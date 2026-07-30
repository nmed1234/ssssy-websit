package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Phase 5 — Plugin registry entry.
 *
 * One row per installed plugin. Status tracks the lifecycle:
 *   INSTALLED  → plugin is registered but not yet activated
 *   ACTIVE     → onActivate() was called successfully
 *   INACTIVE   → admin deactivated the plugin (onDeactivate() was called)
 *   ERROR      → last activation attempt failed (see errorMessage)
 *   UNINSTALLED → soft-deleted row; plugin was fully removed
 */
@Entity
@Table(name = "installed_plugins")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstalledPlugin {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** Unique plugin identifier, e.g. "sssy-doi-resolver". */
  @Column(name = "plugin_id", nullable = false, unique = true, length = 100)
  private String pluginId;

  @Column(name = "plugin_name", nullable = false, length = 255)
  private String pluginName;

  @Column(nullable = false, length = 50)
  private String version;

  @Column(length = 255)
  private String author;

  @Column(columnDefinition = "TEXT")
  private String description;

  /**
   * Full manifest JSON, including permissions and migration file list.
   * Written once on install; reflects the state at install time.
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "manifest_json", columnDefinition = "jsonb", nullable = false)
  @Builder.Default
  private String manifestJson = "{}";

  /** INSTALLED | ACTIVE | INACTIVE | ERROR | UNINSTALLED */
  @Column(nullable = false, length = 20)
  @Builder.Default
  private String status = "INSTALLED";

  /**
   * Admin-editable per-plugin configuration JSON.
   * Shape is defined by the plugin's configSchema declared in plugin.json.
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "config_json", columnDefinition = "jsonb", nullable = false)
  @Builder.Default
  private String configJson = "{}";

  /** CLASSPATH | JAR */
  @Column(nullable = false, length = 20)
  @Builder.Default
  private String source = "CLASSPATH";

  /**
   * Relative path of the uploaded JAR file inside the plugins directory.
   * Null for classpath-loaded plugins.
   */
  @Column(name = "jar_path", length = 500)
  private String jarPath;

  /** Last activation error message — populated when status = ERROR. */
  @Column(name = "error_message", columnDefinition = "TEXT")
  private String errorMessage;

  @Column(name = "installed_at", updatable = false)
  private LocalDateTime installedAt;

  @Column(name = "activated_at")
  private LocalDateTime activatedAt;

  @Column(name = "deactivated_at")
  private LocalDateTime deactivatedAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    installedAt = LocalDateTime.now();
    updatedAt   = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
