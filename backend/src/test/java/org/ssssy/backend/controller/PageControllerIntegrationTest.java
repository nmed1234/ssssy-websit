package org.ssssy.backend.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.ssssy.backend.exception.GlobalExceptionHandler;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PageResponse;
import org.ssssy.backend.model.dto.PageSectionResponse;
import org.ssssy.backend.security.CustomUserDetailsService;
import org.ssssy.backend.security.JwtAuthenticationFilter;
import org.ssssy.backend.security.JwtTokenProvider;
import org.ssssy.backend.security.RateLimitFilter;
import org.ssssy.backend.service.PageService;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Backend integration test for GET /api/admin/pages/{id}.
 *
 * Validates: Requirements 4.3
 *
 * Verifies that the response shape matches PageResponse with:
 *   - layoutJson field present/absent as appropriate
 *   - sections array always present (empty or populated)
 *   - workflowStatus returned correctly
 *   - 404 for soft-deleted pages
 *   - 401/403 for unauthenticated requests
 */
@WebMvcTest(PageController.class)
@Import(GlobalExceptionHandler.class)
class PageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PageService pageService;

    // Security components need to be mocked so @WebMvcTest slice does not
    // attempt to wire JPA / Redis dependencies transitively.
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    private final UUID pageId = UUID.fromString("11111111-1111-1111-1111-111111111111");

    /**
     * Configure the mocked filters to pass requests through to the filter chain.
     * Without this, the mocked OncePerRequestFilter beans would be no-ops and
     * the request would never reach the dispatcher servlet.
     */
    @BeforeEach
    void configureFilterPassthrough() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest  req   = invocation.getArgument(0);
            HttpServletResponse resp  = invocation.getArgument(1);
            FilterChain         chain = invocation.getArgument(2);
            chain.doFilter(req, resp);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());

        doAnswer(invocation -> {
            HttpServletRequest  req   = invocation.getArgument(0);
            HttpServletResponse resp  = invocation.getArgument(1);
            FilterChain         chain = invocation.getArgument(2);
            chain.doFilter(req, resp);
            return null;
        }).when(rateLimitFilter).doFilter(any(), any(), any());
    }

    // ------------------------------------------------------------------
    // Test 1 — Happy path: response contains layoutJson and sections
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAdminPageById_happyPath_returnsLayoutJsonAndSections() throws Exception {
        String layoutJson = "{\"version\":\"1\",\"blocks\":[{\"id\":\"b1\",\"type\":\"about-hero-banner\","
                + "\"props\":{\"title\":\"Test\"},\"children\":[]}]}";

        List<PageSectionResponse> sections = List.of(
                PageSectionResponse.builder()
                        .id(UUID.randomUUID())
                        .componentType("hero-banner")
                        .sortOrder(0)
                        .build(),
                PageSectionResponse.builder()
                        .id(UUID.randomUUID())
                        .componentType("text-block")
                        .sortOrder(1)
                        .build()
        );

        PageResponse pageResponse = PageResponse.builder()
                .id(pageId)
                .titleEn("Test Page")
                .titleAr("صفحة تجريبية")
                .slug("test-page")
                .isPublished(true)
                .workflowStatus("DRAFT")
                .layoutJson(layoutJson)
                .sections(sections)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(pageService.getPageForAdmin(pageId)).thenReturn(pageResponse);

        mockMvc.perform(get("/api/admin/pages/{id}", pageId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.layoutJson").isNotEmpty())
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.sections", hasSize(2)))
                .andExpect(jsonPath("$.data.workflowStatus").value("DRAFT"));
    }

    // ------------------------------------------------------------------
    // Test 2 — Returns 404 for soft-deleted page
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAdminPageById_softDeletedPage_returns404() throws Exception {
        when(pageService.getPageForAdmin(pageId))
                .thenThrow(new ResourceNotFoundException("Page not found or has been deleted: " + pageId));

        mockMvc.perform(get("/api/admin/pages/{id}", pageId))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------
    // Test 3 — sections array is present even if empty
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAdminPageById_emptySections_returnsSectionsAsEmptyArray() throws Exception {
        PageResponse pageResponse = PageResponse.builder()
                .id(pageId)
                .titleEn("No Sections Page")
                .slug("no-sections")
                .isPublished(false)
                .workflowStatus("DRAFT")
                .layoutJson("{\"version\":\"1\",\"blocks\":[]}")
                .sections(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(pageService.getPageForAdmin(pageId)).thenReturn(pageResponse);

        mockMvc.perform(get("/api/admin/pages/{id}", pageId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.sections", hasSize(0)));
    }

    // ------------------------------------------------------------------
    // Test 4 — layoutJson is null when page has no layout yet (legacy page)
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAdminPageById_nullLayoutJson_returnsThreeSections() throws Exception {
        List<PageSectionResponse> legacySections = List.of(
                PageSectionResponse.builder().id(UUID.randomUUID()).componentType("legacy-1").sortOrder(0).build(),
                PageSectionResponse.builder().id(UUID.randomUUID()).componentType("legacy-2").sortOrder(1).build(),
                PageSectionResponse.builder().id(UUID.randomUUID()).componentType("legacy-3").sortOrder(2).build()
        );

        PageResponse pageResponse = PageResponse.builder()
                .id(pageId)
                .titleEn("Legacy Page")
                .slug("legacy-page")
                .isPublished(true)
                .workflowStatus("PUBLISHED")
                .layoutJson(null)
                .sections(legacySections)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(pageService.getPageForAdmin(pageId)).thenReturn(pageResponse);

        mockMvc.perform(get("/api/admin/pages/{id}", pageId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.sections", hasSize(3)))
                // layoutJson is null — Jackson omits null fields or serialises as JSON null;
                // either way the value must not be a non-null string
                .andExpect(jsonPath("$.data.layoutJson").doesNotExist());
    }

    // ------------------------------------------------------------------
    // Test 5 — Unauthenticated request returns 401 or 403
    // ------------------------------------------------------------------

    @Test
    void getAdminPageById_unauthenticated_returns401Or403() throws Exception {
        mockMvc.perform(get("/api/admin/pages/{id}", pageId))
                .andExpect(status().is(anyOf(is(401), is(403))));
    }
}
