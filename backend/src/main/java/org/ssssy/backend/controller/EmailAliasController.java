package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EmailAliasRequest;
import org.ssssy.backend.model.dto.EmailAliasResponse;
import org.ssssy.backend.service.EmailAliasService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/aliases")
@RequiredArgsConstructor
public class EmailAliasController {

  private final EmailAliasService emailAliasService;

  @GetMapping("/account/{accountId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<EmailAliasResponse>>> getAliases(@PathVariable UUID accountId) {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.getAliasesByAccount(accountId)));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EmailAliasResponse>> getAlias(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.getAlias(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EmailAliasResponse>> createAlias(@RequestBody EmailAliasRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.createAlias(request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteAlias(@PathVariable UUID id) {
    emailAliasService.deleteAlias(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/{id}/toggle")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EmailAliasResponse>> toggleAlias(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailAliasService.toggleAlias(id)));
  }
}
