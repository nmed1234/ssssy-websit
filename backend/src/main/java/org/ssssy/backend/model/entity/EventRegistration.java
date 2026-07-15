package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_registrations", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"event_id", "user_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventRegistration {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, length = 320)
  private String email;

  @Column(length = 50)
  private String phone;

  @Column(length = 500)
  private String organization;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(length = 50)
  private String status;

  @Column(name = "registered_at")
  private LocalDateTime registeredAt;

  @Column(name = "checked_in")
  private Boolean checkedIn;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (registeredAt == null) registeredAt = LocalDateTime.now();
    if (status == null) status = "CONFIRMED";
    if (checkedIn == null) checkedIn = false;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
