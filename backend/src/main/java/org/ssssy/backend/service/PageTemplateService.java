package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.common.LayoutJsonValidator;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.CreatePageTemplateRequest;
import org.ssssy.backend.model.dto.PageTemplateDto;
import org.ssssy.backend.model.entity.PageTemplate;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageTemplateRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Business logic for page template management.
 *
 * Requirements: 20.1, 20.2, 20.3, 20.6
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PageTemplateService {

    private static final List<String> VALID_CATEGORIES =
            List.of("Layout", "Landing", "About", "Contact", "Blog");

    private final PageTemplateRepository pageTemplateRepository;
    private final UserRepository userRepository;
    private final LayoutJsonValidator layoutJsonValidator;

    // -------------------------------------------------------------------------
    // 15.1 — GET grouped by category
    // -------------------------------------------------------------------------

    /**
     * Returns all templates sorted by category then name, grouped into a
     * {@code Map<category, List<PageTemplateDto>>} for the frontend template grid.
     *
     * Requirements: 20.3
     */
    public Map<String, List<PageTemplateDto>> getTemplatesGroupedByCategory() {
        List<PageTemplate> all = pageTemplateRepository.findAllByOrderByCategoryAscNameAsc();

        // LinkedHashMap preserves insertion order so categories appear alphabetically.
        return all.stream()
                .collect(Collectors.groupingBy(
                        PageTemplate::getCategory,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));
    }

    // -------------------------------------------------------------------------
    // 15.2 — POST create template
    // -------------------------------------------------------------------------

    /**
     * Validates inputs and persists a new template row.
     *
     * @param request   creation payload already bean-validated by the controller
     * @param createdBy UUID of the authenticated admin user
     * @return the persisted template as a DTO
     * Requirements: 20.1, 20.2
     */
    @Transactional
    public PageTemplateDto createTemplate(CreatePageTemplateRequest request, UUID createdBy) {
        // Category enum guard (belt-and-suspenders on top of Bean Validation)
        if (!VALID_CATEGORIES.contains(request.getCategory())) {
            throw new BadRequestException(
                    "Invalid category '" + request.getCategory()
                    + "'. Must be one of: " + String.join(", ", VALID_CATEGORIES));
        }

        // Validate layoutJson structure
        LayoutJsonValidator.ValidationResult result =
                layoutJsonValidator.validate(request.getLayoutJson());
        if (!result.isValid()) {
            String errors = result.errors().stream()
                    .map(e -> e.path() + ": " + e.message())
                    .collect(Collectors.joining("; "));
            throw new BadRequestException("Invalid layoutJson: " + errors);
        }

        User creator = userRepository.findById(createdBy)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + createdBy));

        PageTemplate template = PageTemplate.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .layoutJson(request.getLayoutJson())
                .thumbnailUrl(request.getThumbnailUrl())
                .usageCount(0)
                .createdBy(creator)
                .build();

        template = pageTemplateRepository.save(template);
        log.info("Created page template '{}' (id={}) in category '{}' by user {}",
                template.getName(), template.getId(), template.getCategory(), createdBy);

        return toDto(template);
    }

    // -------------------------------------------------------------------------
    // 15.2 — DELETE template
    // -------------------------------------------------------------------------

    /**
     * Deletes a template by ID. Throws 404 if the template does not exist.
     *
     * Requirements: 20.1 (ADMIN only — enforced at controller level)
     */
    @Transactional
    public void deleteTemplate(UUID id) {
        if (!pageTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Page template not found: " + id);
        }
        pageTemplateRepository.deleteById(id);
        log.info("Deleted page template id={}", id);
    }

    // -------------------------------------------------------------------------
    // 20.6 — Increment usage count (called from PageService on page creation)
    // -------------------------------------------------------------------------

    /**
     * Atomically increments the {@code usage_count} for the template with the
     * given ID. Silently ignored if the template does not exist (the page was
     * already created successfully — do not roll back for a missing template).
     *
     * Requirements: 20.6
     */
    @Transactional
    public void incrementUsageCount(UUID templateId) {
        pageTemplateRepository.findById(templateId).ifPresentOrElse(
                template -> {
                    template.setUsageCount(template.getUsageCount() + 1);
                    pageTemplateRepository.save(template);
                    log.debug("Incremented usage_count for template id={} to {}",
                            templateId, template.getUsageCount());
                },
                () -> log.warn("incrementUsageCount: template id={} not found; skipping", templateId)
        );
    }

    // -------------------------------------------------------------------------
    // Mapping helper
    // -------------------------------------------------------------------------

    private PageTemplateDto toDto(PageTemplate t) {
        return PageTemplateDto.builder()
                .id(t.getId())
                .name(t.getName())
                .category(t.getCategory())
                .description(t.getDescription())
                .thumbnailUrl(t.getThumbnailUrl())
                .usageCount(t.getUsageCount())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
