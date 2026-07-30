package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired whenever a new content item is created (any content type, any status).
 */
public class ContentCreatedEvent extends CmsEvent {

  private final UUID contentId;
  private final String contentType;
  private final String slug;
  private final String titleEn;
  private final String initialStatus;

  public ContentCreatedEvent(UUID contentId, String contentType, String slug,
      String titleEn, String initialStatus, UUID authorId) {
    super(authorId);
    this.contentId = contentId;
    this.contentType = contentType;
    this.slug = slug;
    this.titleEn = titleEn;
    this.initialStatus = initialStatus;
  }

  @Override
  public String getEventType() { return "CONTENT_CREATED"; }

  public UUID getContentId() { return contentId; }
  public String getContentType() { return contentType; }
  public String getSlug() { return slug; }
  public String getTitleEn() { return titleEn; }
  public String getInitialStatus() { return initialStatus; }
}
