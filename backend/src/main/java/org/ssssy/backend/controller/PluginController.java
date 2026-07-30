package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PluginConfigRequest;
import org.ssssy.backend.model.dto.PluginResponse;
import org.ssssy.backend.plugin.PluginManager;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Phase 5 — Plugin management endpoints (ADMIN only).
 *
 * GET    /api/admin/plugins              → list all installed plugins
 * GET    /api/admin/plugins/{id}         → get single plugin by UUID
 * POST   /api/admin/plugins/upload       → upload and install a JAR/ZIP plugin
 * POST   /api/admin/plugins/{id}/activate   → activate plugin
 * POST   /api/admin/plugins/{id}/deactivate → deactivate plugin
 * DELETE /api/admin/plugins/{id}         → uninstall plugin (JAR plugins only)
 * PUT    /api/admin/plugins/{id}/config  → update plugin configuration JSON
 * GET    /api/admin/plugins/active       → list only active plugins
 */
@RestController
@RequestMapping("/api/admin/plugins")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PluginController {

  private final PluginManager pluginManager;

  @GetMapping
  public ResponseEntity<ApiResponse<List<PluginResponse>>> listAll() {
    return ResponseEntity.ok(ApiResponse.ok(pluginManager.listAll()));
  }

  @GetMapping("/active")
  public ResponseEntity<ApiResponse<List<PluginResponse>>> listActive() {
    return ResponseEntity.ok(ApiResponse.ok(
        pluginManager.listAll().stream()
            .filter(p -> "ACTIVE".equals(p.getStatus()))
            .toList()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<PluginResponse>> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(pluginManager.getById(id)));
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<PluginResponse>> uploadAndInstall(
      @RequestParam("file") MultipartFile file) throws IOException {
    PluginResponse result = pluginManager.installJar(file);
    return ResponseEntity.ok(ApiResponse.ok("Plugin installed: " + result.getPluginId(), result));
  }

  @PostMapping("/{id}/activate")
  public ResponseEntity<ApiResponse<PluginResponse>> activate(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok("Plugin activated", pluginManager.activate(id)));
  }

  @PostMapping("/{id}/deactivate")
  public ResponseEntity<ApiResponse<PluginResponse>> deactivate(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok("Plugin deactivated", pluginManager.deactivate(id)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> uninstall(@PathVariable UUID id) {
    pluginManager.uninstall(id);
    return ResponseEntity.ok(ApiResponse.ok("Plugin uninstalled", null));
  }

  @PutMapping("/{id}/config")
  public ResponseEntity<ApiResponse<PluginResponse>> updateConfig(
      @PathVariable UUID id,
      @RequestBody PluginConfigRequest request) {
    return ResponseEntity.ok(ApiResponse.ok("Configuration saved",
        pluginManager.updateConfig(id, request.getConfigJson())));
  }
}
