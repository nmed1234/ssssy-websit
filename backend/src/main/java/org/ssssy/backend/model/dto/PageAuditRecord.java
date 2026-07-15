package org.ssssy.backend.model.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a single page audit trail entry.
 *
 * Returned by GET /api/admin/pages/{id}/audit-trail?page=0&size=20
 *
 * Requirements: 12.3, 12.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageAuditRecord {

    /** Audit record UUID. */
    private UUID id;

    /**
     * Action that triggered this audit entry.
     * One of: CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, WORKFLOW_TRANSITION
     */
    private String action;

    /** ID of the user who performed the action. */
    private UUID userId;

    /**
     * Display name of the user who performed the action.
     * Derived from User.firstNameEn + " " + User.lastNameEn, with
     * a fallback to User.username if both name parts are blank.
     */
    private String userDisplayName;

    /**
     * Avatar URL of the user who performed the action.
     * May be null if the user has no avatar configured.
     */
    private String userAvatarUrl;

    /** UTC timestamp of when the action occurred. */
    private LocalDateTime timestamp;

    /**
     * JSON object mapping field name → {before, after}.
     * Only fields that actually changed are included.
     * Example: {"workflowStatus":{"before":"DRAFT","after":"REVIEW"}}
     */
    private JsonNode changedFields;
}
