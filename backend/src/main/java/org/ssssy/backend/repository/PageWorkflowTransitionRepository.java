package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.PageWorkflowTransition;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the page-specific workflow transition history.
 * Maps to the page_workflow_transitions table (distinct from the generic
 * workflow_transitions table used by the content workflow engine).
 *
 * Requirements: 9.3
 */
public interface PageWorkflowTransitionRepository extends JpaRepository<PageWorkflowTransition, UUID> {

    /**
     * Fetch paginated transition history for a page, newest first.
     * Used by GET /api/admin/pages/{id}/workflow to populate the history array.
     */
    Page<PageWorkflowTransition> findByPageIdOrderByTimestampDesc(UUID pageId, Pageable pageable);

    /**
     * Returns the most recent transition for a page — used to populate
     * lastTransitionBy / lastTransitionAt in page list responses.
     *
     * Requirements: 10.5
     */
    @Query("""
            SELECT t FROM PageWorkflowTransition t
            WHERE t.pageId = :pageId
            ORDER BY t.timestamp DESC
            LIMIT 1
            """)
    Optional<PageWorkflowTransition> findLatestByPageId(@Param("pageId") UUID pageId);
}
