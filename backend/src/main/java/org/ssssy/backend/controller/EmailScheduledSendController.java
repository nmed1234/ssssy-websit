package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EmailScheduledSendResponse;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.repository.EmailAccountRepository;
import org.ssssy.backend.service.EmailScheduledSendService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/scheduled")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailScheduledSendController {

  private final EmailScheduledSendService scheduledSendService;
  private final EmailAccountRepository emailAccountRepository;

  @GetMapping
  public ResponseEntity<ApiResponse<List<EmailScheduledSendResponse>>> getScheduledSends(
      @AuthenticationPrincipal UserDetails userDetails) {
    UUID userId = UUID.fromString(userDetails.getUsername());
    EmailAccount account = emailAccountRepository.findByUserId(userId).orElse(null);
    if (account == null) {
      return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }
    return ResponseEntity.ok(ApiResponse.ok(scheduledSendService.getScheduledSends(account.getId())));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> cancelScheduledSend(@PathVariable UUID id) {
    scheduledSendService.cancelScheduledSend(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
