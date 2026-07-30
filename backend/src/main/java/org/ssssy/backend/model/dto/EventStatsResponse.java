package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventStatsResponse {
  private long totalEvents;
  private long publishedEvents;
  private long draftEvents;
  private long archivedEvents;
  private long cancelledEvents;
  private long upcomingEvents;
  private long totalRegistrationsThisMonth;
  private long totalRegistrations;
  private Map<String, Long> registrationsByEventType;
  private String mostRegisteredEventTitle;
  private long mostRegisteredEventCount;
}
