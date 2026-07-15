package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowTransitionRequest {
  private UUID id;
  @NotNull
  private UUID fromStateId;
  @NotNull
  private UUID toStateId;
  @NotBlank
  private String name;
  private String rolesAllowed;
  private Boolean requireComment;
  private String conditions;
  private Integer sortOrder;
}
