package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventRegistrationResponse {
  private UUID id;
  private UUID eventId;
  private UUID userId;
  private String userName;
  private String userEmail;
  private String name;
  private String email;
  private String phone;
  private String organization;
  private String notes;
  private String status;
  private LocalDateTime registeredAt;
  private Boolean checkedIn;
  private LocalDateTime createdAt;
}
