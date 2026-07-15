package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailDirectoryResponse {
  private UUID userId;
  private String firstNameEn;
  private String lastNameEn;
  private String firstNameAr;
  private String lastNameAr;
  private String email;
  private String department;
  private String position;
  private String institution;
}
