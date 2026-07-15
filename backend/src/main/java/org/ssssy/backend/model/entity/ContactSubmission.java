package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactSubmission {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, length = 320)
  private String email;

  @Column(length = 50)
  private String phone;

  @Column(nullable = false, length = 500)
  private String subject;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(name = "is_read")
  private Boolean isRead;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "read_by")
  private User readBy;

  @Column(name = "replied_at")
  private LocalDateTime repliedAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isRead == null) isRead = false;
  }
}
