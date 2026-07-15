package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmContact {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 200)
  private String firstName;

  @Column(nullable = false, length = 200)
  private String lastName;

  @Column(nullable = false, length = 320)
  private String email;

  @Column(length = 50)
  private String phone;

  @Column(length = 500)
  private String organization;

  @Column(length = 500)
  private String position;

  @Column(name = "contact_type", length = 50)
  private String contactType;

  @Column(name = "relationship_level", length = 50)
  private String relationshipLevel;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(length = 100)
  private String source;

  @Column(name = "is_primary")
  private Boolean isPrimary;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "last_contact_at")
  private LocalDateTime lastContactAt;

  @Column(name = "next_followup_at")
  private LocalDateTime nextFollowupAt;

  @Column(name = "tags", columnDefinition = "TEXT[]")
  private String[] tags;

  @Column(name = "preferences", columnDefinition = "TEXT")
  private String preferences;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
    if (isPrimary == null) isPrimary = false;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public String getFullName() {
    return firstName + " " + lastName;
  }
}