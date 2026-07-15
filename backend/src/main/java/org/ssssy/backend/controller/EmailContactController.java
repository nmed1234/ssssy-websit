package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/email/contacts")
@RequiredArgsConstructor
public class EmailContactController {

  private final EmailContactService emailContactService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Page<EmailContactResponse>>> getContacts(
      @AuthenticationPrincipal UserDetails userDetails,
      @PageableDefault(size = 50) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getContactsPaged(getUserId(userDetails), pageable)));
  }

  @GetMapping("/all")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailContactResponse>>> getAllContacts(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getContacts(getUserId(userDetails))));
  }

  @GetMapping("/favorites")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailContactResponse>>> getFavorites(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getFavorites(getUserId(userDetails))));
  }

  @GetMapping("/autocomplete")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailContactResponse>>> autocomplete(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam String q) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.autocomplete(getUserId(userDetails), q)));
  }

  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailContactResponse>> getContact(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getContact(getUserId(userDetails), id)));
  }

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailContactResponse>> createContact(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody EmailContactRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.createContact(getUserId(userDetails), request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailContactResponse>> updateContact(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @Valid @RequestBody EmailContactRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.updateContact(getUserId(userDetails), id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Void>> deleteContact(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailContactService.deleteContact(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/import")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailContactResponse>>> importContacts(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody EmailContactImportRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.importContacts(getUserId(userDetails), request)));
  }

  @GetMapping("/export")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailContactResponse>>> exportContacts(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailContactService.getContacts(getUserId(userDetails))));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
