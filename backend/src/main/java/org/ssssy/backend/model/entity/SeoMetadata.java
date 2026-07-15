package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seo_metadata", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"entity_type", "entity_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeoMetadata {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "entity_type", nullable = false, length = 100)
  private String entityType;

  @Column(name = "entity_id", nullable = false)
  private UUID entityId;

  @Column(name = "meta_title", length = 500)
  private String metaTitle;

  @Column(name = "meta_description", columnDefinition = "TEXT")
  private String metaDescription;

  @Column(name = "og_title", length = 500)
  private String ogTitle;

  @Column(name = "og_description", columnDefinition = "TEXT")
  private String ogDescription;

  @Column(name = "og_image_url", length = 500)
  private String ogImageUrl;

  @Column(name = "canonical_url", length = 1000)
  private String canonicalUrl;

  @Column(length = 100)
  private String robots;

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
