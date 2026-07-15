package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowDefinitionResponse {
  private UUID id;
  private String contentType;
  private String nameAr;
  private String nameEn;
  private String description;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<WorkflowStateResponse> states;
  private List<WorkflowTransitionResponse> transitions;
}
