package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "member_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "membership_type", length = 50)
  private String membershipType;

  @Column(name = "membership_number", unique = true, length = 50)
  private String membershipNumber;

  @Column(length = 255)
  private String specialization;

  @Column(name = "research_interests", columnDefinition = "TEXT")
  private String researchInterests;

  @Column(columnDefinition = "TEXT")
  private String education;

  @Column(name = "publications_count")
  private Integer publicationsCount;

  @Column(name = "is_public")
  private Boolean isPublic;

  @Column(name = "joined_at")
  private LocalDate joinedAt;

  @Column(name = "membership_expires_at")
  private LocalDate membershipExpiresAt;

  @Column(name = "orcid_id", length = 100)
  private String orcidId;

  @Column(name = "google_scholar_url", length = 500)
  private String googleScholarUrl;

  @Column(name = "linkedin_url", length = 500)
  private String linkedinUrl;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isPublic == null) isPublic = true;
    if (publicationsCount == null) publicationsCount = 0;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
