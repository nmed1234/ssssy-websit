package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for PATCH /api/admin/pages/{id}/workflow.
 *
 * Requirements: 9.2–9.10
 */
@Getter
@Setter
@NoArgsConstructor
public class PageWorkflowTransitionRequest {

    /** Target workflow state (e.g. "REVIEW", "APPROVED", "PUBLISHED", "DRAFT"). */
    @NotBlank(message = "toState must not be blank")
    private String toState;

    /**
     * Optional notes — required and non-empty only for rejection transitions
     * (REVIEW → DRAFT). Max 1000 characters.
     */
    @Size(max = 1000, message = "notes must not exceed 1000 characters")
    private String notes;
}
