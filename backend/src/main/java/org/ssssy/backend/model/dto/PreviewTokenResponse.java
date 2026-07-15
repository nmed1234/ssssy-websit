package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Response DTO returned when a preview token is generated.
 *
 * Requirements: 8.4, 8.5
 */
@Value
@Builder
public class PreviewTokenResponse {

    /** The 64-character hex-encoded preview token. */
    String token;

    /**
     * The full preview URL.
     * Format: /api/preview/pages/{pageId}?token={token}
     */
    String previewUrl;

    /** UTC timestamp when the token expires (1 hour from creation). */
    LocalDateTime expiresAt;
}
