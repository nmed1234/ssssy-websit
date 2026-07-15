package org.ssssy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.common.LayoutJsonValidator;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.SlugConflictException;
import org.ssssy.backend.model.dto.PageRequest;
import org.ssssy.backend.model.dto.PageResponse;
import org.ssssy.backend.model.dto.PageSectionRequest;
import org.ssssy.backend.model.dto.PageSectionResponse;
import org.ssssy.backend.model.dto.SlugCheckResponse;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.PageSection;
import org.ssssy.backend.model.entity.UrlRedirect;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.PageSectionRepository;
import org.ssssy.backend.repository.PageWorkflowTransitionRepository;
import org.ssssy.backend.repository.UrlRedirectRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {

  private final PageRepository pageRepository;
  private final PageSectionRepository pageSectionRepository;
  private final UserRepository userRepository;
  private final PageAuditService pageAuditService;
  private final PageWorkflowTransitionRepository pageWorkflowTransitionRepository;
  private final UrlRedirectRepository urlRedirectRepository;
  private final LayoutJsonValidator layoutJsonValidator;

  // ---------------------------------------------------------------------------
  // Public read endpoints
  // ---------------------------------------------------------------------------

  public List<PageResponse> getPublishedPages() {
    return pageRepository.findByIsPublishedTrueAndDeletedAtIsNull(Sort.by(Sort.Direction.ASC, "sortOrder"))
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public PageResponse getPageBySlug(String slug) {
    Page page = pageRepository.findBySlug(slug)
        .filter(p -> p.getIsPublished() && p.getDeletedAt() == null)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + slug));
    return toResponse(page);
  }

  public PageResponse getPage(UUID id) {
    Page page = pageRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));
    return toResponse(page);
  }

  public PageResponse getHomepage() {
    Page page = pageRepository.findByIsHomepageTrueAndDeletedAtIsNull()
        .filter(Page::getIsPublished)
        .orElseThrow(() -> new ResourceNotFoundException("Homepage not found"));
    return toResponse(page);
  }

  /** Legacy paginated admin list — kept for backward compat. */
  public org.springframework.data.domain.Page<PageResponse> getAllPages(Pageable pageable) {
    return pageRepository.findAll(pageable).map(this::toResponse);
  }

  public List<PageResponse> getAllPagesList() {
    return pageRepository.findAll().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  // ---------------------------------------------------------------------------
  // 10.2 — Admin page list with workflow filter
  // ---------------------------------------------------------------------------

  /**
   * Returns paginated pages for the admin list, excluding soft-deleted rows.
   * Optionally filters by workflowStatus. Enriches each item with
   * lastTransitionBy / lastTransitionAt from the workflow history.
   *
   * Requirements: 10.5, 10.6, 10.7
   */
  public org.springframework.data.domain.Page<PageResponse> getAllPagesForAdmin(
      String workflowStatus, Pageable pageable) {

    org.springframework.data.domain.Page<Page> pages =
        (workflowStatus != null && !workflowStatus.isBlank())
            ? pageRepository.findByWorkflowStatusAndDeletedAtIsNull(workflowStatus, pageable)
            : pageRepository.findByDeletedAtIsNull(pageable);

    return pages.map(this::toResponseWithTransition);
  }

  // ---------------------------------------------------------------------------
  // 10.3 — Admin single page (includes sections)
  // ---------------------------------------------------------------------------

  /**
   * Returns a single page for the admin editor. Throws 404 if soft-deleted.
   * Includes the sections array and all CMS fields.
   *
   * Requirements: 4.3
   */
  public PageResponse getPageForAdmin(UUID id) {
    Page page = pageRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found or has been deleted: " + id));
    PageResponse response = toResponseWithTransition(page);
    response.setSections(getSections(id));
    response.setLayoutJson(page.getLayoutJson());
    return response;
  }


  // ---------------------------------------------------------------------------
  // 10.1 — Create page
  // ---------------------------------------------------------------------------

  @Transactional
  public PageResponse createPage(PageRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Validate layoutJson if provided
    if (request.getLayoutJson() != null && !request.getLayoutJson().isBlank()) {
      validateLayoutJson(request.getLayoutJson());
    }

    if (pageRepository.existsBySlugAndDeletedAtIsNull(request.getSlug())) {
      throw new BadRequestException("Slug already in use");
    }
    Page parent = resolveParent(request.getParentId());

    Page page = Page.builder()
        .titleAr(request.getTitleAr())
        .titleEn(request.getTitleEn())
        .slug(request.getSlug())
        .layoutType(request.getLayoutType())
        .isPublished(false) // always DRAFT on create
        .isHomepage(request.getIsHomepage() != null && request.getIsHomepage())
        .parent(parent)
        .sortOrder(request.getSortOrder())
        .author(user)
        .createdBy(user)
        .workflowStatus("DRAFT")
        .visibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC")
        .allowedRoles(request.getAllowedRoles())
        .language(request.getLanguage() != null ? request.getLanguage() : "EN")
        .translationGroupId(request.getTranslationGroupId())
        .layoutJson(request.getLayoutJson())
        .metaTitle(request.getMetaTitle())
        .metaDescription(request.getMetaDescription())
        .ogTitle(request.getOgTitle())
        .ogDescription(request.getOgDescription())
        .ogImageUrl(request.getOgImageUrl())
        .build();
    page = pageRepository.save(page);

    Map<String, PageAuditService.FieldChange> changedFields = new HashMap<>();
    changedFields.put("titleAr",         new PageAuditService.FieldChange(null, page.getTitleAr()));
    changedFields.put("titleEn",         new PageAuditService.FieldChange(null, page.getTitleEn()));
    changedFields.put("slug",            new PageAuditService.FieldChange(null, page.getSlug()));
    changedFields.put("workflowStatus",  new PageAuditService.FieldChange(null, page.getWorkflowStatus()));
    changedFields.put("isPublished",     new PageAuditService.FieldChange(null, page.getIsPublished()));
    pageAuditService.record(page.getId(), userId, "CREATE", changedFields);

    return toResponse(page);
  }

  // ---------------------------------------------------------------------------
  // 10.4 — Update page
  // ---------------------------------------------------------------------------

  @Transactional
  public PageResponse updatePage(UUID id, PageRequest request, UUID userId) {
    Page page = pageRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));

    // Validate layoutJson if provided
    if (request.getLayoutJson() != null && !request.getLayoutJson().isBlank()) {
      validateLayoutJson(request.getLayoutJson());
    }

    // Slug uniqueness check across non-deleted pages
    if (request.getSlug() != null
        && !request.getSlug().equals(page.getSlug())
        && pageRepository.existsBySlugAndIdNotAndDeletedAtIsNull(request.getSlug(), id)) {
      throw new SlugConflictException(request.getSlug());
    }

    Page parent = resolveParent(request.getParentId());

    Map<String, PageAuditService.FieldChange> changedFields = new HashMap<>();
    Boolean wasPublished = page.getIsPublished();
    String oldSlug = page.getSlug();

    if (request.getTitleAr() != null && !request.getTitleAr().equals(page.getTitleAr())) {
      changedFields.put("titleAr", new PageAuditService.FieldChange(page.getTitleAr(), request.getTitleAr()));
      page.setTitleAr(request.getTitleAr());
    }
    if (request.getTitleEn() != null && !request.getTitleEn().equals(page.getTitleEn())) {
      changedFields.put("titleEn", new PageAuditService.FieldChange(page.getTitleEn(), request.getTitleEn()));
      page.setTitleEn(request.getTitleEn());
    }
    if (request.getSlug() != null && !request.getSlug().equals(page.getSlug())) {
      changedFields.put("slug", new PageAuditService.FieldChange(page.getSlug(), request.getSlug()));
      page.setSlug(request.getSlug());
    }
    if (request.getLayoutType() != null && !request.getLayoutType().equals(page.getLayoutType())) {
      changedFields.put("layoutType", new PageAuditService.FieldChange(page.getLayoutType(), request.getLayoutType()));
      page.setLayoutType(request.getLayoutType());
    }
    if (request.getIsPublished() != null && !request.getIsPublished().equals(page.getIsPublished())) {
      changedFields.put("isPublished", new PageAuditService.FieldChange(page.getIsPublished(), request.getIsPublished()));
      page.setIsPublished(request.getIsPublished());
    }
    if (request.getIsHomepage() != null && !request.getIsHomepage().equals(page.getIsHomepage())) {
      changedFields.put("isHomepage", new PageAuditService.FieldChange(page.getIsHomepage(), request.getIsHomepage()));
      page.setIsHomepage(request.getIsHomepage());
    }
    if (parent != null) page.setParent(parent);
    if (request.getSortOrder() != null && !request.getSortOrder().equals(page.getSortOrder())) {
      changedFields.put("sortOrder", new PageAuditService.FieldChange(page.getSortOrder(), request.getSortOrder()));
      page.setSortOrder(request.getSortOrder());
    }
    if (request.getMetaTitle() != null && !request.getMetaTitle().equals(page.getMetaTitle())) {
      changedFields.put("metaTitle", new PageAuditService.FieldChange(page.getMetaTitle(), request.getMetaTitle()));
      page.setMetaTitle(request.getMetaTitle());
    }
    if (request.getMetaDescription() != null && !request.getMetaDescription().equals(page.getMetaDescription())) {
      changedFields.put("metaDescription", new PageAuditService.FieldChange(page.getMetaDescription(), request.getMetaDescription()));
      page.setMetaDescription(request.getMetaDescription());
    }
    if (request.getOgTitle() != null && !request.getOgTitle().equals(page.getOgTitle())) {
      changedFields.put("ogTitle", new PageAuditService.FieldChange(page.getOgTitle(), request.getOgTitle()));
      page.setOgTitle(request.getOgTitle());
    }
    if (request.getOgDescription() != null && !request.getOgDescription().equals(page.getOgDescription())) {
      changedFields.put("ogDescription", new PageAuditService.FieldChange(page.getOgDescription(), request.getOgDescription()));
      page.setOgDescription(request.getOgDescription());
    }
    if (request.getOgImageUrl() != null && !request.getOgImageUrl().equals(page.getOgImageUrl())) {
      changedFields.put("ogImageUrl", new PageAuditService.FieldChange(page.getOgImageUrl(), request.getOgImageUrl()));
      page.setOgImageUrl(request.getOgImageUrl());
    }
    // CMS fields
    if (request.getVisibility() != null && !request.getVisibility().equals(page.getVisibility())) {
      changedFields.put("visibility", new PageAuditService.FieldChange(page.getVisibility(), request.getVisibility()));
      page.setVisibility(request.getVisibility());
    }
    if (request.getLanguage() != null && !request.getLanguage().equals(page.getLanguage())) {
      changedFields.put("language", new PageAuditService.FieldChange(page.getLanguage(), request.getLanguage()));
      page.setLanguage(request.getLanguage());
    }
    if (request.getAllowedRoles() != null) {
      changedFields.put("allowedRoles", new PageAuditService.FieldChange(page.getAllowedRoles(), request.getAllowedRoles()));
      page.setAllowedRoles(request.getAllowedRoles());
    }
    if (request.getTranslationGroupId() != null) {
      changedFields.put("translationGroupId", new PageAuditService.FieldChange(page.getTranslationGroupId(), request.getTranslationGroupId()));
      page.setTranslationGroupId(request.getTranslationGroupId());
    }
    if (request.getLayoutJson() != null && !request.getLayoutJson().isBlank()) {
      changedFields.put("layoutJson", new PageAuditService.FieldChange("<previous>", "<updated>"));
      page.setLayoutJson(request.getLayoutJson());
    }

    // When slug changes on a published page, insert a 301 redirect
    String newSlug = page.getSlug();
    if (!oldSlug.equals(newSlug) && Boolean.TRUE.equals(wasPublished)) {
      UrlRedirect redirect = UrlRedirect.builder()
          .fromPath("/" + oldSlug)
          .toPath("/" + newSlug)
          .redirectType(301)
          .pageId(page.getId())
          .build();
      urlRedirectRepository.save(redirect);
    }

    page = pageRepository.save(page);

    if (!changedFields.isEmpty()) {
      pageAuditService.record(page.getId(), userId, "UPDATE", changedFields);
    }

    Boolean nowPublished = page.getIsPublished();
    if (!Boolean.TRUE.equals(wasPublished) && Boolean.TRUE.equals(nowPublished)) {
      pageAuditService.record(page.getId(), userId, "PUBLISH",
          Map.of("isPublished", new PageAuditService.FieldChange(false, true)));
    } else if (Boolean.TRUE.equals(wasPublished) && !Boolean.TRUE.equals(nowPublished)) {
      pageAuditService.record(page.getId(), userId, "UNPUBLISH",
          Map.of("isPublished", new PageAuditService.FieldChange(true, false)));
    }

    return toResponse(page);
  }


  // ---------------------------------------------------------------------------
  // 10.5 — Soft delete / restore
  // ---------------------------------------------------------------------------

  @Transactional
  public void softDeletePage(UUID id, UUID userId) {
    Page page = pageRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));
    if (page.getDeletedAt() != null) {
      throw new ResourceNotFoundException("Page already deleted");
    }
    LocalDateTime now = LocalDateTime.now();
    page.setDeletedAt(now);
    page.setIsPublished(false);
    pageRepository.save(page);

    pageAuditService.record(id, userId, "DELETE",
        Map.of("deletedAt", new PageAuditService.FieldChange(null, now.toString())));
  }

  @Transactional
  public PageResponse restorePage(UUID id, UUID userId) {
    Page page = pageRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));
    if (page.getDeletedAt() == null) {
      throw new BadRequestException("Page is not deleted");
    }
    if (page.getDeletedAt().isBefore(LocalDateTime.now().minusDays(30))) {
      throw new BadRequestException("Cannot restore page deleted more than 30 days ago");
    }
    LocalDateTime oldDeletedAt = page.getDeletedAt();
    page.setDeletedAt(null);
    page = pageRepository.save(page);

    pageAuditService.record(id, userId, "UPDATE",
        Map.of("deletedAt", new PageAuditService.FieldChange(oldDeletedAt.toString(), null)));

    return toResponse(page);
  }

  // ---------------------------------------------------------------------------
  // Legacy hard-delete kept for backward compat (used internally if needed)
  // ---------------------------------------------------------------------------

  @Transactional
  public void deletePage(UUID id, UUID userId) {
    softDeletePage(id, userId);
  }

  // ---------------------------------------------------------------------------
  // 10.6 — Duplicate page
  // ---------------------------------------------------------------------------

  @Transactional
  public PageResponse duplicatePage(UUID id, String newTitle, String newSlug, UUID userId) {
    Page source = pageRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));

    // Validate new slug uniqueness
    if (newSlug != null && pageRepository.existsBySlugAndDeletedAtIsNull(newSlug)) {
      throw new SlugConflictException(newSlug);
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String finalTitle = (newTitle != null && !newTitle.isBlank())
        ? newTitle
        : (source.getTitleEn() != null ? source.getTitleEn() + " (Copy)" : "Copy");

    String finalSlug = (newSlug != null && !newSlug.isBlank())
        ? newSlug
        : generateUniqueSlug(source.getSlug() + "-copy");

    String duplicatedLayoutJson = regenerateBlockIds(source.getLayoutJson());

    Page copy = Page.builder()
        .titleEn(finalTitle)
        .titleAr(source.getTitleAr())
        .slug(finalSlug)
        .layoutType(source.getLayoutType())
        .isPublished(false)
        .isHomepage(false)
        .author(user)
        .createdBy(user)
        .workflowStatus("DRAFT")
        .visibility(source.getVisibility())
        .allowedRoles(source.getAllowedRoles())
        .language(source.getLanguage())
        .layoutJson(duplicatedLayoutJson)
        .metaTitle(source.getMetaTitle())
        .metaDescription(source.getMetaDescription())
        .ogTitle(source.getOgTitle())
        .ogDescription(source.getOgDescription())
        .ogImageUrl(source.getOgImageUrl())
        .sortOrder(source.getSortOrder())
        .parent(source.getParent())
        .build();
    copy = pageRepository.save(copy);

    Map<String, PageAuditService.FieldChange> changedFields = new HashMap<>();
    changedFields.put("titleEn",        new PageAuditService.FieldChange(null, copy.getTitleEn()));
    changedFields.put("slug",           new PageAuditService.FieldChange(null, copy.getSlug()));
    changedFields.put("workflowStatus", new PageAuditService.FieldChange(null, copy.getWorkflowStatus()));
    changedFields.put("duplicatedFrom", new PageAuditService.FieldChange(null, id.toString()));
    pageAuditService.record(copy.getId(), userId, "CREATE", changedFields);

    return toResponse(copy);
  }

  // ---------------------------------------------------------------------------
  // 10.7 — Check slug availability
  // ---------------------------------------------------------------------------

  public SlugCheckResponse checkSlug(String slug, UUID excludeId) {
    boolean taken = (excludeId != null)
        ? pageRepository.existsBySlugAndIdNotAndDeletedAtIsNull(slug, excludeId)
        : pageRepository.existsBySlugAndDeletedAtIsNull(slug);

    if (!taken) {
      return new SlugCheckResponse(true, slug);
    }

    // Find suggestion: slug-2, slug-3, ...
    String suggestion = slug;
    for (int i = 2; i <= 100; i++) {
      String candidate = slug + "-" + i;
      boolean candidateTaken = (excludeId != null)
          ? pageRepository.existsBySlugAndIdNotAndDeletedAtIsNull(candidate, excludeId)
          : pageRepository.existsBySlugAndDeletedAtIsNull(candidate);
      if (!candidateTaken) {
        suggestion = candidate;
        break;
      }
    }
    return new SlugCheckResponse(false, suggestion);
  }


  // ---------------------------------------------------------------------------
  // Sections
  // ---------------------------------------------------------------------------

  public List<PageSectionResponse> getSections(UUID pageId) {
    return pageSectionRepository.findByPageIdOrderBySortOrderAsc(pageId)
        .stream()
        .map(this::toSectionResponse)
        .collect(Collectors.toList());
  }

  /**
   * 10.8 — Sections with optional flat merge.
   * When flat=true, merges data + config + styling into a single props JSON field.
   *
   * Requirements: 4.1, 4.2
   */
  public List<PageSectionResponse> getSectionsFlatMerged(UUID pageId, boolean flat) {
    return pageSectionRepository.findByPageIdOrderBySortOrderAsc(pageId)
        .stream()
        .map(section -> {
          PageSectionResponse r = toSectionResponse(section);
          if (flat) {
            r.setProps(mergeProps(section.getData(), section.getConfig(), section.getStyling()));
          }
          return r;
        })
        .collect(Collectors.toList());
  }

  /**
   * 10.9 — Return layout JSON for a page; throws 404 if not found or soft-deleted.
   *
   * Requirements: 25.1, 25.2, 25.4
   */
  public String getLayoutJson(UUID id) {
    Page page = pageRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + id));
    String json = page.getLayoutJson();
    return (json != null && !json.isBlank()) ? json : "{}";
  }

  @Transactional
  public PageSectionResponse saveSection(UUID pageId, PageSectionRequest request) {
    Page page = pageRepository.findById(pageId)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));
    PageSection section = PageSection.builder()
        .page(page)
        .componentType(request.getComponentType())
        .config(request.getConfig())
        .data(request.getData())
        .styling(request.getStyling())
        .sortOrder(request.getSortOrder())
        .visibility(request.getVisibility() != null ? request.getVisibility() : "ALWAYS")
        .isAnimated(request.getIsAnimated() != null && request.getIsAnimated())
        .animationType(request.getAnimationType())
        .eventsJson(request.getEventsJson() != null ? request.getEventsJson() : "{}")
        .conditionsJson(request.getConditionsJson() != null ? request.getConditionsJson() : "{}")
        .build();
    section = pageSectionRepository.save(section);
    return toSectionResponse(section);
  }

  @Transactional
  public PageSectionResponse updateSection(UUID sectionId, PageSectionRequest request) {
    PageSection section = pageSectionRepository.findById(sectionId)
        .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));
    if (request.getComponentType() != null) section.setComponentType(request.getComponentType());
    if (request.getConfig() != null) section.setConfig(request.getConfig());
    if (request.getData() != null) section.setData(request.getData());
    if (request.getStyling() != null) section.setStyling(request.getStyling());
    if (request.getSortOrder() != null) section.setSortOrder(request.getSortOrder());
    if (request.getVisibility() != null) section.setVisibility(request.getVisibility());
    if (request.getIsAnimated() != null) section.setIsAnimated(request.getIsAnimated());
    if (request.getAnimationType() != null) section.setAnimationType(request.getAnimationType());
    if (request.getEventsJson() != null) section.setEventsJson(request.getEventsJson());
    if (request.getConditionsJson() != null) section.setConditionsJson(request.getConditionsJson());
    section.setVersion(section.getVersion() != null ? section.getVersion() + 1 : 1);
    section = pageSectionRepository.save(section);
    return toSectionResponse(section);
  }

  @Transactional
  public void deleteSection(UUID sectionId) {
    if (!pageSectionRepository.existsById(sectionId)) {
      throw new ResourceNotFoundException("Section not found: " + sectionId);
    }
    pageSectionRepository.deleteById(sectionId);
  }

  @Transactional
  public void reorderSections(UUID pageId, List<UUID> sectionIds) {
    List<PageSection> sections = pageSectionRepository.findByPageIdOrderBySortOrderAsc(pageId);
    for (int i = 0; i < sectionIds.size(); i++) {
      final int order = i;
      UUID sectionId = sectionIds.get(i);
      sections.stream()
          .filter(s -> s.getId().equals(sectionId))
          .findFirst()
          .ifPresent(s -> s.setSortOrder(order));
    }
    pageSectionRepository.saveAll(sections);
  }


  // ---------------------------------------------------------------------------
  // Response mapping
  // ---------------------------------------------------------------------------

  /** Base response — CMS fields included, but NOT sections or lastTransition fields. */
  private PageResponse toResponse(Page page) {
    return PageResponse.builder()
        .id(page.getId())
        .titleAr(page.getTitleAr())
        .titleEn(page.getTitleEn())
        .slug(page.getSlug())
        .layoutType(page.getLayoutType())
        .isPublished(page.getIsPublished())
        .isHomepage(page.getIsHomepage())
        .parentId(page.getParent() != null ? page.getParent().getId() : null)
        .sortOrder(page.getSortOrder())
        .authorName(page.getAuthor() != null
            ? page.getAuthor().getFirstNameEn() + " " + page.getAuthor().getLastNameEn() : null)
        .createdAt(page.getCreatedAt())
        .updatedAt(page.getUpdatedAt())
        .deletedAt(page.getDeletedAt())
        .metaTitle(page.getMetaTitle())
        .metaDescription(page.getMetaDescription())
        .ogTitle(page.getOgTitle())
        .ogDescription(page.getOgDescription())
        .ogImageUrl(page.getOgImageUrl())
        .layoutJson(page.getLayoutJson())
        .workflowStatus(page.getWorkflowStatus())
        .allowedRoles(page.getAllowedRoles())
        .visibility(page.getVisibility())
        .language(page.getLanguage())
        .translationGroupId(page.getTranslationGroupId() != null ? page.getTranslationGroupId().toString() : null)
        .build();
  }

  /**
   * Extended response that also fills lastTransitionBy / lastTransitionAt
   * from the workflow transition history.
   */
  private PageResponse toResponseWithTransition(Page page) {
    PageResponse response = toResponse(page);
    pageWorkflowTransitionRepository.findLatestByPageId(page.getId()).ifPresent(t -> {
      response.setLastTransitionAt(t.getTimestamp());
      userRepository.findById(t.getUserId()).ifPresent(u ->
          response.setLastTransitionBy(u.getFirstNameEn() + " " + u.getLastNameEn()));
    });
    return response;
  }

  private PageSectionResponse toSectionResponse(PageSection section) {
    return PageSectionResponse.builder()
        .id(section.getId())
        .pageId(section.getPage().getId())
        .componentType(section.getComponentType())
        .config(section.getConfig())
        .data(section.getData())
        .styling(section.getStyling())
        .eventsJson(section.getEventsJson())
        .conditionsJson(section.getConditionsJson())
        .version(section.getVersion())
        .sortOrder(section.getSortOrder())
        .visibility(section.getVisibility())
        .isAnimated(section.getIsAnimated())
        .animationType(section.getAnimationType())
        .createdAt(section.getCreatedAt())
        .updatedAt(section.getUpdatedAt())
        .build();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private void validateLayoutJson(String layoutJson) {
    LayoutJsonValidator.ValidationResult result = layoutJsonValidator.validate(layoutJson);
    if (!result.isValid()) {
      String firstError = result.errors().get(0).message();
      throw new BadRequestException("Invalid layoutJson: " + firstError);
    }
  }

  private Page resolveParent(UUID parentId) {
    if (parentId == null) return null;
    return pageRepository.findById(parentId)
        .orElseThrow(() -> new ResourceNotFoundException("Parent page not found"));
  }

  private String generateUniqueSlug(String base) {
    if (!pageRepository.existsBySlugAndDeletedAtIsNull(base)) return base;
    for (int i = 2; i <= 100; i++) {
      String candidate = base + "-" + i;
      if (!pageRepository.existsBySlugAndDeletedAtIsNull(candidate)) return candidate;
    }
    return base + "-" + UUID.randomUUID().toString().substring(0, 8);
  }

  /**
   * Recursively regenerates all block "id" fields in a layoutJson string.
   * Uses Jackson to parse/modify/serialize without losing unknown fields.
   */
  private String regenerateBlockIds(String layoutJson) {
    if (layoutJson == null || layoutJson.isBlank()) return layoutJson;
    try {
      ObjectMapper mapper = new ObjectMapper();
      JsonNode root = mapper.readTree(layoutJson);
      regenerateBlockIdsInNode(root);
      return mapper.writeValueAsString(root);
    } catch (Exception e) {
      return layoutJson; // fallback: return as-is
    }
  }

  private void regenerateBlockIdsInNode(JsonNode node) {
    if (node.isArray()) {
      for (JsonNode item : node) regenerateBlockIdsInNode(item);
    } else if (node.isObject()) {
      ObjectNode obj = (ObjectNode) node;
      if (obj.has("id")) obj.put("id", UUID.randomUUID().toString());
      JsonNode children = obj.get("children");
      if (children != null && children.isArray()) regenerateBlockIdsInNode(children);
      JsonNode blocks = obj.get("blocks");
      if (blocks != null && blocks.isArray()) regenerateBlockIdsInNode(blocks);
    }
  }

  /**
   * Merges data, config, styling JSON objects into a single props JSON string.
   * Priority: data > config > styling (data wins on key conflicts).
   */
  private String mergeProps(String data, String config, String styling) {
    try {
      ObjectMapper mapper = new ObjectMapper();
      Map<String, Object> merged = new LinkedHashMap<>();
      if (styling != null && !styling.isBlank()) {
        merged.putAll(mapper.readValue(styling, new TypeReference<Map<String, Object>>() {}));
      }
      if (config != null && !config.isBlank()) {
        merged.putAll(mapper.readValue(config, new TypeReference<Map<String, Object>>() {}));
      }
      if (data != null && !data.isBlank()) {
        merged.putAll(mapper.readValue(data, new TypeReference<Map<String, Object>>() {}));
      }
      return mapper.writeValueAsString(merged);
    } catch (Exception e) {
      return "{}";
    }
  }
}
