package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComponentPresetResponse {

  private UUID id;
  private String componentType;
  private String nameAr;
  private String nameEn;
  private String configJson;
  private String dataJson;
  private String stylingJson;
  private Boolean isSystem;
  private UUID createdById;
  private String createdByName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
