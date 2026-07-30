package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.ssssy.backend.security.ValidPassword;

@Getter @Setter
public class ChangePasswordRequest {

  @NotBlank
  private String currentPassword;

  @NotBlank @ValidPassword
  private String newPassword;
}
