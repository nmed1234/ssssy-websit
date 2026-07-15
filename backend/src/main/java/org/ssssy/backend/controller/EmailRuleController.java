package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.EmailRuleService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/rules")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailRuleController {

  private final EmailRuleService emailRuleService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<EmailRuleResponse>>> getRules(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailRuleService.getRules(getUserId(userDetails))));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<EmailRuleResponse>> createRule(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailRuleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailRuleService.createRule(getUserId(userDetails), request)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<EmailRuleResponse>> updateRule(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailRuleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailRuleService.updateRule(getUserId(userDetails), id, request)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteRule(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailRuleService.deleteRule(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/{id}/toggle")
  public ResponseEntity<ApiResponse<Void>> toggleRule(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailRuleService.toggleRule(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/reorder")
  public ResponseEntity<ApiResponse<Void>> reorderRules(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody List<UUID> ruleIds) {
    emailRuleService.reorderRules(getUserId(userDetails), ruleIds);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
