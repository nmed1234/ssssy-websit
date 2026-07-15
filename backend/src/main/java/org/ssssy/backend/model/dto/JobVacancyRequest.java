package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class JobVacancyRequest {
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
}
