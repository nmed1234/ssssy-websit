package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CommentRequest {
  @NotNull(message = "Content ID is required")
  private UUID contentId;

  private UUID parentId;

  @NotBlank(message = "Comment body is required")
  private String body;
}
