package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Builder
public class GalleryImageResponse {

  private UUID id;
  private UUID albumId;
  private UUID mediaFileId;
  private String url;
  private String thumbnailUrl;
  private String beforeUrl;
  private String beforeThumbnailUrl;
  private Integer sortOrder;
  private String titleAr;
  private String titleEn;
  private String descriptionAr;
  private String descriptionEn;
  private String altText;
  private String hotspotData;
  private String exifData;
  private String colorPalette;
  private Boolean isCover;
  private String mimeType;
  private Integer width;
  private Integer height;
  private LocalDateTime createdAt;
}
