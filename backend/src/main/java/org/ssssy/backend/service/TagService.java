package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.TagRequest;
import org.ssssy.backend.model.dto.TagResponse;
import org.ssssy.backend.model.entity.Tag;
import org.ssssy.backend.repository.TagRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

  private final TagRepository tagRepository;

  public List<TagResponse> getAllTags() {
    return tagRepository.findAll().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public TagResponse getTagById(UUID id) {
    Tag tag = tagRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
    return toResponse(tag);
  }

  @Transactional
  public TagResponse createTag(TagRequest request) {
    if (tagRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Slug already exists");
    }

    Tag tag = Tag.builder()
        .nameAr(request.getNameAr())
        .nameEn(request.getNameEn())
        .slug(request.getSlug())
        .build();

    tag = tagRepository.save(tag);
    return toResponse(tag);
  }

  @Transactional
  public TagResponse updateTag(UUID id, TagRequest request) {
    Tag tag = tagRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));

    tag.setNameAr(request.getNameAr());
    tag.setNameEn(request.getNameEn());
    tag.setSlug(request.getSlug());

    tag = tagRepository.save(tag);
    return toResponse(tag);
  }

  @Transactional
  public void deleteTag(UUID id) {
    if (!tagRepository.existsById(id)) {
      throw new ResourceNotFoundException("Tag not found: " + id);
    }
    tagRepository.deleteById(id);
  }

  private TagResponse toResponse(Tag tag) {
    return TagResponse.builder()
        .id(tag.getId())
        .nameAr(tag.getNameAr())
        .nameEn(tag.getNameEn())
        .slug(tag.getSlug())
        .createdAt(tag.getCreatedAt())
        .build();
  }
}
