package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request body for PATCH /api/admin/media-folders/{id} — rename a media folder.
 *
 * Requirements: 16.5
 */
@Getter @Setter
public class MediaFolderRenameRequest {

  @NotBlank
  private String name;
}
