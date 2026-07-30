package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MemberProfileRequest {
  private String membershipType;
  private String specialization;
  private String specializationDetail;
  private String researchInterests;
  private String education;
  private Boolean isPublic;
  private LocalDate joinedAt;
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
}
