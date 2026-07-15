package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "newsletter_subscribers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsletterSubscriber {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true, length = 255)
  private String email;

  @Column(length = 100)
  private String name;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "subscribed_at", updatable = false)
  private LocalDateTime subscribedAt;

  @Column(name = "unsubscribed_at")
  private LocalDateTime unsubscribedAt;

  @PrePersist
  protected void onCreate() {
    subscribedAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
  }
}
