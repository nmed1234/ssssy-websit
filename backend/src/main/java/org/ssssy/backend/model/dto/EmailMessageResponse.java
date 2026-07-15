package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailMessageResponse {
  private UUID id;
  private UUID accountId;
  private UUID folderId;
  private String messageId;
  private String inReplyTo;
  private UUID threadId;
  private String senderAddress;
  private String senderName;
  private String replyToAddress;
  private String subject;
  private String bodyText;
  private String bodyHtml;
  private String previewText;
  private Boolean hasAttachments;
  private Integer attachmentCount;
  private String priority;
  private Boolean isRead;
  private Boolean isStarred;
  private Boolean isFlagged;
  private Boolean isDraft;
  private Boolean isScheduled;
  private LocalDateTime scheduledSendAt;
  private LocalDateTime actuallySentAt;
  private String deliveryStatus;
  private List<EmailRecipientResponse> recipients;
  private List<EmailAttachmentResponse> attachments;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
