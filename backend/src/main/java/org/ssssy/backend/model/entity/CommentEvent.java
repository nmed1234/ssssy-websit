package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "comment_id", nullable = false)
  private Comment comment;

  @Column(name = "event_type", nullable = false, length = 50)
  private String eventType;

  @Column(name = "event_data", columnDefinition = "TEXT")
  private String eventData;

  @Column(name = "entity_type", nullable = false, length = 50)
  private String entityType;

  @Column(name = "entity_id", nullable = false)
  private UUID entityId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "initiated_by", nullable = false)
  private User initiatedBy;

  @Column(name = "recipients")
  private String[] recipients;

  @Column(name = "is_processed")
  private Boolean isProcessed;

  @Column(name = "sent_at")
  private LocalDateTime sentAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isProcessed == null) isProcessed = false;
  }

  public String getEventType() {
    return eventType;
  }

  public UUID getCommentId() {
    return comment != null ? comment.getId() : null;
  }

  public UUID getInitiatedById() {
    return initiatedBy != null ? initiatedBy.getId() : null;
  }
}