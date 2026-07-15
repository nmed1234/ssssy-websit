package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.GeneratePreviewRequest;
import org.ssssy.backend.model.dto.PreviewTokenResponse;
import org.ssssy.backend.service.PreviewService;

import java.util.UUID;

/**
 * Handles preview token generation and resolution for pages.
 *
 * POST /api/preview/pages/{id}     — generate a time-limited preview token (EDITOR+)
 * GET  /api/preview/pages/{id}     — resolve a preview token and return layout JSON (public)
 *
 * Requirements: 8.4, 8.5, 8.6, 8.7
 */
@RestController
@RequestMapping("/api/preview/pages")
@RequiredArgsConstructor
public class PreviewController {

    private final PreviewService previewService;

    // -----------------------------------------------------------------
    // POST /api/preview/pages/{id}
    // Generate a preview token for the given page.
    // Requirements: 8.4, 8.5
    // -----------------------------------------------------------------

    /**
     * Generates a 1-hour preview token that encapsulates the supplied layout JSON.
     * The token is stored in {@code preview_tokens} and the response includes the
     * token value, a ready-to-use preview URL, and the expiry timestamp.
     *
     * Auth: EDITOR, PUBLISHER, ADMIN, SUPER_ADMIN
     */
    @PostMapping("/{id}")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PreviewTokenResponse>> generatePreviewToken(
            @PathVariable UUID id,
            @Valid @RequestBody GeneratePreviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID createdByUserId = UUID.fromString(userDetails.getUsername());
        PreviewTokenResponse response = previewService.generateToken(id, request.getLayoutJson(), createdByUserId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // -----------------------------------------------------------------
    // GET /api/preview/pages/{id}?token={token}
    // Resolve a preview token and return the layout JSON snapshot.
    // No authentication required — public endpoint.
    // Requirements: 8.4, 8.6, 8.7
    // -----------------------------------------------------------------

    /**
     * Validates the supplied token against the {@code preview_tokens} table.
     * On success returns the stored layout JSON with {@code X-Robots-Tag: noindex, nofollow}
     * so search engines never index ephemeral preview URLs.
     *
     * On expired / invalid token, {@link org.ssssy.backend.exception.PreviewTokenExpiredException}
     * is thrown and handled globally → HTTP 403 {@code {"error":"preview_token_expired_or_invalid"}}.
     *
     * Auth: none — security is enforced by the token itself.
     */
    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> resolvePreviewToken(
            @PathVariable UUID id,
            @RequestParam String token) {

        String layoutJson = previewService.resolveToken(id, token);

        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("X-Robots-Tag", "noindex, nofollow")
                .body(layoutJson);
    }
}
