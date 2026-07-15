package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventRequest {
  private String titleAr;
  private String titleEn;
  private String slug;
  private String description;
  private LocalDateTime eventDate;
  private LocalDateTime endDate;
  private String location;
  private String locationUrl;
  private String eventType;
  private String organizer;
  private String featuredImage;
  private Boolean isPublished;
  private String address;
  private Double latitude;
  private Double longitude;
  private Boolean isOnline;
  private String onlineUrl;
  private Integer maxParticipants;
  private LocalDateTime registrationDeadline;
  private String status;
  private String contactEmail;
}
