package org.ssssy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.event.CmsEventBus;
import org.ssssy.backend.event.ContentCreatedEvent;
import org.ssssy.backend.event.ContentPublishedEvent;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Phase 3 — Dynamic Content Entry CRUD.
 *
 * Handles create/read/update/delete of entries for any dynamic content type.
 * Validates submitted field_data against the type's field schema at runtime.
 * Publishes CMS events for all key transitions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicContentService {

  private final ContentTypeDefinitionRepository typeRepository;
  private final DynamicContentEntryRepository entryRepository;
  private final UserRepository userRepository;
  private final CmsEventBus cmsEventBus;
  private final ObjectMapper objectMapper;
  private final ContentTypeService contentTypeService;

  // ─── Public read ─────────────────────────────────────────────────────────────

  public Page<DynamicContentEntryResponse> listPublished(String typeName, Pageable pageable) {
    validateTypeExists(typeName);
    return entryRepository.findByContentTypeNameAndStatusInOrderByPublishedAtDesc(
            typeName, List.of("PUBLISHED"), pageable)
        .map(e -> toResponse(e, typeName));
  }

  public DynamicContentEntryResponse getPublishedBySlug(String typeName, String slug) {
    validateTypeExists(typeName);
    DynamicContentEntry entry = entryRepository.findBySlug(slug)
        .filter(e -> "PUBLISHED".equals(e.getStatus()) && typeName.equals(e.getContentTypeName()))
        .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + slug));
    return toResponse(entry, typeName);
  }

  public Page<DynamicContentEntryResponse> search(String typeName, String query, Pageable pageable) {
    validateTypeExists(typeName);
    return entryRepository.searchPublished(typeName, query, pageable)
        .map(e -> toResponse(e, typeName));
  }

  // ─── Admin read ───────────────────────────────────────────────────────────────

  public Page<DynamicContentEntryResponse> listAll(String typeName, String status, Pageable pageable) {
    validateTypeExists(typeName);
    if (status != null && !status.isBlank()) {
      return entryRepository.findByContentTypeNameAndStatusOrderByCreatedAtDesc(typeName, status, pageable)
          .map(e -> toResponse(e, typeName));
    }
    return entryRepository.findByContentTypeNameOrderByCreatedAtDesc(typeName, pageable)
        .map(e -> toResponse(e, typeName));
  }

  public DynamicContentEntryResponse getById(UUID id) {
    DynamicContentEntry entry = findById(id);
    return toResponse(entry, entry.getContentTypeName());
  }

  // ─── Create ──────────────────────────────────────────────────────────────────

  @Transactional
  public DynamicContentEntryResponse create(String typeName, DynamicContentEntryRequest request, UUID authorId) {
    ContentTypeDefinition type = findTypeByName(typeName);
    User author = userRepository.findById(authorId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String validatedData = validateAndNormalizeFieldData(type, request.getFieldData());

    String slug = request.getSlug() != null && !request.getSlug().isBlank()
        ? request.getSlug()
        : generateSlug(typeName, validatedData);

    if (entryRepository.existsBySlug(slug)) {
      slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
    }

    String status = request.getStatus() != null ? request.getStatus() : "DRAFT";

    DynamicContentEntry entry = DynamicContentEntry.builder()
        .contentTypeName(typeName)
        .slug(slug)
        .status(status)
        .author(author)
        .fieldData(validatedData)
        .featuredImageUrl(request.getFeaturedImageUrl())
        .metaTitle(request.getMetaTitle())
        .metaDescription(request.getMetaDescription())
        .build();

    if ("PUBLISHED".equals(status)) {
      entry.setPublishedAt(LocalDateTime.now());
    }

    entry = entryRepository.save(entry);

    cmsEventBus.publish(new ContentCreatedEvent(entry.getId(), typeName, slug,
        extractTitle(validatedData), status, authorId));

    if ("PUBLISHED".equals(status)) {
      cmsEventBus.publish(new ContentPublishedEvent(
          entry.getId(), typeName, slug, extractTitle(validatedData), null,
          entry.getPublishedAt(), authorId));
    }

    return toResponse(entry, typeName);
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  @Transactional
  public DynamicContentEntryResponse update(UUID id, DynamicContentEntryRequest request, UUID editorId) {
    DynamicContentEntry entry = findById(id);
    ContentTypeDefinition type = findTypeByName(entry.getContentTypeName());
    String previousStatus = entry.getStatus();

    if (request.getFieldData() != null) {
      entry.setFieldData(validateAndNormalizeFieldData(type, request.getFieldData()));
    }
    if (request.getSlug() != null && !request.getSlug().isBlank()) {
      entry.setSlug(request.getSlug());
    }
    if (request.getStatus() != null) {
      entry.setStatus(request.getStatus());
      if ("PUBLISHED".equals(request.getStatus()) && !"PUBLISHED".equals(previousStatus)) {
        entry.setPublishedAt(LocalDateTime.now());
      }
    }
    if (request.getFeaturedImageUrl() != null) entry.setFeaturedImageUrl(request.getFeaturedImageUrl());
    if (request.getMetaTitle() != null) entry.setMetaTitle(request.getMetaTitle());
    if (request.getMetaDescription() != null) entry.setMetaDescription(request.getMetaDescription());

    entry = entryRepository.save(entry);

    if ("PUBLISHED".equals(entry.getStatus()) && !"PUBLISHED".equals(previousStatus)) {
      cmsEventBus.publish(new ContentPublishedEvent(
          entry.getId(), entry.getContentTypeName(), entry.getSlug(),
          extractTitle(entry.getFieldData()), null, entry.getPublishedAt(), editorId));
    }

    return toResponse(entry, entry.getContentTypeName());
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  @Transactional
  public void delete(UUID id) {
    if (!entryRepository.existsById(id)) {
      throw new ResourceNotFoundException("Entry not found: " + id);
    }
    entryRepository.deleteById(id);
  }

  // ─── Member dashboard queries ─────────────────────────────────────────────────

  public Page<DynamicContentEntryResponse> listByAuthor(UUID authorId, String typeName, Pageable pageable) {
    if (typeName != null) {
      return entryRepository.findByAuthorIdAndContentTypeNameOrderByCreatedAtDesc(authorId, typeName, pageable)
          .map(e -> toResponse(e, e.getContentTypeName()));
    }
    return entryRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
        .map(e -> toResponse(e, e.getContentTypeName()));
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private ContentTypeDefinition findTypeByName(String name) {
    return typeRepository.findByName(name)
        .orElseThrow(() -> new ResourceNotFoundException("Content type not found: " + name));
  }

  private DynamicContentEntry findById(UUID id) {
    return entryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + id));
  }

  private void validateTypeExists(String name) {
    if (!typeRepository.existsByName(name)) {
      throw new ResourceNotFoundException("Content type not found: " + name);
    }
  }

  /**
   * Validates field_data JSON against the type's field schema:
   *  - Required fields must be present and non-empty
   *  - Returns the validated JSON string
   */
  private String validateAndNormalizeFieldData(ContentTypeDefinition type, String fieldDataJson) {
    if (fieldDataJson == null || fieldDataJson.isBlank()) {
      fieldDataJson = "{}";
    }
    try {
      Map<String, Object> data = objectMapper.readValue(
          fieldDataJson, new TypeReference<Map<String, Object>>() {});

      for (ContentTypeField field : type.getFields()) {
        if (Boolean.TRUE.equals(field.getIsRequired())) {
          Object value = data.get(field.getFieldName());
          if (value == null || value.toString().isBlank()) {
            throw new BadRequestException("Required field missing: " + field.getFieldLabelEn());
          }
        }
      }

      return objectMapper.writeValueAsString(data);
    } catch (BadRequestException e) {
      throw e;
    } catch (Exception e) {
      throw new BadRequestException("Invalid field data: " + e.getMessage());
    }
  }

  private String generateSlug(String typeName, String fieldDataJson) {
    try {
      Map<String, Object> data = objectMapper.readValue(
          fieldDataJson, new TypeReference<Map<String, Object>>() {});
      // Try common title-like field names
      for (String key : new String[]{"title", "title_en", "name", "headline"}) {
        Object val = data.get(key);
        if (val != null && !val.toString().isBlank()) {
          return typeName + "-" + val.toString().toLowerCase()
              .replaceAll("[^a-z0-9\\u0600-\\u06ff\\s]", "")
              .replaceAll("\\s+", "-")
              .replaceAll("-+", "-")
              .substring(0, Math.min(80, val.toString().length() + typeName.length() + 1));
        }
      }
    } catch (Exception ignored) {}
    return typeName + "-" + UUID.randomUUID().toString().substring(0, 8);
  }

  private String extractTitle(String fieldDataJson) {
    try {
      Map<String, Object> data = objectMapper.readValue(
          fieldDataJson, new TypeReference<Map<String, Object>>() {});
      for (String key : new String[]{"title", "title_en", "name", "headline"}) {
        Object val = data.get(key);
        if (val != null && !val.toString().isBlank()) return val.toString();
      }
    } catch (Exception ignored) {}
    return null;
  }

  DynamicContentEntryResponse toResponse(DynamicContentEntry entry, String typeName) {
    ContentTypeDefinitionResponse typeDef = null;
    try {
      typeDef = contentTypeService.getTypeByName(typeName);
    } catch (Exception ignored) {}

    return DynamicContentEntryResponse.builder()
        .id(entry.getId())
        .contentTypeName(entry.getContentTypeName())
        .contentTypeLabelEn(typeDef != null ? typeDef.getLabelEn() : typeName)
        .contentTypeLabelAr(typeDef != null ? typeDef.getLabelAr() : null)
        .slug(entry.getSlug())
        .status(entry.getStatus())
        .authorId(entry.getAuthor() != null ? entry.getAuthor().getId() : null)
        .authorUsername(entry.getAuthor() != null ? entry.getAuthor().getUsername() : null)
        .authorDisplayName(entry.getAuthor() != null
            ? (entry.getAuthor().getFirstNameEn() + " " + entry.getAuthor().getLastNameEn()).trim()
            : null)
        .workflowState(entry.getWorkflowState())
        .fieldData(entry.getFieldData())
        .featuredImageUrl(entry.getFeaturedImageUrl())
        .metaTitle(entry.getMetaTitle())
        .metaDescription(entry.getMetaDescription())
        .publishedAt(entry.getPublishedAt())
        .createdAt(entry.getCreatedAt())
        .updatedAt(entry.getUpdatedAt())
        .build();
  }
}
