package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gallery_albums")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryAlbum {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "title_ar", nullable = false, length = 500)
  private String titleAr;

  @Column(name = "title_en", nullable = false, length = 500)
  private String titleEn;

  @Column(name = "description_ar", columnDefinition = "TEXT")
  private String descriptionAr;

  @Column(name = "description_en", columnDefinition = "TEXT")
  private String descriptionEn;

  @Column(nullable = false, length = 500, unique = true)
  private String slug;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cover_image_id")
  private MediaFile coverImage;

  @Column(name = "is_published", nullable = false)
  private Boolean isPublished;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder;

  @Column(name = "password_hash", length = 255)
  private String passwordHash;

  @Column(name = "is_password_protected", nullable = false)
  private Boolean isPasswordProtected;

  @Column(name = "watermark_overrides", columnDefinition = "jsonb")
  private String watermarkOverrides;

  @Column(name = "settings_overrides", columnDefinition = "jsonb")
  private String settingsOverrides;

  @Column(name = "view_count", nullable = false)
  private Integer viewCount;

  @Column(name = "download_count", nullable = false)
  private Integer downloadCount;

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
    if (sortOrder == null) sortOrder = 0;
    if (isPasswordProtected == null) isPasswordProtected = false;
    if (viewCount == null) viewCount = 0;
    if (downloadCount == null) downloadCount = 0;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
