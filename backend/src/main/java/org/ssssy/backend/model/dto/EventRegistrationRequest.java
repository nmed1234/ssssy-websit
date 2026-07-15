package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventRegistrationRequest {
  private String name;
  private String email;
  private String phone;
  private String organization;
  private String notes;
}
