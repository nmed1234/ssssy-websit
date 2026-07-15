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
import org.ssssy.backend.model.dto.CommentRequest;
import org.ssssy.backend.model.dto.CommentResponse;
import org.ssssy.backend.service.CommentService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;

  @GetMapping("/public/content/{contentId}/comments")
  public ResponseEntity<ApiResponse<List<CommentResponse>>> getApprovedComments(@PathVariable UUID contentId) {
    return ResponseEntity.ok(ApiResponse.ok(commentService.getApprovedComments(contentId)));
  }

  @PostMapping("/comments")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<CommentResponse>> createComment(
      @Valid @RequestBody CommentRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        commentService.createComment(request, UUID.fromString(userDetails.getUsername()))));
  }

  @GetMapping("/admin/comments")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<CommentResponse>>> getAllComments(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(commentService.getAllComments(pageable)));
  }

  @GetMapping("/admin/comments/pending")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<CommentResponse>>> getPendingComments(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(commentService.getPendingComments(pageable)));
  }

  @PutMapping("/comments/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
      @PathVariable UUID id,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        commentService.updateComment(id, UUID.fromString(userDetails.getUsername()), body.get("body"))));
  }

  @PutMapping("/admin/comments/{id}/approve")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<CommentResponse>> approveComment(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        commentService.approveComment(id, UUID.fromString(userDetails.getUsername()))));
  }

  @DeleteMapping("/admin/comments/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteComment(@PathVariable UUID id) {
    commentService.deleteComment(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Comment deleted successfully")));
  }
}
