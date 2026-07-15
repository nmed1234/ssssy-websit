package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuPlacementRequest {
  private UUID menuId;
  private UUID parentId; // nullable — null means top-level
}
