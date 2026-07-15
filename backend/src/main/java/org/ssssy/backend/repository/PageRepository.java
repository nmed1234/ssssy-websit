package org.ssssy.backend.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Page;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {
  Optional<Page> findBySlug(String slug);
  List<Page> findByIsPublishedTrueAndDeletedAtIsNull(Sort sort);
  Optional<Page> findByIsHomepageTrueAndDeletedAtIsNull();
  boolean existsBySlug(String slug);
  boolean existsBySlugAndIdNot(String slug, UUID id);

  // -------------------------------------------------------------------------
  // CMS Foundation Stage 1 — new query methods (Requirements: 10.5, 10.6, 10.7)
  // -------------------------------------------------------------------------

  /** All non-deleted pages ordered newest-first (no pagination). */
  List<Page> findByDeletedAtIsNullOrderByUpdatedAtDesc();

  /** Non-deleted pages with a specific workflow status (no pagination). */
  List<Page> findByWorkflowStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(String workflowStatus);

  /** Non-deleted pages — paginated. */
  org.springframework.data.domain.Page<Page> findByDeletedAtIsNull(Pageable pageable);

  /** Non-deleted pages filtered by workflow status — paginated. */
  org.springframework.data.domain.Page<Page> findByWorkflowStatusAndDeletedAtIsNull(
      String workflowStatus, Pageable pageable);

  /** Slug uniqueness check excluding a specific page and soft-deleted pages. */
  boolean existsBySlugAndIdNotAndDeletedAtIsNull(String slug, UUID excludeId);

  /** Slug existence check among non-deleted pages only. */
  boolean existsBySlugAndDeletedAtIsNull(String slug);

  /** Find a non-deleted page by ID. */
  Optional<Page> findByIdAndDeletedAtIsNull(UUID id);
}
