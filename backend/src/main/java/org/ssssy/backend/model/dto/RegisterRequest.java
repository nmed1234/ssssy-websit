package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterRequest {

  @NotBlank @Size(min = 3, max = 50)
  private String username;

  @NotBlank @Email @Size(max = 255)
  private String email;

  @NotBlank @Size(min = 6, max = 100)
  private String password;

  @Size(max = 100)
  private String firstNameAr;

  @Size(max = 100)
  private String lastNameAr;

  @Size(max = 100)
  private String firstNameEn;

  @Size(max = 100)
  private String lastNameEn;

  private String phone;
}
