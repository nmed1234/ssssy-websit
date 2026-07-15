package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents one entry in the page workflow history timeline.
 * Returned as part of the GET /api/admin/pages/{id}/workflow response.
 *
 * Requirements: 9.1
 */
@Getter
@Setter
@AllArgsConstructor
@Builder
public class WorkflowHistoryEntry {

    private UUID id;
    private String fromState;
    private String toState;
    private UUID userId;
    /** Display name resolved from the users table (firstNameEn + " " + lastNameEn). */
    private String userDisplayName;
    private LocalDateTime timestamp;
    /** Nullable — only present on rejection (REVIEW → DRAFT). */
    private String notes;
}
