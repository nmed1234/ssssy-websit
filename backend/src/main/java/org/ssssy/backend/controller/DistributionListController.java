package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.service.DistributionListService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/distribution-lists")
@RequiredArgsConstructor
public class DistributionListController {

  private final DistributionListService distributionListService;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<DistributionListResponse>>> getAllLists() {
    return ResponseEntity.ok(ApiResponse.ok(distributionListService.getAllLists()));
  }

  @GetMapping("/public")
  public ResponseEntity<ApiResponse<List<DistributionListResponse>>> getPublicLists() {
    return ResponseEntity.ok(ApiResponse.ok(distributionListService.getPublicLists()));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<DistributionListResponse>> createList(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody DistributionListRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(distributionListService.createList(request, getUserId(userDetails))));
  }

  @PostMapping("/{listId}/members/{userId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> addMember(
      @PathVariable UUID listId,
      @PathVariable UUID userId) {
    distributionListService.addMember(listId, userId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @DeleteMapping("/{listId}/members/{userId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> removeMember(
      @PathVariable UUID listId,
      @PathVariable UUID userId) {
    distributionListService.removeMember(listId, userId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/{listId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<DistributionListResponse>> updateList(
      @PathVariable UUID listId,
      @RequestBody DistributionListRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(distributionListService.updateList(listId, request)));
  }

  @DeleteMapping("/{listId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteList(@PathVariable UUID listId) {
    distributionListService.deleteList(listId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/{listId}/members")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<User>>> getMembers(@PathVariable UUID listId) {
    return ResponseEntity.ok(ApiResponse.ok(distributionListService.getListMembers(listId)));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
