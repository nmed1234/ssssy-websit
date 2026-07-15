package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowActionRequest {
  private String comments;
  private UUID assigneeId;
}
