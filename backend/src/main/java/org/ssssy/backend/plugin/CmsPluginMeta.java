package org.ssssy.backend.plugin;

import java.lang.annotation.*;

/**
 * Phase 5 — Plugin SPI.
 *
 * Annotation placed on the main plugin class to declare its metadata.
 * The plugin engine reads this annotation at load time and records it in the plugins table.
 *
 * Example:
 *   @CmsPluginMeta(
 *     id      = "sssy-doi-resolver",
 *     name    = "DOI Resolver",
 *     version = "1.0.0",
 *     author  = "SSSSY Dev Team",
 *     description = "Resolves DOI numbers and enriches research paper entries."
 *   )
 *   public class DoiResolverPlugin implements CmsPlugin { ... }
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CmsPluginMeta {

  /** Unique, URL-safe plugin identifier. e.g. "sssy-doi-resolver" */
  String id();

  /** Human-readable display name. */
  String name();

  /** Semantic version string, e.g. "1.0.0" */
  String version();

  /** Plugin author name or organisation. */
  String author() default "";

  /** Short description of what the plugin does. */
  String description() default "";

  /**
   * Permissions the plugin requires from the platform.
   * Declared permissions gate access to platform services.
   * Undeclared services will throw PluginPermissionException at inject time.
   *
   * Available permissions: CONTENT_READ, CONTENT_WRITE, EMAIL_SEND,
   *   MEDIA_READ, MEDIA_WRITE, USER_READ, WEBHOOK_SEND, FORM_READ, FORM_WRITE
   */
  String[] permissions() default {};

  /** Whether this plugin should be activated automatically on first install. */
  boolean autoActivate() default false;
}
