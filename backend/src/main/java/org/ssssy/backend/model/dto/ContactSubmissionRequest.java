package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ContactSubmissionRequest {

  @NotBlank
  private String name;

  @NotBlank @Email
  private String email;

  @NotBlank
  private String subject;

  @NotBlank
  private String message;

  private String phone;
}
