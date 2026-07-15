package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Append-only audit trail for all page mutations.
 * Records are never deleted — see design doc section 12.
 */
@Entity
@Table(name = "page_audit_trail")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageAuditTrail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * One of: CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, WORKFLOW_TRANSITION.
     * Enforced by a CHECK constraint in the migration.
     */
    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    /**
     * JSON object mapping field name → {before, after}.
     * Only changed fields are included; unchanged fields are omitted.
     * Stored as PostgreSQL JSONB.
     */
    @Column(name = "changed_fields", nullable = false, columnDefinition = "jsonb")
    private String changedFields;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (changedFields == null) {
            changedFields = "{}";
        }
    }
}
