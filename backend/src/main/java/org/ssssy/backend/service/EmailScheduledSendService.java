package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EmailScheduledSendResponse;
import org.ssssy.backend.model.entity.EmailMessage;
import org.ssssy.backend.model.entity.EmailRecipient;
import org.ssssy.backend.model.entity.EmailScheduledSend;
import org.ssssy.backend.repository.EmailMessageRepository;
import org.ssssy.backend.repository.EmailRecipientRepository;
import org.ssssy.backend.repository.EmailScheduledSendRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailScheduledSendService {

  private final EmailScheduledSendRepository scheduledSendRepository;
  private final EmailMessageRepository emailMessageRepository;
  private final EmailRecipientRepository emailRecipientRepository;
  private final EmailSendService emailSendService;
  private final NotificationService notificationService;

  public List<EmailScheduledSendResponse> getAllScheduledSends() {
    return scheduledSendRepository.findAll()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<EmailScheduledSendResponse> getScheduledSends(UUID accountId) {
    return scheduledSendRepository.findByAccountIdOrderByScheduledAtAsc(accountId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public EmailScheduledSendResponse getScheduledSend(UUID id) {
    EmailScheduledSend send = scheduledSendRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Scheduled send not found"));
    return toResponse(send);
  }

  @Transactional
  public void cancelScheduledSend(UUID id) {
    EmailScheduledSend send = scheduledSendRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Scheduled send not found"));
    send.setStatus("CANCELLED");
    scheduledSendRepository.save(send);
  }

  @Scheduled(fixedRate = 60000)
  @Transactional
  public void processPendingScheduledSends() {
    List<EmailScheduledSend> pending = scheduledSendRepository
        .findByStatusAndScheduledAtBefore("PENDING", LocalDateTime.now());

    for (EmailScheduledSend scheduled : pending) {
      try {
        EmailMessage message = scheduled.getMessage();
        List<EmailRecipient> recipients = emailRecipientRepository.findByMessageId(message.getId());

        if (message.getAccount() != null) {
          emailSendService.sendViaSmtpInternal(message.getAccount(), message, recipients);
        }

        message.setDeliveryStatus("SENT");
        message.setActuallySentAt(LocalDateTime.now());
        emailMessageRepository.save(message);

        scheduled.setStatus("SENT");
        scheduled.setProcessedAt(LocalDateTime.now());
      } catch (Exception e) {
        scheduled.setStatus("FAILED");
        scheduled.setErrorMessage(e.getMessage());
        scheduled.setProcessedAt(LocalDateTime.now());
      }
      scheduledSendRepository.save(scheduled);
    }
  }

  private EmailScheduledSendResponse toResponse(EmailScheduledSend send) {
    return EmailScheduledSendResponse.builder()
        .id(send.getId())
        .messageId(send.getMessage().getId())
        .subject(send.getMessage().getSubject())
        .accountId(send.getAccount().getId())
        .senderAddress(send.getMessage().getSenderAddress())
        .scheduledAt(send.getScheduledAt())
        .status(send.getStatus())
        .errorMessage(send.getErrorMessage())
        .createdAt(send.getCreatedAt())
        .processedAt(send.getProcessedAt())
        .build();
  }
}
