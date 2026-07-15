package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.StagingStatusResponse;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.StagingSyncService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staging")
@RequiredArgsConstructor
public class StagingController {

    private final StagingSyncService stagingSyncService;
    private final UserRepository userRepository;

    @GetMapping("/status")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StagingStatusResponse>> getStatus() {
        return ResponseEntity.ok(ApiResponse.ok(stagingSyncService.getStatus()));
    }

    @PostMapping("/enable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> enable() {
        stagingSyncService.enableStaging();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Staging mode enabled")));
    }

    @PostMapping("/disable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> disable() {
        stagingSyncService.disableStaging();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Staging mode disabled")));
    }

    @PostMapping("/sync-to-production")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StagingStatusResponse>> syncToProduction(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = userRepository.findByUsername(userDetails.getUsername()).orElseThrow().getId();
        return ResponseEntity.ok(ApiResponse.ok(stagingSyncService.syncToProduction(userId)));
    }

    @PostMapping("/preview-link")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePreviewLink(
            @RequestParam String slug,
            @RequestParam(defaultValue = "7") int expiryDays) {
        String token = stagingSyncService.generatePreviewToken(slug, expiryDays);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("token", token, "slug", slug)));
    }
}
