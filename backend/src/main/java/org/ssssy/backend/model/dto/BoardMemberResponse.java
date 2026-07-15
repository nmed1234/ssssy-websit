package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardMemberResponse {
  private UUID id;
  private UUID userId;
  private String memberName;
  private String memberNameAr;
  private String memberPhoto;
  private String positionAr;
  private String positionEn;
  private LocalDate termStart;
  private LocalDate termEnd;
  private String bio;
  private String photoUrl;
  private Integer sortOrder;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
