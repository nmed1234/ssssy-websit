package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class PermissionResponse {

  private UUID id;
  private String name;
  private String displayName;
  private String category;
  private String description;

  public PermissionResponse() {}
}
