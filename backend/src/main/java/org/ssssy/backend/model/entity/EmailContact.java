package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailContact {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id")
  private User owner;

  @Column(nullable = false, length = 320)
  private String email;

  @Column(name = "first_name", length = 100)
  private String firstName;

  @Column(name = "last_name", length = 100)
  private String lastName;

  @Column(name = "display_name", length = 200)
  private String displayName;

  @Column(length = 200)
  private String company;

  @Column(length = 200)
  private String position;

  @Column(length = 50)
  private String phone;

  @Column(length = 50)
  private String mobile;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(name = "is_favorite")
  private Boolean isFavorite;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isFavorite == null) isFavorite = false;
  }
}
