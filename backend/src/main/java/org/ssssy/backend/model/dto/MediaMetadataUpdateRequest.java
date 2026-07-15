package org.ssssy.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Request body for PATCH /api/admin/media/{id} — update media file metadata.
 *
 * All fields are optional (nullable). Only non-null values are written.
 * Requirements: 18.3, 18.5
 */
@Getter @Setter
public class MediaMetadataUpdateRequest {

  private String altTextEn;
  private String altTextAr;
  private String captionEn;
  private String captionAr;
  private String tags;
  private UUID folderId;
}
