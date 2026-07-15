package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ComponentPresetRequest {

  @NotBlank
  private String componentType;

  private String nameAr;
  private String nameEn;
  private String configJson;
  private String dataJson;
  private String stylingJson;
  private Boolean isSystem;
}
