package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class MediaFolderRequest {

  @NotBlank
  private String name;

  private UUID parentId;
}
