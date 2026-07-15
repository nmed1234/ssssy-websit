package org.ssssy.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.PageAuditTrail;
import org.ssssy.backend.repository.PageAuditTrailRepository;

import java.util.Map;
import java.util.UUID;

/**
 * Append-only audit service for page mutations.
 * Records CREATE / UPDATE / DELETE / PUBLISH / UNPUBLISH / WORKFLOW_TRANSITION
 * actions into the page_audit_trail table.
 *
 * Requirements: 12.1, 12.2, 12.6, 12.7
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PageAuditService {

    private final PageAuditTrailRepository auditTrailRepository;
    private final ObjectMapper objectMapper;

    /**
     * Captures a single field's before/after values for the audit record.
     */
    public record FieldChange(Object before, Object after) {}

    /**
     * Records a page mutation into the audit trail.
     * Participates in the caller's existing transaction (REQUIRED propagation).
     *
     * @param pageId        the page being mutated
     * @param userId        the authenticated user performing the action
     * @param action        one of: CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, WORKFLOW_TRANSITION
     * @param changedFields map of field name → FieldChange(before, after); may be null or empty
     */
    @Transactional
    public void record(UUID pageId, UUID userId, String action, Map<String, FieldChange> changedFields) {
        String changedFieldsJson = serializeChangedFields(changedFields);

        PageAuditTrail entry = PageAuditTrail.builder()
                .pageId(pageId)
                .userId(userId)
                .action(action)
                .changedFields(changedFieldsJson)
                .build();

        auditTrailRepository.save(entry);
        log.debug("Audit recorded: action={}, pageId={}, userId={}", action, pageId, userId);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String serializeChangedFields(Map<String, FieldChange> changedFields) {
        if (changedFields == null || changedFields.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(changedFields);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize changedFields to JSON, storing empty object. Error: {}", e.getMessage());
            return "{}";
        }
    }
}
