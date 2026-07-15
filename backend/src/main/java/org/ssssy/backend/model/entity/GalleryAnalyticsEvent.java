package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gallery_analytics_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryAnalyticsEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id")
  private GalleryAlbum album;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "image_id")
  private GalleryImage image;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "share_link_id")
  private GalleryShareLink shareLink;

  @Column(name = "event_type", nullable = false, length = 20)
  private String eventType;

  @Column(name = "ip_address", length = 45)
  private String ipAddress;

  @Column(name = "user_agent", columnDefinition = "TEXT")
  private String userAgent;

  @Column(length = 500)
  private String referer;

  @Column(name = "session_id", length = 100)
  private String sessionId;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
