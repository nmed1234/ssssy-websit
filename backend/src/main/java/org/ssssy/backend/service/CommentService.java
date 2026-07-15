package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.common.HtmlSanitizer;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.UnauthorizedException;
import org.ssssy.backend.service.CommentWebSocketService;
import org.ssssy.backend.model.dto.CommentRequest;
import org.ssssy.backend.model.dto.CommentResponse;
import org.ssssy.backend.model.entity.Comment;
import org.ssssy.backend.model.entity.ContentItem;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.CommentRepository;
import org.ssssy.backend.repository.ContentItemRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.service.SystemConfigService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final ContentItemRepository contentItemRepository;
  private final UserRepository userRepository;
  private final CommentWebSocketService commentWebSocketService;
  private final SystemConfigService systemConfigService;

  public List<CommentResponse> getApprovedComments(UUID contentId) {
    return commentRepository.findByContentItemIdAndIsApprovedTrueOrderByCreatedAtAsc(contentId)
        .stream()
        .filter(c -> c.getParent() == null)
        .map(this::toResponseWithReplies)
        .collect(Collectors.toList());
  }

  public Page<CommentResponse> getAllComments(Pageable pageable) {
    return commentRepository.findAll(pageable).map(this::toResponse);
  }

  public Page<CommentResponse> getPendingComments(Pageable pageable) {
    return commentRepository.findByIsApprovedFalseOrderByCreatedAtDesc(pageable)
        .map(this::toResponse);
  }

  @Transactional
  public CommentResponse createComment(CommentRequest request, UUID userId) {
    ContentItem contentItem = contentItemRepository.findById(request.getContentId())
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + request.getContentId()));
    User author = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Comment parent = null;
    if (request.getParentId() != null) {
      parent = commentRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found: " + request.getParentId()));
    }
    if (request.getBody() == null || request.getBody().trim().isEmpty()) {
      throw new BadRequestException("Comment body is required");
    }
    Comment comment = Comment.builder()
        .contentItem(contentItem)
        .parent(parent)
        .author(author)
        .body(HtmlSanitizer.sanitize(request.getBody()))
        .isApproved(!requiresModeration())
        .build();
    comment = commentRepository.save(comment);
    commentWebSocketService.handleCommentCreated(comment, userId.toString());
    if (parent != null) {
      commentWebSocketService.handleCommentReply(comment, userId.toString());
    }
    return toResponse(comment);
  }

  @Transactional
  public CommentResponse approveComment(UUID id, UUID reviewerId) {
    Comment comment = commentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
    User reviewer = userRepository.findById(reviewerId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    comment.setIsApproved(true);
    comment.setApprovedBy(reviewer);
    comment = commentRepository.save(comment);
    return toResponse(comment);
  }

  @Transactional
  public CommentResponse updateComment(UUID id, UUID userId, String newBody) {
    Comment comment = commentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
    if (!comment.getAuthor().getId().equals(userId)) {
      throw new UnauthorizedException("You can only edit your own comments");
    }
    if (newBody == null || newBody.trim().isEmpty()) {
      throw new BadRequestException("Comment body is required");
    }
    comment.setBody(HtmlSanitizer.sanitize(newBody));
    comment = commentRepository.save(comment);
    return toResponse(comment);
  }

  @Transactional
  public void deleteComment(UUID id) {
    if (!commentRepository.existsById(id)) {
      throw new ResourceNotFoundException("Comment not found: " + id);
    }
    commentRepository.deleteById(id);
  }

  private CommentResponse toResponseWithReplies(Comment comment) {
    List<CommentResponse> replies = commentRepository.findByParentId(comment.getId())
        .stream()
        .filter(Comment::getIsApproved)
        .map(this::toResponse)
        .collect(Collectors.toList());
    CommentResponse res = toResponse(comment);
    res.setReplies(replies);
    return res;
  }

  private boolean requiresModeration() {
    try {
      var config = systemConfigService.getConfig("comments_moderation");
      return "pre".equals(config.getConfigValue());
    } catch (Exception e) {
      return true;
    }
  }

  private CommentResponse toResponse(Comment comment) {
    return CommentResponse.builder()
        .id(comment.getId())
        .contentItemId(comment.getContentItem().getId())
        .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
        .authorName(comment.getAuthor().getFirstNameEn() + " " + comment.getAuthor().getLastNameEn())
        .authorPhoto(comment.getAuthor().getAvatarUrl())
        .body(comment.getBody())
        .isApproved(comment.getIsApproved())
        .createdAt(comment.getCreatedAt())
        .updatedAt(comment.getUpdatedAt())
        .build();
  }
}
