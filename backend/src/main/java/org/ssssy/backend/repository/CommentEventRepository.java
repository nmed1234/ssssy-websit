package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.CommentEvent;
import java.util.List;
import java.util.UUID;

public interface CommentEventRepository extends JpaRepository<CommentEvent, UUID> {
  List<CommentEvent> findByIsProcessedFalseOrderByCreatedAtDesc();

  @Query(value = "SELECT * FROM comment_events e WHERE e.recipients IS NOT NULL AND :userId::text = ANY(e.recipients) AND e.isProcessed = false ORDER BY e.created_at DESC", nativeQuery = true)
  List<CommentEvent> findUnreadByUser(@Param("userId") UUID userId);

  long countByIsProcessedFalse();

  @Modifying
  @Query("UPDATE CommentEvent e SET e.isProcessed = true, e.sentAt = CURRENT_TIMESTAMP WHERE e.id = :id")
  void markAsProcessed(@Param("id") UUID id);
}