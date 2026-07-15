package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailContactResponse {
  private UUID id;
  private UUID ownerId;
  private String email;
  private String firstName;
  private String lastName;
  private String displayName;
  private String company;
  private String position;
  private String phone;
  private String mobile;
  private String notes;
  private Boolean isFavorite;
  private LocalDateTime createdAt;
}
