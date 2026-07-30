package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormDefinitionRequest {
  private String title;
  private String titleAr;
  private String slug;
  private String description;
  /** JSON array string — field schema */
  private String schemaJson;
  private String submitLabelEn;
  private String submitLabelAr;
  private String successMessageEn;
  private String successMessageAr;
  private String redirectUrl;
  private String notificationEmails;
  private Boolean requiresAuth;
  private Boolean isActive;
}
