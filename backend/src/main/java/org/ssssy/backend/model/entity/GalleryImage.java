package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gallery_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryImage {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "album_id", nullable = false)
  private GalleryAlbum album;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "media_file_id", nullable = false)
  private MediaFile mediaFile;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder;

  @Column(name = "title_ar", length = 500)
  private String titleAr;

  @Column(name = "title_en", length = 500)
  private String titleEn;

  @Column(name = "description_ar", columnDefinition = "TEXT")
  private String descriptionAr;

  @Column(name = "description_en", columnDefinition = "TEXT")
  private String descriptionEn;

  @Column(name = "alt_text", length = 500)
  private String altText;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "before_media_file_id")
  private MediaFile beforeMediaFile;

  @Column(name = "hotspot_data", columnDefinition = "jsonb")
  private String hotspotData;

  @Column(name = "exif_data", columnDefinition = "jsonb")
  private String exifData;

  @Column(name = "color_palette", columnDefinition = "jsonb")
  private String colorPalette;

  @Column(name = "is_cover", nullable = false)
  private Boolean isCover;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (sortOrder == null) sortOrder = 0;
    if (isCover == null) isCover = false;
  }
}
