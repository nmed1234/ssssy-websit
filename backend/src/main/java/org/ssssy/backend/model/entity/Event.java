package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "title_ar", nullable = false, length = 500)
  private String titleAr;

  @Column(name = "title_en", length = 500)
  private String titleEn;

  @Column(nullable = false, unique = true, length = 550)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "event_date", nullable = false)
  private LocalDateTime eventDate;

  @Column(name = "end_date")
  private LocalDateTime endDate;

  @Column(length = 500)
  private String location;

  @Column(name = "location_url", length = 1000)
  private String locationUrl;

  @Column(name = "event_type", length = 50)
  private String eventType;

  @Column(length = 500)
  private String organizer;

  @Column(name = "featured_image", length = 500)
  private String featuredImage;

  @Column(name = "is_published")
  private Boolean isPublished;

  @Column(length = 500)
  private String address;

  private Double latitude;

  private Double longitude;

  @Column(name = "is_online")
  private Boolean isOnline;

  @Column(name = "online_url", length = 1000)
  private String onlineUrl;

  @Column(name = "max_participants")
  private Integer maxParticipants;

  @Column(name = "registration_deadline")
  private LocalDateTime registrationDeadline;

  @Column(length = 50)
  private String status;

  @Column(name = "contact_email", length = 320)
  private String contactEmail;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isPublished == null) isPublished = false;
    if (isOnline == null) isOnline = false;
    if (status == null) status = "DRAFT";
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
