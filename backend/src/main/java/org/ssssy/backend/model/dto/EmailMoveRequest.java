package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailMoveRequest {
  @NotNull
  private UUID targetFolderId;
  private List<UUID> messageIds;
}
