package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAccount {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "email_address", length = 320, nullable = false, unique = true)
  private String emailAddress;

  @Column(nullable = false, unique = true, length = 100)
  private String username;

  @Column(name = "password_hash", length = 255, nullable = false)
  private String passwordHash;

  @Column(name = "display_name", length = 200)
  private String displayName;

  @Column(name = "quota_bytes")
  private Long quotaBytes;

  @Column(name = "used_bytes")
  private Long usedBytes;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "is_verified")
  private Boolean isVerified;

  @Column(name = "auto_reply_enabled")
  private Boolean autoReplyEnabled;

  @Column(name = "auto_reply_subject", length = 500)
  private String autoReplySubject;

  @Column(name = "auto_reply_body", columnDefinition = "TEXT")
  private String autoReplyBody;

  @Column(name = "auto_reply_starts_at")
  private LocalDateTime autoReplyStartsAt;

  @Column(name = "auto_reply_ends_at")
  private LocalDateTime autoReplyEndsAt;

  @Column(name = "forward_to", length = 320)
  private String forwardTo;

  @Column(name = "forward_keep_copy")
  private Boolean forwardKeepCopy;

  @Column(columnDefinition = "TEXT")
  private String signature;

  @Column(name = "imap_subscribed")
  private Boolean imapSubscribed;

  @Column(name = "last_sync_at")
  private LocalDateTime lastSyncAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
    if (isVerified == null) isVerified = false;
    if (autoReplyEnabled == null) autoReplyEnabled = false;
    if (forwardKeepCopy == null) forwardKeepCopy = true;
    if (imapSubscribed == null) imapSubscribed = true;
    if (usedBytes == null) usedBytes = 0L;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
