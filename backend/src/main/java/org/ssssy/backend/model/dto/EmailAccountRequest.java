package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailAccountRequest {
  @NotBlank
  private String username;
  @NotBlank @Email
  private String emailAddress;
  private String displayName;
  private String password;
  private Long quotaBytes;
}
