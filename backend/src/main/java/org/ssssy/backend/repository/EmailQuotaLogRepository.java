package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailQuotaLog;
import java.util.List;
import java.util.UUID;

public interface EmailQuotaLogRepository extends JpaRepository<EmailQuotaLog, UUID> {

  List<EmailQuotaLog> findByAccountIdOrderByCreatedAtDesc(UUID accountId);
}
