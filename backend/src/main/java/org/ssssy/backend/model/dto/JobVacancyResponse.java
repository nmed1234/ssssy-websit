package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobVacancyResponse {
  private UUID id;
  private String titleAr;
  private String titleEn;
  private String slug;
  private String description;
  private String requirements;
  private String location;
  private String jobType;
  private String department;
  private LocalDate deadline;
  private Boolean isPublished;
  private String createdByName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
