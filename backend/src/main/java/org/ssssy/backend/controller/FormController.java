package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
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
import org.ssssy.backend.service.FormService;

import java.util.UUID;

/**
 * Phase 2 — Dynamic Form Engine endpoints.
 *
 * Public endpoints (no auth):
 *   GET  /api/public/forms/{slug}            → fetch form schema for rendering
 *   POST /api/public/forms/{slug}/submit     → submit a form
 *
 * Admin endpoints (ADMIN / EDITOR):
 *   GET  /api/forms                          → list all forms
 *   POST /api/forms                          → create form
 *   GET  /api/forms/{id}                     → get form by ID
 *   PUT  /api/forms/{id}                     → update form
 *   DELETE /api/forms/{id}                   → delete form
 *   GET  /api/forms/{id}/submissions         → list submissions
 *   GET  /api/forms/submissions/{subId}      → get single submission
 *   PATCH /api/forms/submissions/{subId}     → update submission status
 *   DELETE /api/forms/submissions/{subId}    → delete submission
 */
@RestController
@RequiredArgsConstructor
public class FormController {

  private final FormService formService;
  private final UserRepository userRepository;

  // ─── Public ──────────────────────────────────────────────────────────────────

  /** Returns form definition including schema — used by frontend DynamicForm component. */
  @GetMapping("/api/public/forms/{slug}")
  public ResponseEntity<ApiResponse<FormDefinitionResponse>> getPublicForm(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(formService.getFormBySlug(slug)));
  }

  /** Anonymous or authenticated form submission. */
  @PostMapping("/api/public/forms/{slug}/submit")
  public ResponseEntity<ApiResponse<FormSubmissionResponse>> submit(
      @PathVariable String slug,
      @RequestBody FormSubmissionRequest request,
      @AuthenticationPrincipal UserDetails principal,
      HttpServletRequest httpRequest) {

    UUID userId = resolveUserId(principal);
    String ip = getClientIp(httpRequest);
    String ua = httpRequest.getHeader("User-Agent");

    FormSubmissionResponse response = formService.submit(slug, request, userId, ip, ua);
    return ResponseEntity.ok(ApiResponse.ok("Form submitted successfully", response));
  }

  // ─── Admin: Form management ───────────────────────────────────────────────────

  @GetMapping("/api/forms")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<Page<FormDefinitionResponse>>> listForms(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        formService.listForms(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
  }

  @PostMapping("/api/forms")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<FormDefinitionResponse>> createForm(
      @RequestBody FormDefinitionRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    UUID userId = resolveUserId(principal);
    return ResponseEntity.ok(ApiResponse.ok("Form created", formService.createForm(request, userId)));
  }

  @GetMapping("/api/forms/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<FormDefinitionResponse>> getForm(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(formService.getFormById(id)));
  }

  @PutMapping("/api/forms/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<FormDefinitionResponse>> updateForm(
      @PathVariable UUID id, @RequestBody FormDefinitionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok("Form updated", formService.updateForm(id, request)));
  }

  @DeleteMapping("/api/forms/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteForm(@PathVariable UUID id) {
    formService.deleteForm(id);
    return ResponseEntity.ok(ApiResponse.ok("Form deleted", null));
  }

  // ─── Admin: Submission management ─────────────────────────────────────────────

  @GetMapping("/api/forms/{id}/submissions")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<Page<FormSubmissionResponse>>> listSubmissions(
      @PathVariable UUID id,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(ApiResponse.ok(
        formService.listSubmissions(id, PageRequest.of(page, size))));
  }

  @GetMapping("/api/forms/submissions/{subId}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<FormSubmissionResponse>> getSubmission(@PathVariable UUID subId) {
    return ResponseEntity.ok(ApiResponse.ok(formService.getSubmission(subId)));
  }

  @PatchMapping("/api/forms/submissions/{subId}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<FormSubmissionResponse>> updateSubmission(
      @PathVariable UUID subId,
      @RequestParam String status,
      @RequestParam(required = false) String notes) {
    return ResponseEntity.ok(ApiResponse.ok("Updated",
        formService.updateSubmissionStatus(subId, status, notes)));
  }

  @DeleteMapping("/api/forms/submissions/{subId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable UUID subId) {
    formService.deleteSubmission(subId);
    return ResponseEntity.ok(ApiResponse.ok("Submission deleted", null));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private UUID resolveUserId(UserDetails principal) {
    if (principal == null) return null;
    return userRepository.findByUsername(principal.getUsername())
        .map(u -> u.getId())
        .orElse(null);
  }

  private String getClientIp(HttpServletRequest request) {
    String xfwd = request.getHeader("X-Forwarded-For");
    if (xfwd != null && !xfwd.isBlank()) {
      return xfwd.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
