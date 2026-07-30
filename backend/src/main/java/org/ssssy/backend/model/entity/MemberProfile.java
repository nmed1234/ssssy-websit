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

  @Column(name = "specialization_detail", length = 255)
  private String specializationDetail;

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

  // ── Rich fields added in V72 ────────────────────────────────────────────────

  @Column(name = "name_ar", length = 200)
  private String nameAr;

  @Column(name = "name_en", length = 200)
  private String nameEn;

  @Column(name = "title_ar", length = 100)
  private String titleAr;

  @Column(name = "birth_year")
  private Integer birthYear;

  @Column(name = "birth_city", length = 100)
  private String birthCity;

  @Column(name = "nationality", length = 100)
  private String nationality;

  @Column(name = "marital_status", length = 50)
  private String maritalStatus;

  @Column(name = "career_summary", columnDefinition = "TEXT")
  private String careerSummary;

  @Column(columnDefinition = "TEXT")
  private String memberships;

  @Column(length = 500)
  private String languages;

  @Column(name = "photo_url", length = 500)
  private String photoUrl;

  @Column(length = 255, unique = true)
  private String slug;

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
