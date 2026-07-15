package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowActionResponse {
  private UUID id;
  private UUID contentId;
  private UUID workflowId;
  private UUID fromStateId;
  private String fromStateName;
  private UUID toStateId;
  private String toStateName;
  private String action;
  private UUID actorId;
  private String actorName;
  private String comments;
  private String metadata;
  private LocalDateTime createdAt;
}
