package org.ssssy.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.exception.SlugConflictException;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.DuplicatePageRequest;
import org.ssssy.backend.model.dto.PageRequest;
import org.ssssy.backend.model.dto.PageResponse;
import org.ssssy.backend.model.dto.PageSectionRequest;
import org.ssssy.backend.model.dto.PageSectionResponse;
import org.ssssy.backend.model.dto.SlugCheckResponse;
import org.ssssy.backend.service.PageService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PageController {

  private final PageService pageService;

  // ---------------------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------------------

  @GetMapping("/public/pages")
  public ResponseEntity<ApiResponse<List<PageResponse>>> getPublishedPages() {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getPublishedPages()));
  }

  @GetMapping("/public/pages/id/{id}")
  public ResponseEntity<ApiResponse<PageResponse>> getPageById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getPage(id)));
  }

  @GetMapping("/public/pages/homepage")
  public ResponseEntity<ApiResponse<PageResponse>> getHomepage() {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getHomepage()));
  }

  @GetMapping("/public/pages/{slug}")
  public ResponseEntity<ApiResponse<PageResponse>> getPageBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getPageBySlug(slug)));
  }

  @GetMapping("/public/pages/{slug}/sections")
  public ResponseEntity<ApiResponse<List<PageSectionResponse>>> getPageSections(@PathVariable String slug) {
    PageResponse page = pageService.getPageBySlug(slug);
    return ResponseEntity.ok(ApiResponse.ok(pageService.getSections(page.getId())));
  }

  // ---------------------------------------------------------------------------
  // Admin read endpoints
  // ---------------------------------------------------------------------------

  /**
   * 10.2 — List all non-deleted pages with optional workflowStatus filter.
   * Requirements: 10.5, 10.6, 10.7
   */
  @GetMapping("/admin/pages")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<PageResponse>>> getAllPages(
      @RequestParam(required = false) String workflowStatus,
      @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getAllPagesForAdmin(workflowStatus, pageable)));
  }

  /**
   * 10.7 — Check slug availability. MUST be declared before /{id} to avoid
   * Spring routing it to the path-variable endpoint.
   * Requirements: 5.7, 5.8, 6.4
   */
  @GetMapping("/admin/pages/check-slug")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> checkSlug(
      @RequestParam String slug,
      @RequestParam(required = false) UUID excludeId) {
    SlugCheckResponse result = pageService.checkSlug(slug, excludeId);
    return ResponseEntity.ok(ApiResponse.ok(
        Map.of("available", result.available(), "suggestion", result.suggestion())));
  }

  /** Legacy admin list (no pagination / no filter) */
  @GetMapping("/admin/pages/list")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<PageResponse>>> getAllPagesList() {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getAllPagesList()));
  }

  /**
   * 10.3 — Get single page by ID; returns 404 if soft-deleted.
   * Includes sections and layoutJson.
   * Requirements: 4.3
   */
  @GetMapping("/admin/pages/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageResponse>> getAdminPageById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getPageForAdmin(id)));
  }


  // ---------------------------------------------------------------------------
  // Admin mutating endpoints
  // ---------------------------------------------------------------------------

  /**
   * 10.1 — Create page; sets workflowStatus=DRAFT, validates layoutJson.
   * Requirements: 5.5, 5.6, 9.1
   */
  @PostMapping("/admin/pages")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageResponse>> createPage(
      @Valid @RequestBody PageRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        pageService.createPage(request, UUID.fromString(userDetails.getUsername()))));
  }

  /**
   * 10.4 — Update page; validates layoutJson; creates 301 redirect on slug change.
   * Returns 409 on slug conflict.
   * Requirements: 1.3, 4.5, 4.6, 4.7, 6.4, 6.5, 6.7, 7.3
   */
  @PutMapping("/admin/pages/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageResponse>> updatePage(
      @PathVariable UUID id,
      @Valid @RequestBody PageRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    try {
      return ResponseEntity.ok(ApiResponse.ok(
          pageService.updatePage(id, request, UUID.fromString(userDetails.getUsername()))));
    } catch (SlugConflictException ex) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(ApiResponse.error("slug_conflict"));
    }
  }

  /**
   * 10.5 — Soft-delete page (ADMIN only).
   * Requirements: 22.5, 22.6, 22.7
   */
  @DeleteMapping("/admin/pages/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deletePage(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetails userDetails) {
    pageService.softDeletePage(id, UUID.fromString(userDetails.getUsername()));
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Page deleted successfully")));
  }

  /**
   * 10.5 — Restore soft-deleted page (within 30 days, ADMIN only).
   * Requirements: 22.5, 22.6, 22.7
   */
  @PostMapping("/admin/pages/{id}/restore")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageResponse>> restorePage(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        pageService.restorePage(id, UUID.fromString(userDetails.getUsername()))));
  }

  /**
   * 10.6 — Duplicate page with regenerated block IDs.
   * Requirements: 21.3, 21.4, 21.5, 21.7
   */
  @PostMapping("/admin/pages/{id}/duplicate")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageResponse>> duplicatePage(
      @PathVariable UUID id,
      @RequestBody DuplicatePageRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        pageService.duplicatePage(id, request.getNewTitle(), request.getNewSlug(),
            UUID.fromString(userDetails.getUsername()))));
  }

  // ---------------------------------------------------------------------------
  // Section endpoints
  // ---------------------------------------------------------------------------

  /**
   * 10.8 — Get sections with optional flat merge (?flat=true).
   * Requirements: 4.1, 4.2
   */
  @GetMapping("/admin/pages/{pageId}/sections")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<PageSectionResponse>>> getAdminPageSections(
      @PathVariable UUID pageId,
      @RequestParam(required = false, defaultValue = "false") boolean flat) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.getSectionsFlatMerged(pageId, flat)));
  }

  @PostMapping("/admin/pages/{pageId}/sections")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageSectionResponse>> addSection(
      @PathVariable UUID pageId, @Valid @RequestBody PageSectionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.saveSection(pageId, request)));
  }

  @PutMapping("/admin/pages/sections/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PageSectionResponse>> updateSection(
      @PathVariable UUID id, @Valid @RequestBody PageSectionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(pageService.updateSection(id, request)));
  }

  @DeleteMapping("/admin/pages/sections/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteSection(@PathVariable UUID id) {
    pageService.deleteSection(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Section deleted successfully")));
  }

  @PutMapping("/admin/pages/{pageId}/sections/reorder")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> reorderSections(
      @PathVariable UUID pageId, @RequestBody List<UUID> sectionIds) {
    pageService.reorderSections(pageId, sectionIds);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Sections reordered successfully")));
  }

  /**
   * 10.9 — Return pretty-printed layout JSON (ADMIN only).
   * Raw UTF-8, no unicode escaping. Returns 404 if page not found or soft-deleted.
   * Requirements: 25.1, 25.2, 25.4, 25.6, 25.7
   */
  @GetMapping(value = "/admin/pages/{id}/layout-json", produces = "application/json;charset=UTF-8")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<String> getLayoutJson(@PathVariable UUID id) {
    try {
      String rawJson = pageService.getLayoutJson(id);
      ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
      mapper.configure(com.fasterxml.jackson.core.JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
      String pretty = mapper.writeValueAsString(mapper.readTree(rawJson));
      return ResponseEntity.ok()
          .header("Content-Type", "application/json;charset=UTF-8")
          .body(pretty);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\":\"Failed to format layout JSON\"}");
    }
  }
}
