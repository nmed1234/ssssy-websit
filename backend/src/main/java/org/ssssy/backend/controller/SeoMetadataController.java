package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.SeoMetadataRequest;
import org.ssssy.backend.model.dto.SeoMetadataResponse;
import org.ssssy.backend.service.SeoMetadataService;

import java.util.UUID;

@RestController
@RequestMapping("/api/seo")
@RequiredArgsConstructor
public class SeoMetadataController {

  private final SeoMetadataService seoMetadataService;

  @GetMapping("/{entityType}/{entityId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SeoMetadataResponse>> getSeo(
      @PathVariable String entityType,
      @PathVariable UUID entityId) {
    return ResponseEntity.ok(ApiResponse.ok(seoMetadataService.getSeo(entityType, entityId)));
  }

  @PutMapping("/{entityType}/{entityId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SeoMetadataResponse>> saveSeo(
      @PathVariable String entityType,
      @PathVariable UUID entityId,
      @Valid @RequestBody SeoMetadataRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(seoMetadataService.saveSeo(entityType, entityId, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteSeo(@PathVariable UUID id) {
    seoMetadataService.deleteSeo(id);
    return ResponseEntity.ok(ApiResponse.ok("SEO metadata deleted", null));
  }
}
