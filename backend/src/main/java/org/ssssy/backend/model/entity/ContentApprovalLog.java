package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_approval_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentApprovalLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "content_type", nullable = false, length = 100)
  private String contentType;

  @Column(name = "content_id", nullable = false)
  private UUID contentId;

  @Column(name = "old_status", length = 50)
  private String oldStatus;

  @Column(name = "new_status", nullable = false, length = 50)
  private String newStatus;

  @Column(columnDefinition = "TEXT")
  private String comments;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "action_by")
  private User actionBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
