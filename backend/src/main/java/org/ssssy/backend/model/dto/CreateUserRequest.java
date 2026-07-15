package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class CreateUserRequest {

  @NotBlank @Size(min = 3, max = 50)
  private String username;

  @NotBlank @Email
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

  @Size(max = 200)
  private String institution;

  @Size(max = 200)
  private String department;

  @Size(max = 200)
  private String position;

  @Size(max = 200)
  private String specialization;

  private String biography;

  @Size(max = 500)
  private String address;

  @Size(max = 100)
  private String city;

  @Size(max = 100)
  private String country;

  private UUID roleId;

  private Boolean isActive;
}
