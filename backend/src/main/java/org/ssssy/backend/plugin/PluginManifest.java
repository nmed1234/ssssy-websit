package org.ssssy.backend.plugin;

import lombok.*;
import java.util.List;

/**
 * Phase 5 — Parsed plugin manifest.
 *
 * Read from the @CmsPluginMeta annotation on the plugin class at load time.
 * Stored as JSON in the installed_plugins.manifest_json column.
 *
 * For external JAR plugins, it is parsed from the plugin.json file
 * inside the JAR at the root level.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PluginManifest {

  /** Unique plugin identifier — matches @CmsPluginMeta.id(). */
  private String id;

  /** Display name. */
  private String name;

  /** SemVer string, e.g. "1.0.0". */
  private String version;

  /** Author name or org. */
  private String author;

  /** Short description. */
  private String description;

  /**
   * Fully-qualified class name of the CmsPlugin implementation.
   * Used to instantiate the plugin from a loaded JAR.
   */
  private String entryClass;

  /**
   * Permissions declared by this plugin.
   * Only declared permissions grant access to platform services.
   */
  private List<String> permissions;

  /**
   * Classpath-relative SQL migration paths.
   * Executed once in order during install.
   */
  private List<String> dbMigrations;

  /** Whether to activate immediately on first install. */
  private boolean autoActivate;
}
