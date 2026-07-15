package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.dto.NotificationResponse;
import org.ssssy.backend.model.entity.ContentItem;
import org.ssssy.backend.model.entity.Notification;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final SimpMessagingTemplate messagingTemplate;

  public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
    return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        .map(this::toResponse);
  }

  public long getUnreadCount(UUID userId) {
    return notificationRepository.countByUserIdAndIsReadFalse(userId);
  }

  @Transactional
  public void markAsRead(UUID notificationId, UUID userId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));
    if (!notification.getUser().getId().equals(userId)) {
      throw new RuntimeException("Notification does not belong to this user");
    }
    notification.setIsRead(true);
    notificationRepository.save(notification);
  }

  @Transactional
  public void markAllAsRead(UUID userId) {
    notificationRepository.markAllAsRead(userId);
  }

  public void notifyWorkflowSubmitted(ContentItem item, User actor) {
    String title = "Content Submitted for Review";
    String body = actor.getFirstNameEn() + " " + actor.getLastNameEn()
        + " submitted \"" + item.getTitleEn() + "\" for review";
    String link = "/admin/workflow?contentId=" + item.getId();

    if (item.getReviewer() != null) {
      createAndPush(item.getReviewer(), "workflow", title, body, link,
          item.getId(), "content");
    }
  }

  public void notifyAssignedForReview(ContentItem item, User reviewer, User assigner) {
    String title = "Review Assignment";
    String body = "You have been assigned to review \"" + item.getTitleEn() + "\"";
    String link = "/admin/workflow?contentId=" + item.getId();
    createAndPush(reviewer, "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowApproved(ContentItem item, User reviewer) {
    String title = "Content Approved";
    String body = "\"" + item.getTitleEn() + "\" has been approved";
    String link = "/admin/content/" + item.getId();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowRejected(ContentItem item, User reviewer, String comments) {
    String title = "Content Rejected";
    String body = "\"" + item.getTitleEn() + "\" was rejected"
        + (comments != null ? ": " + comments : "");
    String link = "/admin/content/" + item.getId();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowRevisionRequested(ContentItem item, User reviewer, String comments) {
    String title = "Revision Requested";
    String body = "Revision requested for \"" + item.getTitleEn() + "\""
        + (comments != null ? ": " + comments : "");
    String link = "/admin/content/" + item.getId();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowPublished(ContentItem item, User publisher) {
    String title = "Content Published";
    String body = "\"" + item.getTitleEn() + "\" has been published";
    String link = "/content/" + item.getSlug();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowScheduled(ContentItem item, User publisher, LocalDateTime scheduledAt) {
    String title = "Content Scheduled";
    String body = "\"" + item.getTitleEn() + "\" is scheduled for " + scheduledAt.toString();
    String link = "/admin/content/" + item.getId();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void notifyWorkflowUnpublished(ContentItem item, User publisher) {
    String title = "Content Unpublished";
    String body = "\"" + item.getTitleEn() + "\" has been unpublished";
    String link = "/admin/content/" + item.getId();
    createAndPush(item.getAuthor(), "workflow", title, body, link, item.getId(), "content");
  }

  public void createNotification(User user, String type, String title, String body,
      String link, UUID referenceId, String referenceType) {
    Notification notification = Notification.builder()
        .user(user)
        .type(type)
        .title(title)
        .body(body)
        .link(link)
        .referenceId(referenceId)
        .referenceType(referenceType)
        .isRead(false)
        .isArchived(false)
        .build();
    notificationRepository.save(notification);
  }

  private void createAndPush(User user, String type, String title, String body,
      String link, UUID referenceId, String referenceType) {
    Notification notification = Notification.builder()
        .user(user)
        .type(type)
        .title(title)
        .body(body)
        .link(link)
        .referenceId(referenceId)
        .referenceType(referenceType)
        .isRead(false)
        .isArchived(false)
        .build();
    notificationRepository.save(notification);

    NotificationResponse response = toResponse(notification);
    messagingTemplate.convertAndSendToUser(
        user.getId().toString(), "/queue/notifications", response);
  }

  private NotificationResponse toResponse(Notification notification) {
    return NotificationResponse.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .body(notification.getBody())
        .link(notification.getLink())
        .referenceId(notification.getReferenceId())
        .referenceType(notification.getReferenceType())
        .isRead(notification.getIsRead())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
