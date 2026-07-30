package org.ssssy.backend.plugin.example;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.ssssy.backend.event.ContentPublishedEvent;
import org.ssssy.backend.plugin.CmsPlugin;
import org.ssssy.backend.plugin.CmsPluginMeta;

/**
 * Phase 5 — Reference plugin implementation.
 *
 * This plugin demonstrates the full CmsPlugin SPI pattern:
 *  - Declares metadata via @CmsPluginMeta
 *  - Implements CmsPlugin lifecycle hooks
 *  - Subscribes to CMS events using @EventListener (thanks to being a Spring @Component)
 *
 * This plugin logs a message whenever a "research-paper" dynamic content entry
 * is published. To use it as a starting point, copy this class into a new
 * Maven project, implement your logic, and drop the JAR into the plugins directory.
 *
 * Because it is annotated @Component it is discovered automatically by the
 * PluginRegistry at startup. External (JAR) plugins instantiate the class manually
 * so they cannot use @EventListener directly — they must register listeners
 * programmatically in onActivate().
 */
@Slf4j
@Component
@CmsPluginMeta(
    id          = "sssy-example-plugin",
    name        = "SSSSY Example Plugin",
    version     = "1.0.0",
    author      = "SSSSY Dev Team",
    description = "Reference implementation — logs published research-paper entries.",
    permissions = { "CONTENT_READ" },
    autoActivate = true
)
public class ExamplePlugin implements CmsPlugin {

  @Override
  public void install(ApplicationContext context) {
    log.info("[ExamplePlugin] install() called — one-time setup complete.");
  }

  @Override
  public void onActivate(ApplicationContext context) {
    log.info("[ExamplePlugin] onActivate() — plugin is now active.");
  }

  @Override
  public void onDeactivate() {
    log.info("[ExamplePlugin] onDeactivate() — plugin deactivated.");
  }

  @Override
  public void onUninstall() {
    log.info("[ExamplePlugin] onUninstall() — cleaning up.");
  }

  /**
   * Hook: listen to ContentPublishedEvent from the CMS Event Bus.
   *
   * For CLASSPATH plugins this just works via Spring's @EventListener.
   * For external JAR plugins, register a listener programmatically in onActivate():
   *
   *   ApplicationEventPublisher bus = context.getBean(ApplicationEventPublisher.class);
   *   // Use CmsEventBus to subscribe if you add that capability.
   */
  @EventListener
  public void onContentPublished(ContentPublishedEvent event) {
    if ("research-paper".equals(event.getContentType())) {
      log.info("[ExamplePlugin] Research paper published: slug={} title={}",
          event.getSlug(), event.getTitleEn());
      // Real plugin would: call DOI API, send notification, update external index, etc.
    }
  }
}
