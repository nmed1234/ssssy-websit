package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_states")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowState {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workflow_id", nullable = false)
  private Workflow workflow;

  @Column(nullable = false, length = 50)
  private String name;

  @Column(name = "label_ar", nullable = false, length = 255)
  private String labelAr;

  @Column(name = "label_en", nullable = false, length = 255)
  private String labelEn;

  @Column(length = 7)
  private String color;

  @Column(name = "is_initial")
  private Boolean isInitial;

  @Column(name = "is_final")
  private Boolean isFinal;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (color == null) color = "#6B7280";
    if (isInitial == null) isInitial = false;
    if (isFinal == null) isFinal = false;
    if (sortOrder == null) sortOrder = 0;
  }
}
