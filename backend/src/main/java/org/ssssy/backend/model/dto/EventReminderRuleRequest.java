package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventReminderRuleRequest {
  private String ruleType;        // BEFORE_EVENT | AFTER_EVENT | CUSTOM_DATE
  private Integer offsetHours;    // e.g. 24 means "24 hours before event"
  private LocalDateTime fireAt;   // explicit fire time (used for CUSTOM_DATE)
  private String subjectTemplate;
  private String bodyTemplate;
  private Boolean sendEmail;
  private Boolean sendInApp;
}
