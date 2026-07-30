package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_reminder_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventReminderRule {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  /** BEFORE_EVENT | AFTER_EVENT | CUSTOM_DATE */
  @Column(name = "rule_type", length = 30, nullable = false)
  private String ruleType;

  /** Hours offset from eventDate (positive = before, used when ruleType = BEFORE_EVENT / AFTER_EVENT) */
  @Column(name = "offset_hours", nullable = false)
  private Integer offsetHours;

  /** Computed absolute fire time */
  @Column(name = "fire_at", nullable = false)
  private LocalDateTime fireAt;

  @Column(name = "subject_template", columnDefinition = "TEXT", nullable = false)
  private String subjectTemplate;

  @Column(name = "body_template", columnDefinition = "TEXT", nullable = false)
  private String bodyTemplate;

  @Column(name = "send_email")
  private Boolean sendEmail;

  @Column(name = "send_in_app")
  private Boolean sendInApp;

  @Column(name = "is_fired")
  private Boolean isFired;

  @Column(name = "fired_at")
  private LocalDateTime firedAt;

  @Column(name = "recipients_count")
  private Integer recipientsCount;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isFired == null)   isFired   = false;
    if (sendEmail == null) sendEmail = true;
    if (sendInApp == null) sendInApp = true;
    if (ruleType == null)  ruleType  = "BEFORE_EVENT";
    if (offsetHours == null) offsetHours = 24;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
