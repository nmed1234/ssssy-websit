package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.SiteSectionRequest;
import org.ssssy.backend.model.dto.SiteSectionResponse;
import org.ssssy.backend.model.entity.SiteSection;
import org.ssssy.backend.repository.SiteSectionRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSectionService {

  private final SiteSectionRepository siteSectionRepository;

  @Cacheable(value = "siteSections", key = "'active'")
  public List<SiteSectionResponse> getActiveSections() {
    return siteSectionRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "siteSections", key = "'location_' + #location")
  public List<SiteSectionResponse> getActiveSectionsByLocation(String location) {
    return siteSectionRepository.findByIsActiveTrueAndLocationOrderBySortOrderAsc(location).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "siteSections", key = "#slug")
  public SiteSectionResponse getBySlug(String slug) {
    SiteSection section = siteSectionRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + slug));
    return toResponse(section);
  }

  public SiteSectionResponse getById(UUID id) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));
    return toResponse(section);
  }

  public List<SiteSectionResponse> getAll() {
    return siteSectionRepository.findAllByOrderBySortOrderAsc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public SiteSectionResponse create(SiteSectionRequest request) {
    SiteSection section = SiteSection.builder()
        .name(request.getName())
        .slug(request.getSlug())
        .componentType(request.getComponentType())
        .config(request.getConfig() != null ? request.getConfig() : "{}")
        .data(request.getData() != null ? request.getData() : "{}")
        .styling(request.getStyling() != null ? request.getStyling() : "{}")
        .location(request.getLocation() != null ? request.getLocation() : "general")
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
        .eventsJson(request.getEventsJson() != null ? request.getEventsJson() : "{}")
        .conditionsJson(request.getConditionsJson() != null ? request.getConditionsJson() : "{}")
        .build();
    section = siteSectionRepository.save(section);
    return toResponse(section);
  }

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public SiteSectionResponse update(UUID id, SiteSectionRequest request) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));
    section.setName(request.getName());
    section.setSlug(request.getSlug());
    section.setComponentType(request.getComponentType());
    section.setConfig(request.getConfig() != null ? request.getConfig() : "{}");
    section.setData(request.getData() != null ? request.getData() : "{}");
    section.setStyling(request.getStyling() != null ? request.getStyling() : "{}");
    if (request.getLocation() != null) section.setLocation(request.getLocation());
    if (request.getIsActive() != null) section.setIsActive(request.getIsActive());
    if (request.getSortOrder() != null) section.setSortOrder(request.getSortOrder());
    if (request.getEventsJson() != null) section.setEventsJson(request.getEventsJson());
    if (request.getConditionsJson() != null) section.setConditionsJson(request.getConditionsJson());
    section.setVersion(section.getVersion() != null ? section.getVersion() + 1 : 1);
    section = siteSectionRepository.save(section);
    return toResponse(section);
  }

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public void delete(UUID id) {
    if (!siteSectionRepository.existsById(id)) {
      throw new ResourceNotFoundException("Site section not found: " + id);
    }
    siteSectionRepository.deleteById(id);
  }

  private SiteSectionResponse toResponse(SiteSection section) {
    return SiteSectionResponse.builder()
        .id(section.getId())
        .name(section.getName())
        .slug(section.getSlug())
        .componentType(section.getComponentType())
        .config(section.getConfig())
        .data(section.getData())
        .styling(section.getStyling())
        .eventsJson(section.getEventsJson())
        .conditionsJson(section.getConditionsJson())
        .version(section.getVersion())
        .isActive(section.getIsActive())
        .location(section.getLocation())
        .sortOrder(section.getSortOrder())
        .createdAt(section.getCreatedAt())
        .updatedAt(section.getUpdatedAt())
        .build();
  }
}
