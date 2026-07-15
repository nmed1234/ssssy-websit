package org.ssssy.backend.exception;

/**
 * Thrown when a preview token is not found in the database or has expired.
 * Results in HTTP 403 with {"error": "preview_token_expired_or_invalid"}.
 *
 * Requirements: 8.7
 */
public class PreviewTokenExpiredException extends RuntimeException {

    public PreviewTokenExpiredException() {
        super("preview_token_expired_or_invalid");
    }

    public PreviewTokenExpiredException(String message) {
        super(message);
    }
}
