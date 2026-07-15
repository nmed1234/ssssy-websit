package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Builder
public class GalleryAlbumDetailResponse {

  private UUID id;
  private String titleAr;
  private String titleEn;
  private String descriptionAr;
  private String descriptionEn;
  private String slug;
  private String coverImageUrl;
  private String coverImageThumbnailUrl;
  private Boolean isPublished;
  private Boolean isPasswordProtected;
  private Integer viewCount;
  private Integer downloadCount;
  private String watermarkOverrides;
  private String settingsOverrides;
  private String createdByName;
  private int imageCount;
  private List<GalleryImageResponse> images;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
