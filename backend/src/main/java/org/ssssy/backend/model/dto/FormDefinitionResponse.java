package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormDefinitionResponse {
  private UUID id;
  private String title;
  private String titleAr;
  private String slug;
  private String description;
  private String schemaJson;
  private String submitLabelEn;
  private String submitLabelAr;
  private String successMessageEn;
  private String successMessageAr;
  private String redirectUrl;
  private String notificationEmails;
  private Boolean requiresAuth;
  private Boolean isActive;
  private String createdByUsername;
  private long submissionCount;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
