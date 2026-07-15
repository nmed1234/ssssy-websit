package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class GalleryShareLinkRequest {

  @NotNull(message = "Album ID is required")
  private UUID albumId;

  private LocalDateTime expiresAt;
  private Integer maxViews;
}
