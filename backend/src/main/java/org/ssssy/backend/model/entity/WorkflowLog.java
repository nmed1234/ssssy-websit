package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "content_id", nullable = false)
  private ContentItem content;

  @Column(name = "from_status", length = 30)
  private String fromStatus;

  @Column(name = "to_status", nullable = false, length = 30)
  private String toStatus;

  @Column(nullable = false, length = 50)
  private String action;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id", nullable = false)
  private User actor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assignee_id")
  private User assignee;

  @Column(columnDefinition = "TEXT")
  private String comments;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
