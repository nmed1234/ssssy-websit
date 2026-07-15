package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.ssssy.backend.model.dto.AuditLogResponse;
import org.ssssy.backend.model.dto.DashboardStatsResponse;
import org.ssssy.backend.repository.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final UserRepository userRepository;
  private final ContentItemRepository contentItemRepository;
  private final CategoryRepository categoryRepository;
  private final TagRepository tagRepository;
  private final MediaFileRepository mediaFileRepository;
  private final AuditLogRepository auditLogRepository;

  public DashboardStatsResponse getStats() {
    return DashboardStatsResponse.builder()
        .totalMembers(userRepository.count())
        .publishedArticles(contentItemRepository.countByStatus("PUBLISHED"))
        .draftArticles(contentItemRepository.countByStatus("DRAFT"))
        .pendingReviews(contentItemRepository.countByStatus("IN_REVIEW"))
        .totalContent(contentItemRepository.count())
        .totalCategories(categoryRepository.count())
        .totalTags(tagRepository.count())
        .totalMediaFiles(mediaFileRepository.count())
        .storageUsedBytes(mediaFileRepository.sumSizeBytes() != null
            ? mediaFileRepository.sumSizeBytes() : 0L)
        .build();
  }

  public long getTotalMembers() {
    return userRepository.count();
  }

  public long getPublishedArticles() {
    return contentItemRepository.countByStatus("PUBLISHED");
  }

  public long getDraftArticles() {
    return contentItemRepository.countByStatus("DRAFT");
  }

  public long getPendingReviews() {
    return contentItemRepository.countByStatus("IN_REVIEW");
  }

  public long getSubmittedItems() {
    return contentItemRepository.countByStatus("SUBMITTED");
  }

  public long getApprovedItems() {
    return contentItemRepository.countByStatus("APPROVED");
  }

  public List<AuditLogResponse> getRecentActivity(int limit) {
    return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
        .stream()
        .map(log -> AuditLogResponse.builder()
            .id(log.getId())
            .userId(log.getUserId())
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .oldValue(log.getOldValue())
            .newValue(log.getNewValue())
            .ipAddress(log.getIpAddress())
            .userAgent(log.getUserAgent())
            .createdAt(log.getCreatedAt())
            .build())
        .collect(Collectors.toList());
  }

  public Map<String, Long> getContentByStatus() {
    Map<String, Long> counts = new LinkedHashMap<>();
    counts.put("DRAFT", contentItemRepository.countByStatus("DRAFT"));
    counts.put("SUBMITTED", contentItemRepository.countByStatus("SUBMITTED"));
    counts.put("IN_REVIEW", contentItemRepository.countByStatus("IN_REVIEW"));
    counts.put("APPROVED", contentItemRepository.countByStatus("APPROVED"));
    counts.put("PUBLISHED", contentItemRepository.countByStatus("PUBLISHED"));
    counts.put("ARCHIVED", contentItemRepository.countByStatus("ARCHIVED"));
    return counts;
  }
}
