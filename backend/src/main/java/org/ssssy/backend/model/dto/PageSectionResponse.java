package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageSectionResponse {

  private UUID id;
  private UUID pageId;
  private String componentType;
  private String config;
  private String data;
  private String styling;
  private String eventsJson;
  private String conditionsJson;
  private Integer version;
  private Integer sortOrder;
  private String visibility;
  private Boolean isAnimated;
  private String animationType;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  /**
   * Merged JSON of data + config + styling when fetched with ?format=flat.
   * Null when flat=false (default).
   *
   * Requirements: 4.1, 4.2
   */
  private String props;
}
