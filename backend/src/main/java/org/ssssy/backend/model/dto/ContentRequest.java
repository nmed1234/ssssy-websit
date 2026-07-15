package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter @Setter
public class ContentRequest {

  @NotBlank
  private String titleAr;

  private String titleEn;

  @NotBlank
  private String slug;

  private String excerpt;
  private String body;
  private String contentType;
  private UUID categoryId;
  private Set<UUID> tagIds;
  private String featuredImage;
  private Boolean isFeatured;
  private Boolean isPinned;
  private Boolean isMemberOnly;
  private LocalDateTime scheduledAt;
  private String metaTitle;
  private String metaDescription;
  private String metaKeywords;
  private String ogImageUrl;
  private String ogTitle;
  private String ogDescription;
  private String changeSummary;
}
