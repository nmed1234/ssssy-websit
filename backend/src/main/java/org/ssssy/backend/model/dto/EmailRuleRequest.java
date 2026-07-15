package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailRuleRequest {
  @NotBlank
  private String name;
  private Integer orderIndex;
  private Boolean isEnabled;
  private Boolean stopProcessing;
  private Boolean matchAll;
  private String conditions;
  private String actions;
}
