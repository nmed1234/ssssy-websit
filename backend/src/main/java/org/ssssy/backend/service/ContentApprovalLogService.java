package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ContentApprovalLogResponse;
import org.ssssy.backend.model.entity.ContentApprovalLog;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ContentApprovalLogRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentApprovalLogService {

  private final ContentApprovalLogRepository contentApprovalLogRepository;
  private final UserRepository userRepository;

  public List<ContentApprovalLogResponse> getByContentTypeAndId(String contentType, UUID contentId) {
    return contentApprovalLogRepository
        .findByContentTypeAndContentIdOrderByCreatedAtDesc(contentType, contentId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ContentApprovalLogResponse> getAllPaged(Pageable pageable) {
    return contentApprovalLogRepository.findAllByOrderByCreatedAtDesc(pageable)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public ContentApprovalLogResponse recordApprovalAction(
      String contentType, UUID contentId,
      String oldStatus, String newStatus,
      String comments, UUID actionById) {

    User actionBy = null;
    if (actionById != null) {
      actionBy = userRepository.findById(actionById).orElse(null);
    }

    ContentApprovalLog log = ContentApprovalLog.builder()
        .contentType(contentType)
        .contentId(contentId)
        .oldStatus(oldStatus)
        .newStatus(newStatus)
        .comments(comments)
        .actionBy(actionBy)
        .build();

    log = contentApprovalLogRepository.save(log);
    return toResponse(log);
  }

  private ContentApprovalLogResponse toResponse(ContentApprovalLog log) {
    return ContentApprovalLogResponse.builder()
        .id(log.getId())
        .contentType(log.getContentType())
        .contentId(log.getContentId())
        .oldStatus(log.getOldStatus())
        .newStatus(log.getNewStatus())
        .comments(log.getComments())
        .actionById(log.getActionBy() != null ? log.getActionBy().getId() : null)
        .actionByName(log.getActionBy() != null
            ? log.getActionBy().getFirstNameEn() + " " + log.getActionBy().getLastNameEn()
            : null)
        .createdAt(log.getCreatedAt())
        .build();
  }
}
