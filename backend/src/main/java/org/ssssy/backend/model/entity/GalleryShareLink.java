package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gallery_share_links")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryShareLink {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id", nullable = false)
  private GalleryAlbum album;

  @Column(nullable = false, length = 64, unique = true)
  private String token;

  @Column(name = "expires_at")
  private LocalDateTime expiresAt;

  @Column(name = "max_views")
  private Integer maxViews;

  @Column(name = "current_views", nullable = false)
  private Integer currentViews;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (currentViews == null) currentViews = 0;
    if (isActive == null) isActive = true;
  }
}
