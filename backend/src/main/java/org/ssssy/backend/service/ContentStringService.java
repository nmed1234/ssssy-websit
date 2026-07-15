package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ContentStringRequest;
import org.ssssy.backend.model.dto.ContentStringResponse;
import org.ssssy.backend.model.entity.ContentString;
import org.ssssy.backend.repository.ContentStringRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentStringService {

  private final ContentStringRepository contentStringRepository;

  public List<ContentStringResponse> getAllStrings() {
    return contentStringRepository.findAllByOrderByStringKey()
        .stream().map(this::toResponse).collect(Collectors.toList());
  }

  @Cacheable(value = "contentStrings", key = "'all'")
  public List<ContentStringResponse> getCachedAllStrings() {
    return getAllStrings();
  }

  @Cacheable(value = "contentStrings", key = "'group_' + #group")
  public List<ContentStringResponse> getStringsByGroup(String group) {
    return contentStringRepository.findByStringGroupOrderByStringKey(group)
        .stream().map(this::toResponse).collect(Collectors.toList());
  }

  public ContentStringResponse getStringById(UUID id) {
    ContentString cs = contentStringRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content string not found: " + id));
    return toResponse(cs);
  }

  public ContentStringResponse getStringByKey(String key) {
    ContentString cs = contentStringRepository.findByStringKey(key)
        .orElseThrow(() -> new ResourceNotFoundException("Content string not found: " + key));
    return toResponse(cs);
  }

  @Cacheable(value = "contentStrings", key = "'map_en'")
  public Map<String, String> getStringMapEn() {
    return contentStringRepository.findAll().stream()
        .collect(Collectors.toMap(ContentString::getStringKey, ContentString::getValueEn,
            (a, b) -> b, LinkedHashMap::new));
  }

  @Cacheable(value = "contentStrings", key = "'map_ar'")
  public Map<String, String> getStringMapAr() {
    return contentStringRepository.findAll().stream()
        .collect(Collectors.toMap(ContentString::getStringKey, ContentString::getValueAr,
            (a, b) -> b, LinkedHashMap::new));
  }

  public List<String> getAllGroups() {
    return contentStringRepository.findAll().stream()
        .map(ContentString::getStringGroup)
        .distinct()
        .sorted()
        .collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "contentStrings", allEntries = true)
  public ContentStringResponse createString(ContentStringRequest request) {
    if (contentStringRepository.existsByStringKey(request.getStringKey())) {
      throw new BadRequestException("Content string key already exists: " + request.getStringKey());
    }
    ContentString cs = ContentString.builder()
        .stringKey(request.getStringKey())
        .valueEn(request.getValueEn() != null ? request.getValueEn() : "")
        .valueAr(request.getValueAr() != null ? request.getValueAr() : "")
        .stringGroup(request.getStringGroup() != null ? request.getStringGroup() : "general")
        .description(request.getDescription())
        .build();
    cs = contentStringRepository.save(cs);
    return toResponse(cs);
  }

  @Transactional
  @CacheEvict(value = "contentStrings", allEntries = true)
  public ContentStringResponse updateString(UUID id, ContentStringRequest request) {
    ContentString cs = contentStringRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content string not found: " + id));
    if (request.getStringKey() != null) {
      if (!request.getStringKey().equals(cs.getStringKey())
          && contentStringRepository.existsByStringKey(request.getStringKey())) {
        throw new BadRequestException("Content string key already exists: " + request.getStringKey());
      }
      cs.setStringKey(request.getStringKey());
    }
    if (request.getValueEn() != null) cs.setValueEn(request.getValueEn());
    if (request.getValueAr() != null) cs.setValueAr(request.getValueAr());
    if (request.getStringGroup() != null) cs.setStringGroup(request.getStringGroup());
    if (request.getDescription() != null) cs.setDescription(request.getDescription());
    cs = contentStringRepository.save(cs);
    return toResponse(cs);
  }

  @Transactional
  @CacheEvict(value = "contentStrings", allEntries = true)
  public void deleteString(UUID id) {
    if (!contentStringRepository.existsById(id)) {
      throw new ResourceNotFoundException("Content string not found: " + id);
    }
    contentStringRepository.deleteById(id);
  }

  private ContentStringResponse toResponse(ContentString cs) {
    return ContentStringResponse.builder()
        .id(cs.getId())
        .stringKey(cs.getStringKey())
        .valueEn(cs.getValueEn())
        .valueAr(cs.getValueAr())
        .stringGroup(cs.getStringGroup())
        .description(cs.getDescription())
        .createdAt(cs.getCreatedAt())
        .updatedAt(cs.getUpdatedAt())
        .build();
  }
}
