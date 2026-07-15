package org.ssssy.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Returned by PageWorkflowService after a successful state transition.
 *
 * Requirements: 9.2–9.10
 */
public record WorkflowTransitionResult(
        UUID pageId,
        String fromState,
        String toState,
        LocalDateTime timestamp) {
}
