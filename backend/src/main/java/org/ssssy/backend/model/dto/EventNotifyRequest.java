package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventNotifyRequest {
  private String subject;
  private String htmlBody;
  private String textBody;
  /** ALL | CONFIRMED | WAITLISTED | CANCELLED */
  private String targetStatus;
}
