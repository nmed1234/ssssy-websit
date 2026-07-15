package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "content_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentItem {

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
  private String excerpt;

  @Column(columnDefinition = "jsonb")
  private String body;

  @Column(name = "content_type", nullable = false, length = 50)
  private String contentType;

  @Column(nullable = false, length = 30)
  private String status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewer_id")
  private User reviewer;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "publisher_id")
  private User publisher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private Category category;

  @Column(name = "featured_image", length = 500)
  private String featuredImage;

  @Column(name = "is_featured")
  private Boolean isFeatured;

  @Column(name = "is_pinned")
  private Boolean isPinned;

  @Column(name = "is_member_only")
  private Boolean isMemberOnly;

  @Column(name = "published_at")
  private LocalDateTime publishedAt;

  @Column(name = "scheduled_at")
  private LocalDateTime scheduledAt;

  @Column(name = "archived_at")
  private LocalDateTime archivedAt;

  @Column(name = "view_count")
  private Long viewCount;

  @Column(name = "meta_title", length = 200)
  private String metaTitle;

  @Column(name = "meta_description", length = 500)
  private String metaDescription;

  @Column(name = "meta_keywords", length = 255)
  private String metaKeywords;

  @Column(name = "og_image_url", length = 500)
  private String ogImageUrl;

  @Column(name = "og_title", length = 200)
  private String ogTitle;

  @Column(name = "og_description", length = 500)
  private String ogDescription;

  @Column(nullable = false)
  private Integer version;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "content_tags",
      joinColumns = @JoinColumn(name = "content_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @Builder.Default
  private Set<Tag> tags = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (status == null) status = "DRAFT";
    if (version == null) version = 1;
    if (viewCount == null) viewCount = 0L;
    if (isFeatured == null) isFeatured = false;
    if (isPinned == null) isPinned = false;
    if (isMemberOnly == null) isMemberOnly = false;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
