package org.ssssy.backend.model.dto;

/**
 * Response DTO for the slug availability check endpoint.
 *
 * @param available  true if the slug is not currently in use
 * @param suggestion a suggested alternative slug (equals the slug itself when available)
 */
public record SlugCheckResponse(boolean available, String suggestion) {}
