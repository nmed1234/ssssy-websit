package org.ssssy.backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.PageResponse;
import org.ssssy.backend.model.dto.PageSectionResponse;
import org.ssssy.backend.service.PageService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PageControllerTest {

  @Mock
  private PageService pageService;

  @InjectMocks
  private PageController pageController;

  private final UUID pageId = UUID.randomUUID();

  private PageResponse createPageResponse() {
    return PageResponse.builder()
        .id(pageId)
        .titleAr("عنوان")
        .titleEn("Test Page")
        .slug("test-page")
        .layoutType("default")
        .isPublished(true)
        .isHomepage(false)
        .sortOrder(0)
        .authorName("Test User")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @Test
  void getPublishedPages_returnsList() {
    when(pageService.getPublishedPages()).thenReturn(List.of(createPageResponse()));

    ResponseEntity<ApiResponse<List<PageResponse>>> response = pageController.getPublishedPages();

    assertTrue(response.getBody().isSuccess());
    assertEquals("test-page", response.getBody().getData().get(0).getSlug());
    assertEquals("Test Page", response.getBody().getData().get(0).getTitleEn());
  }

  @Test
  void getPublishedPages_returnsEmptyList() {
    when(pageService.getPublishedPages()).thenReturn(List.of());

    ResponseEntity<ApiResponse<List<PageResponse>>> response = pageController.getPublishedPages();

    assertTrue(response.getBody().isSuccess());
    assertTrue(response.getBody().getData().isEmpty());
  }

  @Test
  void getPageById_returnsPage() {
    when(pageService.getPage(pageId)).thenReturn(createPageResponse());

    ResponseEntity<ApiResponse<PageResponse>> response = pageController.getPageById(pageId);

    assertTrue(response.getBody().isSuccess());
    assertEquals(pageId, response.getBody().getData().getId());
  }

  @Test
  void getPageBySlug_returnsPage() {
    when(pageService.getPageBySlug("test-page")).thenReturn(createPageResponse());

    ResponseEntity<ApiResponse<PageResponse>> response = pageController.getPageBySlug("test-page");

    assertTrue(response.getBody().isSuccess());
    assertEquals("test-page", response.getBody().getData().getSlug());
  }

  @Test
  void getHomepage_returnsHomepage() {
    PageResponse hp = createPageResponse();
    hp.setIsHomepage(true);
    when(pageService.getHomepage()).thenReturn(hp);

    ResponseEntity<ApiResponse<PageResponse>> response = pageController.getHomepage();

    assertTrue(response.getBody().isSuccess());
    assertTrue(response.getBody().getData().getIsHomepage());
  }

  @Test
  void getPageSections_returnsSections() {
    when(pageService.getPageBySlug("test-page")).thenReturn(createPageResponse());

    ResponseEntity<ApiResponse<List<PageSectionResponse>>> response = pageController.getPageSections("test-page");

    assertTrue(response.getBody().isSuccess());
  }
}
