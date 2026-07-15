package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAliasResponse {
  private UUID id;
  private UUID accountId;
  private String emailAddress;
  private String aliasAddress;
  private Boolean isActive;
  private LocalDateTime createdAt;
}
