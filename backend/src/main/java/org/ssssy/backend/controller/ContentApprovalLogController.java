package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentApprovalLogResponse;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.ContentApprovalLogService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/approval-log")
@RequiredArgsConstructor
public class ContentApprovalLogController {

  private final ContentApprovalLogService contentApprovalLogService;
  private final UserRepository userRepository;

  @GetMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentApprovalLogResponse>>> getAll(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentApprovalLogService.getAllPaged(PageRequest.of(page, size))));
  }

  @GetMapping("/{contentType}/{contentId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentApprovalLogResponse>>> getByContent(
      @PathVariable String contentType,
      @PathVariable UUID contentId) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentApprovalLogService.getByContentTypeAndId(contentType, contentId)));
  }

  @PostMapping("/{contentType}/{contentId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentApprovalLogResponse>> record(
      @PathVariable String contentType,
      @PathVariable UUID contentId,
      @RequestParam(required = false) String oldStatus,
      @RequestParam String newStatus,
      @RequestParam(required = false) String comments,
      @AuthenticationPrincipal UserDetails userDetails) {

    UUID userId = userRepository.findByUsername(userDetails.getUsername())
        .orElseThrow().getId();

    return ResponseEntity.ok(ApiResponse.ok(
        contentApprovalLogService.recordApprovalAction(
            contentType, contentId, oldStatus, newStatus, comments, userId)));
  }
}
