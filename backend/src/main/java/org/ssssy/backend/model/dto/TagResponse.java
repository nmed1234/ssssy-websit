package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class TagResponse {

  private UUID id;
  private String nameAr;
  private String nameEn;
  private String slug;
  private LocalDateTime createdAt;

  public TagResponse() {}
}
