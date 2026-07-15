package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.ThemeSettingService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ThemeSettingController {

  private final ThemeSettingService themeSettingService;

  @GetMapping("/public/theme-settings")
  public ResponseEntity<ApiResponse<List<ThemeSettingResponse>>> getAll() {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.getAll()));
  }

  @GetMapping("/public/theme-settings/group/{groupName}")
  public ResponseEntity<ApiResponse<List<ThemeSettingResponse>>> getByGroup(@PathVariable String groupName) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.getByGroup(groupName)));
  }

  @GetMapping("/public/theme-settings/key/{key}")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> getByKey(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.getByKey(key)));
  }

  @GetMapping("/admin/theme-settings")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ThemeSettingResponse>>> getAllAdmin() {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.getAll()));
  }

  @GetMapping("/admin/theme-settings/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.getById(id)));
  }

  @PostMapping("/admin/theme-settings")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> create(@Valid @RequestBody ThemeSettingRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.create(request)));
  }

  @PutMapping("/admin/theme-settings/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> update(@PathVariable UUID id, @Valid @RequestBody ThemeSettingRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.update(id, request)));
  }

  @PutMapping("/admin/theme-settings/by-key/{key}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> updateValueByKey(@PathVariable String key, @Valid @RequestBody ThemeSettingValueRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.updateValueByKey(key, request)));
  }

  @PutMapping("/admin/theme-settings/upsert/{key}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ThemeSettingResponse>> upsertByKey(@PathVariable String key, @RequestBody ThemeSettingValueRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(themeSettingService.upsertByKey(key, request)));
  }

  @DeleteMapping("/admin/theme-settings/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
    themeSettingService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Theme setting deleted successfully")));
  }
}
