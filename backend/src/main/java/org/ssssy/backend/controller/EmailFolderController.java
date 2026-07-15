package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EmailFolderCountsResponse;
import org.ssssy.backend.model.dto.EmailFolderRequest;
import org.ssssy.backend.model.dto.EmailFolderResponse;
import org.ssssy.backend.service.EmailFolderService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/folders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailFolderController {

  private final EmailFolderService emailFolderService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<EmailFolderResponse>>> getFolders(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailFolderService.getFolders(getUserId(userDetails))));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<EmailFolderResponse>> createFolder(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailFolderRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailFolderService.createFolder(getUserId(userDetails), request)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<EmailFolderResponse>> updateFolder(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailFolderRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailFolderService.updateFolder(getUserId(userDetails), id, request)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteFolder(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailFolderService.deleteFolder(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/type/{folderType}")
  public ResponseEntity<ApiResponse<EmailFolderResponse>> getFolderByType(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable String folderType) {
    return ResponseEntity.ok(ApiResponse.ok(emailFolderService.getFolderByType(getUserId(userDetails), folderType)));
  }

  @PutMapping("/reorder")
  public ResponseEntity<ApiResponse<Void>> reorderFolders(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody List<UUID> folderIds) {
    emailFolderService.reorderFolders(getUserId(userDetails), folderIds);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/{id}/counts")
  public ResponseEntity<ApiResponse<EmailFolderCountsResponse>> getFolderCounts(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailFolderService.getFolderCounts(getUserId(userDetails), id)));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
