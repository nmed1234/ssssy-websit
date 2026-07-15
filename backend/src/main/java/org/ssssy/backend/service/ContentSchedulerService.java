package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.ContentItem;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.model.entity.WorkflowLog;
import org.ssssy.backend.repository.ContentItemRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.repository.WorkflowLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentSchedulerService {

  private final ContentItemRepository contentItemRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final WorkflowLogRepository workflowLogRepository;

  @Scheduled(fixedRate = 60000)
  @Transactional
  public void publishScheduledContent() {
    List<ContentItem> pendingItems = contentItemRepository.findPendingScheduledContent(LocalDateTime.now());

    if (pendingItems.isEmpty()) {
      return;
    }

    log.info("Publishing {} scheduled content items", pendingItems.size());

    User systemUser = userRepository.findByUsername("system")
        .orElseGet(() -> userRepository.findByUsername("admin")
            .orElse(null));

    if (systemUser == null) {
      log.warn("No system or admin user found for scheduled publishing");
      return;
    }

    for (ContentItem item : pendingItems) {
      try {
        item.setStatus("PUBLISHED");
        item.setPublishedAt(LocalDateTime.now());
        item.setPublisher(systemUser);
        contentItemRepository.save(item);

        WorkflowLog logEntry = WorkflowLog.builder()
            .content(item)
            .fromStatus("SCHEDULED")
            .toStatus("PUBLISHED")
            .action("AUTO_PUBLISH")
            .actor(systemUser)
            .comments("Automatically published by scheduled task")
            .build();
        workflowLogRepository.save(logEntry);

        notificationService.notifyWorkflowPublished(item, systemUser);

        log.info("Published scheduled content: {} ({})", item.getTitleEn(), item.getId());
      } catch (Exception e) {
        log.error("Failed to publish scheduled content {}: {}", item.getId(), e.getMessage());
      }
    }
  }
}
