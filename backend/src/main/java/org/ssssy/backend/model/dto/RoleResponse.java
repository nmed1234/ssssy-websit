package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class RoleResponse {

  private UUID id;
  private String name;
  private String displayNameAr;
  private String displayNameEn;
  private String description;
  private Integer hierarchyLevel;
  private Boolean isSystem;
  private List<String> permissions;

  public RoleResponse() {}
}
