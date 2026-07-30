package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired when a comment is created (before or after approval depending on moderation setting).
 */
public class CommentPostedEvent extends CmsEvent {

  private final UUID commentId;
  private final UUID contentId;
  private final String contentType;
  private final String commentBody;
  private final boolean requiresModeration;
  private final UUID parentCommentId;

  public CommentPostedEvent(UUID commentId, UUID contentId, String contentType,
      String commentBody, boolean requiresModeration, UUID parentCommentId, UUID authorId) {
    super(authorId);
    this.commentId = commentId;
    this.contentId = contentId;
    this.contentType = contentType;
    this.commentBody = commentBody;
    this.requiresModeration = requiresModeration;
    this.parentCommentId = parentCommentId;
  }

  @Override
  public String getEventType() { return "COMMENT_POSTED"; }

  public UUID getCommentId() { return commentId; }
  public UUID getContentId() { return contentId; }
  public String getContentType() { return contentType; }
  public String getCommentBody() { return commentBody; }
  public boolean isRequiresModeration() { return requiresModeration; }
  public UUID getParentCommentId() { return parentCommentId; }
  public boolean isReply() { return parentCommentId != null; }
}
