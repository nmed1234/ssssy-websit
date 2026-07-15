package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.dto.EmailQuotaLogResponse;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailMessage;
import org.ssssy.backend.model.entity.EmailQuotaLog;
import org.ssssy.backend.repository.EmailQuotaLogRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailQuotaLogService {

  private final EmailQuotaLogRepository quotaLogRepository;

  @Transactional
  public void logQuotaChange(EmailAccount account, long usedBytesBefore, long usedBytesAfter,
                             String operation, EmailMessage message) {
    EmailQuotaLog log = EmailQuotaLog.builder()
        .account(account)
        .usedBytesBefore(usedBytesBefore)
        .usedBytesAfter(usedBytesAfter)
        .changeBytes(usedBytesAfter - usedBytesBefore)
        .operation(operation)
        .message(message)
        .build();
    quotaLogRepository.save(log);
  }

  public Page<EmailQuotaLogResponse> getAllQuotaLogs(Pageable pageable) {
    return quotaLogRepository.findAll(pageable)
        .map(this::toResponse);
  }

  public List<EmailQuotaLogResponse> getQuotaLogs(UUID accountId) {
    return quotaLogRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  private EmailQuotaLogResponse toResponse(EmailQuotaLog log) {
    return EmailQuotaLogResponse.builder()
        .id(log.getId())
        .accountId(log.getAccount().getId())
        .emailAddress(log.getAccount().getEmailAddress())
        .usedBytesBefore(log.getUsedBytesBefore())
        .usedBytesAfter(log.getUsedBytesAfter())
        .changeBytes(log.getChangeBytes())
        .operation(log.getOperation())
        .messageId(log.getMessage() != null ? log.getMessage().getId() : null)
        .createdAt(log.getCreatedAt())
        .build();
  }
}
