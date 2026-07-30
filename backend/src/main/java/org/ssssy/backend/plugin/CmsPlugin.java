package org.ssssy.backend.plugin;

import org.springframework.context.ApplicationContext;

/**
 * Phase 5 — Plugin SPI.
 *
 * The interface every backend plugin must implement.
 * A plugin is discovered either from the classpath (annotated @Component)
 * or from a JAR dropped into the configured plugins directory.
 *
 * Lifecycle:
 *   install()    — called once when the plugin is first registered
 *   onActivate() — called when the plugin is activated (after install or on startup)
 *   onDeactivate() — called when the plugin is deactivated (plugin remains installed)
 *   onUninstall() — called before the plugin is permanently removed
 *
 * The CMS injects the parent ApplicationContext so the plugin can access
 * core services it has declared permissions for.
 */
public interface CmsPlugin {

  /**
   * Called once when this plugin is first installed.
   * Use to run one-time setup (create initial config, validate environment).
   * Do NOT run DB migrations here — declare them in getDbMigrations() instead.
   *
   * @param context the parent Spring ApplicationContext (read-only service access)
   */
  default void install(ApplicationContext context) {}

  /**
   * Called each time the plugin is activated — on first install and on application restart
   * when the plugin is in ACTIVE state.
   * Register event listeners, scheduled tasks, and REST extensions here.
   *
   * @param context the parent Spring ApplicationContext
   */
  default void onActivate(ApplicationContext context) {}

  /**
   * Called when an admin deactivates this plugin without uninstalling it.
   * Unregister any dynamic resources created in onActivate().
   */
  default void onDeactivate() {}

  /**
   * Called just before the plugin is permanently removed.
   * Clean up any side-effects from install().
   */
  default void onUninstall() {}

  /**
   * Return classpath-relative SQL migration file paths to run when installing.
   * Files are executed in declaration order using a plain JDBC statement.
   *
   * Example: return List.of("plugins/doi-resolver/V100__doi_tables.sql");
   */
  default java.util.List<String> getDbMigrations() {
    return java.util.List.of();
  }
}
