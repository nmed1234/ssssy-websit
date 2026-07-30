package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.DynamicContentEntry;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DynamicContentEntryRepository extends JpaRepository<DynamicContentEntry, UUID> {

  Optional<DynamicContentEntry> findBySlug(String slug);

  boolean existsBySlug(String slug);

  Page<DynamicContentEntry> findByContentTypeNameOrderByCreatedAtDesc(String typeName, Pageable pageable);

  Page<DynamicContentEntry> findByContentTypeNameAndStatusOrderByCreatedAtDesc(
      String typeName, String status, Pageable pageable);

  Page<DynamicContentEntry> findByContentTypeNameAndStatusInOrderByPublishedAtDesc(
      String typeName, List<String> statuses, Pageable pageable);

  Page<DynamicContentEntry> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

  Page<DynamicContentEntry> findByAuthorIdAndContentTypeNameOrderByCreatedAtDesc(
      UUID authorId, String typeName, Pageable pageable);

  long countByContentTypeName(String typeName);

  long countByContentTypeNameAndStatus(String typeName, String status);

  /**
   * Full-text search on JSONB field_data using PostgreSQL @> containment
   * and text_search via jsonb operators.
   */
  @Query(value = """
      SELECT * FROM dynamic_content_entries
       WHERE content_type_name = :typeName
         AND status IN ('PUBLISHED')
         AND field_data::text ILIKE CONCAT('%', :query, '%')
       ORDER BY published_at DESC
      """, nativeQuery = true)
  Page<DynamicContentEntry> searchPublished(@Param("typeName") String typeName,
                                             @Param("query") String query,
                                             Pageable pageable);
}
