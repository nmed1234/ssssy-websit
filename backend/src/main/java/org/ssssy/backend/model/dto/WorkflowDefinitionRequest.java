package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowDefinitionRequest {
  @NotBlank
  private String contentType;
  @NotBlank
  private String nameAr;
  @NotBlank
  private String nameEn;
  private String description;
  private Boolean isActive;
  private List<WorkflowStateRequest> states;
  private List<WorkflowTransitionRequest> transitions;
}
