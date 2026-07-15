package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request body for POST /api/admin/page-templates.
 *
 * Requirements: 20.1, 20.2
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePageTemplateRequest {

    /** Template display name — 1 to 100 characters. */
    @NotBlank(message = "Template name is required")
    @Size(min = 1, max = 100, message = "Template name must be between 1 and 100 characters")
    private String name;

    /**
     * One of the five allowed categories enforced by the DB CHECK constraint.
     * Validation is also performed in the service layer for a clear 400 response.
     */
    @NotBlank(message = "Category is required")
    @Pattern(
        regexp = "Layout|Landing|About|Contact|Blog",
        message = "Category must be one of: Layout, Landing, About, Contact, Blog"
    )
    private String category;

    /** Optional template description — max 500 characters. */
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    /**
     * Full block tree in canonical format: {"version":"1","blocks":[...]}.
     * Validated via LayoutJsonValidator before persistence.
     */
    @NotBlank(message = "layoutJson is required")
    private String layoutJson;

    /** Optional URL to a screenshot / thumbnail for the template selection grid. */
    private String thumbnailUrl;
}
