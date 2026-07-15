package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailAliasRequest {
  @NotBlank
  private String aliasAddress;
  private UUID accountId;
  private Boolean isActive;
}
