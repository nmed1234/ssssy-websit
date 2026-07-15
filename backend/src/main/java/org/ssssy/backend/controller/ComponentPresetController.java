package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ComponentPresetRequest;
import org.ssssy.backend.model.dto.ComponentPresetResponse;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.ComponentPresetService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/component-presets")
@RequiredArgsConstructor
public class ComponentPresetController {

  private final ComponentPresetService componentPresetService;
  private final UserRepository userRepository;

  @GetMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ComponentPresetResponse>>> getAll(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) Boolean systemOnly) {

    List<ComponentPresetResponse> results;
    if (type != null) {
      results = componentPresetService.getByType(type);
    } else if (Boolean.TRUE.equals(systemOnly)) {
      results = componentPresetService.getSystemPresets();
    } else {
      results = componentPresetService.getAll();
    }
    return ResponseEntity.ok(ApiResponse.ok(results));
  }

  @GetMapping("/system")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ComponentPresetResponse>>> getSystemPresets() {
    return ResponseEntity.ok(ApiResponse.ok(componentPresetService.getSystemPresets()));
  }

  @GetMapping("/custom")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ComponentPresetResponse>>> getCustomPresets() {
    return ResponseEntity.ok(ApiResponse.ok(componentPresetService.getCustomPresets()));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ComponentPresetResponse>> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(componentPresetService.getById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ComponentPresetResponse>> create(
      @Valid @RequestBody ComponentPresetRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {

    UUID userId = userRepository.findByUsername(userDetails.getUsername())
        .orElseThrow().getId();
    return ResponseEntity.ok(ApiResponse.ok(componentPresetService.create(request, userId)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ComponentPresetResponse>> update(
      @PathVariable UUID id,
      @Valid @RequestBody ComponentPresetRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(componentPresetService.update(id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
    componentPresetService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Component preset deleted")));
  }
}
