package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Comment;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
  List<Comment> findByContentItemIdOrderByCreatedAtAsc(UUID contentItemId);
  List<Comment> findByContentItemIdAndIsApprovedTrueOrderByCreatedAtAsc(UUID contentItemId);
  List<Comment> findByParentId(UUID parentId);
  long countByContentItemIdAndIsApprovedTrue(UUID contentItemId);
  Page<Comment> findByIsApprovedFalseOrderByCreatedAtDesc(Pageable pageable);
}
