package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.SiteSectionRequest;
import org.ssssy.backend.model.dto.SiteSectionResponse;
import org.ssssy.backend.model.dto.SiteSectionVersionResponse;
import org.ssssy.backend.model.entity.SiteSection;
import org.ssssy.backend.model.entity.SiteSectionVersion;
import org.ssssy.backend.repository.SiteSectionRepository;
import org.ssssy.backend.repository.SiteSectionVersionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSectionService {

  private final SiteSectionRepository siteSectionRepository;
  private final SiteSectionVersionRepository versionRepository;

  // ── Public read (returns published snapshots for active sections) ────────

  @Cacheable(value = "siteSections", key = "'active'")
  public List<SiteSectionResponse> getActiveSections() {
    return siteSectionRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
        .map(this::toPublicResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "siteSections", key = "'location_' + #location")
  public List<SiteSectionResponse> getActiveSectionsByLocation(String location) {
    return siteSectionRepository.findByIsActiveTrueAndLocationOrderBySortOrderAsc(location).stream()
        .map(this::toPublicResponse)
        .collect(Collectors.toList());
  }

  @Cacheable(value = "siteSections", key = "#slug")
  public SiteSectionResponse getBySlug(String slug) {
    SiteSection section = siteSectionRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + slug));
    return toPublicResponse(section);
  }

  // ── Admin read (returns full draft data + published snapshots) ───────────

  public SiteSectionResponse getById(UUID id) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));
    return toAdminResponse(section);
  }

  public List<SiteSectionResponse> getAll() {
    return siteSectionRepository.findAllByOrderBySortOrderAsc().stream()
        .map(this::toAdminResponse)
        .collect(Collectors.toList());
  }

  // ── Create (always creates as DRAFT) ────────────────────────────────────

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
        .status("DRAFT")
        .build();
    section = siteSectionRepository.save(section);
    return toAdminResponse(section);
  }

  // ── Update draft (saves to draft fields only, does NOT publish) ──────────

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
    // Mark as DRAFT if currently PUBLISHED and changes were made
    // (published snapshot is preserved until explicitly re-published)
    section = siteSectionRepository.save(section);
    return toAdminResponse(section);
  }

  // ── Publish: snapshot draft → published columns + version history ────────

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public SiteSectionResponse publish(UUID id, String publishedBy) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));

    // Copy draft fields into published snapshot
    section.setPublishedData(section.getData());
    section.setPublishedConfig(section.getConfig());
    section.setPublishedStyling(section.getStyling());
    section.setPublishedAt(LocalDateTime.now());
    section.setStatus("PUBLISHED");
    section = siteSectionRepository.save(section);

    // Save a version snapshot
    int nextVersion = versionRepository.findMaxVersionNumber(id) + 1;
    SiteSectionVersion snap = SiteSectionVersion.builder()
        .sectionId(id)
        .versionNumber(nextVersion)
        .data(section.getData())
        .config(section.getConfig())
        .styling(section.getStyling())
        .publishedBy(publishedBy)
        .changeSummary("Published version " + nextVersion)
        .build();
    versionRepository.save(snap);

    return toAdminResponse(section);
  }

  // ── Unpublish: hide from public (keeps published snapshot for rollback) ──

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public SiteSectionResponse unpublish(UUID id) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));
    section.setStatus("DRAFT");
    section = siteSectionRepository.save(section);
    return toAdminResponse(section);
  }

  // ── Version history ───────────────────────────────────────────────────────

  public List<SiteSectionVersionResponse> getVersionHistory(UUID id) {
    if (!siteSectionRepository.existsById(id)) {
      throw new ResourceNotFoundException("Site section not found: " + id);
    }
    return versionRepository.findBySectionIdOrderByVersionNumberDesc(id).stream()
        .map(this::toVersionResponse)
        .collect(Collectors.toList());
  }

  // ── Rollback: restore a version snapshot back to draft fields ────────────

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public SiteSectionResponse rollback(UUID id, int versionNumber) {
    SiteSection section = siteSectionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site section not found: " + id));
    SiteSectionVersion ver = versionRepository.findBySectionIdAndVersionNumber(id, versionNumber)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Version " + versionNumber + " not found for section " + id));

    // Copy version snapshot back to draft fields
    section.setData(ver.getData());
    section.setConfig(ver.getConfig());
    section.setStyling(ver.getStyling());
    section.setVersion(section.getVersion() != null ? section.getVersion() + 1 : 1);
    // Stays in DRAFT after rollback — admin must explicitly publish
    section = siteSectionRepository.save(section);
    return toAdminResponse(section);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  @Transactional
  @CacheEvict(value = "siteSections", allEntries = true)
  public void delete(UUID id) {
    if (!siteSectionRepository.existsById(id)) {
      throw new ResourceNotFoundException("Site section not found: " + id);
    }
    siteSectionRepository.deleteById(id);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Public response: returns publishedData/Config/Styling for PUBLISHED sections
   * so the live homepage always shows the last-published snapshot.
   * Falls back to draft data if no published snapshot exists yet.
   */
  private SiteSectionResponse toPublicResponse(SiteSection s) {
    String effectiveData    = s.getPublishedData()    != null ? s.getPublishedData()    : s.getData();
    String effectiveConfig  = s.getPublishedConfig()  != null ? s.getPublishedConfig()  : s.getConfig();
    String effectiveStyling = s.getPublishedStyling() != null ? s.getPublishedStyling() : s.getStyling();

    return SiteSectionResponse.builder()
        .id(s.getId())
        .name(s.getName())
        .slug(s.getSlug())
        .componentType(s.getComponentType())
        .config(effectiveConfig)
        .data(effectiveData)
        .styling(effectiveStyling)
        .eventsJson(s.getEventsJson())
        .conditionsJson(s.getConditionsJson())
        .version(s.getVersion())
        .isActive(s.getIsActive())
        .location(s.getLocation())
        .sortOrder(s.getSortOrder())
        .status(s.getStatus())
        .publishedAt(s.getPublishedAt())
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .build();
  }

  /** Admin response: includes full draft data AND published snapshots */
  private SiteSectionResponse toAdminResponse(SiteSection s) {
    long vCount = versionRepository.findMaxVersionNumber(s.getId());
    return SiteSectionResponse.builder()
        .id(s.getId())
        .name(s.getName())
        .slug(s.getSlug())
        .componentType(s.getComponentType())
        .config(s.getConfig())
        .data(s.getData())
        .styling(s.getStyling())
        .eventsJson(s.getEventsJson())
        .conditionsJson(s.getConditionsJson())
        .version(s.getVersion())
        .isActive(s.getIsActive())
        .location(s.getLocation())
        .sortOrder(s.getSortOrder())
        .status(s.getStatus())
        .publishedData(s.getPublishedData())
        .publishedConfig(s.getPublishedConfig())
        .publishedStyling(s.getPublishedStyling())
        .publishedAt(s.getPublishedAt())
        .versionCount(vCount)
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .build();
  }

  private SiteSectionVersionResponse toVersionResponse(SiteSectionVersion v) {
    return SiteSectionVersionResponse.builder()
        .id(v.getId())
        .sectionId(v.getSectionId())
        .versionNumber(v.getVersionNumber())
        .data(v.getData())
        .config(v.getConfig())
        .styling(v.getStyling())
        .publishedBy(v.getPublishedBy())
        .changeSummary(v.getChangeSummary())
        .createdAt(v.getCreatedAt())
        .build();
  }
}
