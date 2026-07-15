package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class AssignRoleRequest {

  @NotNull
  private UUID roleId;
}
