package org.ssssy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 3 — Dynamic Content Type Engine.
 *
 * Manages content type definitions and their field schemas.
 * Actual entry CRUD is handled by DynamicContentService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentTypeService {

  private final ContentTypeDefinitionRepository typeRepository;
  private final DynamicContentEntryRepository entryRepository;
  private final WorkflowRepository workflowRepository;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  // ─── Content Type CRUD ────────────────────────────────────────────────────────

  public List<ContentTypeDefinitionResponse> listAllTypes() {
    return typeRepository.findAllByOrderBySortOrderAscCreatedAtDesc(Pageable.unpaged())
        .getContent().stream().map(this::toTypeResponse).toList();
  }

  public List<ContentTypeDefinitionResponse> listActiveTypes() {
    return typeRepository.findByIsActiveTrueOrderBySortOrderAsc()
        .stream().map(this::toTypeResponse).toList();
  }

  public ContentTypeDefinitionResponse getTypeById(UUID id) {
    return toTypeResponse(findTypeById(id));
  }

  public ContentTypeDefinitionResponse getTypeByName(String name) {
    ContentTypeDefinition type = typeRepository.findByName(name)
        .orElseThrow(() -> new ResourceNotFoundException("Content type not found: " + name));
    return toTypeResponse(type);
  }

  @Transactional
  public ContentTypeDefinitionResponse createType(ContentTypeDefinitionRequest request, UUID creatorId) {
    validateTypeName(request.getName());
    if (typeRepository.existsByName(request.getName())) {
      throw new BadRequestException("Content type already exists: " + request.getName());
    }

    User creator = userRepository.findById(creatorId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    ContentTypeDefinition type = ContentTypeDefinition.builder()
        .name(request.getName().toLowerCase().replace(" ", "-"))
        .labelEn(request.getLabelEn())
        .labelAr(request.getLabelAr())
        .description(request.getDescription())
        .icon(request.getIcon() != null ? request.getIcon() : "FileText")
        .allowComments(request.getAllowComments() != null ? request.getAllowComments() : false)
        .allowMemberSubmit(request.getAllowMemberSubmit() != null ? request.getAllowMemberSubmit() : false)
        .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : true)
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
        .createdBy(creator)
        .build();

    if (request.getWorkflowId() != null) {
      workflowRepository.findById(request.getWorkflowId()).ifPresent(type::setWorkflow);
    }

    ContentTypeDefinition saved = typeRepository.save(type);

    if (request.getFields() != null) {
      replaceFields(saved, request.getFields());
    }

    return toTypeResponse(typeRepository.findById(saved.getId()).orElse(saved));
  }

  @Transactional
  public ContentTypeDefinitionResponse updateType(UUID id, ContentTypeDefinitionRequest request) {
    ContentTypeDefinition type = findTypeById(id);

    if (request.getLabelEn() != null) type.setLabelEn(request.getLabelEn());
    if (request.getLabelAr() != null) type.setLabelAr(request.getLabelAr());
    if (request.getDescription() != null) type.setDescription(request.getDescription());
    if (request.getIcon() != null) type.setIcon(request.getIcon());
    if (request.getAllowComments() != null) type.setAllowComments(request.getAllowComments());
    if (request.getAllowMemberSubmit() != null) type.setAllowMemberSubmit(request.getAllowMemberSubmit());
    if (request.getRequiresApproval() != null) type.setRequiresApproval(request.getRequiresApproval());
    if (request.getIsActive() != null) type.setIsActive(request.getIsActive());
    if (request.getSortOrder() != null) type.setSortOrder(request.getSortOrder());
    if (request.getWorkflowId() != null) {
      workflowRepository.findById(request.getWorkflowId()).ifPresent(type::setWorkflow);
    }

    if (request.getFields() != null) {
      replaceFields(type, request.getFields());
    }

    return toTypeResponse(typeRepository.save(type));
  }

  @Transactional
  public void deleteType(UUID id) {
    ContentTypeDefinition type = findTypeById(id);
    long count = entryRepository.countByContentTypeName(type.getName());
    if (count > 0) {
      throw new BadRequestException(
          "Cannot delete content type with " + count + " existing entries. Archive or delete entries first.");
    }
    typeRepository.deleteById(id);
  }

  // ─── Field Management ─────────────────────────────────────────────────────────

  /** Replace all fields of a type with the provided list (ordered). */
  @Transactional
  public ContentTypeDefinitionResponse updateFields(UUID typeId, List<ContentTypeFieldRequest> fields) {
    ContentTypeDefinition type = findTypeById(typeId);
    replaceFields(type, fields);
    return toTypeResponse(typeRepository.findById(typeId).orElse(type));
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private ContentTypeDefinition findTypeById(UUID id) {
    return typeRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content type not found: " + id));
  }

  private void validateTypeName(String name) {
    if (name == null || name.isBlank()) throw new BadRequestException("Content type name cannot be empty");
    if (!name.matches("[a-z0-9][a-z0-9\\-]*")) {
      throw new BadRequestException("Content type name must be lowercase letters, numbers, and hyphens only");
    }
  }

  private void replaceFields(ContentTypeDefinition type, List<ContentTypeFieldRequest> fieldRequests) {
    type.getFields().clear();
    int order = 0;
    for (ContentTypeFieldRequest fr : fieldRequests) {
      ContentTypeField field = ContentTypeField.builder()
          .contentType(type)
          .fieldName(fr.getFieldName().toLowerCase().replace(" ", "_"))
          .fieldLabelEn(fr.getFieldLabelEn())
          .fieldLabelAr(fr.getFieldLabelAr())
          .fieldType(fr.getFieldType() != null ? fr.getFieldType() : "text")
          .isRequired(fr.getIsRequired() != null ? fr.getIsRequired() : false)
          .isSearchable(fr.getIsSearchable() != null ? fr.getIsSearchable() : false)
          .isListed(fr.getIsListed() != null ? fr.getIsListed() : true)
          .placeholderEn(fr.getPlaceholderEn())
          .placeholderAr(fr.getPlaceholderAr())
          .helpTextEn(fr.getHelpTextEn())
          .helpTextAr(fr.getHelpTextAr())
          .optionsJson(fr.getOptionsJson())
          .validationJson(fr.getValidationJson())
          .sortOrder(fr.getSortOrder() != null ? fr.getSortOrder() : order)
          .build();
      type.getFields().add(field);
      order++;
    }
    typeRepository.save(type);
  }

  ContentTypeDefinitionResponse toTypeResponse(ContentTypeDefinition type) {
    long count = entryRepository.countByContentTypeName(type.getName());
    return ContentTypeDefinitionResponse.builder()
        .id(type.getId())
        .name(type.getName())
        .labelEn(type.getLabelEn())
        .labelAr(type.getLabelAr())
        .description(type.getDescription())
        .icon(type.getIcon())
        .workflowId(type.getWorkflow() != null ? type.getWorkflow().getId() : null)
        .workflowName(type.getWorkflow() != null ? type.getWorkflow().getNameEn() : null)
        .allowComments(type.getAllowComments())
        .allowMemberSubmit(type.getAllowMemberSubmit())
        .requiresApproval(type.getRequiresApproval())
        .isActive(type.getIsActive())
        .sortOrder(type.getSortOrder())
        .createdByUsername(type.getCreatedBy() != null ? type.getCreatedBy().getUsername() : null)
        .entryCount(count)
        .fields(type.getFields().stream().map(this::toFieldResponse).toList())
        .createdAt(type.getCreatedAt())
        .updatedAt(type.getUpdatedAt())
        .build();
  }

  private ContentTypeFieldResponse toFieldResponse(ContentTypeField f) {
    return ContentTypeFieldResponse.builder()
        .id(f.getId())
        .fieldName(f.getFieldName())
        .fieldLabelEn(f.getFieldLabelEn())
        .fieldLabelAr(f.getFieldLabelAr())
        .fieldType(f.getFieldType())
        .isRequired(f.getIsRequired())
        .isSearchable(f.getIsSearchable())
        .isListed(f.getIsListed())
        .placeholderEn(f.getPlaceholderEn())
        .placeholderAr(f.getPlaceholderAr())
        .helpTextEn(f.getHelpTextEn())
        .helpTextAr(f.getHelpTextAr())
        .optionsJson(f.getOptionsJson())
        .validationJson(f.getValidationJson())
        .sortOrder(f.getSortOrder())
        .createdAt(f.getCreatedAt())
        .build();
  }
}
