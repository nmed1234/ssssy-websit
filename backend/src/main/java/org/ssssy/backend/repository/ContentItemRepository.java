package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.ContentItem;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {

  // Eager-load author + category in a single JOIN to avoid N+1 on public list views
  @EntityGraph(attributePaths = {"author", "category"})
  Optional<ContentItem> findBySlug(String slug);

  // Public list endpoint: eager-load author + category + tags in one SQL
  @EntityGraph(attributePaths = {"author", "category", "tags"})
  Page<ContentItem> findByContentTypeAndStatus(String contentType, String status, Pageable pageable);

  Page<ContentItem> findByAuthorId(UUID authorId, Pageable pageable);

  @EntityGraph(attributePaths = {"author", "category"})
  Page<ContentItem> findByCategoryId(UUID categoryId, Pageable pageable);

  List<ContentItem> findByStatus(String status);

  @EntityGraph(attributePaths = {"author", "category"})
  Page<ContentItem> findByStatus(String status, Pageable pageable);

  List<ContentItem> findByReviewerIdAndStatus(UUID reviewerId, String status);

  long countByStatus(String status);

  @EntityGraph(attributePaths = {"author", "category"})
  Page<ContentItem> findByStatusAndCategory_Slug(String status, String categorySlug, Pageable pageable);

  @Query(value = "SELECT * FROM content_items c WHERE c.deleted_at IS NULL AND " +
      "to_tsvector('simple', coalesce(c.title_ar,'') || ' ' || coalesce(c.title_en,'') || ' ' || coalesce(c.excerpt,'')) " +
      "@@ plainto_tsquery('simple', :query)", nativeQuery = true)
  Page<ContentItem> searchByText(@Param("query") String query, Pageable pageable);

  boolean existsBySlug(String slug);

  @Query("SELECT c FROM ContentItem c WHERE c.status = 'SCHEDULED' AND c.scheduledAt <= :now")
  List<ContentItem> findPendingScheduledContent(@Param("now") LocalDateTime now);

  @Query(value = "SELECT DISTINCT title_en FROM content_items WHERE status = 'PUBLISHED' AND deleted_at IS NULL AND title_en ILIKE :query LIMIT 10", nativeQuery = true)
  List<String> searchTitleSuggestions(@Param("query") String query);
}
