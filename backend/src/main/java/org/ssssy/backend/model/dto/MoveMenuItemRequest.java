package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MoveMenuItemRequest {
  private UUID itemId;
  private UUID parentId; // nullable — null means top-level
  private Integer sortOrder;
}
