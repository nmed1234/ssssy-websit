package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailScheduledSend;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EmailScheduledSendRepository extends JpaRepository<EmailScheduledSend, UUID> {

  List<EmailScheduledSend> findByStatusAndScheduledAtBefore(String status, LocalDateTime now);

  List<EmailScheduledSend> findByAccountIdOrderByScheduledAtAsc(UUID accountId);
}
