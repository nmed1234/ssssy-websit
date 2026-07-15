package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 50)
  private String type;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String body;

  @Column(length = 1000)
  private String link;

  @Column(name = "reference_id")
  private UUID referenceId;

  @Column(name = "reference_type", length = 50)
  private String referenceType;

  @Column(name = "is_read")
  private Boolean isRead;

  @Column(name = "is_archived")
  private Boolean isArchived;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isRead == null) isRead = false;
    if (isArchived == null) isArchived = false;
  }
}
