package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.EmailAccountService;
import org.ssssy.backend.service.EmailAliasService;
import org.ssssy.backend.service.EmailQuotaLogService;
import org.ssssy.backend.service.EmailScheduledSendService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/email")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class EmailAdminController {

  private final EmailAccountService emailAccountService;
  private final EmailScheduledSendService scheduledSendService;
  private final EmailAliasService emailAliasService;
  private final EmailQuotaLogService emailQuotaLogService;

  @GetMapping("/accounts")
  public ResponseEntity<ApiResponse<List<EmailAccountResponse>>> getAllAccounts() {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getAllAccounts()));
  }

  @PostMapping("/accounts")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> createAccount(
      @Valid @RequestBody EmailAccountCreateRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.createAccountByAdmin(request)));
  }

  @GetMapping("/accounts/{id}")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> getAccount(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getAccountById(id)));
  }

  @PutMapping("/accounts/{id}")
  public ResponseEntity<ApiResponse<EmailAccountResponse>> updateAccount(
      @PathVariable UUID id,
      @Valid @RequestBody EmailAccountUpdateRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.updateAccountByAdmin(id, request)));
  }

  @DeleteMapping("/accounts/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable UUID id) {
    emailAccountService.deleteAccountByAdmin(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/accounts/{id}/password")
  public ResponseEntity<ApiResponse<Void>> resetPassword(
      @PathVariable UUID id,
      @RequestBody Map<String, String> body) {
    emailAccountService.resetPasswordByAdmin(id, body.get("newPassword"));
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/accounts/{id}/quota")
  public ResponseEntity<ApiResponse<Void>> setQuota(
      @PathVariable UUID id,
      @RequestBody QuotaUpdateRequest request) {
    emailAccountService.setQuota(id, request.getQuotaBytes());
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/accounts/{id}/toggle-active")
  public ResponseEntity<ApiResponse<Void>> toggleActive(
      @PathVariable UUID id) {
    emailAccountService.toggleActive(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/accounts/bulk")
  public ResponseEntity<ApiResponse<Void>> bulkOperation(@RequestBody EmailBulkRequest request) {
    emailAccountService.bulkOperation(request);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/accounts/{id}/quota-logs")
  public ResponseEntity<ApiResponse<List<EmailQuotaLogResponse>>> getQuotaLogs(
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailQuotaLogService.getQuotaLogs(id)));
  }

  @GetMapping("/accounts/{id}/scheduled-sends")
  public ResponseEntity<ApiResponse<List<EmailScheduledSendResponse>>> getScheduledSends(
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(scheduledSendService.getScheduledSends(id)));
  }

  @DeleteMapping("/scheduled-sends/{id}")
  public ResponseEntity<ApiResponse<Void>> cancelScheduledSend(
      @PathVariable UUID id) {
    scheduledSendService.cancelScheduledSend(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/stats")
  public ResponseEntity<ApiResponse<EmailAdminStatsResponse>> getStats() {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getAdminStats()));
  }

  @GetMapping("/storage-report")
  public ResponseEntity<ApiResponse<List<EmailStorageReportResponse>>> getStorageReport() {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getStorageReport()));
  }

  @GetMapping("/logs")
  public ResponseEntity<ApiResponse<Page<EmailQuotaLogResponse>>> getEmailLogs(
      @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailQuotaLogService.getAllQuotaLogs(pageable)));
  }

  @GetMapping("/aliases")
  public ResponseEntity<ApiResponse<List<EmailAliasResponse>>> getAllAliases() {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.getAllAliases()));
  }

  @PostMapping("/aliases")
  public ResponseEntity<ApiResponse<EmailAliasResponse>> createAlias(@RequestBody EmailAliasRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.createAlias(request)));
  }

  @DeleteMapping("/aliases/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteAlias(@PathVariable UUID id) {
    emailAliasService.deleteAlias(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/mail-queue")
  public ResponseEntity<ApiResponse<List<EmailScheduledSendResponse>>> getMailQueue() {
    return ResponseEntity.ok(ApiResponse.ok(scheduledSendService.getAllScheduledSends()));
  }

  @PostMapping("/flush-queue")
  public ResponseEntity<ApiResponse<Void>> flushQueue() {
    scheduledSendService.processPendingScheduledSends();
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/bounce-reports")
  public ResponseEntity<ApiResponse<Page<EmailMessageResponse>>> getBounceReports(
      @PageableDefault(size = 50, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailAccountService.getBouncedMessages(pageable)));
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
