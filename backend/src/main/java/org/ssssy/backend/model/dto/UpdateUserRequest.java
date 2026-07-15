package org.ssssy.backend.model.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class UpdateUserRequest {

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
  private Boolean isActive;
  private UUID roleId;
}
