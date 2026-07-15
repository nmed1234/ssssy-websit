package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.EmailAccountService;
import org.ssssy.backend.service.EmailAliasService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/account")
@RequiredArgsConstructor
public class EmailAccountController {

  private final EmailAccountService emailAccountService;
  private final EmailAliasService emailAliasService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> getMyAccount(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getMyAccount(getUserId(userDetails))));
  }

  @PutMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> updateAccount(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailAccountRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.updateAccount(getUserId(userDetails), request)));
  }

  @PutMapping("/password")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody Map<String, String> body) {
    emailAccountService.changePassword(getUserId(userDetails), body.get("currentPassword"), body.get("newPassword"));
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/provision")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> provision(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.provisionAccount(getUserId(userDetails))));
  }

  @GetMapping("/quota")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<EmailQuotaResponse>> getQuota(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getQuotaInfo(getUserId(userDetails))));
  }

  @GetMapping("/aliases")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<List<EmailAliasResponse>>> getMyAliases(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getMyAliases(getUserId(userDetails))));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
