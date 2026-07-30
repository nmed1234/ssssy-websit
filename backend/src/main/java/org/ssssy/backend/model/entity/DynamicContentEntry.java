package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single entry for any dynamic content type.
 * All field values are stored as JSONB in field_data.
 * The content_type_name column identifies which type this entry belongs to.
 *
 * Example: Research Paper entry
 *   content_type_name = "research-paper"
 *   field_data = {"abstract":"...", "doi":"10.1234/...", "pdf_url":"..."}
 */
@Entity
@Table(name = "dynamic_content_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DynamicContentEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "content_type_name", nullable = false, length = 100)
  private String contentTypeName;

  @Column(nullable = false, unique = true, length = 550)
  private String slug;

  /** DRAFT | PENDING_REVIEW | APPROVED | PUBLISHED | ARCHIVED */
  @Column(nullable = false, length = 30)
  @Builder.Default
  private String status = "DRAFT";

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id")
  private User author;

  @Column(name = "workflow_state", length = 50)
  private String workflowState;

  /**
   * All field values as JSON object.
   * Keys are field_name values from content_type_fields.
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "field_data", columnDefinition = "jsonb", nullable = false)
  @Builder.Default
  private String fieldData = "{}";

  @Column(name = "featured_image_url", length = 500)
  private String featuredImageUrl;

  @Column(name = "meta_title", length = 255)
  private String metaTitle;

  @Column(name = "meta_description", columnDefinition = "TEXT")
  private String metaDescription;

  @Column(name = "published_at")
  private LocalDateTime publishedAt;

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
