package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.DynamicContentService;

import java.util.UUID;

/**
 * Phase 3 — Dynamic Content Entry endpoints.
 *
 * The single generic controller for ALL dynamic content types.
 * The typeName path variable determines which type to operate on.
 *
 * Public:
 *   GET  /api/v2/dt/{typeName}              → paginated list (published only)
 *   GET  /api/v2/dt/{typeName}/{slug}       → single entry by slug
 *   GET  /api/v2/dt/{typeName}/search       → full-text search
 *
 * Admin (ADMIN/EDITOR):
 *   GET    /api/v2/admin/dt/{typeName}          → list all (any status)
 *   GET    /api/v2/admin/dt/{typeName}/{id}      → get by ID
 *   POST   /api/v2/admin/dt/{typeName}          → create entry
 *   PUT    /api/v2/admin/dt/{typeName}/{id}      → update entry
 *   DELETE /api/v2/admin/dt/{typeName}/{id}      → delete entry
 *
 * Member:
 *   GET  /api/v2/member/dt               → my entries (all types)
 *   POST /api/v2/member/dt/{typeName}    → submit entry (PENDING_REVIEW)
 */
@RestController
@RequiredArgsConstructor
public class DynamicContentController {

  private final DynamicContentService dynamicContentService;
  private final UserRepository userRepository;

  // ─── Public ──────────────────────────────────────────────────────────────────

  @GetMapping("/api/v2/dt/{typeName}")
  public ResponseEntity<ApiResponse<Page<DynamicContentEntryResponse>>> listPublished(
      @PathVariable String typeName,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        dynamicContentService.listPublished(typeName,
            PageRequest.of(page, size, Sort.by("publishedAt").descending()))));
  }

  @GetMapping("/api/v2/dt/{typeName}/search")
  public ResponseEntity<ApiResponse<Page<DynamicContentEntryResponse>>> search(
      @PathVariable String typeName,
      @RequestParam String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        dynamicContentService.search(typeName, q, PageRequest.of(page, size))));
  }

  @GetMapping("/api/v2/dt/{typeName}/{slug}")
  public ResponseEntity<ApiResponse<DynamicContentEntryResponse>> getBySlug(
      @PathVariable String typeName, @PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(
        dynamicContentService.getPublishedBySlug(typeName, slug)));
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  @GetMapping("/api/v2/admin/dt/{typeName}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<Page<DynamicContentEntryResponse>>> listAll(
      @PathVariable String typeName,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        dynamicContentService.listAll(typeName, status,
            PageRequest.of(page, size, Sort.by("createdAt").descending()))));
  }

  @GetMapping("/api/v2/admin/dt/entry/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<DynamicContentEntryResponse>> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(dynamicContentService.getById(id)));
  }

  @PostMapping("/api/v2/admin/dt/{typeName}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<DynamicContentEntryResponse>> create(
      @PathVariable String typeName,
      @RequestBody DynamicContentEntryRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    return ResponseEntity.ok(ApiResponse.ok("Entry created",
        dynamicContentService.create(typeName, request, userId)));
  }

  @PutMapping("/api/v2/admin/dt/entry/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<DynamicContentEntryResponse>> update(
      @PathVariable UUID id,
      @RequestBody DynamicContentEntryRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    return ResponseEntity.ok(ApiResponse.ok("Entry updated",
        dynamicContentService.update(id, request, userId)));
  }

  @DeleteMapping("/api/v2/admin/dt/entry/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
    dynamicContentService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok("Entry deleted", null));
  }

  // ─── Member submission ───────────────────────────────────────────────────────

  @GetMapping("/api/v2/member/dt")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Page<DynamicContentEntryResponse>>> myEntries(
      @RequestParam(required = false) String typeName,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    return ResponseEntity.ok(ApiResponse.ok(
        dynamicContentService.listByAuthor(userId, typeName,
            PageRequest.of(page, size, Sort.by("createdAt").descending()))));
  }

  @PostMapping("/api/v2/member/dt/{typeName}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<DynamicContentEntryResponse>> memberSubmit(
      @PathVariable String typeName,
      @RequestBody DynamicContentEntryRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    // Force status to PENDING_REVIEW for member submissions
    request.setStatus("PENDING_REVIEW");
    return ResponseEntity.ok(ApiResponse.ok("Entry submitted for review",
        dynamicContentService.create(typeName, request, userId)));
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  private UUID resolveUserId(UserDetails principal) {
    if (principal == null) return null;
    return userRepository.findByUsername(principal.getUsername())
        .map(u -> u.getId()).orElse(null);
  }
}
