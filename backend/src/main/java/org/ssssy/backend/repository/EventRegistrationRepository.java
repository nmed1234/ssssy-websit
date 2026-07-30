package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.EventRegistration;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
  Optional<EventRegistration> findByEventIdAndUserId(UUID eventId, UUID userId);
  Page<EventRegistration> findByEventIdOrderByCreatedAtDesc(UUID eventId, Pageable pageable);
  long countByEventId(UUID eventId);
  long countByEventIdAndStatus(UUID eventId, String status);
  boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

  /** Used by CSV export and bulk messaging */
  List<EventRegistration> findByEventId(UUID eventId);

  /** Find by event and status */
  List<EventRegistration> findByEventIdAndStatus(UUID eventId, String status);

  /** For analytics: registration trend — count per day */
  @Query("SELECT CAST(r.createdAt AS date) as regDate, COUNT(r) as cnt " +
         "FROM EventRegistration r WHERE r.event.id = :eventId " +
         "GROUP BY CAST(r.createdAt AS date) ORDER BY regDate")
  List<Object[]> countByDayForEvent(@Param("eventId") UUID eventId);

  /** For global stats: total registrations since a given timestamp */
  @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.createdAt >= :since")
  long countSince(@Param("since") java.time.LocalDateTime since);

  /** For analytics: find most-registered events */
  @Query("SELECT r.event.id, COUNT(r) as cnt FROM EventRegistration r " +
         "GROUP BY r.event.id ORDER BY cnt DESC")
  List<Object[]> topEventsByRegistrationCount(Pageable pageable);
}
