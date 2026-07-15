package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailBatchActionRequest {
  private List<UUID> messageIds;
  private String action;
  private UUID targetFolderId;
}
