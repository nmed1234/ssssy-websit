package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_recipients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailRecipient {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "message_id")
  private EmailMessage message;

  @Column(name = "recipient_type", length = 20, nullable = false)
  private String recipientType;

  @Column(nullable = false, length = 320)
  private String address;

  @Column(length = 200)
  private String name;

  @Column(name = "is_internal")
  private Boolean isInternal;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isInternal == null) isInternal = false;
  }
}
