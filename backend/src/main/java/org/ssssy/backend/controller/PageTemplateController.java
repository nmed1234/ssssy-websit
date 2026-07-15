package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.CreatePageTemplateRequest;
import org.ssssy.backend.model.dto.PageTemplateDto;
import org.ssssy.backend.service.PageTemplateService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for page template management.
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET  /api/admin/page-templates}       — list all templates grouped by category (EDITOR+)</li>
 *   <li>{@code POST /api/admin/page-templates}        — create a template (ADMIN only)</li>
 *   <li>{@code DELETE /api/admin/page-templates/{id}} — delete a template (ADMIN only)</li>
 * </ul>
 *
 * Requirements: 20.1, 20.2, 20.3, 20.6
 */
@RestController
@RequestMapping("/api/admin/page-templates")
@RequiredArgsConstructor
public class PageTemplateController {

    private final PageTemplateService pageTemplateService;

    // -------------------------------------------------------------------------
    // 15.1 — GET grouped by category
    // -------------------------------------------------------------------------

    /**
     * Returns all page templates grouped by {@code category}.
     *
     * <p>Response shape:
     * <pre>{@code
     * {
     *   "Layout":  [ { id, name, category, description, thumbnailUrl, usageCount, createdAt }, ... ],
     *   "Landing": [ ... ],
     *   ...
     * }
     * }</pre>
     *
     * Requirements: 20.3
     */
    @GetMapping
    @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, List<PageTemplateDto>>>> getTemplatesGroupedByCategory() {
        Map<String, List<PageTemplateDto>> grouped =
                pageTemplateService.getTemplatesGroupedByCategory();
        return ResponseEntity.ok(ApiResponse.ok(grouped));
    }

    // -------------------------------------------------------------------------
    // 15.2 — POST create template (ADMIN only)
    // -------------------------------------------------------------------------

    /**
     * Creates a new reusable page template.
     *
     * <p>Validates:
     * <ul>
     *   <li>{@code name}        — 1–100 characters (non-blank)</li>
     *   <li>{@code category}    — one of: Layout, Landing, About, Contact, Blog</li>
     *   <li>{@code description} — 0–500 characters</li>
     *   <li>{@code layoutJson}  — valid block tree via {@code LayoutJsonValidator}</li>
     * </ul>
     *
     * Returns HTTP 201 on success, HTTP 400 with an {@code errors} array when
     * layoutJson validation fails.
     *
     * Requirements: 20.1, 20.2
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageTemplateDto>> createTemplate(
            @Valid @RequestBody CreatePageTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        PageTemplateDto created = pageTemplateService.createTemplate(
                request,
                UUID.fromString(userDetails.getUsername()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Page template created successfully", created));
    }

    // -------------------------------------------------------------------------
    // 15.2 — DELETE template (ADMIN only)
    // -------------------------------------------------------------------------

    /**
     * Permanently deletes a page template by ID.
     *
     * <p>Returns HTTP 200 on success, HTTP 404 if the template does not exist.
     *
     * Requirements: 20.1
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteTemplate(@PathVariable UUID id) {
        pageTemplateService.deleteTemplate(id);
        return ResponseEntity.ok(
                ApiResponse.ok(Map.of("message", "Page template deleted successfully")));
    }
}
