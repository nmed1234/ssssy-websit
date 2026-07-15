package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ThemeRequest;
import org.ssssy.backend.model.dto.ThemeResponse;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.ThemeService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;
    private final UserRepository userRepository;

    /** Public read — active theme needed by frontend for CSS vars */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ThemeResponse>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(themeService.getActiveTheme()));
    }

    @GetMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(themeService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(themeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponse>> create(
            @RequestBody ThemeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = userRepository.findByUsername(userDetails.getUsername()).orElseThrow().getId();
        return ResponseEntity.ok(ApiResponse.ok(themeService.create(request, userId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponse>> update(
            @PathVariable UUID id,
            @RequestBody ThemeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(themeService.update(id, request)));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(themeService.activate(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> delete(@PathVariable UUID id) {
        themeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Theme deleted")));
    }
}
