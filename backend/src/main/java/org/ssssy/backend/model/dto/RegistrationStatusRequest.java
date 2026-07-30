package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegistrationStatusRequest {
  private String status;  // CONFIRMED | CANCELLED | WAITLISTED | CHECKED_IN
  private String notes;
}
