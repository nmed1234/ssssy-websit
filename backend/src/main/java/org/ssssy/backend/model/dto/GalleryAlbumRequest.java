package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class GalleryAlbumRequest {

  @NotBlank(message = "Arabic title is required")
  private String titleAr;

  @NotBlank(message = "English title is required")
  private String titleEn;

  private String descriptionAr;
  private String descriptionEn;

  @NotBlank(message = "Slug is required")
  private String slug;

  private UUID coverImageId;
  private Boolean isPublished;
  private Integer sortOrder;
  private String password;
  private Boolean isPasswordProtected;
  private String watermarkOverrides;
  private String settingsOverrides;
}
