package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.ssssy.backend.security.ValidPassword;

@Getter @Setter
public class ResetPasswordRequest {

  @NotBlank
  private String token;

  @NotBlank @ValidPassword
  private String newPassword;
}
