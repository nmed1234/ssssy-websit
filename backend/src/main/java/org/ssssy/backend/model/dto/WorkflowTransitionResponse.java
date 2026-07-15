package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowTransitionResponse {
  private UUID id;
  private UUID workflowId;
  private UUID fromStateId;
  private String fromStateName;
  private UUID toStateId;
  private String toStateName;
  private String name;
  private String rolesAllowed;
  private Boolean requireComment;
  private String conditions;
  private Integer sortOrder;
}
