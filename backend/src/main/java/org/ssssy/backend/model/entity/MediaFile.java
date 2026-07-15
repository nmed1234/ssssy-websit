package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "media_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaFile {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 500)
  private String filename;

  @Column(name = "original_filename", nullable = false, length = 500)
  private String originalFilename;

  @Column(name = "mime_type", nullable = false, length = 100)
  private String mimeType;

  @Column(name = "size_bytes", nullable = false)
  private Long sizeBytes;

  @Column(name = "storage_path", nullable = false, length = 1000)
  private String storagePath;

  @Column(length = 1000)
  private String url;

  @Column(name = "thumbnail_url", length = 1000)
  private String thumbnailUrl;

  @Column
  private Integer width;

  @Column
  private Integer height;

  @Column(name = "alt_text_ar", length = 500)
  private String altTextAr;

  @Column(name = "alt_text_en", length = 500)
  private String altTextEn;

  // -------------------------------------------------------------------------
  // CMS Foundation Stage 1 — new columns added in V39 migration (task 1.4)
  // Requirements: 18.2, 18.5
  // -------------------------------------------------------------------------

  /** Caption for the image in English (max 500 chars). */
  @Column(name = "caption_en", length = 500)
  private String captionEn;

  /** Caption for the image in Arabic (max 500 chars). */
  @Column(name = "caption_ar", length = 500)
  private String captionAr;

  /**
   * Comma-separated keyword tags for FTS and manual filtering.
   * The DB GENERATED column fts_index is built from this field;
   * do NOT map fts_index — it is DB-generated and read-only.
   */
  @Column(name = "tags")
  private String tags;

  /**
   * The user who uploaded this file (from JWT principal at upload time).
   * Distinct from the legacy user_id FK which may reference a different
   * relationship.
   */
  @Column(name = "uploader_id")
  private UUID uploaderId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id")
  private MediaFolder folder;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
