package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Response DTO for an installed plugin entry. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PluginResponse {

  private UUID id;
  private String pluginId;
  private String pluginName;
  private String version;
  private String author;
  private String description;
  /** INSTALLED | ACTIVE | INACTIVE | ERROR | UNINSTALLED */
  private String status;
  /** CLASSPATH | JAR */
  private String source;
  private String jarPath;
  private String errorMessage;
  private String configJson;
  private String manifestJson;
  private List<String> permissions;
  private LocalDateTime installedAt;
  private LocalDateTime activatedAt;
  private LocalDateTime deactivatedAt;
  private LocalDateTime updatedAt;
}
