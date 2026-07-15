package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplicationResponse {
  private UUID id;
  private UUID jobVacancyId;
  private String jobVacancyTitle;
  private String firstName;
  private String lastName;
  private String email;
  private String phone;
  private String coverLetter;
  private String cvFilePath;
  private String status;
  private LocalDateTime createdAt;
}
