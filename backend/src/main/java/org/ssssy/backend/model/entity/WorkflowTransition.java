package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_transitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowTransition {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workflow_id", nullable = false)
  private Workflow workflow;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "from_state_id", nullable = false)
  private WorkflowState fromState;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_state_id", nullable = false)
  private WorkflowState toState;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "roles_allowed", columnDefinition = "jsonb", nullable = false)
  private String rolesAllowed;

  @Column(name = "require_comment")
  private Boolean requireComment;

  @Column(columnDefinition = "jsonb")
  private String conditions;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (rolesAllowed == null) rolesAllowed = "[]";
    if (requireComment == null) requireComment = false;
    if (conditions == null) conditions = "{}";
    if (sortOrder == null) sortOrder = 0;
  }
}
