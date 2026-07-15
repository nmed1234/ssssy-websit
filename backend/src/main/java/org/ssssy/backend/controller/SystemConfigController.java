package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.SystemConfigRequest;
import org.ssssy.backend.model.dto.SystemConfigResponse;
import org.ssssy.backend.service.SystemConfigService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SystemConfigController {

  private final SystemConfigService systemConfigService;

  @GetMapping("/public/settings")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getAllPublicConfigs() {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getAllConfigs()));
  }

  @GetMapping("/public/settings/group/{group}")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getPublicConfigsByGroup(@PathVariable String group) {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getConfigsByGroup(group)));
  }

  @GetMapping("/public/settings/{key}")
  public ResponseEntity<ApiResponse<SystemConfigResponse>> getPublicConfig(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getConfig(key)));
  }

  @GetMapping("/admin/settings")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getAllConfigs() {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getAllConfigs()));
  }

  @GetMapping("/admin/settings/{key}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SystemConfigResponse>> getConfig(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getConfig(key)));
  }

  @GetMapping("/admin/settings/admin")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getAdminSettings() {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getConfigsByGroup("SECURITY")));
  }

  @GetMapping("/admin/settings/group/{group}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getConfigsByGroup(@PathVariable String group) {
    return ResponseEntity.ok(ApiResponse.ok(systemConfigService.getConfigsByGroup(group)));
  }

  @PutMapping("/admin/settings")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SystemConfigResponse>> setConfig(
      @Valid @RequestBody SystemConfigRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        systemConfigService.setConfig(request, UUID.fromString(userDetails.getUsername()))));
  }

  @PostMapping("/admin/settings/bulk")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> bulkSetConfigs(
      @RequestBody List<SystemConfigRequest> requests,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        systemConfigService.bulkSetConfigs(requests, UUID.fromString(userDetails.getUsername()))));
  }

  @DeleteMapping("/admin/settings/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteConfig(@PathVariable UUID id) {
    systemConfigService.deleteConfig(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Config deleted successfully")));
  }
}
