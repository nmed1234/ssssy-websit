package org.ssssy.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.ssssy.backend.common.LayoutJsonValidator;
import org.ssssy.backend.repository.PageWorkflowTransitionRepository;
import org.ssssy.backend.repository.UrlRedirectRepository;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PageRequest;
import org.ssssy.backend.model.dto.PageResponse;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.Role;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.PageSectionRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PageServiceTest {

  @Mock
  private PageRepository pageRepository;

  @Mock
  private PageSectionRepository pageSectionRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private PageAuditService pageAuditService;

  @Mock
  private PageWorkflowTransitionRepository pageWorkflowTransitionRepository;

  @Mock
  private UrlRedirectRepository urlRedirectRepository;

  @Mock
  private LayoutJsonValidator layoutJsonValidator;

  @InjectMocks
  private PageService pageService;

  private UUID pageId = UUID.randomUUID();
  private UUID userId = UUID.randomUUID();

  private Page createTestPage() {
    Role role = Role.builder().id(UUID.randomUUID()).name("EDITOR").build();
    User user = User.builder().id(userId).username("editor").firstNameEn("Test").lastNameEn("User").role(role).build();
    return Page.builder()
        .id(pageId)
        .titleAr("عنوان")
        .titleEn("Title")
        .slug("test-page")
        .layoutType("default")
        .isPublished(true)
        .isHomepage(false)
        .sortOrder(0)
        .author(user)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @Test
  void getPublishedPages_returnsPublishedPages() {
    Page page = createTestPage();
    when(pageRepository.findByIsPublishedTrueAndDeletedAtIsNull(any(Sort.class)))
        .thenReturn(List.of(page));

    List<PageResponse> result = pageService.getPublishedPages();

    assertEquals(1, result.size());
    assertEquals("Title", result.get(0).getTitleEn());
    assertEquals("test-page", result.get(0).getSlug());
  }

  @Test
  void getPublishedPages_returnsEmptyList_whenNonePublished() {
    when(pageRepository.findByIsPublishedTrueAndDeletedAtIsNull(any(Sort.class)))
        .thenReturn(List.of());

    List<PageResponse> result = pageService.getPublishedPages();

    assertTrue(result.isEmpty());
  }

  @Test
  void getPageBySlug_returnsPage() {
    Page page = createTestPage();
    when(pageRepository.findBySlug("test-page")).thenReturn(Optional.of(page));

    PageResponse result = pageService.getPageBySlug("test-page");

    assertNotNull(result);
    assertEquals("Title", result.getTitleEn());
  }

  @Test
  void getPageBySlug_throws_whenNotFound() {
    when(pageRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> pageService.getPageBySlug("nonexistent"));
  }

  @Test
  void getPageById_returnsPage() {
    Page page = createTestPage();
    when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));

    PageResponse result = pageService.getPage(pageId);

    assertNotNull(result);
    assertEquals(pageId, result.getId());
  }

  @Test
  void getPageById_throws_whenNotFound() {
    when(pageRepository.findById(pageId)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> pageService.getPage(pageId));
  }

  @Test
  void getHomepage_returnsHomepage() {
    Page page = createTestPage();
    page.setIsHomepage(true);
    when(pageRepository.findByIsHomepageTrueAndDeletedAtIsNull()).thenReturn(Optional.of(page));

    PageResponse result = pageService.getHomepage();

    assertNotNull(result);
    assertTrue(result.getIsHomepage());
  }

  @Test
  void getHomepage_throws_whenNotFound() {
    when(pageRepository.findByIsHomepageTrueAndDeletedAtIsNull()).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> pageService.getHomepage());
  }

  @Test
  void getAllPages_returnsPagedResults() {
    Page page = createTestPage();
    org.springframework.data.domain.Page<Page> pagePage = new PageImpl<>(List.of(page));
    when(pageRepository.findAll(any(org.springframework.data.domain.PageRequest.class))).thenReturn(pagePage);

    org.springframework.data.domain.Page<PageResponse> result = pageService.getAllPages(org.springframework.data.domain.PageRequest.of(0, 10));

    assertEquals(1, result.getTotalElements());
  }

  @Test
  void createPage_createsAndReturnsPage() {
    Page page = createTestPage();
    when(userRepository.findById(userId)).thenReturn(Optional.of(page.getAuthor()));
    when(pageRepository.existsBySlugAndDeletedAtIsNull("test-page")).thenReturn(false);
    when(pageRepository.save(any(Page.class))).thenReturn(page);

    PageRequest request = new PageRequest();
    request.setTitleAr("عنوان");
    request.setTitleEn("Title");
    request.setSlug("test-page");
    request.setLayoutType("default");

    PageResponse result = pageService.createPage(request, userId);

    assertNotNull(result);
    assertEquals("Title", result.getTitleEn());
    verify(pageRepository).save(any(Page.class));
  }

  @Test
  void createPage_throws_whenSlugExists() {
    Role role = Role.builder().id(UUID.randomUUID()).name("EDITOR").build();
    User user = User.builder().id(userId).username("editor").firstNameEn("Test").lastNameEn("User").role(role).build();
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(pageRepository.existsBySlugAndDeletedAtIsNull("test-page")).thenReturn(true);

    PageRequest request = new PageRequest();
    request.setTitleAr("عنوان");
    request.setTitleEn("Title");
    request.setSlug("test-page");

    assertThrows(BadRequestException.class, () -> pageService.createPage(request, userId));
    verify(pageRepository, never()).save(any());
  }

  @Test
  void createPage_throws_whenUserNotFound() {

    PageRequest request = new PageRequest();
    request.setTitleAr("عنوان");
    request.setTitleEn("Title");
    request.setSlug("test-page");

    assertThrows(ResourceNotFoundException.class, () -> pageService.createPage(request, userId));
  }

  @Test
  void updatePage_updatesAndReturnsPage() {
    Page page = createTestPage();
    when(pageRepository.findByIdAndDeletedAtIsNull(pageId)).thenReturn(Optional.of(page));
    when(pageRepository.existsBySlugAndIdNotAndDeletedAtIsNull("new-slug", pageId)).thenReturn(false);
    when(pageRepository.save(any(Page.class))).thenReturn(page);

    PageRequest request = new PageRequest();
    request.setTitleAr("عنوان جديد");
    request.setTitleEn("New Title");
    request.setSlug("new-slug");
    request.setIsPublished(true);

    PageResponse result = pageService.updatePage(pageId, request, userId);

    assertNotNull(result);
    verify(pageRepository).save(page);
  }

  @Test
  void updatePage_throws_whenNotFound() {
    when(pageRepository.findByIdAndDeletedAtIsNull(pageId)).thenReturn(Optional.empty());

    PageRequest request = new PageRequest();
    request.setTitleAr("عنوان");
    request.setTitleEn("Title");
    request.setSlug("slug");

    assertThrows(ResourceNotFoundException.class, () -> pageService.updatePage(pageId, request, userId));
  }

  @Test
  void deletePage_softDeletes() {
    Page page = createTestPage();
    when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
    when(pageRepository.save(any(Page.class))).thenReturn(page);

    pageService.deletePage(pageId, userId);

    assertNotNull(page.getDeletedAt());
    verify(pageRepository).save(page);
  }

  @Test
  void deletePage_throws_whenNotFound() {
    when(pageRepository.findById(pageId)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> pageService.deletePage(pageId, userId));
  }
}
