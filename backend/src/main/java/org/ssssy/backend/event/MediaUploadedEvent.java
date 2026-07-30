package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired when a media file is successfully uploaded.
 */
public class MediaUploadedEvent extends CmsEvent {

  private final UUID mediaId;
  private final String fileName;
  private final String mimeType;
  private final long fileSizeBytes;
  private final String storageUrl;

  public MediaUploadedEvent(UUID mediaId, String fileName, String mimeType,
      long fileSizeBytes, String storageUrl, UUID uploadedByUserId) {
    super(uploadedByUserId);
    this.mediaId = mediaId;
    this.fileName = fileName;
    this.mimeType = mimeType;
    this.fileSizeBytes = fileSizeBytes;
    this.storageUrl = storageUrl;
  }

  @Override
  public String getEventType() { return "MEDIA_UPLOADED"; }

  public UUID getMediaId() { return mediaId; }
  public String getFileName() { return fileName; }
  public String getMimeType() { return mimeType; }
  public long getFileSizeBytes() { return fileSizeBytes; }
  public String getStorageUrl() { return storageUrl; }
}
