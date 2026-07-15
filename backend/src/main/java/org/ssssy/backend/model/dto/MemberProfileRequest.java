package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MemberProfileRequest {
  private String membershipType;
  private String specialization;
  private String researchInterests;
  private String education;
  private Boolean isPublic;
  private LocalDate joinedAt;
  private String orcidId;
  private String googleScholarUrl;
  private String linkedinUrl;
}
