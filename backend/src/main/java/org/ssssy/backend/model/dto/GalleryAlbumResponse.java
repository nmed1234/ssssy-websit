package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Builder
public class GalleryAlbumResponse {

  private UUID id;
  private String titleAr;
  private String titleEn;
  private String descriptionAr;
  private String descriptionEn;
  private String slug;
  private String coverImageUrl;
  private String coverImageThumbnailUrl;
  private Boolean isPublished;
  private Integer sortOrder;
  private Boolean isPasswordProtected;
  private Integer viewCount;
  private Integer downloadCount;
  private String watermarkOverrides;
  private String settingsOverrides;
  private String createdByName;
  private int imageCount;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
