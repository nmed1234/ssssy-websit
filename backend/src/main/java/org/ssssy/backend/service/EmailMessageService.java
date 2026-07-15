package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailMessageService {

  private final EmailMessageRepository emailMessageRepository;
  private final EmailRecipientRepository emailRecipientRepository;
  private final EmailAttachmentRepository emailAttachmentRepository;
  private final EmailAccountRepository emailAccountRepository;
  private final EmailFolderRepository emailFolderRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  public Page<EmailMessageResponse> getMessages(UUID userId, UUID folderId, Pageable pageable) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailMessageRepository.findByAccountIdAndFolderIdOrderByCreatedAtDesc(account.getId(), folderId, pageable)
        .map(this::toResponse);
  }

  public Page<EmailMessageResponse> getStarredMessages(UUID userId, Pageable pageable) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailMessageRepository.findByAccountIdAndIsStarredTrueOrderByCreatedAtDesc(account.getId(), pageable)
        .map(this::toResponse);
  }

  public Page<EmailMessageResponse> getDrafts(UUID userId, Pageable pageable) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailMessageRepository.findByAccountIdAndIsDraftTrueOrderByUpdatedAtDesc(account.getId(), pageable)
        .map(this::toResponse);
  }

  public EmailMessageResponse getMessage(UUID userId, UUID messageId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailMessage message = emailMessageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
    if (!message.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Message does not belong to this account");
    }
    if (!message.getIsRead() && !Boolean.TRUE.equals(message.getIsDraft())) {
      message.setIsRead(true);
      emailMessageRepository.save(message);
    }
    return toResponse(message);
  }

  @Transactional
  public void markAsRead(UUID userId, UUID messageId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    message.setIsRead(true);
    emailMessageRepository.save(message);
  }

  @Transactional
  public void toggleStar(UUID userId, UUID messageId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    message.setIsStarred(!Boolean.TRUE.equals(message.getIsStarred()));
    emailMessageRepository.save(message);
  }

  @Transactional
  public void toggleFlag(UUID userId, UUID messageId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    message.setIsFlagged(!Boolean.TRUE.equals(message.getIsFlagged()));
    emailMessageRepository.save(message);
  }

  @Transactional
  public void moveToFolder(UUID userId, EmailMoveRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder target = emailFolderRepository.findById(request.getTargetFolderId())
        .orElseThrow(() -> new ResourceNotFoundException("Target folder not found"));
    if (!target.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Target folder does not belong to this account");
    }
    for (UUID msgId : request.getMessageIds()) {
      EmailMessage msg = emailMessageRepository.findById(msgId)
          .orElse(null);
      if (msg != null && msg.getAccount().getId().equals(account.getId())) {
        msg.setFolder(target);
        emailMessageRepository.save(msg);
      }
    }
  }

  @Transactional
  public void moveToFolderByType(UUID userId, UUID messageId, String folderType) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailMessage msg = getOwnedMessage(userId, messageId);
    EmailFolder target = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), folderType)
        .orElseThrow(() -> new ResourceNotFoundException("Target folder not found: " + folderType));
    msg.setFolder(target);
    emailMessageRepository.save(msg);
  }

  @Transactional
  public void deleteMessages(UUID userId, List<UUID> messageIds) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder trash = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), "TRASH")
        .orElse(null);
    for (UUID msgId : messageIds) {
      EmailMessage msg = emailMessageRepository.findById(msgId)
          .orElse(null);
      if (msg != null && msg.getAccount().getId().equals(account.getId())) {
        if (trash != null && !msg.getFolder().getId().equals(trash.getId())) {
          msg.setFolder(trash);
          emailMessageRepository.save(msg);
        } else {
          emailMessageRepository.delete(msg);
        }
      }
    }
  }

  @Transactional
  public void deleteDraft(UUID userId, UUID messageId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    if (!Boolean.TRUE.equals(message.getIsDraft())) {
      throw new BadRequestException("Message is not a draft");
    }
    emailMessageRepository.delete(message);
  }

  public List<EmailMessageResponse> getThreads(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    List<UUID> threadIds = emailMessageRepository.findDistinctThreadIdsByAccountId(account.getId());
    return threadIds.stream()
        .map(tid -> {
          List<EmailMessage> msgs = emailMessageRepository.findByThreadIdOrderByCreatedAtAsc(tid);
          return msgs.stream().filter(m -> m.getAccount().getId().equals(account.getId())).findFirst().orElse(null);
        })
        .filter(m -> m != null)
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<EmailMessageResponse> getThread(UUID userId, UUID threadId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailMessageRepository.findByThreadIdOrderByCreatedAtAsc(threadId)
        .stream()
        .filter(m -> m.getAccount().getId().equals(account.getId()))
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public void batchAction(UUID userId, EmailBatchActionRequest request) {
    if (request.getMessageIds() == null) return;
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    for (UUID msgId : request.getMessageIds()) {
      EmailMessage msg = emailMessageRepository.findById(msgId).orElse(null);
      if (msg == null || !msg.getAccount().getId().equals(account.getId())) continue;
      switch (request.getAction()) {
        case "delete": {
          EmailFolder trash = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), "TRASH").orElse(null);
          if (trash != null && !msg.getFolder().getId().equals(trash.getId())) {
            msg.setFolder(trash);
            emailMessageRepository.save(msg);
          } else { emailMessageRepository.delete(msg); }
          break;
        }
        case "mark_read": msg.setIsRead(true); emailMessageRepository.save(msg); break;
        case "mark_unread": msg.setIsRead(false); emailMessageRepository.save(msg); break;
        case "star": msg.setIsStarred(true); emailMessageRepository.save(msg); break;
        case "unstar": msg.setIsStarred(false); emailMessageRepository.save(msg); break;
        case "move":
          if (request.getTargetFolderId() != null) {
            EmailFolder target = emailFolderRepository.findById(request.getTargetFolderId()).orElse(null);
            if (target != null && target.getAccount().getId().equals(account.getId())) {
              msg.setFolder(target);
              emailMessageRepository.save(msg);
            }
          }
          break;
      }
    }
  }

  public List<EmailAttachmentResponse> getAttachments(UUID userId, UUID messageId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    return emailAttachmentRepository.findByMessageId(message.getId())
        .stream()
        .map(a -> EmailAttachmentResponse.builder()
            .id(a.getId())
            .messageId(a.getMessage().getId())
            .filename(a.getFilename())
            .mimeType(a.getMimeType())
            .sizeBytes(a.getSizeBytes())
            .storagePath(a.getStoragePath())
            .isInline(a.getIsInline())
            .build())
        .collect(Collectors.toList());
  }

  public EmailAttachment getAttachment(UUID userId, UUID messageId, UUID attachmentId) {
    EmailMessage message = getOwnedMessage(userId, messageId);
    return emailAttachmentRepository.findById(attachmentId)
        .filter(a -> a.getMessage().getId().equals(message.getId()))
        .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
  }

  private EmailMessage getOwnedMessage(UUID userId, UUID messageId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailMessage message = emailMessageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
    if (!message.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Message does not belong to this account");
    }
    return message;
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

    List<EmailAttachmentResponse> attachments = emailAttachmentRepository.findByMessageId(message.getId())
        .stream()
        .map(a -> EmailAttachmentResponse.builder()
            .id(a.getId())
            .messageId(a.getMessage().getId())
            .filename(a.getFilename())
            .mimeType(a.getMimeType())
            .sizeBytes(a.getSizeBytes())
            .storagePath(a.getStoragePath())
            .isInline(a.getIsInline())
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
        .replyToAddress(message.getReplyToAddress())
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
        .attachments(attachments)
        .createdAt(message.getCreatedAt())
        .updatedAt(message.getUpdatedAt())
        .build();
  }
}
