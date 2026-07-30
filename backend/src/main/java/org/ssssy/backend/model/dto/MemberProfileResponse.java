package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberProfileResponse {
  private UUID id;
  private UUID userId;
  private String firstName;
  private String lastName;
  private String email;
  private String photo;
  private String institution;
  private String department;
  private String position;
  private String phone;
  private String membershipType;
  private String membershipNumber;
  private String specialization;
  private String specializationDetail;
  private String researchInterests;
  private String education;
  private Integer publicationsCount;
  private Boolean isPublic;
  private LocalDate joinedAt;
  private LocalDate membershipExpiresAt;
  private String orcidId;
  private String googleScholarUrl;
  private String linkedinUrl;
  // Rich fields
  private String nameAr;
  private String nameEn;
  private String titleAr;
  private Integer birthYear;
  private String birthCity;
  private String nationality;
  private String maritalStatus;
  private String careerSummary;
  private String memberships;
  private String languages;
  private String photoUrl;
  private String slug;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
