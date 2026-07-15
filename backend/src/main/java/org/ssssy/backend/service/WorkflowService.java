package org.ssssy.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.audit.AuditService;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.WorkflowException;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.model.dto.WorkflowLogResponse;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

  private final ContentItemRepository contentItemRepository;
  private final ContentVersionRepository contentVersionRepository;
  private final WorkflowLogRepository workflowLogRepository;
  private final UserRepository userRepository;
  private final ContentService contentService;
  private final NotificationService notificationService;
  private final AuditService auditService;
  private final JavaMailSender mailSender;

  private static final Set<String> DRAFT = Set.of("DRAFT");
  private static final Set<String> SUBMITTED = Set.of("SUBMITTED");
  private static final Set<String> IN_REVIEW = Set.of("IN_REVIEW");
  private static final Set<String> APPROVED = Set.of("APPROVED");
  private static final Set<String> REJECTED = Set.of("REJECTED");
  private static final Set<String> REVISION_REQUESTED = Set.of("REVISION_REQUESTED");
  private static final Set<String> PUBLISHED = Set.of("PUBLISHED");
  private static final Set<String> SCHEDULED = Set.of("SCHEDULED");
  private static final Set<String> ARCHIVED = Set.of("ARCHIVED");

  private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.ofEntries(
      Map.entry("DRAFT", Set.of("SUBMITTED")),
      Map.entry("SUBMITTED", Set.of("IN_REVIEW")),
      Map.entry("IN_REVIEW", Set.of("APPROVED", "REJECTED", "REVISION_REQUESTED")),
      Map.entry("REVISION_REQUESTED", Set.of("DRAFT", "SUBMITTED")),
      Map.entry("REJECTED", Set.of("DRAFT", "SUBMITTED")),
      Map.entry("APPROVED", Set.of("PUBLISHED", "SCHEDULED")),
      Map.entry("SCHEDULED", Set.of("PUBLISHED")),
      Map.entry("PUBLISHED", Set.of("ARCHIVED"))
  );

  @Transactional
  public ContentResponse submit(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "SUBMITTED");
    validateAuthor(item, user);
    logWorkflow(item, "SUBMIT", user, null, "SUBMITTED", comments);
    item.setStatus("SUBMITTED");
    item = contentItemRepository.save(item);
    saveVersion(item, user, "Submitted for review");
    notificationService.notifyWorkflowSubmitted(item, user);
    sendWorkflowEmail(item.getReviewer(), "Review Requested",
        "Content \"" + item.getTitleEn() + "\" has been submitted for review by "
        + user.getFirstNameEn() + " " + user.getLastNameEn() + ".",
        "/admin/workflow");
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse assignReviewer(UUID contentId, UUID reviewerId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    User reviewer = getUser(reviewerId);
    validateTransition(item, "IN_REVIEW");
    logWorkflow(item, "ASSIGN_REVIEWER", user, reviewer, "IN_REVIEW", comments);
    item.setReviewer(reviewer);
    item.setStatus("IN_REVIEW");
    item = contentItemRepository.save(item);
    notificationService.notifyAssignedForReview(item, reviewer, user);
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse approve(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "APPROVED");
    validateReviewer(item, user);
    logWorkflow(item, "APPROVE", user, null, "APPROVED", comments);
    item.setStatus("APPROVED");
    item = contentItemRepository.save(item);
    notificationService.notifyWorkflowApproved(item, user);
    sendWorkflowEmail(item.getAuthor(), "Content Approved",
        "Your content \"" + item.getTitleEn() + "\" has been approved and is ready to publish.",
        "/admin/content/" + item.getId());
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse reject(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "REJECTED");
    validateReviewer(item, user);
    logWorkflow(item, "REJECT", user, null, "REJECTED", comments);
    item.setStatus("REJECTED");
    item = contentItemRepository.save(item);
    notificationService.notifyWorkflowRejected(item, user, comments);
    sendWorkflowEmail(item.getAuthor(), "Content Rejected",
        "Your content \"" + item.getTitleEn() + "\" was rejected."
        + (comments != null && !comments.isBlank() ? "\n\nFeedback: " + comments : ""),
        "/admin/content/" + item.getId());
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse requestRevision(UUID contentId, UUID userId, String comments) {
    if (comments == null || comments.isBlank()) {
      throw new BadRequestException("Comments are required when requesting revision");
    }
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "REVISION_REQUESTED");
    validateReviewer(item, user);
    logWorkflow(item, "REQUEST_REVISION", user, null, "REVISION_REQUESTED", comments);
    item.setStatus("REVISION_REQUESTED");
    item = contentItemRepository.save(item);
    notificationService.notifyWorkflowRevisionRequested(item, user, comments);
    sendWorkflowEmail(item.getAuthor(), "Revision Requested",
        "Revision has been requested for \"" + item.getTitleEn() + "\".\n\nNotes: " + comments,
        "/admin/content/" + item.getId());
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse publish(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "PUBLISHED");
    logWorkflow(item, "PUBLISH", user, null, "PUBLISHED", comments);
    item.setStatus("PUBLISHED");
    item.setPublisher(user);
    item.setPublishedAt(LocalDateTime.now());
    item = contentItemRepository.save(item);
    saveVersion(item, user, "Published");
    notificationService.notifyWorkflowPublished(item, user);
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse schedule(UUID contentId, LocalDateTime scheduledAt, UUID userId, String comments) {
    if (scheduledAt == null) {
      throw new BadRequestException("Scheduled date is required");
    }
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "SCHEDULED");
    logWorkflow(item, "SCHEDULE", user, null, "SCHEDULED", comments);
    item.setStatus("SCHEDULED");
    item.setScheduledAt(scheduledAt);
    item = contentItemRepository.save(item);
    notificationService.notifyWorkflowScheduled(item, user, scheduledAt);
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse unpublish(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    validateTransition(item, "ARCHIVED");
    logWorkflow(item, "UNPUBLISH", user, null, "ARCHIVED", comments);
    item.setStatus("ARCHIVED");
    item.setArchivedAt(LocalDateTime.now());
    item = contentItemRepository.save(item);
    notificationService.notifyWorkflowUnpublished(item, user);
    return contentService.toResponse(item);
  }

  @Transactional
  public ContentResponse backToDraft(UUID contentId, UUID userId, String comments) {
    ContentItem item = getContent(contentId);
    User user = getUser(userId);
    if (!Set.of("REVISION_REQUESTED", "REJECTED").contains(item.getStatus())) {
      throw new WorkflowException("Can only move back to draft from REVISION_REQUESTED or REJECTED");
    }
    validateAuthorOrReviewer(item, user);
    logWorkflow(item, "BACK_TO_DRAFT", user, null, "DRAFT", comments);
    item.setStatus("DRAFT");
    item = contentItemRepository.save(item);
    return contentService.toResponse(item);
  }

  public List<WorkflowLogResponse> getWorkflowLogs(UUID contentId) {
    return workflowLogRepository.findByContentIdOrderByCreatedAtDesc(contentId)
        .stream()
        .map(this::toLogResponse)
        .collect(Collectors.toList());
  }

  public List<ContentResponse> getPendingReviews(UUID reviewerId) {
    return contentItemRepository.findByReviewerIdAndStatus(reviewerId, "IN_REVIEW")
        .stream()
        .map(contentService::toResponse)
        .collect(Collectors.toList());
  }

  public List<ContentResponse> getApprovedItems() {
    return contentItemRepository.findByStatus("APPROVED")
        .stream()
        .map(contentService::toResponse)
        .collect(Collectors.toList());
  }

  public List<ContentResponse> getSubmittedItems() {
    return contentItemRepository.findByStatus("SUBMITTED")
        .stream()
        .map(contentService::toResponse)
        .collect(Collectors.toList());
  }

  private ContentItem getContent(UUID id) {
    ContentItem item = contentItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    if (item.getDeletedAt() != null) {
      throw new BadRequestException("Content has been deleted");
    }
    return item;
  }

  private User getUser(UUID id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
  }

  private void validateTransition(ContentItem item, String targetStatus) {
    Set<String> allowed = ALLOWED_TRANSITIONS.get(item.getStatus());
    if (allowed == null || !allowed.contains(targetStatus)) {
      throw new WorkflowException(
          "Cannot transition from " + item.getStatus() + " to " + targetStatus);
    }
  }

  private void validateAuthor(ContentItem item, User user) {
    if (!item.getAuthor().getId().equals(user.getId())) {
      throw new WorkflowException("Only the author can submit this content");
    }
  }

  private void validateReviewer(ContentItem item, User user) {
    if (item.getReviewer() != null && !item.getReviewer().getId().equals(user.getId())) {
      throw new WorkflowException("You are not the assigned reviewer for this content");
    }
  }

  private void validateAuthorOrReviewer(ContentItem item, User user) {
    boolean isAuthor = item.getAuthor().getId().equals(user.getId());
    boolean isReviewer = item.getReviewer() != null && item.getReviewer().getId().equals(user.getId());
    if (!isAuthor && !isReviewer) {
      throw new WorkflowException("Only the author or reviewer can perform this action");
    }
  }

  private void logWorkflow(ContentItem item, String action, User actor, User assignee,
      String toStatus, String comments) {
    WorkflowLog log = WorkflowLog.builder()
        .content(item)
        .fromStatus(item.getStatus())
        .toStatus(toStatus)
        .action(action)
        .actor(actor)
        .assignee(assignee)
        .comments(comments)
        .build();
    workflowLogRepository.save(log);
  }

  private void saveVersion(ContentItem item, User user, String changeSummary) {
    ContentVersion version = ContentVersion.builder()
        .content(item)
        .version(item.getVersion())
        .titleAr(item.getTitleAr())
        .titleEn(item.getTitleEn())
        .excerpt(item.getExcerpt())
        .body(item.getBody())
        .status(item.getStatus())
        .changedBy(user)
        .changeSummary(changeSummary)
        .build();
    contentVersionRepository.save(version);
  }

  private WorkflowLogResponse toLogResponse(WorkflowLog log) {
    return WorkflowLogResponse.builder()
        .id(log.getId())
        .contentId(log.getContent().getId())
        .fromStatus(log.getFromStatus())
        .toStatus(log.getToStatus())
        .action(log.getAction())
        .actorId(log.getActor().getId())
        .actorName(log.getActor().getFirstNameEn() + " " + log.getActor().getLastNameEn())
        .assigneeId(log.getAssignee() != null ? log.getAssignee().getId() : null)
        .assigneeName(log.getAssignee() != null ?
            log.getAssignee().getFirstNameEn() + " " + log.getAssignee().getLastNameEn() : null)
        .comments(log.getComments())
        .createdAt(log.getCreatedAt())
        .build();
  }

  @Async
  protected void sendWorkflowEmail(User recipient, String subject, String body, String link) {
    if (recipient == null || recipient.getEmail() == null) return;
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
      helper.setTo(recipient.getEmail());
      helper.setSubject("[SSSSY] " + subject);
      String html = "<p>" + body.replace("\n", "<br>") + "</p>"
          + "<p><a href=\"" + link + "\">View in Admin Panel</a></p>";
      helper.setText(html, true);
      mailSender.send(msg);
      log.info("Workflow email sent to {} — {}", recipient.getEmail(), subject);
    } catch (Exception e) {
      log.warn("Failed to send workflow email to {}: {}", recipient.getEmail(), e.getMessage());
    }
  }
}
