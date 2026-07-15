package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailFolderRequest {
  @NotBlank
  private String name;
  private UUID parentId;
  private Integer sortOrder;
}
