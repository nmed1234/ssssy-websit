package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BoardMemberRequest {
  private UUID userId;
  private String positionAr;
  private String positionEn;
  private LocalDate termStart;
  private LocalDate termEnd;
  private String bio;
  private String photoUrl;
  private Integer sortOrder;
  private Boolean isActive;
}
