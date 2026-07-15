package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.SystemConfigRequest;
import org.ssssy.backend.model.dto.SystemConfigResponse;
import org.ssssy.backend.model.entity.SystemConfig;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.SystemConfigRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

  private final SystemConfigRepository systemConfigRepository;
  private final UserRepository userRepository;

  @Cacheable(value = "systemConfig", key = "#key")
  public SystemConfigResponse getConfig(String key) {
    SystemConfig config = systemConfigRepository.findByConfigKey(key)
        .orElseThrow(() -> new ResourceNotFoundException("Config not found: " + key));
    return toResponse(config);
  }

  @Cacheable(value = "systemConfig", key = "#group")
  public List<SystemConfigResponse> getConfigsByGroup(String group) {
    return systemConfigRepository.findByConfigGroup(group)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "systemConfig", key = "'all'")
  public List<SystemConfigResponse> getAllConfigs() {
    return systemConfigRepository.findAll()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "systemConfig", allEntries = true)
  public SystemConfigResponse setConfig(SystemConfigRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    SystemConfig config = systemConfigRepository.findByConfigKey(request.getConfigKey())
        .orElse(SystemConfig.builder()
            .configKey(request.getConfigKey())
            .build());
    config.setConfigValue(request.getConfigValue());
    config.setConfigGroup(request.getConfigGroup());
    config.setConfigType(request.getConfigType());
    config.setDescription(request.getDescription());
    config.setIsEncrypted(request.getIsEncrypted() != null && request.getIsEncrypted());
    config.setUpdatedBy(user);
    config = systemConfigRepository.save(config);
    return toResponse(config);
  }

  @Transactional
  @CacheEvict(value = "systemConfig", allEntries = true)
  public List<SystemConfigResponse> bulkSetConfigs(List<SystemConfigRequest> requests, UUID userId) {
    return requests.stream()
        .map(req -> setConfig(req, userId))
        .collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "systemConfig", allEntries = true)
  public void deleteConfig(UUID id) {
    if (!systemConfigRepository.existsById(id)) {
      throw new ResourceNotFoundException("Config not found: " + id);
    }
    systemConfigRepository.deleteById(id);
  }

  private SystemConfigResponse toResponse(SystemConfig config) {
    return SystemConfigResponse.builder()
        .id(config.getId())
        .configKey(config.getConfigKey())
        .configValue(config.getConfigValue())
        .configGroup(config.getConfigGroup())
        .configType(config.getConfigType())
        .isEncrypted(config.getIsEncrypted())
        .description(config.getDescription())
        .updatedByName(config.getUpdatedBy() != null
            ? config.getUpdatedBy().getFirstNameEn() + " " + config.getUpdatedBy().getLastNameEn()
            : null)
        .createdAt(config.getCreatedAt())
        .updatedAt(config.getUpdatedAt())
        .build();
  }
}
