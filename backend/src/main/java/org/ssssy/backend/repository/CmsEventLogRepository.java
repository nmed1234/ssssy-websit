package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.CmsEventLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CmsEventLogRepository extends JpaRepository<CmsEventLog, UUID> {

  Page<CmsEventLog> findAllByOrderByOccurredAtDesc(Pageable pageable);

  List<CmsEventLog> findByEventTypeOrderByOccurredAtDesc(String eventType);

  Page<CmsEventLog> findByEventTypeOrderByOccurredAtDesc(String eventType, Pageable pageable);

  List<CmsEventLog> findByActorIdOrderByOccurredAtDesc(UUID actorId);

  long countByEventTypeAndOccurredAtAfter(String eventType, LocalDateTime since);
}
