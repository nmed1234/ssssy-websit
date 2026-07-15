package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PageWorkflowTransitionRequest;
import org.ssssy.backend.model.dto.WorkflowTransitionResult;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.PageWorkflowTransition;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.PageWorkflowTransitionRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.PageWorkflowService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Handles workflow state inspection and transitions for pages.
 *
 * GET   /api/admin/pages/{pageId}/workflow — current state, available transitions
 *                                            (role-filtered), and history
 * PATCH /api/admin/pages/{pageId}/workflow — performs a transition; delegates to
 *                                            PageWorkflowService
 *
 * Requirements: 9.1–9.10
 */
@RestController
@RequestMapping("/api/admin/pages/{pageId}/workflow")
@RequiredArgsConstructor
public class PageWorkflowController {

    // -----------------------------------------------------------------
    // Transition permission matrix (mirrors PageWorkflowService)
    // fromState → toState → required roles
    // -----------------------------------------------------------------
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

    private final PageWorkflowService workflowService;
    private final PageWorkflowTransitionRepository transitionRepository;
    private final PageRepository pageRepository;
    private final UserRepository userRepository;

    // -----------------------------------------------------------------
    // GET /api/admin/pages/{pageId}/workflow
    // Requirements: 9.1
    // -----------------------------------------------------------------

    /**
     * Returns the current workflow state, available transitions filtered by the
     * caller's role, and a paginated history (newest first, up to 20 entries).
     *
     * Auth: EDITOR, PUBLISHER, ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkflowStatus(
            @PathVariable UUID pageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User caller = resolveUser(userDetails);
        String callerRole = callerRole(caller);

        Page page = resolvePage(pageId);
        String currentState = page.getWorkflowStatus() != null ? page.getWorkflowStatus() : "DRAFT";

        // Transitions visible to this caller's role
        List<String> availableTransitions = computeAvailableTransitions(currentState, callerRole);

        // History — newest 20
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<Map<String, Object>> history = transitionRepository
                .findByPageIdOrderByTimestampDesc(pageId, pageable)
                .getContent()
                .stream()
                .map(this::transitionToMap)
                .toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("currentState", currentState);
        body.put("availableTransitions", availableTransitions);
        body.put("history", history);

        return ResponseEntity.ok(ApiResponse.ok(body));
    }

    // -----------------------------------------------------------------
    // PATCH /api/admin/pages/{pageId}/workflow
    // Requirements: 9.2–9.10
    // -----------------------------------------------------------------

    /**
     * Performs a workflow transition.  All validation is delegated to
     * {@link PageWorkflowService} which throws:
     * <ul>
     *   <li>{@code InvalidStateTransitionException}  → HTTP 400 (handled globally)</li>
     *   <li>{@code InsufficientPermissionsException} → HTTP 403 (handled globally)</li>
     *   <li>{@code BadRequestException}              → HTTP 400 (blank rejection notes)</li>
     * </ul>
     *
     * Auth: minimum EDITOR (can submit DRAFT → REVIEW); service enforces the full matrix.
     */
    @PatchMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> performTransition(
            @PathVariable UUID pageId,
            @Valid @RequestBody PageWorkflowTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User caller = resolveUser(userDetails);

        WorkflowTransitionResult result = workflowService.transition(
                pageId,
                request.getToState().toUpperCase(),
                caller,
                request.getNotes());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("pageId", result.pageId());
        body.put("workflowStatus", result.toState());
        body.put("fromState", result.fromState());
        body.put("transitionedAt", result.timestamp());

        return ResponseEntity.ok(ApiResponse.ok("Workflow transition completed", body));
    }

    // -----------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------

    /** Load the caller's User entity from the JWT principal (username = UUID). */
    private User resolveUser(UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    /** Extract the role name from a User; returns empty string when absent. */
    private String callerRole(User user) {
        if (user.getRole() == null) return "";
        String name = user.getRole().getName();
        return name != null ? name : "";
    }

    /** Load a non-deleted Page or throw 404. */
    private Page resolvePage(UUID pageId) {
        return pageRepository.findById(pageId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));
    }

    /**
     * Returns the list of target states that {@code callerRole} can transition to
     * from {@code currentState}.
     */
    private List<String> computeAvailableTransitions(String currentState, String callerRole) {
        Map<String, Set<String>> targets = TRANSITIONS.get(currentState);
        if (targets == null) return List.of();

        List<String> available = new ArrayList<>();
        for (Map.Entry<String, Set<String>> entry : targets.entrySet()) {
            if (entry.getValue().contains(callerRole)) {
                available.add(entry.getKey());
            }
        }
        return available;
    }

    /** Converts a transition entity to a lightweight map for the history payload. */
    private Map<String, Object> transitionToMap(PageWorkflowTransition t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("fromState", t.getFromState());
        m.put("toState", t.getToState());
        m.put("userId", t.getUserId());
        m.put("timestamp", t.getTimestamp());
        if (t.getNotes() != null) {
            m.put("notes", t.getNotes());
        }
        return m;
    }
}
