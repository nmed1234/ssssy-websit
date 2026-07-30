package org.ssssy.backend.plugin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.ssssy.backend.event.CmsEventBus;
import org.ssssy.backend.event.PluginInstalledEvent;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PluginResponse;
import org.ssssy.backend.model.entity.InstalledPlugin;
import org.ssssy.backend.repository.InstalledPluginRepository;

import java.io.File;
import java.io.IOException;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Phase 5 — Plugin Manager.
 *
 * The admin-facing service for the full plugin lifecycle:
 *   list → install → activate → deactivate → configure → uninstall
 *
 * Internally delegates to PluginRegistry for in-memory state management.
 * All persistent state is stored in the installed_plugins table.
 *
 * Supports two plugin sources:
 *  - CLASSPATH: Spring @Component beans annotated with @CmsPluginMeta (auto-discovered at boot)
 *  - JAR: ZIP/JAR uploaded via /api/admin/plugins/upload → stored in cms.plugins.dir
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PluginManager {

  private final InstalledPluginRepository pluginRepository;
  private final PluginRegistry pluginRegistry;
  private final CmsEventBus cmsEventBus;
  private final ObjectMapper objectMapper;

  @Value("${cms.plugins.dir:./plugins}")
  private String pluginsDir;

  // ─── Read ─────────────────────────────────────────────────────────────────────

  public List<PluginResponse> listAll() {
    return pluginRepository.findAllByOrderByInstalledAtDesc()
        .stream()
        .filter(p -> !"UNINSTALLED".equals(p.getStatus()))
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public PluginResponse getById(UUID id) {
    return toResponse(findById(id));
  }

  public PluginResponse getByPluginId(String pluginId) {
    return toResponse(findByPluginId(pluginId));
  }

  // ─── Activate ────────────────────────────────────────────────────────────────

  @Transactional
  public PluginResponse activate(UUID id) {
    InstalledPlugin record = findById(id);
    if ("ACTIVE".equals(record.getStatus())) {
      throw new BadRequestException("Plugin is already active.");
    }

    boolean success = pluginRegistry.activate(record.getPluginId());

    if (success) {
      record.setStatus("ACTIVE");
      record.setActivatedAt(LocalDateTime.now());
      record.setErrorMessage(null);
      pluginRepository.save(record);

      cmsEventBus.publish(new PluginInstalledEvent(
          record.getPluginId(), record.getPluginName(), record.getVersion()));
    } else {
      record.setStatus("ERROR");
      record.setErrorMessage("onActivate() threw an exception — check server logs.");
      pluginRepository.save(record);
      throw new BadRequestException(
          "Plugin '" + record.getPluginId() + "' activation failed. Check server logs.");
    }

    return toResponse(record);
  }

  // ─── Deactivate ───────────────────────────────────────────────────────────────

  @Transactional
  public PluginResponse deactivate(UUID id) {
    InstalledPlugin record = findById(id);
    if (!"ACTIVE".equals(record.getStatus())) {
      throw new BadRequestException("Plugin is not currently active.");
    }

    pluginRegistry.deactivate(record.getPluginId());

    record.setStatus("INACTIVE");
    record.setDeactivatedAt(LocalDateTime.now());
    pluginRepository.save(record);

    return toResponse(record);
  }

  // ─── Uninstall ────────────────────────────────────────────────────────────────

  @Transactional
  public void uninstall(UUID id) {
    InstalledPlugin record = findById(id);

    if ("CLASSPATH".equals(record.getSource())) {
      throw new BadRequestException(
          "Classpath plugins cannot be uninstalled via the UI. Remove them from the classpath.");
    }

    // Deactivate if active
    if ("ACTIVE".equals(record.getStatus())) {
      pluginRegistry.deactivate(record.getPluginId());
    }
    pluginRegistry.unload(record.getPluginId());

    // Delete the JAR file
    if (record.getJarPath() != null) {
      try {
        Path jarFile = Paths.get(pluginsDir, record.getJarPath());
        Files.deleteIfExists(jarFile);
        log.info("Deleted plugin JAR: {}", jarFile);
      } catch (IOException ex) {
        log.warn("Could not delete plugin JAR '{}': {}", record.getJarPath(), ex.getMessage());
      }
    }

    // Soft-delete the record
    record.setStatus("UNINSTALLED");
    pluginRepository.save(record);
  }

  // ─── Upload & Install JAR ─────────────────────────────────────────────────────

  /**
   * Upload a JAR/ZIP file, extract the plugin, and register it.
   * The JAR must contain a class implementing CmsPlugin + annotated with @CmsPluginMeta,
   * and optionally a plugin.json manifest at the JAR root.
   *
   * This is intentionally simple — for production use, add signature verification
   * and a sandboxed ClassLoader with security policy.
   */
  @Transactional
  public PluginResponse installJar(MultipartFile file) throws IOException {
    if (file.isEmpty()) throw new BadRequestException("Uploaded file is empty.");

    String originalName = file.getOriginalFilename();
    if (originalName == null || (!originalName.endsWith(".jar") && !originalName.endsWith(".zip"))) {
      throw new BadRequestException("Only .jar or .zip files are accepted.");
    }

    // Ensure plugins directory exists
    Path pluginsDirPath = Paths.get(pluginsDir);
    Files.createDirectories(pluginsDirPath);

    // Save file with a unique name to avoid collisions
    String savedName = UUID.randomUUID().toString().replace("-", "").substring(0, 8)
        + "-" + originalName;
    Path savedPath = pluginsDirPath.resolve(savedName);
    Files.write(savedPath, file.getBytes());
    log.info("Plugin JAR saved to: {}", savedPath.toAbsolutePath());

    // Load the JAR and discover the CmsPlugin implementation
    try (URLClassLoader loader = new URLClassLoader(
        new java.net.URL[]{ savedPath.toUri().toURL() },
        Thread.currentThread().getContextClassLoader())) {

      // Try to read plugin.json from the JAR root
      PluginManifest manifest = readManifestFromJar(loader, savedName);
      if (manifest == null) {
        // Clean up and fail
        Files.deleteIfExists(savedPath);
        throw new BadRequestException(
            "No plugin.json found in JAR root. Include a plugin.json with id, name, version, and entryClass.");
      }

      // Check for duplicate
      if (pluginRepository.existsByPluginId(manifest.getId())) {
        Files.deleteIfExists(savedPath);
        throw new BadRequestException(
            "A plugin with id '" + manifest.getId() + "' is already installed. Uninstall it first.");
      }

      // Instantiate the plugin
      Class<?> pluginClass = loader.loadClass(manifest.getEntryClass());
      if (!CmsPlugin.class.isAssignableFrom(pluginClass)) {
        Files.deleteIfExists(savedPath);
        throw new BadRequestException(
            "Entry class '" + manifest.getEntryClass() + "' does not implement CmsPlugin.");
      }
      CmsPlugin plugin = (CmsPlugin) pluginClass.getDeclaredConstructor().newInstance();

      // Register in the registry and DB
      InstalledPlugin record = pluginRegistry.registerExternal(plugin, manifest, savedName);

      // Run DB migrations if any
      runMigrations(plugin, loader);

      // Auto-activate if configured
      if (manifest.isAutoActivate()) {
        try {
          boolean ok = pluginRegistry.activate(manifest.getId());
          if (ok) {
            record.setStatus("ACTIVE");
            record.setActivatedAt(LocalDateTime.now());
            pluginRepository.save(record);
            cmsEventBus.publish(new PluginInstalledEvent(
                manifest.getId(), manifest.getName(), manifest.getVersion()));
          }
        } catch (Exception ex) {
          log.warn("Auto-activation failed for plugin '{}': {}", manifest.getId(), ex.getMessage());
        }
      }

      return toResponse(pluginRepository.findByPluginId(manifest.getId()).orElse(record));

    } catch (BadRequestException e) {
      throw e;
    } catch (Exception ex) {
      Files.deleteIfExists(savedPath);
      throw new BadRequestException("Failed to install plugin: " + ex.getMessage());
    }
  }

  // ─── Configure ────────────────────────────────────────────────────────────────

  @Transactional
  public PluginResponse updateConfig(UUID id, String configJson) {
    InstalledPlugin record = findById(id);
    // Validate it's parseable JSON
    try {
      objectMapper.readTree(configJson);
    } catch (Exception e) {
      throw new BadRequestException("configJson is not valid JSON: " + e.getMessage());
    }
    record.setConfigJson(configJson);
    return toResponse(pluginRepository.save(record));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private InstalledPlugin findById(UUID id) {
    return pluginRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Plugin not found: " + id));
  }

  private InstalledPlugin findByPluginId(String pluginId) {
    return pluginRepository.findByPluginId(pluginId)
        .orElseThrow(() -> new ResourceNotFoundException("Plugin not found: " + pluginId));
  }

  private PluginManifest readManifestFromJar(URLClassLoader loader, String savedName) {
    try (java.io.InputStream is = loader.getResourceAsStream("plugin.json")) {
      if (is == null) return null;
      return objectMapper.readValue(is, PluginManifest.class);
    } catch (Exception e) {
      log.warn("Could not parse plugin.json in JAR '{}': {}", savedName, e.getMessage());
      return null;
    }
  }

  private void runMigrations(CmsPlugin plugin, URLClassLoader loader) {
    List<String> migrations = plugin.getDbMigrations();
    if (migrations == null || migrations.isEmpty()) return;
    // Migrations are intentionally not auto-run here for safety in production.
    // Admins should apply them manually or via Flyway out-of-order.
    log.info("Plugin declares {} migration(s). Apply manually or via Flyway.", migrations.size());
  }

  public PluginResponse toResponse(InstalledPlugin p) {
    List<String> permissions = List.of();
    try {
      Map<String, Object> manifest = objectMapper.readValue(
          p.getManifestJson(), new TypeReference<Map<String, Object>>() {});
      Object perms = manifest.get("permissions");
      if (perms instanceof List<?> list) {
        permissions = list.stream().map(Object::toString).collect(Collectors.toList());
      }
    } catch (Exception ignored) {}

    return PluginResponse.builder()
        .id(p.getId())
        .pluginId(p.getPluginId())
        .pluginName(p.getPluginName())
        .version(p.getVersion())
        .author(p.getAuthor())
        .description(p.getDescription())
        .status(p.getStatus())
        .source(p.getSource())
        .jarPath(p.getJarPath())
        .errorMessage(p.getErrorMessage())
        .configJson(p.getConfigJson())
        .manifestJson(p.getManifestJson())
        .permissions(permissions)
        .installedAt(p.getInstalledAt())
        .activatedAt(p.getActivatedAt())
        .deactivatedAt(p.getDeactivatedAt())
        .updatedAt(p.getUpdatedAt())
        .build();
  }
}
