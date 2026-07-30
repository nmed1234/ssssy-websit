package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.entity.CmsEventLog;
import org.ssssy.backend.repository.CmsEventLogRepository;

import java.util.Map;

/**
 * Phase 1 — CMS Event Bus: admin read-only API for the event audit log.
 *
 * GET /api/admin/event-log          — paginated list of all CMS events
 * GET /api/admin/event-log/types    — distinct event type names for filter dropdown
 */
@RestController
@RequestMapping("/api/admin/event-log")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
public class CmsEventLogController {

    private final CmsEventLogRepository eventLogRepository;

    /**
     * Return a paginated, newest-first list of CMS events.
     *
     * @param page      zero-based page index (default 0)
     * @param size      page size (default 50, max 200)
     * @param eventType optional filter by event type (e.g. CONTENT_PUBLISHED)
     */
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false)    String eventType) {

        // clamp size
        if (size > 200) size = 200;

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));

        Page<CmsEventLog> events;
        if (eventType != null && !eventType.isBlank()) {
            events = eventLogRepository.findByEventTypeOrderByOccurredAtDesc(eventType, pageable);
        } else {
            events = eventLogRepository.findAllByOrderByOccurredAtDesc(pageable);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", events
        ));
    }

    /**
     * Return a count summary per event type — useful for the dashboard cards.
     */
    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        // Quick counts for the most important event types — drives the UI dashboard
        java.time.LocalDateTime since24h = java.time.LocalDateTime.now().minusHours(24);
        Map<String, Long> counts = Map.of(
                "CONTENT_PUBLISHED",           eventLogRepository.countByEventTypeAndOccurredAtAfter("CONTENT_PUBLISHED", since24h),
                "CONTENT_CREATED",             eventLogRepository.countByEventTypeAndOccurredAtAfter("CONTENT_CREATED", since24h),
                "FORM_SUBMITTED",              eventLogRepository.countByEventTypeAndOccurredAtAfter("FORM_SUBMITTED", since24h),
                "USER_REGISTERED",             eventLogRepository.countByEventTypeAndOccurredAtAfter("USER_REGISTERED", since24h),
                "CONTENT_WORKFLOW_TRANSITION", eventLogRepository.countByEventTypeAndOccurredAtAfter("CONTENT_WORKFLOW_TRANSITION", since24h),
                "COMMENT_POSTED",              eventLogRepository.countByEventTypeAndOccurredAtAfter("COMMENT_POSTED", since24h),
                "MEDIA_UPLOADED",              eventLogRepository.countByEventTypeAndOccurredAtAfter("MEDIA_UPLOADED", since24h),
                "PLUGIN_INSTALLED",            eventLogRepository.countByEventTypeAndOccurredAtAfter("PLUGIN_INSTALLED", since24h)
        );
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("last24h", counts)));
    }
}
