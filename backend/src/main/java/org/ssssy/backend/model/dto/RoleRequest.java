package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter @Setter
public class RoleRequest {

  @NotBlank @Size(max = 50)
  private String name;

  @Size(max = 100)
  private String displayNameAr;

  @Size(max = 100)
  private String displayNameEn;

  private String description;

  private Integer hierarchyLevel;

  private List<UUID> permissionIds;
}
