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
import org.ssssy.backend.model.dto.ContactSubmissionReplyRequest;
import org.ssssy.backend.model.dto.ContactSubmissionRequest;
import org.ssssy.backend.model.dto.ContactSubmissionResponse;
import org.ssssy.backend.service.ContactSubmissionService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactSubmissionController {

  private final ContactSubmissionService contactSubmissionService;

  @PostMapping("/public/contact")
  public ResponseEntity<ApiResponse<ContactSubmissionResponse>> submitContact(
      @Valid @RequestBody ContactSubmissionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(contactSubmissionService.submit(request)));
  }

  @GetMapping("/admin/contact-submissions/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContactSubmissionResponse>> getSubmission(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contactSubmissionService.getSubmission(id)));
  }

  @PostMapping("/admin/contact-submissions/{id}/reply")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContactSubmissionResponse>> replyToSubmission(
      @PathVariable UUID id,
      @Valid @RequestBody ContactSubmissionReplyRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        contactSubmissionService.replyToSubmission(id, UUID.fromString(userDetails.getUsername()), request)));
  }

  @GetMapping("/admin/contact-submissions")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<ContactSubmissionResponse>>> getAllSubmissions(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(contactSubmissionService.getAllSubmissions(pageable)));
  }

  @GetMapping("/admin/contact-submissions/unread")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<ContactSubmissionResponse>>> getUnreadSubmissions(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(contactSubmissionService.getUnreadSubmissions(pageable)));
  }

  @GetMapping("/admin/contact-submissions/unread-count")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
    return ResponseEntity.ok(ApiResponse.ok(Map.of("count", contactSubmissionService.getUnreadCount())));
  }

  @PutMapping("/admin/contact-submissions/{id}/read")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContactSubmissionResponse>> markAsRead(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contactSubmissionService.markAsRead(id)));
  }

  @DeleteMapping("/admin/contact-submissions/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteSubmission(@PathVariable UUID id) {
    contactSubmissionService.deleteSubmission(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Submission deleted successfully")));
  }
}
