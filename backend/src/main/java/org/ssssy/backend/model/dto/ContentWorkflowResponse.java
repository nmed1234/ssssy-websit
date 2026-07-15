package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentWorkflowResponse {
  private UUID contentId;
  private String titleAr;
  private String titleEn;
  private String contentType;
  private String currentStatus;
  private Integer version;
  private UUID authorId;
  private String authorName;
  private UUID reviewerId;
  private String reviewerName;
  private UUID publisherId;
  private String publisherName;
  private LocalDateTime publishedAt;
  private LocalDateTime scheduledAt;
  private List<WorkflowActionResponse> workflowActions;
  private boolean canSubmit;
  private boolean canApprove;
  private boolean canReject;
  private boolean canPublish;
  private boolean canSchedule;

  @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
  public static class WorkflowActionResponse {
    private UUID id;
    private String action;
    private String fromState;
    private String toState;
    private String actorName;
    private String comment;
    private LocalDateTime createdAt;
  }
}
