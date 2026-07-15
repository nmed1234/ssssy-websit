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
import org.ssssy.backend.model.dto.JobApplicationRequest;
import org.ssssy.backend.model.dto.JobApplicationResponse;
import org.ssssy.backend.service.JobApplicationService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JobApplicationController {

  private final JobApplicationService jobApplicationService;

  @PostMapping("/public/jobs/{jobVacancyId}/apply")
  public ResponseEntity<ApiResponse<JobApplicationResponse>> apply(
      @PathVariable UUID jobVacancyId,
      @Valid @RequestBody JobApplicationRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(jobApplicationService.apply(jobVacancyId, request)));
  }

  @GetMapping("/admin/jobs/{jobVacancyId}/applications")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getApplications(
      @PathVariable UUID jobVacancyId,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(
        jobApplicationService.getApplicationsByVacancy(jobVacancyId, pageable)));
  }

  @PutMapping("/admin/jobs/applications/{id}/status")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplicationStatus(
      @PathVariable UUID id,
      @RequestParam String status) {
    return ResponseEntity.ok(ApiResponse.ok(
        jobApplicationService.updateApplicationStatus(id, status)));
  }
}
