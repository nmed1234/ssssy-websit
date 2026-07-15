package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.SeoMetadataRequest;
import org.ssssy.backend.model.dto.SeoMetadataResponse;
import org.ssssy.backend.model.entity.SeoMetadata;
import org.ssssy.backend.repository.SeoMetadataRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeoMetadataService {

  private final SeoMetadataRepository seoMetadataRepository;

  public SeoMetadataResponse getSeo(String entityType, UUID entityId) {
    SeoMetadata seo = seoMetadataRepository.findByEntityTypeAndEntityId(entityType, entityId)
        .orElseThrow(() -> new ResourceNotFoundException("SEO metadata not found"));
    return toResponse(seo);
  }

  @Transactional
  public SeoMetadataResponse saveSeo(String entityType, UUID entityId, SeoMetadataRequest request) {
    SeoMetadata seo = seoMetadataRepository.findByEntityTypeAndEntityId(entityType, entityId)
        .orElse(SeoMetadata.builder()
            .entityType(entityType)
            .entityId(entityId)
            .build());
    seo.setMetaTitle(request.getMetaTitle());
    seo.setMetaDescription(request.getMetaDescription());
    seo.setOgTitle(request.getOgTitle());
    seo.setOgDescription(request.getOgDescription());
    seo.setOgImageUrl(request.getOgImageUrl());
    seo.setCanonicalUrl(request.getCanonicalUrl());
    seo.setRobots(request.getRobots());
    seo = seoMetadataRepository.save(seo);
    return toResponse(seo);
  }

  @Transactional
  public void deleteSeo(UUID id) {
    if (!seoMetadataRepository.existsById(id)) {
      throw new ResourceNotFoundException("SEO metadata not found: " + id);
    }
    seoMetadataRepository.deleteById(id);
  }

  private SeoMetadataResponse toResponse(SeoMetadata seo) {
    return SeoMetadataResponse.builder()
        .id(seo.getId())
        .entityType(seo.getEntityType())
        .entityId(seo.getEntityId())
        .metaTitle(seo.getMetaTitle())
        .metaDescription(seo.getMetaDescription())
        .ogTitle(seo.getOgTitle())
        .ogDescription(seo.getOgDescription())
        .ogImageUrl(seo.getOgImageUrl())
        .canonicalUrl(seo.getCanonicalUrl())
        .robots(seo.getRobots())
        .createdAt(seo.getCreatedAt())
        .updatedAt(seo.getUpdatedAt())
        .build();
  }
}
