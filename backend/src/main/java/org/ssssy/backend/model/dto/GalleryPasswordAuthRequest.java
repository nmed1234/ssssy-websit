package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class GalleryPasswordAuthRequest {

  @NotNull(message = "Album ID is required")
  private UUID albumId;

  @NotBlank(message = "Password is required")
  private String password;
}
