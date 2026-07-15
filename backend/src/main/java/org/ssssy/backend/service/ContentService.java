package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.common.HtmlSanitizer;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ContentRequest;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.model.dto.ContentWorkflowResponse;
import org.ssssy.backend.model.dto.CategoryResponse;
import org.ssssy.backend.model.dto.TagResponse;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentService {

  private final ContentItemRepository contentItemRepository;
  private final ContentVersionRepository contentVersionRepository;
  private final CategoryRepository categoryRepository;
  private final TagRepository tagRepository;
  private final UserRepository userRepository;
  private final WorkflowActionRepository workflowActionRepository;
  public Page<ContentResponse> getAllContent(String contentType, String status, Pageable pageable) {
    Page<ContentItem> items;
    if (contentType != null && status != null) {
      items = contentItemRepository.findByContentTypeAndStatus(contentType, status, pageable);
    } else {
      items = contentItemRepository.findAll(pageable);
    }
    return items.map(this::toResponse);
  }

  public ContentResponse getContentById(UUID id) {
    ContentItem item = contentItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    return toResponse(item);
  }

  public ContentResponse getContentBySlug(String slug) {
    ContentItem item = contentItemRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + slug));
    return toResponse(item);
  }

  @Transactional
  public ContentResponse createContent(ContentRequest request, UUID authorId) {
    User author = userRepository.findById(authorId)
        .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

    String sanitizedBody = HtmlSanitizer.sanitize(request.getBody());

    ContentItem item = ContentItem.builder()
        .titleAr(request.getTitleAr())
        .titleEn(request.getTitleEn())
        .slug(request.getSlug())
        .excerpt(request.getExcerpt())
        .body(sanitizedBody)
        .contentType(request.getContentType() != null ? request.getContentType() : "ARTICLE")
        .status("DRAFT")
        .author(author)
        .featuredImage(request.getFeaturedImage())
        .isFeatured(request.getIsFeatured() != null && request.getIsFeatured())
        .isPinned(request.getIsPinned() != null && request.getIsPinned())
        .isMemberOnly(request.getIsMemberOnly() != null && request.getIsMemberOnly())
        .metaTitle(request.getMetaTitle())
        .metaDescription(request.getMetaDescription())
        .metaKeywords(request.getMetaKeywords())
        .build();

    if (request.getCategoryId() != null) {
      item.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
    }
    if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
      Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
      item.setTags(tags);
    }

    item = contentItemRepository.save(item);
    createVersion(item, author, "Created");
    return toResponse(item);
  }

  @Transactional
  public ContentResponse updateContent(UUID id, ContentRequest request, UUID userId) {
    ContentItem item = contentItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String sanitizedBody = HtmlSanitizer.sanitize(request.getBody());

    item.setTitleAr(request.getTitleAr());
    item.setTitleEn(request.getTitleEn());
    item.setSlug(request.getSlug());
    item.setExcerpt(request.getExcerpt());
    item.setBody(sanitizedBody);
    item.setContentType(request.getContentType());
    item.setFeaturedImage(request.getFeaturedImage());
    item.setIsFeatured(request.getIsFeatured() != null && request.getIsFeatured());
    item.setIsPinned(request.getIsPinned() != null && request.getIsPinned());
    item.setIsMemberOnly(request.getIsMemberOnly() != null && request.getIsMemberOnly());
    item.setMetaTitle(request.getMetaTitle());
    item.setMetaDescription(request.getMetaDescription());
    item.setMetaKeywords(request.getMetaKeywords());

    if (request.getCategoryId() != null) {
      item.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
    }
    if (request.getTagIds() != null) {
      Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
      item.setTags(tags);
    }

    item.setVersion(item.getVersion() != null ? item.getVersion() + 1 : 1);
    item = contentItemRepository.save(item);
    createVersion(item, user, "Updated");
    return toResponse(item);
  }

  @Transactional
  public void deleteContent(UUID id) {
    ContentItem item = contentItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    item.setDeletedAt(java.time.LocalDateTime.now());
    contentItemRepository.save(item);
  }

  public Page<ContentResponse> searchContent(String q, Pageable pageable) {
    return contentItemRepository.searchByText(q, pageable)
        .map(this::toResponse);
  }

  public List<ContentVersion> getContentVersions(UUID contentId) {
    return contentVersionRepository.findByContentIdOrderByVersionDesc(contentId);
  }

  public ContentVersion getContentVersion(UUID contentId, Integer versionNumber) {
    return contentVersionRepository.findByContentIdAndVersion(contentId, versionNumber)
        .orElseThrow(() -> new ResourceNotFoundException("Version not found"));
  }

  public ContentResponse previewContent(UUID id) {
    return getContentById(id);
  }

  public ContentWorkflowResponse getContentWorkflow(UUID id) {
    ContentItem item = contentItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    List<WorkflowAction> actions = workflowActionRepository.findByContentIdOrderByCreatedAtDesc(id);

    List<ContentWorkflowResponse.WorkflowActionResponse> actionResponses = actions.stream()
        .map(a -> ContentWorkflowResponse.WorkflowActionResponse.builder()
            .id(a.getId())
            .action(a.getAction())
            .fromState(a.getFromState() != null ? a.getFromState().getName() : null)
            .toState(a.getToState() != null ? a.getToState().getName() : null)
            .actorName(a.getActor() != null
                ? (a.getActor().getFirstNameEn() != null ? a.getActor().getFirstNameEn() : "") + " " + (a.getActor().getLastNameEn() != null ? a.getActor().getLastNameEn() : "")
                : "System")
            .comment(a.getComments())
            .createdAt(a.getCreatedAt())
            .build())
        .collect(Collectors.toList());

    String status = item.getStatus();
    return ContentWorkflowResponse.builder()
        .contentId(item.getId())
        .titleAr(item.getTitleAr())
        .titleEn(item.getTitleEn())
        .contentType(item.getContentType())
        .currentStatus(status)
        .version(item.getVersion())
        .authorId(item.getAuthor().getId())
        .authorName((item.getAuthor().getFirstNameEn() != null ? item.getAuthor().getFirstNameEn() : "") + " " + (item.getAuthor().getLastNameEn() != null ? item.getAuthor().getLastNameEn() : ""))
        .reviewerId(item.getReviewer() != null ? item.getReviewer().getId() : null)
        .reviewerName(item.getReviewer() != null ? (item.getReviewer().getFirstNameEn() != null ? item.getReviewer().getFirstNameEn() : "") + " " + (item.getReviewer().getLastNameEn() != null ? item.getReviewer().getLastNameEn() : "") : null)
        .publisherId(item.getPublisher() != null ? item.getPublisher().getId() : null)
        .publisherName(item.getPublisher() != null ? (item.getPublisher().getFirstNameEn() != null ? item.getPublisher().getFirstNameEn() : "") + " " + (item.getPublisher().getLastNameEn() != null ? item.getPublisher().getLastNameEn() : "") : null)
        .publishedAt(item.getPublishedAt())
        .scheduledAt(item.getScheduledAt())
        .workflowActions(actionResponses)
        .canSubmit("DRAFT".equals(status))
        .canApprove("IN_REVIEW".equals(status) || "SUBMITTED".equals(status))
        .canReject("IN_REVIEW".equals(status) || "SUBMITTED".equals(status))
        .canPublish("APPROVED".equals(status))
        .canSchedule("APPROVED".equals(status))
        .build();
  }

  public Page<ContentResponse> getPublishedContent(Pageable pageable) {
    return contentItemRepository.findByStatus("PUBLISHED", pageable)
        .map(this::toResponse);
  }

  public Page<ContentResponse> getPublishedByType(String contentType, Pageable pageable) {
    return contentItemRepository.findByContentTypeAndStatus(contentType, "PUBLISHED", pageable)
        .map(this::toResponse);
  }

  public Page<ContentResponse> getPublishedByCategory(String categorySlug, Pageable pageable) {
    return contentItemRepository.findByStatusAndCategory_Slug("PUBLISHED", categorySlug, pageable)
        .map(this::toResponse);
  }

  public ContentResponse getPublishedBySlug(String slug) {
    ContentItem item = contentItemRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + slug));
    if (!"PUBLISHED".equals(item.getStatus())) {
      throw new ResourceNotFoundException("Content not published: " + slug);
    }
    return toResponse(item);
  }

  public List<ContentResponse> getFeaturedContent(int limit) {
    return contentItemRepository.findByStatus("PUBLISHED", Pageable.ofSize(limit))
        .stream()
        .filter(ContentItem::getIsFeatured)
        .limit(limit)
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<String> searchSuggestions(String q) {
    return contentItemRepository.searchTitleSuggestions(q + "%");
  }

  private void createVersion(ContentItem item, User user, String changeNote) {
    ContentVersion version = ContentVersion.builder()
        .content(item)
        .version(item.getVersion() != null ? item.getVersion() : 1)
        .titleAr(item.getTitleAr())
        .titleEn(item.getTitleEn())
        .excerpt(item.getExcerpt())
        .body(item.getBody())
        .status(item.getStatus())
        .changedBy(user)
        .changeSummary(changeNote)
        .build();
    contentVersionRepository.save(version);
  }

  public ContentResponse toResponse(ContentItem item) {
    return ContentResponse.builder()
        .id(item.getId())
        .titleAr(item.getTitleAr())
        .titleEn(item.getTitleEn())
        .slug(item.getSlug())
        .excerpt(item.getExcerpt())
        .body(item.getBody())
        .contentType(item.getContentType())
        .status(item.getStatus())
        .authorId(item.getAuthor().getId())
        .authorName(
            (item.getAuthor().getFirstNameEn() != null ? item.getAuthor().getFirstNameEn() : "")
            + " " +
            (item.getAuthor().getLastNameEn() != null ? item.getAuthor().getLastNameEn() : "")
        )
        .reviewerId(item.getReviewer() != null ? item.getReviewer().getId() : null)
        .publisherId(item.getPublisher() != null ? item.getPublisher().getId() : null)
        .category(item.getCategory() != null ? toCategoryResponse(item.getCategory()) : null)
        .tags(item.getTags().stream().map(this::toTagResponse).collect(Collectors.toSet()))
        .featuredImage(item.getFeaturedImage())
        .isFeatured(item.getIsFeatured())
        .isPinned(item.getIsPinned())
        .isMemberOnly(item.getIsMemberOnly())
        .publishedAt(item.getPublishedAt())
        .scheduledAt(item.getScheduledAt())
        .viewCount(item.getViewCount())
        .version(item.getVersion())
        .metaTitle(item.getMetaTitle())
        .metaDescription(item.getMetaDescription())
        .metaKeywords(item.getMetaKeywords())
        .ogImageUrl(item.getOgImageUrl())
        .ogTitle(item.getOgTitle())
        .ogDescription(item.getOgDescription())
        .createdAt(item.getCreatedAt())
        .updatedAt(item.getUpdatedAt())
        .build();
  }

  private CategoryResponse toCategoryResponse(Category category) {
    return CategoryResponse.builder()
        .id(category.getId())
        .nameAr(category.getNameAr())
        .nameEn(category.getNameEn())
        .slug(category.getSlug())
        .build();
  }

  private TagResponse toTagResponse(Tag tag) {
    return TagResponse.builder()
        .id(tag.getId())
        .nameAr(tag.getNameAr())
        .nameEn(tag.getNameEn())
        .slug(tag.getSlug())
        .build();
  }
}
