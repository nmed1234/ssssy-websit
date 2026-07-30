package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventReminderRuleResponse {
  private UUID id;
  private UUID eventId;
  private String ruleType;
  private Integer offsetHours;
  private LocalDateTime fireAt;
  private String subjectTemplate;
  private String bodyTemplate;
  private Boolean sendEmail;
  private Boolean sendInApp;
  private Boolean isFired;
  private LocalDateTime firedAt;
  private Integer recipientsCount;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
