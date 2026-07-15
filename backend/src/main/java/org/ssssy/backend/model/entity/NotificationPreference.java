package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "workflow_email")
  private Boolean workflowEmail;

  @Column(name = "workflow_inapp")
  private Boolean workflowInapp;

  @Column(name = "email_received_email")
  private Boolean emailReceivedEmail;

  @Column(name = "email_received_inapp")
  private Boolean emailReceivedInapp;

  @Column(name = "system_announcement_email")
  private Boolean systemAnnouncementEmail;

  @Column(name = "system_announcement_inapp")
  private Boolean systemAnnouncementInapp;

  @Column(name = "comment_email")
  private Boolean commentEmail;

  @Column(name = "comment_inapp")
  private Boolean commentInapp;

  @Column(name = "event_reminder_email")
  private Boolean eventReminderEmail;

  @Column(name = "event_reminder_inapp")
  private Boolean eventReminderInapp;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (workflowEmail == null) workflowEmail = true;
    if (workflowInapp == null) workflowInapp = true;
    if (emailReceivedEmail == null) emailReceivedEmail = true;
    if (emailReceivedInapp == null) emailReceivedInapp = true;
    if (systemAnnouncementEmail == null) systemAnnouncementEmail = true;
    if (systemAnnouncementInapp == null) systemAnnouncementInapp = true;
    if (commentEmail == null) commentEmail = false;
    if (commentInapp == null) commentInapp = true;
    if (eventReminderEmail == null) eventReminderEmail = true;
    if (eventReminderInapp == null) eventReminderInapp = true;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
