package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ComponentTemplateRequest;
import org.ssssy.backend.model.dto.ComponentTemplateResponse;
import org.ssssy.backend.service.ComponentTemplateService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComponentTemplateController {

  private final ComponentTemplateService componentTemplateService;

  @GetMapping("/public/component-templates")
  public ResponseEntity<ApiResponse<List<ComponentTemplateResponse>>> getAll() {
    return ResponseEntity.ok(ApiResponse.ok(componentTemplateService.getAll()));
  }

  @GetMapping("/public/component-templates/category/{category}")
  public ResponseEntity<ApiResponse<List<ComponentTemplateResponse>>> getByCategory(@PathVariable String category) {
    return ResponseEntity.ok(ApiResponse.ok(componentTemplateService.getByCategory(category)));
  }

  @GetMapping("/admin/component-templates")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ComponentTemplateResponse>>> getAllAdmin() {
    return ResponseEntity.ok(ApiResponse.ok(componentTemplateService.getAll()));
  }

  @PostMapping("/admin/component-templates")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ComponentTemplateResponse>> create(@Valid @RequestBody ComponentTemplateRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(componentTemplateService.create(request)));
  }

  @PutMapping("/admin/component-templates/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ComponentTemplateResponse>> update(@PathVariable UUID id, @Valid @RequestBody ComponentTemplateRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(componentTemplateService.update(id, request)));
  }

  @DeleteMapping("/admin/component-templates/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
    componentTemplateService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Component template deleted successfully")));
  }
}
