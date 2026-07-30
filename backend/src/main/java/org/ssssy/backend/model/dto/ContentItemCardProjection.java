package org.ssssy.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Spring Data Projection for content list views (cards/tiles).
 *
 * <p>Only the columns needed to render a list card are fetched — avoids loading the full
 * {@code body} JSONB column (which can be several KB per row) just to show a title + thumbnail.
 *
 * <p>Usage in repository:
 * <pre>{@code
 *   Page<ContentItemCardProjection> findByStatusAndContentType(
 *       String status, String contentType, Pageable pageable,
 *       Class<ContentItemCardProjection> projection);
 * }</pre>
 */
public interface ContentItemCardProjection {

  UUID getId();

  String getTitleAr();

  String getTitleEn();

  String getSlug();

  String getExcerpt();

  String getFeaturedImage();

  String getStatus();

  String getContentType();

  LocalDateTime getPublishedAt();

  /** Category name (English) resolved via Spring Data. */
  CategoryInfo getCategory();

  /** Author display name resolved via Spring Data. */
  AuthorInfo getAuthor();

  interface CategoryInfo {
    UUID getId();
    String getNameEn();
    String getNameAr();
    String getSlug();
  }

  interface AuthorInfo {
    UUID getId();
    String getFirstNameEn();
    String getLastNameEn();
  }
}
