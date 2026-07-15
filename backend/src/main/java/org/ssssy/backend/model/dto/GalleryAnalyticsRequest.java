package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class GalleryAnalyticsRequest {

  @NotNull(message = "Album ID is required")
  private UUID albumId;

  private UUID imageId;

  @NotBlank(message = "Event type is required")
  private String eventType;

  private String sessionId;
}
