package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persistent audit log of every CMS event fired through CmsEventBus.
 * Useful for debugging, analytics, and plugin activity monitoring.
 */
@Entity
@Table(name = "cms_event_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CmsEventLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "event_id", nullable = false)
  private UUID eventId;

  @Column(name = "event_type", nullable = false, length = 100)
  private String eventType;

  @Column(name = "actor_id")
  private UUID actorId;

  @Column(name = "occurred_at", nullable = false)
  private LocalDateTime occurredAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
