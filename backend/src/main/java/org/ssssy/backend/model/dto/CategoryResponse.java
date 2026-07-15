package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class CategoryResponse {

  private UUID id;
  private String nameAr;
  private String nameEn;
  private String slug;
  private String description;
  private UUID parentId;
  private String parentName;
  private Integer sortOrder;
  private Boolean isActive;
  private Long contentCount;
  private LocalDateTime createdAt;

  public CategoryResponse() {}
}
