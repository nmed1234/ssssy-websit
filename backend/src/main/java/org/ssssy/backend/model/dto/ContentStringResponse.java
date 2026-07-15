package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Builder
public class ContentStringResponse {
  private UUID id;
  private String stringKey;
  private String valueEn;
  private String valueAr;
  private String stringGroup;
  private String description;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
