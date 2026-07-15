package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmContactResponse {
  private UUID id;
  private String firstName;
  private String lastName;
  private String email;
  private String phone;
  private String organization;
  private String position;
  private String contactType;
  private String relationshipLevel;
  private String notes;
  private String source;
  private Boolean isPrimary;
  private Boolean isActive;
  private String lastContactAt;
  private String nextFollowupAt;
  private String[] tags;
  private String preferences;
  private String createdAt;
  private String updatedAt;
}