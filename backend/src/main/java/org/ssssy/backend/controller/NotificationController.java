package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.NotificationResponse;
import org.ssssy.backend.service.NotificationService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        notificationService.getUserNotifications(UUID.fromString(userDetails.getUsername()), pageable)));
  }

  @GetMapping("/unread-count")
  public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
      @AuthenticationPrincipal UserDetails userDetails) {
    long count = notificationService.getUnreadCount(UUID.fromString(userDetails.getUsername()));
    return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<ApiResponse<Void>> markAsRead(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetails userDetails) {
    notificationService.markAsRead(id, UUID.fromString(userDetails.getUsername()));
    return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
  }

  @PutMapping("/read-all")
  public ResponseEntity<ApiResponse<Void>> markAllAsRead(
      @AuthenticationPrincipal UserDetails userDetails) {
    notificationService.markAllAsRead(UUID.fromString(userDetails.getUsername()));
    return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
  }
}
