package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailContactRequest {
  @NotBlank @Email
  private String email;
  private String firstName;
  private String lastName;
  private String displayName;
  private String company;
  private String position;
  private String phone;
  private String mobile;
  private String notes;
  private Boolean isFavorite;
  private List<UUID> groupIds;
}
