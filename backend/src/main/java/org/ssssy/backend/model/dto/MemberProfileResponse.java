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
  private String membershipType;
  private String membershipNumber;
  private String specialization;
  private String researchInterests;
  private String education;
  private Integer publicationsCount;
  private Boolean isPublic;
  private LocalDate joinedAt;
  private LocalDate membershipExpiresAt;
  private String orcidId;
  private String googleScholarUrl;
  private String linkedinUrl;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
