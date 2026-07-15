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
import org.ssssy.backend.model.dto.JobVacancyRequest;
import org.ssssy.backend.model.dto.JobVacancyResponse;
import org.ssssy.backend.service.JobVacancyService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JobVacancyController {

  private final JobVacancyService jobVacancyService;

  @GetMapping("/public/jobs")
  public ResponseEntity<ApiResponse<Page<JobVacancyResponse>>> getPublishedVacancies(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(jobVacancyService.getPublishedVacancies(pageable)));
  }

  @GetMapping("/public/jobs/{slug}")
  public ResponseEntity<ApiResponse<JobVacancyResponse>> getVacancyBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(jobVacancyService.getVacancyBySlug(slug)));
  }

  @GetMapping("/public/jobs/id/{id}")
  public ResponseEntity<ApiResponse<JobVacancyResponse>> getVacancyById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(jobVacancyService.getVacancy(id)));
  }

  @GetMapping("/admin/jobs")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<JobVacancyResponse>>> getAllVacancies(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(jobVacancyService.getAllVacancies(pageable)));
  }

  @PostMapping("/admin/jobs")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<JobVacancyResponse>> createVacancy(
      @Valid @RequestBody JobVacancyRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        jobVacancyService.createVacancy(request, UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/admin/jobs/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<JobVacancyResponse>> updateVacancy(
      @PathVariable UUID id, @Valid @RequestBody JobVacancyRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(jobVacancyService.updateVacancy(id, request)));
  }

  @DeleteMapping("/admin/jobs/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteVacancy(@PathVariable UUID id) {
    jobVacancyService.deleteVacancy(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Vacancy deleted successfully")));
  }
}
