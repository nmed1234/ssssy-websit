package org.ssssy.backend.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.AuditLogResponse;
import org.ssssy.backend.model.entity.AuditLog;
import org.ssssy.backend.repository.AuditLogRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

  private final AuditLogRepository auditLogRepository;

  public void log(String action, String entityType, UUID entityId,
      String oldValue, String newValue, UUID userId, String ipAddress, String userAgent) {
    AuditLog log = AuditLog.builder()
        .action(action)
        .entityType(entityType)
        .entityId(entityId)
        .oldValue(oldValue)
        .newValue(newValue)
        .userId(userId)
        .ipAddress(ipAddress)
        .userAgent(userAgent)
        .build();
    auditLogRepository.save(log);
  }

  public Page<AuditLogResponse> getAllAuditLogs(Pageable pageable) {
    return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
        .map(this::toAuditLogResponse);
  }

  public AuditLogResponse getAuditLogById(UUID id) {
    AuditLog log = auditLogRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Audit log not found: " + id));
    return toAuditLogResponse(log);
  }

  private AuditLogResponse toAuditLogResponse(AuditLog log) {
    return AuditLogResponse.builder()
        .id(log.getId())
        .userId(log.getUserId())
        .action(log.getAction())
        .entityType(log.getEntityType())
        .entityId(log.getEntityId())
        .oldValue(log.getOldValue())
        .newValue(log.getNewValue())
        .ipAddress(log.getIpAddress())
        .userAgent(log.getUserAgent())
        .createdAt(log.getCreatedAt())
        .build();
  }
}
