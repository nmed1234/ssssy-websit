package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentApprovalLogResponse {

  private UUID id;
  private String contentType;
  private UUID contentId;
  private String oldStatus;
  private String newStatus;
  private String comments;
  private UUID actionById;
  private String actionByName;
  private LocalDateTime createdAt;
}
