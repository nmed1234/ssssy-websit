package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SiteSectionRequest {

  @NotBlank
  private String name;

  private String slug;

  @NotBlank
  private String componentType;

  private String config;

  private String data;

  private String styling;

  private String location;

  private Boolean isActive;

  private Integer sortOrder;

  private String eventsJson;

  private String conditionsJson;
}
