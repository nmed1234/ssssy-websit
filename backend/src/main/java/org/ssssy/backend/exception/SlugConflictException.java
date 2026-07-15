package org.ssssy.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a page update would create a slug conflict with another non-deleted page.
 * Maps to HTTP 409 Conflict.
 *
 * Requirements: 6.4, 6.5
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SlugConflictException extends RuntimeException {

    private final String conflictingSlug;

    public SlugConflictException(String slug) {
        super("Slug already in use: " + slug);
        this.conflictingSlug = slug;
    }

    public String getConflictingSlug() {
        return conflictingSlug;
    }
}
