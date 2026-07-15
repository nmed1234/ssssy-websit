package org.ssssy.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateProfileRequest {

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
}
