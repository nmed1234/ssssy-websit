package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ThemeSettingRequest;
import org.ssssy.backend.model.dto.ThemeSettingResponse;
import org.ssssy.backend.model.dto.ThemeSettingValueRequest;
import org.ssssy.backend.model.entity.ThemeSetting;
import org.ssssy.backend.repository.ThemeSettingRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThemeSettingService {

  private final ThemeSettingRepository themeSettingRepository;

  @Cacheable(value = "themeSettings", key = "'all'")
  public List<ThemeSettingResponse> getAll() {
    return themeSettingRepository.findAllByOrderByGroupNameAscSettingKeyAsc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "themeSettings", key = "'group_' + #groupName")
  public List<ThemeSettingResponse> getByGroup(String groupName) {
    return themeSettingRepository.findByGroupNameOrderBySettingKeyAsc(groupName).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public ThemeSettingResponse getById(UUID id) {
    ThemeSetting setting = themeSettingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Theme setting not found: " + id));
    return toResponse(setting);
  }

  public ThemeSettingResponse getByKey(String key) {
    ThemeSetting setting = themeSettingRepository.findBySettingKey(key)
        .orElseThrow(() -> new ResourceNotFoundException("Theme setting not found: " + key));
    return toResponse(setting);
  }

  @Transactional
  @CacheEvict(value = "themeSettings", allEntries = true)
  public ThemeSettingResponse create(ThemeSettingRequest request) {
    ThemeSetting setting = ThemeSetting.builder()
        .settingKey(request.getSettingKey())
        .settingValue(request.getSettingValue())
        .settingType(request.getSettingType() != null ? request.getSettingType() : "text")
        .groupName(request.getGroupName() != null ? request.getGroupName() : "general")
        .label(request.getLabel())
        .build();
    setting = themeSettingRepository.save(setting);
    return toResponse(setting);
  }

  @Transactional
  @CacheEvict(value = "themeSettings", allEntries = true)
  public ThemeSettingResponse update(UUID id, ThemeSettingRequest request) {
    ThemeSetting setting = themeSettingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Theme setting not found: " + id));
    setting.setSettingKey(request.getSettingKey());
    setting.setSettingValue(request.getSettingValue());
    if (request.getSettingType() != null) setting.setSettingType(request.getSettingType());
    if (request.getGroupName() != null) setting.setGroupName(request.getGroupName());
    if (request.getLabel() != null) setting.setLabel(request.getLabel());
    setting = themeSettingRepository.save(setting);
    return toResponse(setting);
  }

  @Transactional
  @CacheEvict(value = "themeSettings", allEntries = true)
  public ThemeSettingResponse updateValueByKey(String key, ThemeSettingValueRequest request) {
    ThemeSetting setting = themeSettingRepository.findBySettingKey(key)
        .orElseThrow(() -> new ResourceNotFoundException("Theme setting not found: " + key));
    setting.setSettingValue(request.getSettingValue());
    setting = themeSettingRepository.save(setting);
    return toResponse(setting);
  }

  /** Upsert: creates the row if it doesn't exist yet, otherwise updates value. */
  @Transactional
  @CacheEvict(value = "themeSettings", allEntries = true)
  public ThemeSettingResponse upsertByKey(String key, ThemeSettingValueRequest request) {
    ThemeSetting setting = themeSettingRepository.findBySettingKey(key)
        .orElse(ThemeSetting.builder()
            .settingKey(key)
            .settingType("text")
            .groupName("style")
            .build());
    setting.setSettingValue(request.getSettingValue());
    setting = themeSettingRepository.save(setting);
    return toResponse(setting);
  }

  @Transactional
  @CacheEvict(value = "themeSettings", allEntries = true)
  public void delete(UUID id) {
    if (!themeSettingRepository.existsById(id)) {
      throw new ResourceNotFoundException("Theme setting not found: " + id);
    }
    themeSettingRepository.deleteById(id);
  }

  private ThemeSettingResponse toResponse(ThemeSetting setting) {
    return ThemeSettingResponse.builder()
        .id(setting.getId())
        .settingKey(setting.getSettingKey())
        .settingValue(setting.getSettingValue())
        .settingType(setting.getSettingType())
        .groupName(setting.getGroupName())
        .label(setting.getLabel())
        .createdAt(setting.getCreatedAt())
        .updatedAt(setting.getUpdatedAt())
        .build();
  }
}
