package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Response DTO for a dynamic content entry. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DynamicContentEntryResponse {

  private UUID id;
  private String contentTypeName;
  private String contentTypeLabelEn;
  private String contentTypeLabelAr;
  private String slug;
  private String status;
  private UUID authorId;
  private String authorUsername;
  private String authorDisplayName;
  private String workflowState;
  /** Raw JSON object string of all field values. */
  private String fieldData;
  private String featuredImageUrl;
  private String metaTitle;
  private String metaDescription;
  private LocalDateTime publishedAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
