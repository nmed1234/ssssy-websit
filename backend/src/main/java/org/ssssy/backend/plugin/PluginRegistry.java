package org.ssssy.backend.plugin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.ssssy.backend.model.entity.InstalledPlugin;
import org.ssssy.backend.repository.InstalledPluginRepository;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Phase 5 — Plugin Registry.
 *
 * Responsibilities:
 *  1. On application startup: discover all @CmsPluginMeta-annotated beans
 *     already on the classpath and register them if not already in DB.
 *  2. Maintain an in-memory map of pluginId → CmsPlugin instance for
 *     fast activation/deactivation without DB round-trips.
 *  3. Provide lookup APIs for PluginManager to use.
 *
 * JAR-based external plugins are registered via PluginManager.installJar()
 * which uses a URLClassLoader and then calls register() here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PluginRegistry {

  private final ApplicationContext applicationContext;
  private final InstalledPluginRepository pluginRepository;
  private final ObjectMapper objectMapper;

  /** In-memory map: pluginId → live CmsPlugin instance (only when ACTIVE). */
  private final Map<String, CmsPlugin> activePlugins = new ConcurrentHashMap<>();

  /** In-memory map: pluginId → CmsPlugin instance for all loaded (not necessarily active). */
  private final Map<String, CmsPlugin> loadedPlugins = new ConcurrentHashMap<>();

  // ─── Startup discovery ───────────────────────────────────────────────────────

  /**
   * Discover all @CmsPluginMeta-annotated Spring beans on the classpath.
   * For each, ensure a row exists in installed_plugins.
   * Then activate any plugin whose DB status is ACTIVE or autoActivate=true.
   */
  @PostConstruct
  public void discoverAndActivateClasspathPlugins() {
    Map<String, CmsPlugin> pluginBeans = applicationContext.getBeansOfType(CmsPlugin.class);

    for (Map.Entry<String, CmsPlugin> entry : pluginBeans.entrySet()) {
      CmsPlugin plugin = entry.getValue();
      Class<?> pluginClass = plugin.getClass();

      CmsPluginMeta meta = pluginClass.getAnnotation(CmsPluginMeta.class);
      if (meta == null) {
        log.warn("CmsPlugin bean '{}' has no @CmsPluginMeta annotation — skipping.", entry.getKey());
        continue;
      }

      loadedPlugins.put(meta.id(), plugin);
      ensureRegistered(plugin, meta);
    }

    // Activate all ACTIVE plugins in DB order
    pluginRepository.findByStatusInOrderByInstalledAtDesc(List.of("ACTIVE"))
        .forEach(record -> {
          CmsPlugin p = loadedPlugins.get(record.getPluginId());
          if (p != null) {
            tryActivate(p, record.getPluginId());
          }
        });

    log.info("PluginRegistry: {} classpath plugin(s) discovered, {} active.",
        loadedPlugins.size(), activePlugins.size());
  }

  // ─── Registration ─────────────────────────────────────────────────────────────

  /**
   * Ensure a plugin has a row in the DB. Does NOT activate it.
   * Called for classpath plugins at startup, and for JAR plugins during install.
   */
  public InstalledPlugin ensureRegistered(CmsPlugin plugin, CmsPluginMeta meta) {
    return pluginRepository.findByPluginId(meta.id()).orElseGet(() -> {
      PluginManifest manifest = buildManifest(plugin, meta);
      String manifestJson = toJson(manifest);

      InstalledPlugin record = InstalledPlugin.builder()
          .pluginId(meta.id())
          .pluginName(meta.name())
          .version(meta.version())
          .author(meta.author())
          .description(meta.description())
          .manifestJson(manifestJson)
          .status(meta.autoActivate() ? "INSTALLED" : "INSTALLED")
          .source("CLASSPATH")
          .build();

      record = pluginRepository.save(record);
      log.info("PluginRegistry: registered classpath plugin '{}'", meta.id());
      return record;
    });
  }

  /**
   * Register an external JAR plugin. Called by PluginManager.installJar().
   */
  public InstalledPlugin registerExternal(CmsPlugin plugin, PluginManifest manifest, String jarPath) {
    loadedPlugins.put(manifest.getId(), plugin);

    return pluginRepository.findByPluginId(manifest.getId()).orElseGet(() -> {
      InstalledPlugin record = InstalledPlugin.builder()
          .pluginId(manifest.getId())
          .pluginName(manifest.getName())
          .version(manifest.getVersion())
          .author(manifest.getAuthor())
          .description(manifest.getDescription())
          .manifestJson(toJson(manifest))
          .status("INSTALLED")
          .source("JAR")
          .jarPath(jarPath)
          .build();
      record = pluginRepository.save(record);
      log.info("PluginRegistry: registered JAR plugin '{}' from {}", manifest.getId(), jarPath);
      return record;
    });
  }

  // ─── Activation / Deactivation ────────────────────────────────────────────────

  public boolean activate(String pluginId) {
    CmsPlugin plugin = loadedPlugins.get(pluginId);
    if (plugin == null) {
      log.warn("Cannot activate plugin '{}' — not loaded in registry.", pluginId);
      return false;
    }
    return tryActivate(plugin, pluginId);
  }

  public boolean deactivate(String pluginId) {
    CmsPlugin plugin = activePlugins.remove(pluginId);
    if (plugin == null) {
      log.warn("Cannot deactivate plugin '{}' — not active.", pluginId);
      return false;
    }
    try {
      plugin.onDeactivate();
      log.info("PluginRegistry: deactivated plugin '{}'", pluginId);
      return true;
    } catch (Exception ex) {
      log.error("Plugin '{}' onDeactivate() threw: {}", pluginId, ex.getMessage(), ex);
      return false;
    }
  }

  public boolean unload(String pluginId) {
    deactivate(pluginId);
    loadedPlugins.remove(pluginId);
    return true;
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  public boolean isActive(String pluginId) {
    return activePlugins.containsKey(pluginId);
  }

  public Optional<CmsPlugin> getActivePlugin(String pluginId) {
    return Optional.ofNullable(activePlugins.get(pluginId));
  }

  public Map<String, CmsPlugin> getAllActive() {
    return Collections.unmodifiableMap(activePlugins);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private boolean tryActivate(CmsPlugin plugin, String pluginId) {
    try {
      plugin.onActivate(applicationContext);
      activePlugins.put(pluginId, plugin);
      log.info("PluginRegistry: activated plugin '{}'", pluginId);
      return true;
    } catch (Exception ex) {
      log.error("Plugin '{}' onActivate() threw: {}", pluginId, ex.getMessage(), ex);
      activePlugins.remove(pluginId);
      return false;
    }
  }

  private PluginManifest buildManifest(CmsPlugin plugin, CmsPluginMeta meta) {
    return PluginManifest.builder()
        .id(meta.id())
        .name(meta.name())
        .version(meta.version())
        .author(meta.author())
        .description(meta.description())
        .entryClass(plugin.getClass().getName())
        .permissions(List.of(meta.permissions()))
        .dbMigrations(plugin.getDbMigrations())
        .autoActivate(meta.autoActivate())
        .build();
  }

  private String toJson(Object obj) {
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (Exception e) {
      return "{}";
    }
  }
}
