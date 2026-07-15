package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PageSectionRequest {
  private UUID pageId;
  private String componentType;
  private String config;
  private String data;
  private String styling;
  private Integer sortOrder;
  private String visibility;
  private Boolean isAnimated;
  private String animationType;
  private String eventsJson;
  private String conditionsJson;
}
