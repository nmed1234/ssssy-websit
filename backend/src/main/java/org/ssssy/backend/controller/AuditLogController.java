package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.audit.AuditService;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.AuditLogResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

  private final AuditService auditService;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(auditService.getAllAuditLogs(pageable)));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(auditService.getAuditLogById(id)));
  }
}
