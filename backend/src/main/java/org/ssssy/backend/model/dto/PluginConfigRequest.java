package org.ssssy.backend.model.dto;

import lombok.*;

/** Request to update a plugin's admin-editable configuration JSON. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PluginConfigRequest {
  /** The full configuration JSON object string to save. */
  private String configJson;
}
