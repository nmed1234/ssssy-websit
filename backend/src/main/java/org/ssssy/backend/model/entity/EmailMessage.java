package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id")
  private EmailAccount account;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id")
  private EmailFolder folder;

  @Column(name = "message_id", length = 500)
  private String messageId;

  @Column(name = "in_reply_to", length = 500)
  private String inReplyTo;

  @Column(name = "references_header", columnDefinition = "TEXT")
  private String referencesHeader;

  @Column(name = "thread_id")
  private UUID threadId;

  @Column(name = "sender_address", length = 320, nullable = false)
  private String senderAddress;

  @Column(name = "sender_name", length = 200)
  private String senderName;

  @Column(name = "reply_to_address", length = 320)
  private String replyToAddress;

  @Column(name = "reply_to_name", length = 200)
  private String replyToName;

  @Column(length = 998)
  private String subject;

  @Column(name = "body_text", columnDefinition = "TEXT")
  private String bodyText;

  @Column(name = "body_html", columnDefinition = "TEXT")
  private String bodyHtml;

  @Column(name = "preview_text", length = 500)
  private String previewText;

  @Column(name = "size_bytes")
  private Integer sizeBytes;

  @Column(name = "has_attachments")
  private Boolean hasAttachments;

  @Column(name = "attachment_count")
  private Integer attachmentCount;

  @Column(length = 20)
  private String priority;

  @Column(name = "is_read")
  private Boolean isRead;

  @Column(name = "is_flagged")
  private Boolean isFlagged;

  @Column(name = "is_starred")
  private Boolean isStarred;

  @Column(name = "is_draft")
  private Boolean isDraft;

  @Column(name = "is_scheduled")
  private Boolean isScheduled;

  @Column(name = "scheduled_send_at")
  private LocalDateTime scheduledSendAt;

  @Column(name = "actually_sent_at")
  private LocalDateTime actuallySentAt;

  @Column(name = "imap_uid")
  private Long imapUid;

  @Column(name = "delivery_status", length = 30)
  private String deliveryStatus;

  @Column(name = "bounce_message", columnDefinition = "TEXT")
  private String bounceMessage;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isRead == null) isRead = false;
    if (isDraft == null) isDraft = false;
    if (isScheduled == null) isScheduled = false;
    if (isFlagged == null) isFlagged = false;
    if (isStarred == null) isStarred = false;
    if (hasAttachments == null) hasAttachments = false;
    if (attachmentCount == null) attachmentCount = 0;
    if (priority == null) priority = "NORMAL";
    if (deliveryStatus == null) deliveryStatus = "PENDING";
    if (sizeBytes == null) sizeBytes = 0;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
