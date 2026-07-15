package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentRequest;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.model.dto.ContentWorkflowResponse;
import org.ssssy.backend.model.entity.ContentVersion;
import org.ssssy.backend.service.ContentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

  private final ContentService contentService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<ContentResponse>>> getAllContent(
      @RequestParam(required = false) String contentType,
      @RequestParam(required = false) String status,
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getAllContent(contentType, status, pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ContentResponse>> getContentById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getContentById(id)));
  }

  @GetMapping("/slug/{slug}")
  public ResponseEntity<ApiResponse<ContentResponse>> getContentBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getContentBySlug(slug)));
  }

  @PostMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> createContent(
      @Valid @RequestBody ContentRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentService.createContent(request, UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> updateContent(
      @PathVariable UUID id, @Valid @RequestBody ContentRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentService.updateContent(id, request, UUID.fromString(userDetails.getUsername()))));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable UUID id) {
    contentService.deleteContent(id);
    return ResponseEntity.ok(ApiResponse.ok("Content deleted", null));
  }

  @GetMapping("/search")
  public ResponseEntity<ApiResponse<Page<ContentResponse>>> searchContent(
      @RequestParam String q,
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.searchContent(q, pageable)));
  }

  @GetMapping("/{id}/versions")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentVersion>>> getContentVersions(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getContentVersions(id)));
  }

  @GetMapping("/{id}/versions/{version}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentVersion>> getContentVersion(
      @PathVariable UUID id, @PathVariable Integer version) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getContentVersion(id, version)));
  }

  @GetMapping("/{id}/preview")
  public ResponseEntity<ApiResponse<ContentResponse>> previewContent(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.previewContent(id)));
  }

  @GetMapping("/{id}/workflow")
  public ResponseEntity<ApiResponse<ContentWorkflowResponse>> getContentWorkflow(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getContentWorkflow(id)));
  }
}
