package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired on every workflow state transition for content items.
 * Includes SUBMIT, ASSIGN_REVIEWER, APPROVE, REJECT, REQUEST_REVISION, PUBLISH, SCHEDULE, ARCHIVE.
 */
public class ContentWorkflowTransitionEvent extends CmsEvent {

  private final UUID contentId;
  private final String contentType;
  private final String titleEn;
  private final String action;
  private final String fromState;
  private final String toState;
  private final String comments;
  private final UUID targetUserId;  // reviewer or author being notified

  public ContentWorkflowTransitionEvent(UUID contentId, String contentType, String titleEn,
      String action, String fromState, String toState,
      String comments, UUID actorId, UUID targetUserId) {
    super(actorId);
    this.contentId = contentId;
    this.contentType = contentType;
    this.titleEn = titleEn;
    this.action = action;
    this.fromState = fromState;
    this.toState = toState;
    this.comments = comments;
    this.targetUserId = targetUserId;
  }

  @Override
  public String getEventType() { return "CONTENT_WORKFLOW_TRANSITION"; }

  public UUID getContentId() { return contentId; }
  public String getContentType() { return contentType; }
  public String getTitleEn() { return titleEn; }
  public String getAction() { return action; }
  public String getFromState() { return fromState; }
  public String getToState() { return toState; }
  public String getComments() { return comments; }
  public UUID getTargetUserId() { return targetUserId; }
}
