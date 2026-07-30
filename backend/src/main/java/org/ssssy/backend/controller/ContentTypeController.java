package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.ContentTypeService;

import java.util.List;
import java.util.UUID;

/**
 * Phase 3 — Content Type Definition endpoints.
 *
 * Public:
 *   GET /api/public/content-types              → list active types (for navigation, dropdowns)
 *   GET /api/public/content-types/{name}       → get a type definition (frontend needs schema to render forms)
 *
 * Admin (ADMIN/EDITOR):
 *   GET    /api/v2/content-types               → list all types
 *   POST   /api/v2/content-types               → create type
 *   GET    /api/v2/content-types/{id}          → get type by ID
 *   PUT    /api/v2/content-types/{id}          → update type
 *   DELETE /api/v2/content-types/{id}          → delete type (fails if has entries)
 *   PUT    /api/v2/content-types/{id}/fields   → replace all fields of a type
 */
@RestController
@RequiredArgsConstructor
public class ContentTypeController {

  private final ContentTypeService contentTypeService;
  private final UserRepository userRepository;

  // ─── Public ─────────────────────────────────────────────────────────────────

  @GetMapping("/api/public/content-types")
  public ResponseEntity<ApiResponse<List<ContentTypeDefinitionResponse>>> listActiveTypes() {
    return ResponseEntity.ok(ApiResponse.ok(contentTypeService.listActiveTypes()));
  }

  @GetMapping("/api/public/content-types/{name}")
  public ResponseEntity<ApiResponse<ContentTypeDefinitionResponse>> getTypeByName(@PathVariable String name) {
    return ResponseEntity.ok(ApiResponse.ok(contentTypeService.getTypeByName(name)));
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  @GetMapping("/api/v2/content-types")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<List<ContentTypeDefinitionResponse>>> listAllTypes() {
    return ResponseEntity.ok(ApiResponse.ok(contentTypeService.listAllTypes()));
  }

  @PostMapping("/api/v2/content-types")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ContentTypeDefinitionResponse>> createType(
      @RequestBody ContentTypeDefinitionRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    return ResponseEntity.ok(ApiResponse.ok("Content type created",
        contentTypeService.createType(request, userId)));
  }

  @GetMapping("/api/v2/content-types/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<ContentTypeDefinitionResponse>> getTypeById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentTypeService.getTypeById(id)));
  }

  @PutMapping("/api/v2/content-types/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ContentTypeDefinitionResponse>> updateType(
      @PathVariable UUID id, @RequestBody ContentTypeDefinitionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok("Content type updated",
        contentTypeService.updateType(id, request)));
  }

  @DeleteMapping("/api/v2/content-types/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteType(@PathVariable UUID id) {
    contentTypeService.deleteType(id);
    return ResponseEntity.ok(ApiResponse.ok("Content type deleted", null));
  }

  @PutMapping("/api/v2/content-types/{id}/fields")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ContentTypeDefinitionResponse>> updateFields(
      @PathVariable UUID id,
      @RequestBody java.util.List<ContentTypeFieldRequest> fields) {
    return ResponseEntity.ok(ApiResponse.ok("Fields updated",
        contentTypeService.updateFields(id, fields)));
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  private UUID resolveUserId(UserDetails principal) {
    if (principal == null) return null;
    return userRepository.findByUsername(principal.getUsername())
        .map(u -> u.getId()).orElse(null);
  }
}
