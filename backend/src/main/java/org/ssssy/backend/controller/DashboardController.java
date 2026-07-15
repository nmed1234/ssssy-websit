package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.AuditLogResponse;
import org.ssssy.backend.model.dto.DashboardStatsResponse;
import org.ssssy.backend.service.DashboardService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  @GetMapping("/dashboard/stats")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
    return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
  }

  @GetMapping("/dashboard/recent-activity")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getRecentActivity() {
    return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentActivity(20)));
  }

  @GetMapping("/dashboard/content-by-status")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Long>>> getContentByStatus() {
    return ResponseEntity.ok(ApiResponse.ok(dashboardService.getContentByStatus()));
  }
}
