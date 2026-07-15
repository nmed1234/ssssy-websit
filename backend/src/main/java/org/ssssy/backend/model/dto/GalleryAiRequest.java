package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class GalleryAiRequest {

  @NotNull(message = "Album ID is required")
  private UUID albumId;

  private UUID imageId;

  private String prompt;
}
