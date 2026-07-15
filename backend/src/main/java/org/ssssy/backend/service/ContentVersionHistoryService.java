package org.ssssy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ContentVersionHistoryResponse;
import org.ssssy.backend.model.entity.ContentItem;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ContentItemRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manages generic content version history entries stored in content_version_history table.
 * Tracks full JSON snapshots of any content entity for diff/rollback.
 */
@Service
@RequiredArgsConstructor
public class ContentVersionHistoryService {

  private final org.ssssy.backend.repository.ContentVersionHistoryRepository contentVersionHistoryRepository;
  private final ContentItemRepository contentItemRepository;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  public List<ContentVersionHistoryResponse> getHistory(String contentType, UUID contentId) {
    return contentVersionHistoryRepository
        .findByContentTypeAndContentIdOrderByVersionNumberDesc(contentType, contentId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public ContentVersionHistoryResponse getVersion(String contentType, UUID contentId, int versionNumber) {
    return contentVersionHistoryRepository
        .findByContentTypeAndContentIdAndVersionNumber(contentType, contentId, versionNumber)
        .map(this::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Version " + versionNumber + " not found for " + contentType + "/" + contentId));
  }

  @Transactional
  public ContentVersionHistoryResponse snapshot(
      String contentType, UUID contentId,
      Object dataObject, String changeDescription, UUID createdById) {

    int nextVersion = contentVersionHistoryRepository
        .countByContentTypeAndContentId(contentType, contentId) + 1;

    User createdBy = null;
    if (createdById != null) {
      createdBy = userRepository.findById(createdById).orElse(null);
    }

    String dataSnapshot;
    try {
      dataSnapshot = objectMapper.writeValueAsString(dataObject);
    } catch (Exception e) {
      dataSnapshot = dataObject.toString();
    }

    org.ssssy.backend.model.entity.ContentVersionHistory entry =
        org.ssssy.backend.model.entity.ContentVersionHistory.builder()
            .contentType(contentType)
            .contentId(contentId)
            .versionNumber(nextVersion)
            .dataSnapshot(dataSnapshot)
            .changeDescription(changeDescription)
            .createdBy(createdBy)
            .build();

    entry = contentVersionHistoryRepository.save(entry);
    return toResponse(entry);
  }

  @Transactional
  public Map<String, Object> rollbackContentItem(UUID contentId, int versionNumber, UUID userId) {
    ContentItem item = contentItemRepository.findById(contentId)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));

    org.ssssy.backend.model.entity.ContentVersionHistory versionEntry =
        contentVersionHistoryRepository
            .findByContentTypeAndContentIdAndVersionNumber("content_item", contentId, versionNumber)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Version " + versionNumber + " not found for content/" + contentId));

    try {
      Map<String, Object> snapshot = objectMapper.readValue(
          versionEntry.getDataSnapshot(), Map.class);

      if (snapshot.containsKey("titleAr")) item.setTitleAr((String) snapshot.get("titleAr"));
      if (snapshot.containsKey("titleEn")) item.setTitleEn((String) snapshot.get("titleEn"));
      if (snapshot.containsKey("excerpt")) item.setExcerpt((String) snapshot.get("excerpt"));
      if (snapshot.containsKey("body")) item.setBody((String) snapshot.get("body"));

      item.setVersion(item.getVersion() + 1);
      contentItemRepository.save(item);

      // Record rollback as a new snapshot
      snapshot("content_item", contentId, snapshot,
          "Rolled back to version " + versionNumber, userId);

      Map<String, Object> result = new HashMap<>();
      result.put("message", "Rolled back to version " + versionNumber);
      result.put("newVersion", item.getVersion());
      return result;
    } catch (Exception e) {
      throw new BadRequestException("Failed to apply rollback: " + e.getMessage());
    }
  }

  private ContentVersionHistoryResponse toResponse(
      org.ssssy.backend.model.entity.ContentVersionHistory entry) {
    return ContentVersionHistoryResponse.builder()
        .id(entry.getId())
        .contentType(entry.getContentType())
        .contentId(entry.getContentId())
        .versionNumber(entry.getVersionNumber())
        .dataSnapshot(entry.getDataSnapshot())
        .changeDescription(entry.getChangeDescription())
        .createdById(entry.getCreatedBy() != null ? entry.getCreatedBy().getId() : null)
        .createdByName(entry.getCreatedBy() != null
            ? entry.getCreatedBy().getFirstNameEn() + " " + entry.getCreatedBy().getLastNameEn()
            : null)
        .createdAt(entry.getCreatedAt())
        .build();
  }
}
