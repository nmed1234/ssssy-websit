package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class CategoryRequest {

  @NotBlank
  private String nameAr;

  private String nameEn;

  @NotBlank
  private String slug;

  private String description;
  private UUID parentId;
  private Integer sortOrder;
  private Boolean isActive;
}
