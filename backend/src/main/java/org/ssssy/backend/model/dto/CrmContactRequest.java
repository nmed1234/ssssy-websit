package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CrmContactRequest {
  @NotBlank(message = "First name is required")
  private String firstName;

  @NotBlank(message = "Last name is required")
  private String lastName;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
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
  private String createdById;
}
