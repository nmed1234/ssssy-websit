package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowStateRequest {
  private UUID id;
  @NotBlank
  private String name;
  @NotBlank
  private String labelAr;
  @NotBlank
  private String labelEn;
  private String color;
  private Boolean isInitial;
  private Boolean isFinal;
  private Integer sortOrder;
}
