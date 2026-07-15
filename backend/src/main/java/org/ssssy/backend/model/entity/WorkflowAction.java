package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_actions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowAction {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "content_id", nullable = false)
  private ContentItem content;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workflow_id", nullable = false)
  private Workflow workflow;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "from_state_id")
  private WorkflowState fromState;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_state_id", nullable = false)
  private WorkflowState toState;

  @Column(nullable = false, length = 50)
  private String action;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id", nullable = false)
  private User actor;

  @Column(columnDefinition = "TEXT")
  private String comments;

  @Column(columnDefinition = "jsonb")
  private String metadata;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (metadata == null) metadata = "{}";
  }
}
