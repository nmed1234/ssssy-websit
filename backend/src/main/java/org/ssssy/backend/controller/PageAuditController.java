package org.ssssy.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PageAuditRecord;
import org.ssssy.backend.model.entity.PageAuditTrail;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageAuditTrailRepository;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Exposes the audit trail for a given page.
 *
 * Endpoint: GET /api/admin/pages/{id}/audit-trail?page=0&size=20
 *
 * Returns paginated {@link PageAuditRecord} list sorted by timestamp DESC.
 * Each record includes userDisplayName and userAvatarUrl, resolved by
 * joining the users table in-memory after the paginated query.
 *
 * Requirements: 12.3, 12.5
 */
@RestController
@RequestMapping("/api/admin/pages")
@RequiredArgsConstructor
@Slf4j
public class PageAuditController {

    private final PageAuditTrailRepository auditTrailRepository;
    private final PageRepository pageRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * GET /api/admin/pages/{id}/audit-trail?page=0&size=20
     *
     * Returns paginated audit records for the given page, sorted by timestamp
     * descending. Requires EDITOR, PUBLISHER, or ADMIN role.
     *
     * @param id       the page UUID
     * @param pageable pagination parameters; defaults to page=0, size=20, sort=timestamp DESC
     * @return HTTP 200 with {@link Page} of {@link PageAuditRecord}, or HTTP 404 if
     *         the page does not exist or has been soft-deleted
     *
     * Requirements: 12.3, 12.5
     */
    @GetMapping("/{id}/audit-trail")
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<PageAuditRecord>>> getAuditTrail(
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {

        // Return 404 if the page doesn't exist or has been soft-deleted
        if (!pageRepository.findByIdAndDeletedAtIsNull(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Fetch the paginated audit records — already ordered by timestamp DESC
        // because the repository method name enforces that ordering and Pageable
        // just adds the LIMIT/OFFSET.
        Page<PageAuditTrail> auditPage =
                auditTrailRepository.findByPageIdOrderByTimestampDesc(id, pageable);

        // Collect distinct user IDs referenced in this page of results
        List<UUID> userIds = auditPage.getContent().stream()
                .map(PageAuditTrail::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // Bulk-load users to avoid N+1 queries; build a lookup map
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Map each audit trail row to the response DTO
        List<PageAuditRecord> records = auditPage.getContent().stream()
                .map(trail -> toRecord(trail, userMap))
                .collect(Collectors.toList());

        Page<PageAuditRecord> resultPage =
                new PageImpl<>(records, auditPage.getPageable(), auditPage.getTotalElements());

        return ResponseEntity.ok(ApiResponse.ok(resultPage));
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Converts a {@link PageAuditTrail} entity to a {@link PageAuditRecord} DTO,
     * enriching it with user display information from the supplied map.
     */
    private PageAuditRecord toRecord(PageAuditTrail trail, Map<UUID, User> userMap) {
        User user = userMap.get(trail.getUserId());

        String displayName = resolveDisplayName(user);
        String avatarUrl   = user != null ? user.getAvatarUrl() : null;

        JsonNode changedFieldsNode = parseChangedFields(trail.getChangedFields());

        return PageAuditRecord.builder()
                .id(trail.getId())
                .action(trail.getAction())
                .userId(trail.getUserId())
                .userDisplayName(displayName)
                .userAvatarUrl(avatarUrl)
                .timestamp(trail.getTimestamp())
                .changedFields(changedFieldsNode)
                .build();
    }

    /**
     * Builds a human-readable display name from a {@link User}.
     * Priority: "FirstNameEn LastNameEn" → username → "Unknown User".
     */
    private String resolveDisplayName(User user) {
        if (user == null) {
            return "Unknown User";
        }
        String firstName = user.getFirstNameEn();
        String lastName  = user.getLastNameEn();
        if ((firstName != null && !firstName.isBlank()) ||
            (lastName  != null && !lastName.isBlank())) {
            return ((firstName != null ? firstName.trim() : "") + " " +
                    (lastName  != null ? lastName.trim()  : "")).trim();
        }
        return user.getUsername();
    }

    /**
     * Deserialises the JSONB string stored in {@link PageAuditTrail#getChangedFields()}
     * into a {@link JsonNode}. Returns an empty object node on parse failure.
     */
    private JsonNode parseChangedFields(String changedFieldsJson) {
        if (changedFieldsJson == null || changedFieldsJson.isBlank()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(changedFieldsJson);
        } catch (Exception e) {
            log.warn("Failed to parse changedFields JSON: {}", e.getMessage());
            return objectMapper.createObjectNode();
        }
    }
}
