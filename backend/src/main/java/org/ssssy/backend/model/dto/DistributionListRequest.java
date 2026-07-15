package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DistributionListRequest {
  @NotBlank
  private String name;
  @NotBlank
  private String emailAddress;
  private String description;
  private String listType;
  private Boolean isPublic;
  private Boolean allowExternal;
  private UUID moderatorId;
  private Boolean requiresModeration;
}
