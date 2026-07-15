package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.model.dto.WorkflowActionRequest;
import org.ssssy.backend.model.dto.WorkflowActionResponse;
import org.ssssy.backend.model.dto.WorkflowDefinitionRequest;
import org.ssssy.backend.model.dto.WorkflowDefinitionResponse;
import org.ssssy.backend.model.dto.WorkflowLogResponse;
import org.ssssy.backend.service.ConfigurableWorkflowService;
import org.ssssy.backend.service.WorkflowService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
public class WorkflowController {

  private final WorkflowService workflowService;
  private final ConfigurableWorkflowService configurableWorkflowService;

  @PostMapping("/{contentId}/submit")
  @PreAuthorize("hasRole('MEMBER') or hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> submit(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.submit(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/assign")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> assignReviewer(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    if (request.getAssigneeId() == null) {
      return ResponseEntity.badRequest().body(ApiResponse.error("Assignee ID is required"));
    }
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.assignReviewer(contentId, request.getAssigneeId(),
            UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/approve")
  @PreAuthorize("hasRole('REVIEWER') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> approve(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.approve(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/reject")
  @PreAuthorize("hasRole('REVIEWER') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> reject(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.reject(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/request-revision")
  @PreAuthorize("hasRole('REVIEWER') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> requestRevision(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.requestRevision(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/publish")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> publish(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.publish(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/schedule")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> schedule(
      @PathVariable UUID contentId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledAt,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.schedule(contentId, scheduledAt, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/unpublish")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> unpublish(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.unpublish(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @PostMapping("/{contentId}/back-to-draft")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> backToDraft(
      @PathVariable UUID contentId,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.backToDraft(contentId, UUID.fromString(userDetails.getUsername()), request.getComments())));
  }

  @GetMapping("/{contentId}/logs")
  public ResponseEntity<ApiResponse<List<WorkflowLogResponse>>> getWorkflowLogs(
      @PathVariable UUID contentId) {
    return ResponseEntity.ok(ApiResponse.ok(workflowService.getWorkflowLogs(contentId)));
  }

  @GetMapping("/pending-reviews")
  @PreAuthorize("hasRole('REVIEWER') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentResponse>>> getPendingReviews(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        workflowService.getPendingReviews(UUID.fromString(userDetails.getUsername()))));
  }

  @GetMapping("/submitted")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentResponse>>> getSubmittedItems() {
    return ResponseEntity.ok(ApiResponse.ok(workflowService.getSubmittedItems()));
  }

  @GetMapping("/approved")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<ContentResponse>>> getApprovedItems() {
    return ResponseEntity.ok(ApiResponse.ok(workflowService.getApprovedItems()));
  }

  @PostMapping("/{contentId}/transition")
  @PreAuthorize("hasRole('MEMBER') or hasRole('EDITOR') or hasRole('REVIEWER') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<ContentResponse>> transition(
      @PathVariable UUID contentId,
      @RequestParam UUID toStateId,
      @RequestParam(defaultValue = "TRANSITION") String action,
      @Valid @RequestBody WorkflowActionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        configurableWorkflowService.executeTransition(contentId, toStateId,
            UUID.fromString(userDetails.getUsername()), action, request.getComments())));
  }

  @GetMapping("/{contentId}/actions")
  public ResponseEntity<ApiResponse<List<WorkflowActionResponse>>> getWorkflowActions(
      @PathVariable UUID contentId) {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.getActionsForContent(contentId)));
  }

  @GetMapping("/definitions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<WorkflowDefinitionResponse>>> getAllWorkflowDefinitions() {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.getAllWorkflows()));
  }

  @GetMapping("/definitions/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> getWorkflowDefinition(
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.getWorkflow(id)));
  }

  @GetMapping("/definitions/by-content-type/{contentType}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> getWorkflowByContentType(
      @PathVariable String contentType) {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.getWorkflowByContentType(contentType)));
  }

  @PostMapping("/definitions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> createWorkflowDefinition(
      @Valid @RequestBody WorkflowDefinitionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.createWorkflow(request)));
  }

  @PutMapping("/definitions/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> updateWorkflowDefinition(
      @PathVariable UUID id,
      @Valid @RequestBody WorkflowDefinitionRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(configurableWorkflowService.updateWorkflow(id, request)));
  }

  @DeleteMapping("/definitions/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteWorkflowDefinition(@PathVariable UUID id) {
    configurableWorkflowService.deleteWorkflow(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
