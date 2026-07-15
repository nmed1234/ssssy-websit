package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeoMetadataResponse {
  private UUID id;
  private String entityType;
  private UUID entityId;
  private String metaTitle;
  private String metaDescription;
  private String ogTitle;
  private String ogDescription;
  private String ogImageUrl;
  private String canonicalUrl;
  private String robots;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
