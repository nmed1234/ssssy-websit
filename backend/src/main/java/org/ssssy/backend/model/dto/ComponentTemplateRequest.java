package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ComponentTemplateRequest {
  @NotBlank
  private String name;
  @NotBlank
  private String category;
  @NotBlank
  private String componentType;
  private String thumbnailUrl;
  private String defaultConfig;
  private String defaultData;
  private String defaultStyling;
  private Boolean isSystem;
  private Integer sortOrder;
}
