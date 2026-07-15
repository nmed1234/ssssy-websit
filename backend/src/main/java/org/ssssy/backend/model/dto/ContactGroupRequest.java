package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ContactGroupRequest {
  @NotBlank
  private String name;
  private String description;
  private String color;
}
