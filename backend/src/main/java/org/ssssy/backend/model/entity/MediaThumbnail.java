package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "media_thumbnails")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaThumbnail {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "media_file_id", nullable = false)
  private MediaFile mediaFile;

  @Column(name = "thumbnail_path", nullable = false, length = 1000)
  private String thumbnailPath;

  @Column(nullable = false)
  private Integer width;

  @Column(nullable = false)
  private Integer height;

  @Column(name = "mime_type", length = 100)
  private String mimeType;

  @Column(name = "size_bytes")
  private Long sizeBytes;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
