package org.ssssy.backend.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Fired when a content item status transitions to PUBLISHED.
 * This is the most important content event — SEO, sitemap, newsletter, and plugin
 * listeners all hook into this.
 */
public class ContentPublishedEvent extends CmsEvent {

  private final UUID contentId;
  private final String contentType;
  private final String slug;
  private final String titleEn;
  private final String titleAr;
  private final LocalDateTime publishedAt;

  public ContentPublishedEvent(UUID contentId, String contentType, String slug,
      String titleEn, String titleAr, LocalDateTime publishedAt, UUID publisherId) {
    super(publisherId);
    this.contentId = contentId;
    this.contentType = contentType;
    this.slug = slug;
    this.titleEn = titleEn;
    this.titleAr = titleAr;
    this.publishedAt = publishedAt;
  }

  @Override
  public String getEventType() { return "CONTENT_PUBLISHED"; }

  public UUID getContentId() { return contentId; }
  public String getContentType() { return contentType; }
  public String getSlug() { return slug; }
  public String getTitleEn() { return titleEn; }
  public String getTitleAr() { return titleAr; }
  public LocalDateTime getPublishedAt() { return publishedAt; }
}
