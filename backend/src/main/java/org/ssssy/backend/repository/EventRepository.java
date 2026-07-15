package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Event;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
  Page<Event> findByIsPublishedTrueOrderByEventDateDesc(Pageable pageable);
  List<Event> findByIsPublishedTrueAndEventDateAfterOrderByEventDateAsc(LocalDateTime from);
  List<Event> findByIsPublishedTrueAndEventDateBetweenOrderByEventDateAsc(LocalDateTime start, LocalDateTime end);
  Page<Event> findByEventTypeAndIsPublishedTrue(String eventType, Pageable pageable);
  long countByIsPublishedTrue();
  boolean existsBySlug(String slug);
  boolean existsBySlugAndIdNot(String slug, UUID id);
  java.util.Optional<Event> findBySlug(String slug);
}
