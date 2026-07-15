package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailBulkRequest {
  private List<UUID> accountIds;
  private String operation;
  private String value;
}
