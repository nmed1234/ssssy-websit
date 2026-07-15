package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.AuditLog;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

  Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

  Page<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
