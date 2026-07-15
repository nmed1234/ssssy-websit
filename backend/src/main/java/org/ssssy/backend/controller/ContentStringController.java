package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentStringRequest;
import org.ssssy.backend.model.dto.ContentStringResponse;
import org.ssssy.backend.service.ContentStringService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ContentStringController {

  private final ContentStringService contentStringService;

  // ─── Public Endpoints ──────────────────────────────────────────────

  @GetMapping("/api/public/content-strings")
  public ResponseEntity<ApiResponse<Map<String, String>>> getPublicStrings(
      @RequestParam(defaultValue = "en") String lang) {
    Map<String, String> map = "ar".equalsIgnoreCase(lang)
        ? contentStringService.getStringMapAr()
        : contentStringService.getStringMapEn();
    return ResponseEntity.ok(ApiResponse.ok(map));
  }

  @GetMapping("/api/public/content-strings/{key}")
  public ResponseEntity<ApiResponse<ContentStringResponse>> getPublicString(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.getStringByKey(key)));
  }

  @GetMapping("/api/public/content-strings/group/{group}")
  public ResponseEntity<ApiResponse<List<ContentStringResponse>>> getPublicStringsByGroup(
      @PathVariable String group) {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.getStringsByGroup(group)));
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────

  @GetMapping("/api/admin/content-strings")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<List<ContentStringResponse>>> getAllStrings() {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.getAllStrings()));
  }

  @GetMapping("/api/admin/content-strings/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<ContentStringResponse>> getString(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.getStringById(id)));
  }

  @GetMapping("/api/admin/content-strings/groups")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<List<String>>> getGroups() {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.getAllGroups()));
  }

  @PostMapping("/api/admin/content-strings")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<ContentStringResponse>> createString(
      @RequestBody ContentStringRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.createString(request)));
  }

  @PutMapping("/api/admin/content-strings/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<ContentStringResponse>> updateString(
      @PathVariable UUID id, @RequestBody ContentStringRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(contentStringService.updateString(id, request)));
  }

  @DeleteMapping("/api/admin/content-strings/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteString(@PathVariable UUID id) {
    contentStringService.deleteString(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Content string deleted")));
  }
}
