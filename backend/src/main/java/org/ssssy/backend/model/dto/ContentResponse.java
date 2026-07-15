package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class ContentResponse {

  private UUID id;
  private String titleAr;
  private String titleEn;
  private String slug;
  private String excerpt;
  private String body;
  private String contentType;
  private String status;
  private UUID authorId;
  private String authorName;
  private UUID reviewerId;
  private UUID publisherId;
  private CategoryResponse category;
  private Set<TagResponse> tags;
  private String featuredImage;
  private Boolean isFeatured;
  private Boolean isPinned;
  private Boolean isMemberOnly;
  private LocalDateTime publishedAt;
  private LocalDateTime scheduledAt;
  private Long viewCount;
  private Integer version;
  private String metaTitle;
  private String metaDescription;
  private String metaKeywords;
  private String ogImageUrl;
  private String ogTitle;
  private String ogDescription;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public ContentResponse() {}
}
