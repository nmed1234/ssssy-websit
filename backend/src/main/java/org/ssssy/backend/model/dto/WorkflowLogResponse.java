package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowLogResponse {
  private UUID id;
  private UUID contentId;
  private String fromStatus;
  private String toStatus;
  private String action;
  private UUID actorId;
  private String actorName;
  private UUID assigneeId;
  private String assigneeName;
  private String comments;
  private LocalDateTime createdAt;
}
