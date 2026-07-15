package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ComponentPresetRequest;
import org.ssssy.backend.model.dto.ComponentPresetResponse;
import org.ssssy.backend.model.entity.ComponentPreset;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ComponentPresetRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComponentPresetService {

  private final ComponentPresetRepository componentPresetRepository;
  private final UserRepository userRepository;

  public List<ComponentPresetResponse> getAll() {
    return componentPresetRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ComponentPresetResponse> getByType(String componentType) {
    return componentPresetRepository.findByComponentTypeOrderByCreatedAtDesc(componentType).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ComponentPresetResponse> getSystemPresets() {
    return componentPresetRepository.findByIsSystemTrueOrderByCreatedAtDesc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ComponentPresetResponse> getCustomPresets() {
    return componentPresetRepository.findByIsSystemFalseOrderByCreatedAtDesc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public ComponentPresetResponse getById(UUID id) {
    return componentPresetRepository.findById(id)
        .map(this::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Component preset not found: " + id));
  }

  @Transactional
  public ComponentPresetResponse create(ComponentPresetRequest request, UUID userId) {
    User creator = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    ComponentPreset preset = ComponentPreset.builder()
        .componentType(request.getComponentType())
        .nameAr(request.getNameAr())
        .nameEn(request.getNameEn())
        .configJson(request.getConfigJson() != null ? request.getConfigJson() : "{}")
        .dataJson(request.getDataJson() != null ? request.getDataJson() : "{}")
        .stylingJson(request.getStylingJson() != null ? request.getStylingJson() : "{}")
        .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
        .createdBy(creator)
        .build();

    preset = componentPresetRepository.save(preset);
    return toResponse(preset);
  }

  @Transactional
  public ComponentPresetResponse update(UUID id, ComponentPresetRequest request) {
    ComponentPreset preset = componentPresetRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Component preset not found: " + id));

    preset.setComponentType(request.getComponentType());
    if (request.getNameAr() != null) preset.setNameAr(request.getNameAr());
    if (request.getNameEn() != null) preset.setNameEn(request.getNameEn());
    if (request.getConfigJson() != null) preset.setConfigJson(request.getConfigJson());
    if (request.getDataJson() != null) preset.setDataJson(request.getDataJson());
    if (request.getStylingJson() != null) preset.setStylingJson(request.getStylingJson());
    if (request.getIsSystem() != null) preset.setIsSystem(request.getIsSystem());

    preset = componentPresetRepository.save(preset);
    return toResponse(preset);
  }

  @Transactional
  public void delete(UUID id) {
    if (!componentPresetRepository.existsById(id)) {
      throw new ResourceNotFoundException("Component preset not found: " + id);
    }
    componentPresetRepository.deleteById(id);
  }

  private ComponentPresetResponse toResponse(ComponentPreset preset) {
    return ComponentPresetResponse.builder()
        .id(preset.getId())
        .componentType(preset.getComponentType())
        .nameAr(preset.getNameAr())
        .nameEn(preset.getNameEn())
        .configJson(preset.getConfigJson())
        .dataJson(preset.getDataJson())
        .stylingJson(preset.getStylingJson())
        .isSystem(preset.getIsSystem())
        .createdById(preset.getCreatedBy() != null ? preset.getCreatedBy().getId() : null)
        .createdByName(preset.getCreatedBy() != null
            ? preset.getCreatedBy().getFirstNameEn() + " " + preset.getCreatedBy().getLastNameEn()
            : null)
        .createdAt(preset.getCreatedAt())
        .updatedAt(preset.getUpdatedAt())
        .build();
  }
}
