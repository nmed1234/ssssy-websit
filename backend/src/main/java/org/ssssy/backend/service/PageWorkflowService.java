package org.ssssy.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.InsufficientPermissionsException;
import org.ssssy.backend.exception.InvalidStateTransitionException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.WorkflowTransitionResult;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.PageAuditTrail;
import org.ssssy.backend.model.entity.PageWorkflowTransition;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageAuditTrailRepository;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.PageWorkflowTransitionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Handles page approval workflow transitions.
 *
 * Allowed transitions:
 *   DRAFT   → REVIEW    : EDITOR, PUBLISHER, ADMIN
 *   REVIEW  → APPROVED  : PUBLISHER, ADMIN
 *   REVIEW  → DRAFT     : PUBLISHER, ADMIN  (rejection — notes required)
 *   APPROVED→ PUBLISHED : PUBLISHER, ADMIN
 *
 * Requirements: 9.2–9.10
 */
@Service
public class PageWorkflowService {

    // -------------------------------------------------------------------------
    // Allowed transitions: fromState → toState → set of permitted role names
    // -------------------------------------------------------------------------
    private static final Map<String, Map<String, Set<String>>> TRANSITIONS = Map.of(
            "DRAFT", Map.of(
                    "REVIEW", Set.of("EDITOR", "PUBLISHER", "ADMIN")
            ),
            "REVIEW", Map.of(
                    "APPROVED", Set.of("PUBLISHER", "ADMIN"),
                    "DRAFT",    Set.of("PUBLISHER", "ADMIN")   // rejection
            ),
            "APPROVED", Map.of(
                    "PUBLISHED", Set.of("PUBLISHER", "ADMIN")
            )
    );

    private final PageRepository pageRepository;
    private final PageWorkflowTransitionRepository transitionRepository;
    private final PageAuditTrailRepository auditTrailRepository;
    private final PageWorkflowEmailService emailService;

    public PageWorkflowService(
            PageRepository pageRepository,
            PageWorkflowTransitionRepository transitionRepository,
            PageAuditTrailRepository auditTrailRepository,
            PageWorkflowEmailService emailService) {
        this.pageRepository = pageRepository;
        this.transitionRepository = transitionRepository;
        this.auditTrailRepository = auditTrailRepository;
        this.emailService = emailService;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Perform a workflow transition on the given page.
     *
     * @param pageId   the page to transition
     * @param toState  the desired new state
     * @param caller   the authenticated user requesting the transition
     * @param notes    required (non-blank) only for REVIEW → DRAFT (rejection)
     * @return a {@link WorkflowTransitionResult} describing the outcome
     */
    public WorkflowTransitionResult transition(UUID pageId, String toState, User caller, String notes) {

        // 1. Load page — 404 if missing or soft-deleted
        Page page = pageRepository.findById(pageId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        String fromState = page.getWorkflowStatus();

        // 2. Validate source state
        Map<String, Set<String>> allowedTargets = TRANSITIONS.get(fromState);
        if (allowedTargets == null || !allowedTargets.containsKey(toState)) {
            throw new InvalidStateTransitionException(fromState, toState);
        }

        // 3. Validate caller role
        String callerRole = caller.getRole() != null ? caller.getRole().getName() : "";
        Set<String> allowedRoles = allowedTargets.get(toState);
        if (!allowedRoles.contains(callerRole)) {
            throw new InsufficientPermissionsException(
                    "Role '" + callerRole + "' cannot transition from " + fromState + " to " + toState);
        }

        // 4. Rejection (REVIEW → DRAFT) requires non-blank notes
        boolean isRejection = "REVIEW".equals(fromState) && "DRAFT".equals(toState);
        if (isRejection) {
            if (notes == null || notes.isBlank()) {
                throw new BadRequestException("Rejection notes must not be blank");
            }
            if (notes.length() > 1000) {
                throw new BadRequestException("Rejection notes must not exceed 1000 characters");
            }
        }

        // 5. Transactional persistence
        LocalDateTime now = executeTransition(page, fromState, toState, caller, notes);

        // 6. Async email notification (fire-and-forget, runs after commit)
        emailService.notifyTransition(page, fromState, toState, now);

        return new WorkflowTransitionResult(page.getId(), fromState, toState, now);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    @Transactional
    protected LocalDateTime executeTransition(
            Page page, String fromState, String toState, User caller, String notes) {

        LocalDateTime now = LocalDateTime.now();

        // Update page state
        page.setWorkflowStatus(toState);
        if ("PUBLISHED".equals(toState)) {
            page.setIsPublished(true);
        }
        pageRepository.save(page);

        // Insert workflow transition row
        PageWorkflowTransition transition = PageWorkflowTransition.builder()
                .pageId(page.getId())
                .fromState(fromState)
                .toState(toState)
                .userId(caller.getId())
                .timestamp(now)
                .notes(notes)
                .build();
        transitionRepository.save(transition);

        // Insert audit trail row
        String changedFields = buildChangedFieldsJson(fromState, toState);
        PageAuditTrail audit = PageAuditTrail.builder()
                .pageId(page.getId())
                .userId(caller.getId())
                .action("WORKFLOW_TRANSITION")
                .timestamp(now)
                .changedFields(changedFields)
                .build();
        auditTrailRepository.save(audit);

        return now;
    }

    /**
     * Builds the JSONB {@code changedFields} string for the audit trail.
     * Format: {"workflowStatus":{"before":"DRAFT","after":"REVIEW"}}
     */
    private String buildChangedFieldsJson(String before, String after) {
        return "{\"workflowStatus\":{\"before\":\"" + before + "\",\"after\":\"" + after + "\"}}";
    }
}
