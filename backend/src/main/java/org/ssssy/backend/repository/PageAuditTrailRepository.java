package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.PageAuditTrail;

import java.util.UUID;

/**
 * Repository for the append-only page audit trail.
 *
 * Requirements: 12.5
 */
public interface PageAuditTrailRepository extends JpaRepository<PageAuditTrail, UUID> {

    /**
     * Fetch paginated audit entries for a page, newest first.
     * Used by GET /api/admin/pages/{id}/audit-trail?page=0&size=20.
     */
    Page<PageAuditTrail> findByPageIdOrderByTimestampDesc(UUID pageId, Pageable pageable);
}
