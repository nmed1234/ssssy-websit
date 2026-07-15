package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.PageTemplate;

import java.util.List;
import java.util.UUID;

/**
 * Repository for reusable page layout templates.
 *
 * Requirements: 20.2, 20.3
 */
public interface PageTemplateRepository extends JpaRepository<PageTemplate, UUID> {

    /**
     * Returns templates for a given category (e.g. "Layout", "Landing").
     * Used to populate the template selection grid in CreatePageWizard Step 3.
     */
    List<PageTemplate> findByCategoryOrderByUsageCountDesc(String category);

    /**
     * Returns all templates sorted by category then name — backing the
     * GET /api/admin/page-templates endpoint that groups by category.
     */
    List<PageTemplate> findAllByOrderByCategoryAscNameAsc();
}
