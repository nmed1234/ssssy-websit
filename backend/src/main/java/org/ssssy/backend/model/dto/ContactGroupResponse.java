package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactGroupResponse {
  private UUID id;
  private UUID ownerId;
  private String name;
  private String description;
  private String color;
  private Integer memberCount;
  private LocalDateTime createdAt;
}
