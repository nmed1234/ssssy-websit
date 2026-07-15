package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class UserResponse {

  private UUID id;
  private String username;
  private String email;
  private String firstNameAr;
  private String lastNameAr;
  private String firstNameEn;
  private String lastNameEn;
  private String phone;
  private String avatarUrl;
  private String institution;
  private String department;
  private String position;
  private String specialization;
  private String biography;
  private String address;
  private String city;
  private String country;
  private Boolean twoFactorEnabled;
  private String role;
  private String roleDisplayNameAr;
  private String roleDisplayNameEn;
  private Boolean isActive;
  private Boolean isEmailVerified;
  private LocalDateTime emailVerifiedAt;
  private LocalDateTime lastLoginAt;
  private LocalDateTime createdAt;

  public UserResponse() {}
}
