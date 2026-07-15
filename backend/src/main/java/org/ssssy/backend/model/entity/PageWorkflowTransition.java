package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Records each state transition in the page approval workflow.
 * Maps to the page_workflow_transitions table (named to avoid collision with
 * the pre-existing workflow_transitions table for the generic workflow engine).
 *
 * Requirements: 9.3
 */
@Entity
@Table(name = "page_workflow_transitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageWorkflowTransition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(name = "from_state", nullable = false, length = 50)
    private String fromState;

    @Column(name = "to_state", nullable = false, length = 50)
    private String toState;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    /**
     * Optional notes — required and non-empty for rejection transitions
     * (REVIEW → DRAFT). Max 1000 characters.
     */
    @Column(name = "notes", length = 1000)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
