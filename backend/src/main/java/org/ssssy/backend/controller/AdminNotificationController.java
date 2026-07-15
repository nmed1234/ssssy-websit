package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.AdminNotificationResponse;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.service.AdminNotificationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

  private final AdminNotificationService adminNotificationService;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<AdminNotificationResponse>>> getAllNotifications(
      @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.getAllNotifications(pageable)));
  }

  @GetMapping("/unread")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<AdminNotificationResponse>>> getUnreadNotifications(
      @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.getUnreadNotifications(pageable)));
  }

  @GetMapping("/unread-count")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
    return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.getUnreadCount()));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<AdminNotificationResponse>> getNotification(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.getNotification(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<AdminNotificationResponse>> createNotification(
      @RequestBody AdminNotificationResponse request) {
    return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.createNotification(request)));
  }

  @PutMapping("/{id}/read")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
    adminNotificationService.markAsRead(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
    adminNotificationService.deleteNotification(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
