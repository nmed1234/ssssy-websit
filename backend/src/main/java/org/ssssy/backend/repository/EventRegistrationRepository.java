package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EventRegistration;
import java.util.Optional;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
  Optional<EventRegistration> findByEventIdAndUserId(UUID eventId, UUID userId);
  Page<EventRegistration> findByEventIdOrderByCreatedAtDesc(UUID eventId, Pageable pageable);
  long countByEventId(UUID eventId);
  long countByEventIdAndStatus(UUID eventId, String status);
  boolean existsByEventIdAndUserId(UUID eventId, UUID userId);
}
