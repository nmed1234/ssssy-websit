package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentVersionHistoryResponse;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.ContentVersionHistoryService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/version-history")
@RequiredArgsConstructor
public class ContentVersionHistoryController {

  private final ContentVersionHistoryService contentVersionHistoryService;
  private final UserRepository userRepository;

  @GetMapping("/{contentType}/{contentId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentVersionHistoryResponse>>> getHistory(
      @PathVariable String contentType,
      @PathVariable UUID contentId) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentVersionHistoryService.getHistory(contentType, contentId)));
  }

  @GetMapping("/{contentType}/{contentId}/{versionNumber}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentVersionHistoryResponse>> getVersion(
      @PathVariable String contentType,
      @PathVariable UUID contentId,
      @PathVariable int versionNumber) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentVersionHistoryService.getVersion(contentType, contentId, versionNumber)));
  }

  @PostMapping("/content-item/{contentId}/rollback/{versionNumber}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> rollback(
      @PathVariable UUID contentId,
      @PathVariable int versionNumber,
      @AuthenticationPrincipal UserDetails userDetails) {

    UUID userId = userRepository.findByUsername(userDetails.getUsername())
        .orElseThrow().getId();

    return ResponseEntity.ok(ApiResponse.ok(
        contentVersionHistoryService.rollbackContentItem(contentId, versionNumber, userId)));
  }
}
