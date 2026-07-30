package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired whenever an existing content item is updated.
 */
public class ContentUpdatedEvent extends CmsEvent {

  private final UUID contentId;
  private final String contentType;
  private final String slug;
  private final String titleEn;
  private final String status;
  private final int version;

  public ContentUpdatedEvent(UUID contentId, String contentType, String slug,
      String titleEn, String status, int version, UUID editorId) {
    super(editorId);
    this.contentId = contentId;
    this.contentType = contentType;
    this.slug = slug;
    this.titleEn = titleEn;
    this.status = status;
    this.version = version;
  }

  @Override
  public String getEventType() { return "CONTENT_UPDATED"; }

  public UUID getContentId() { return contentId; }
  public String getContentType() { return contentType; }
  public String getSlug() { return slug; }
  public String getTitleEn() { return titleEn; }
  public String getStatus() { return status; }
  public int getVersion() { return version; }
}
