package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EmailMessageRequest;
import org.ssssy.backend.model.dto.EmailMessageResponse;
import org.ssssy.backend.service.EmailSendService;

import java.util.UUID;

@RestController
@RequestMapping("/api/email/compose")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailComposeController {

  private final EmailSendService emailSendService;

  @PostMapping("/send")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> send(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.sendEmail(getUserId(userDetails), request)));
  }

  @PostMapping("/draft")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> saveDraft(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.saveDraft(getUserId(userDetails), request)));
  }

  @PutMapping("/draft/{id}")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> updateDraft(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.updateDraft(getUserId(userDetails), id, request)));
  }

  @PostMapping("/draft/{id}/send")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> sendDraft(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.sendDraft(getUserId(userDetails), id)));
  }

  @PostMapping("/{id}/reply")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> reply(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.reply(getUserId(userDetails), id, request)));
  }

  @PostMapping("/{id}/reply-all")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> replyAll(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.replyAll(getUserId(userDetails), id, request)));
  }

  @PostMapping("/{id}/forward")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> forward(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.forward(getUserId(userDetails), id, request)));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
