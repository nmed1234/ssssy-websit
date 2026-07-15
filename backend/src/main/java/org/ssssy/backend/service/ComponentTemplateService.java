package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ComponentTemplateRequest;
import org.ssssy.backend.model.dto.ComponentTemplateResponse;
import org.ssssy.backend.model.entity.ComponentTemplate;
import org.ssssy.backend.repository.ComponentTemplateRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComponentTemplateService {

  private final ComponentTemplateRepository componentTemplateRepository;

  public List<ComponentTemplateResponse> getAll() {
    return componentTemplateRepository.findAllByOrderBySortOrder().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ComponentTemplateResponse> getByCategory(String category) {
    return componentTemplateRepository.findByCategoryOrderBySortOrder(category).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ComponentTemplateResponse> getSystemTemplates() {
    return componentTemplateRepository.findByIsSystemTrueOrderBySortOrder().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public ComponentTemplateResponse getById(UUID id) {
    return componentTemplateRepository.findById(id)
        .map(this::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Component template not found: " + id));
  }

  @Transactional
  public ComponentTemplateResponse create(ComponentTemplateRequest request) {
    ComponentTemplate template = ComponentTemplate.builder()
        .name(request.getName())
        .category(request.getCategory())
        .componentType(request.getComponentType())
        .thumbnailUrl(request.getThumbnailUrl())
        .defaultConfig(request.getDefaultConfig() != null ? request.getDefaultConfig() : "{}")
        .defaultData(request.getDefaultData() != null ? request.getDefaultData() : "{}")
        .defaultStyling(request.getDefaultStyling() != null ? request.getDefaultStyling() : "{}")
        .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
        .sortOrder(request.getSortOrder())
        .build();
    template = componentTemplateRepository.save(template);
    return toResponse(template);
  }

  @Transactional
  public ComponentTemplateResponse update(UUID id, ComponentTemplateRequest request) {
    ComponentTemplate template = componentTemplateRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Component template not found: " + id));
    template.setName(request.getName());
    template.setCategory(request.getCategory());
    template.setComponentType(request.getComponentType());
    template.setThumbnailUrl(request.getThumbnailUrl());
    template.setDefaultConfig(request.getDefaultConfig() != null ? request.getDefaultConfig() : "{}");
    template.setDefaultData(request.getDefaultData() != null ? request.getDefaultData() : "{}");
    template.setDefaultStyling(request.getDefaultStyling() != null ? request.getDefaultStyling() : "{}");
    if (request.getIsSystem() != null) template.setIsSystem(request.getIsSystem());
    if (request.getSortOrder() != null) template.setSortOrder(request.getSortOrder());
    template = componentTemplateRepository.save(template);
    return toResponse(template);
  }

  @Transactional
  public void delete(UUID id) {
    if (!componentTemplateRepository.existsById(id)) {
      throw new ResourceNotFoundException("Component template not found: " + id);
    }
    componentTemplateRepository.deleteById(id);
  }

  private ComponentTemplateResponse toResponse(ComponentTemplate template) {
    return ComponentTemplateResponse.builder()
        .id(template.getId())
        .name(template.getName())
        .category(template.getCategory())
        .componentType(template.getComponentType())
        .thumbnailUrl(template.getThumbnailUrl())
        .defaultConfig(template.getDefaultConfig())
        .defaultData(template.getDefaultData())
        .defaultStyling(template.getDefaultStyling())
        .isSystem(template.getIsSystem())
        .sortOrder(template.getSortOrder())
        .createdAt(template.getCreatedAt())
        .updatedAt(template.getUpdatedAt())
        .build();
  }
}
