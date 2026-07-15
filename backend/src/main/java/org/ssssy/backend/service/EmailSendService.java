package org.ssssy.backend.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailSendService {

  private final EmailMessageRepository emailMessageRepository;
  private final EmailRecipientRepository emailRecipientRepository;
  private final EmailAccountRepository emailAccountRepository;
  private final EmailFolderRepository emailFolderRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final JavaMailSender mailSender;
  private final EmailRuleExecutionService emailRuleExecutionService;
  private final EmailQuotaLogService emailQuotaLogService;

  private final Map<UUID, AtomicInteger> sendCounts = new ConcurrentHashMap<>();
  private static final int MAX_SENDS_PER_MINUTE = 50;

  private EmailMessageRequest buildReplyRequest(EmailMessage original) {
    EmailMessageRequest req = new EmailMessageRequest();
    req.setSubject((original.getSubject() != null && !original.getSubject().startsWith("Re: "))
        ? "Re: " + original.getSubject() : original.getSubject());
    req.setBodyHtml("<br><br><blockquote>" + (original.getBodyHtml() != null ? original.getBodyHtml() : original.getBodyText()) + "</blockquote>");
    List<String> to = new ArrayList<>();
    to.add(original.getSenderAddress());
    req.setToRecipients(to);
    return req;
  }

  private EmailMessageRequest buildReplyAllRequest(EmailMessage original, List<EmailRecipient> allRecipients) {
    EmailMessageRequest req = buildReplyRequest(original);
    Set<String> allTo = new LinkedHashSet<>();
    allTo.add(original.getSenderAddress());
    for (EmailRecipient r : allRecipients) {
      if ("TO".equals(r.getRecipientType()) || "CC".equals(r.getRecipientType())) {
        allTo.add(r.getAddress());
      }
    }
    allTo.remove(original.getSenderAddress());
    req.setToRecipients(new ArrayList<>(allTo));
    return req;
  }

  private EmailMessageRequest buildForwardRequest(EmailMessage original) {
    EmailMessageRequest req = new EmailMessageRequest();
    req.setSubject((original.getSubject() != null && !original.getSubject().startsWith("Fwd: "))
        ? "Fwd: " + original.getSubject() : original.getSubject());
    req.setBodyHtml("<br><br>---------- Forwarded message ----------<br>" +
        "<b>From:</b> " + original.getSenderName() + " &lt;" + original.getSenderAddress() + "&gt;<br>" +
        "<b>Subject:</b> " + original.getSubject() + "<br><br>" +
        (original.getBodyHtml() != null ? original.getBodyHtml() : original.getBodyText()));
    return req;
  }

  @Transactional
  public EmailMessageResponse sendEmail(UUID userId, EmailMessageRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    if (!Boolean.TRUE.equals(account.getIsActive())) {
      throw new BadRequestException("Email account is not active");
    }

    EmailFolder sentFolder = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), "SENT")
        .orElseThrow(() -> new ResourceNotFoundException("Sent folder not found"));

    UUID threadId = UUID.randomUUID();

    EmailMessage message = EmailMessage.builder()
        .account(account)
        .folder(sentFolder)
        .senderAddress(request.getSenderEmail() != null ? request.getSenderEmail() : account.getEmailAddress())
        .senderName(request.getSenderName() != null ? request.getSenderName() : account.getDisplayName())
        .subject(request.getSubject())
        .bodyHtml(request.getBodyHtml())
        .bodyText(request.getBodyText())
        .threadId(threadId)
        .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
        .isDraft(false)
        .isScheduled(request.getScheduledSendAt() != null)
        .scheduledSendAt(request.getScheduledSendAt())
        .deliveryStatus("PENDING")
        .hasAttachments(false)
        .attachmentCount(0)
        .build();

    if (request.getBodyHtml() != null) {
      String plain = request.getBodyHtml().replaceAll("<[^>]*>", "");
      message.setPreviewText(plain.length() > 500 ? plain.substring(0, 500) : plain);
    }

    message = emailMessageRepository.save(message);

    List<EmailRecipient> recipients = new ArrayList<>();
    if (request.getToRecipients() != null) {
      for (String addr : request.getToRecipients()) {
        recipients.add(createRecipient(message, "TO", addr.trim()));
      }
    }
    if (request.getCcRecipients() != null) {
      for (String addr : request.getCcRecipients()) {
        recipients.add(createRecipient(message, "CC", addr.trim()));
      }
    }
    if (request.getBccRecipients() != null) {
      for (String addr : request.getBccRecipients()) {
        recipients.add(createRecipient(message, "BCC", addr.trim()));
      }
    }
    emailRecipientRepository.saveAll(recipients);

    for (EmailRecipient r : recipients) {
      if (Boolean.TRUE.equals(r.getIsInternal())) {
        deliverInternal(r.getAddress(), message, threadId);
      }
    }

    boolean hasExternal = recipients.stream().anyMatch(r -> !Boolean.TRUE.equals(r.getIsInternal()));
    if (hasExternal && request.getScheduledSendAt() == null) {
      try {
        sendViaSmtpInternal(account, message, recipients);
        message.setDeliveryStatus("SENT");
        message.setActuallySentAt(LocalDateTime.now());
      } catch (Exception e) {
        message.setDeliveryStatus("FAILED");
        message.setBounceMessage(e.getMessage());
      }
    } else if (hasExternal && request.getScheduledSendAt() != null) {
      message.setDeliveryStatus("SCHEDULED");
    } else {
      message.setDeliveryStatus("SENT");
    }

    if (request.getScheduledSendAt() == null) {
      message.setActuallySentAt(LocalDateTime.now());
    }

    try { emailRuleExecutionService.applyRulesOnSend(message); } catch (Exception e) { /* ignore */ }

    int size = (message.getBodyHtml() != null ? message.getBodyHtml().length() : 0)
        + (message.getBodyText() != null ? message.getBodyText().length() : 0);
    long usedBefore = account.getUsedBytes() != null ? account.getUsedBytes() : 0;
    account.setUsedBytes(usedBefore + size);
    emailAccountRepository.save(account);

    emailQuotaLogService.logQuotaChange(account, usedBefore, usedBefore + size, "SEND", message);

    message = emailMessageRepository.save(message);
    return toResponse(message);
  }

  @Transactional
  public EmailMessageResponse saveDraft(UUID userId, EmailMessageRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder draftsFolder = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), "DRAFTS")
        .orElseThrow(() -> new ResourceNotFoundException("Drafts folder not found"));

    EmailMessage message = EmailMessage.builder()
        .account(account)
        .folder(draftsFolder)
        .senderAddress(request.getSenderEmail() != null ? request.getSenderEmail() : account.getEmailAddress())
        .senderName(account.getDisplayName())
        .subject(request.getSubject())
        .bodyHtml(request.getBodyHtml())
        .bodyText(request.getBodyText())
        .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
        .isDraft(true)
        .deliveryStatus("DRAFT")
        .build();

    message = emailMessageRepository.save(message);

    if (request.getToRecipients() != null) {
      for (String addr : request.getToRecipients()) {
        emailRecipientRepository.save(createRecipient(message, "TO", addr.trim()));
      }
    }
    if (request.getCcRecipients() != null) {
      for (String addr : request.getCcRecipients()) {
        emailRecipientRepository.save(createRecipient(message, "CC", addr.trim()));
      }
    }

    return toResponse(message);
  }

  @Transactional
  public EmailMessageResponse updateDraft(UUID userId, UUID draftId, EmailMessageRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailMessage message = emailMessageRepository.findById(draftId)
        .orElseThrow(() -> new ResourceNotFoundException("Draft not found"));
    if (!message.getAccount().getId().equals(account.getId()) || !Boolean.TRUE.equals(message.getIsDraft())) {
      throw new BadRequestException("Message is not a draft or does not belong to this account");
    }

    message.setSubject(request.getSubject());
    message.setBodyHtml(request.getBodyHtml());
    message.setBodyText(request.getBodyText());
    message = emailMessageRepository.save(message);

    emailRecipientRepository.deleteByMessageId(draftId);
    if (request.getToRecipients() != null) {
      for (String addr : request.getToRecipients()) {
        emailRecipientRepository.save(createRecipient(message, "TO", addr.trim()));
      }
    }
    if (request.getCcRecipients() != null) {
      for (String addr : request.getCcRecipients()) {
        emailRecipientRepository.save(createRecipient(message, "CC", addr.trim()));
      }
    }

    return toResponse(message);
  }

  @Transactional
  public EmailMessageResponse sendDraft(UUID userId, UUID draftId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailMessage draft = emailMessageRepository.findById(draftId)
        .orElseThrow(() -> new ResourceNotFoundException("Draft not found"));
    if (!draft.getAccount().getId().equals(account.getId()) || !Boolean.TRUE.equals(draft.getIsDraft())) {
      throw new BadRequestException("Message is not a draft or does not belong to this account");
    }

    List<EmailRecipient> recipients = emailRecipientRepository.findByMessageId(draft.getId());

    EmailFolder sentFolder = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), "SENT")
        .orElseThrow(() -> new ResourceNotFoundException("Sent folder not found"));

    UUID threadId = UUID.randomUUID();
    draft.setFolder(sentFolder);
    draft.setIsDraft(false);
    draft.setThreadId(threadId);

    for (EmailRecipient r : recipients) {
      if (Boolean.TRUE.equals(r.getIsInternal())) {
        deliverInternal(r.getAddress(), draft, threadId);
      }
    }

    boolean hasExternal = recipients.stream().anyMatch(r -> !Boolean.TRUE.equals(r.getIsInternal()));
    if (hasExternal) {
      try {
        sendViaSmtpInternal(account, draft, recipients);
        draft.setDeliveryStatus("SENT");
      } catch (Exception e) {
        draft.setDeliveryStatus("FAILED");
        draft.setBounceMessage(e.getMessage());
      }
    } else {
      draft.setDeliveryStatus("SENT");
    }
    draft.setActuallySentAt(LocalDateTime.now());
    draft = emailMessageRepository.save(draft);
    return toResponse(draft);
  }

  @Transactional
  public EmailMessageResponse reply(UUID userId, UUID messageId, EmailMessageRequest request) {
    EmailMessage original = emailMessageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Original message not found"));
    EmailMessageResponse sent = sendEmail(userId, request != null ? request : buildReplyRequest(original));
    EmailMessage sentMsg = emailMessageRepository.findById(sent.getId()).orElseThrow();
    sentMsg.setInReplyTo(original.getMessageId());
    sentMsg.setThreadId(original.getThreadId() != null ? original.getThreadId() : original.getId());
    emailMessageRepository.save(sentMsg);
    return toResponse(sentMsg);
  }

  @Transactional
  public EmailMessageResponse replyAll(UUID userId, UUID messageId, EmailMessageRequest request) {
    EmailMessage original = emailMessageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Original message not found"));
    List<EmailRecipient> allRecipients = emailRecipientRepository.findByMessageId(original.getId());
    EmailMessageRequest req = request != null ? request : buildReplyAllRequest(original, allRecipients);
    EmailMessageResponse sent = sendEmail(userId, req);
    EmailMessage sentMsg = emailMessageRepository.findById(sent.getId()).orElseThrow();
    sentMsg.setInReplyTo(original.getMessageId());
    sentMsg.setThreadId(original.getThreadId() != null ? original.getThreadId() : original.getId());
    emailMessageRepository.save(sentMsg);
    return toResponse(sentMsg);
  }

  @Transactional
  public EmailMessageResponse forward(UUID userId, UUID messageId, EmailMessageRequest request) {
    EmailMessage original = emailMessageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Original message not found"));
    EmailMessageRequest req = request != null ? request : buildForwardRequest(original);
    return sendEmail(userId, req);
  }

  private void deliverInternal(String emailAddress, EmailMessage original, UUID threadId) {
    userRepository.findByEmail(emailAddress).ifPresent(recipientUser -> {
      emailAccountRepository.findByUserId(recipientUser.getId()).ifPresent(recipientAccount -> {
        EmailFolder inbox = emailFolderRepository.findByAccountIdAndFolderType(recipientAccount.getId(), "INBOX")
            .orElse(null);
        if (inbox != null) {
          EmailMessage copy = EmailMessage.builder()
              .account(recipientAccount)
              .folder(inbox)
              .messageId(original.getMessageId())
              .inReplyTo(original.getInReplyTo())
              .threadId(threadId)
              .senderAddress(original.getSenderAddress())
              .senderName(original.getSenderName())
              .subject(original.getSubject())
              .bodyHtml(original.getBodyHtml())
              .bodyText(original.getBodyText())
              .previewText(original.getPreviewText())
              .isRead(false)
              .priority(original.getPriority())
              .deliveryStatus("DELIVERED")
              .hasAttachments(false)
              .attachmentCount(0)
              .build();
          emailMessageRepository.save(copy);

          notificationService.createNotification(
              recipientUser, "email_new", "New Email",
              "You received a new email: " + original.getSubject(),
              "/email/inbox", copy.getId(), "email");
        }
      });
    });
  }

  public void sendViaSmtpInternal(EmailAccount account, EmailMessage message, List<EmailRecipient> recipients) {
    AtomicInteger count = sendCounts.computeIfAbsent(account.getId(), k -> new AtomicInteger(0));
    if (count.incrementAndGet() > MAX_SENDS_PER_MINUTE) {
      count.decrementAndGet();
      throw new RuntimeException("SMTP rate limit exceeded: max " + MAX_SENDS_PER_MINUTE + " per minute");
    }

    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setFrom(new InternetAddress(account.getEmailAddress(), account.getDisplayName()));
      helper.setSubject(message.getSubject() != null ? message.getSubject() : "");

      if (message.getBodyHtml() != null) {
        helper.setText(message.getBodyText() != null ? message.getBodyText() : "", message.getBodyHtml());
      } else if (message.getBodyText() != null) {
        helper.setText(message.getBodyText());
      }

      for (EmailRecipient r : recipients) {
        switch (r.getRecipientType()) {
          case "TO": helper.addTo(r.getAddress()); break;
          case "CC": helper.addCc(r.getAddress()); break;
          case "BCC": helper.addBcc(r.getAddress()); break;
        }
      }

      mailSender.send(mimeMessage);
    } catch (Exception e) {
      throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
    }
  }

  private EmailRecipient createRecipient(EmailMessage message, String type, String address) {
    boolean isInternal = address.toLowerCase().endsWith("@ssssy.org.sy");
    return EmailRecipient.builder()
        .message(message)
        .recipientType(type)
        .address(address)
        .name("")
        .isInternal(isInternal)
        .build();
  }

  private EmailMessageResponse toResponse(EmailMessage message) {
    List<EmailRecipientResponse> recipients = emailRecipientRepository.findByMessageId(message.getId())
        .stream()
        .map(r -> EmailRecipientResponse.builder()
            .id(r.getId())
            .messageId(r.getMessage().getId())
            .recipientType(r.getRecipientType())
            .address(r.getAddress())
            .name(r.getName())
            .isInternal(r.getIsInternal())
            .build())
        .collect(Collectors.toList());

    return EmailMessageResponse.builder()
        .id(message.getId())
        .accountId(message.getAccount().getId())
        .folderId(message.getFolder().getId())
        .messageId(message.getMessageId())
        .inReplyTo(message.getInReplyTo())
        .threadId(message.getThreadId())
        .senderAddress(message.getSenderAddress())
        .senderName(message.getSenderName())
        .subject(message.getSubject())
        .bodyText(message.getBodyText())
        .bodyHtml(message.getBodyHtml())
        .previewText(message.getPreviewText())
        .hasAttachments(message.getHasAttachments())
        .attachmentCount(message.getAttachmentCount())
        .priority(message.getPriority())
        .isRead(message.getIsRead())
        .isStarred(message.getIsStarred())
        .isFlagged(message.getIsFlagged())
        .isDraft(message.getIsDraft())
        .isScheduled(message.getIsScheduled())
        .scheduledSendAt(message.getScheduledSendAt())
        .actuallySentAt(message.getActuallySentAt())
        .deliveryStatus(message.getDeliveryStatus())
        .recipients(recipients)
        .createdAt(message.getCreatedAt())
        .updatedAt(message.getUpdatedAt())
        .build();
  }
}
