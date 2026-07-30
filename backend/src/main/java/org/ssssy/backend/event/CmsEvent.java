package org.ssssy.backend.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all CMS domain events.
 * Every meaningful action in the CMS extends this and is published through CmsEventBus.
 * Plugins and internal listeners subscribe using @EventListener or CmsEventBus.subscribe().
 */
public abstract class CmsEvent {

  private final UUID eventId = UUID.randomUUID();
  private final LocalDateTime occurredAt = LocalDateTime.now();

  /** Optional: the user who triggered this event (null for system-initiated events). */
  private UUID actorId;

  protected CmsEvent() {}

  protected CmsEvent(UUID actorId) {
    this.actorId = actorId;
  }

  public UUID getEventId() { return eventId; }
  public LocalDateTime getOccurredAt() { return occurredAt; }
  public UUID getActorId() { return actorId; }
  public void setActorId(UUID actorId) { this.actorId = actorId; }

  /** Human-readable event type name used for event log storage. */
  public abstract String getEventType();
}
