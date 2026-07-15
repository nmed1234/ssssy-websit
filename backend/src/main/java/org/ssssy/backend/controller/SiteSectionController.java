package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.SiteSectionRequest;
import org.ssssy.backend.model.dto.SiteSectionResponse;
import org.ssssy.backend.service.SiteSectionService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SiteSectionController {

  private final SiteSectionService siteSectionService;

  @GetMapping("/public/site-sections")
  public ResponseEntity<ApiResponse<List<SiteSectionResponse>>> getActiveSections(
      @RequestParam(required = false) String location) {
    if (location != null && !location.isEmpty()) {
      return ResponseEntity.ok(ApiResponse.ok(siteSectionService.getActiveSectionsByLocation(location)));
    }
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.getActiveSections()));
  }

  @GetMapping("/public/site-sections/{slug}")
  public ResponseEntity<ApiResponse<SiteSectionResponse>> getBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.getBySlug(slug)));
  }

  @GetMapping("/admin/site-sections")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<SiteSectionResponse>>> getAll() {
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.getAll()));
  }

  @GetMapping("/admin/site-sections/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SiteSectionResponse>> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.getById(id)));
  }

  @PostMapping("/admin/site-sections")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SiteSectionResponse>> create(@Valid @RequestBody SiteSectionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.create(request)));
  }

  @PutMapping("/admin/site-sections/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SiteSectionResponse>> update(@PathVariable UUID id, @Valid @RequestBody SiteSectionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(siteSectionService.update(id, request)));
  }

  @DeleteMapping("/admin/site-sections/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
    siteSectionService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Site section deleted successfully")));
  }
}
