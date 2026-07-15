package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.EmailContactService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/contact-groups")
@RequiredArgsConstructor
public class EmailContactGroupController {

  private final EmailContactService emailContactService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<ContactGroupResponse>>> getGroups(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getGroups(getUserId(userDetails))));
  }

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<ContactGroupResponse>> createGroup(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody ContactGroupRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.createGroup(getUserId(userDetails), request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<ContactGroupResponse>> updateGroup(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @Valid @RequestBody ContactGroupRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.updateGroup(getUserId(userDetails), id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Void>> deleteGroup(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailContactService.deleteGroup(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/{groupId}/members/{contactId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Void>> addMember(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID groupId,
      @PathVariable UUID contactId) {
    emailContactService.addContactToGroup(getUserId(userDetails), groupId, contactId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @DeleteMapping("/{groupId}/members/{contactId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Void>> removeMember(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID groupId,
      @PathVariable UUID contactId) {
    emailContactService.removeContactFromGroup(getUserId(userDetails), groupId, contactId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
