package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComponentTemplateResponse {
  private UUID id;
  private String name;
  private String category;
  private String componentType;
  private String thumbnailUrl;
  private String defaultConfig;
  private String defaultData;
  private String defaultStyling;
  private Boolean isSystem;
  private Integer sortOrder;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
