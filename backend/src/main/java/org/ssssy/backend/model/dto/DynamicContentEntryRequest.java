package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Request to create or update a dynamic content entry. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DynamicContentEntryRequest {

  /** JSON object string — all field key-value pairs. */
  private String fieldData;

  private String slug;
  private String status;
  private String featuredImageUrl;
  private String metaTitle;
  private String metaDescription;
}
