package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TagRequest {

  @NotBlank
  private String nameAr;

  private String nameEn;

  @NotBlank
  private String slug;
}
