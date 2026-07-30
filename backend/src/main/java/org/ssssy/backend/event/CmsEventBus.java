package org.ssssy.backend.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.ssssy.backend.model.entity.CmsEventLog;
import org.ssssy.backend.repository.CmsEventLogRepository;

/**
 * Central event bus for all CMS domain events.
 *
 * Usage — publishing:
 *   cmsEventBus.publish(new ContentPublishedEvent(...));
 *
 * Usage — listening (any Spring @Component):
 *   @EventListener
 *   public void onContentPublished(ContentPublishedEvent event) { ... }
 *
 * All events are asynchronously persisted to the cms_event_log table for audit.
 * Listeners are invoked synchronously within the same transaction unless they declare @Async.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CmsEventBus {

  private final ApplicationEventPublisher publisher;
  private final CmsEventLogRepository eventLogRepository;

  /**
   * Publish a CMS event. Fires synchronous Spring listeners first, then logs asynchronously.
   */
  public void publish(CmsEvent event) {
    log.debug("CmsEventBus publishing {} eventId={}", event.getEventType(), event.getEventId());
    publisher.publishEvent(event);
    logEventAsync(event);
  }

  @Async("ssssyTaskExecutor")
  protected void logEventAsync(CmsEvent event) {
    try {
      CmsEventLog log = CmsEventLog.builder()
          .eventId(event.getEventId())
          .eventType(event.getEventType())
          .actorId(event.getActorId())
          .occurredAt(event.getOccurredAt())
          .build();
      eventLogRepository.save(log);
    } catch (Exception ex) {
      log.warn("Failed to persist CmsEventLog for eventType={}: {}", event.getEventType(), ex.getMessage());
    }
  }
}
