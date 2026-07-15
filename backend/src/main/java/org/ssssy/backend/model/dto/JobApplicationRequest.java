package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class JobApplicationRequest {
  private String firstName;
  private String lastName;
  private String email;
  private String phone;
  private String coverLetter;
}
