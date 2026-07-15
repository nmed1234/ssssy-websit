package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSectionResponse {

  private UUID id;
  private String name;
  private String slug;
  private String componentType;
  private String config;
  private String data;
  private String styling;
  private String eventsJson;
  private String conditionsJson;
  private Integer version;
  private Boolean isActive;
  private String location;
  private Integer sortOrder;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
