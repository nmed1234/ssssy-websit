package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Page {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "title_ar", nullable = false, length = 500)
  private String titleAr;

  @Column(name = "title_en", length = 500)
  private String titleEn;

  @Column(nullable = false, unique = true, length = 550)
  private String slug;

  @Column(name = "layout_type", length = 50)
  private String layoutType;

  @Column(name = "is_published")
  private Boolean isPublished;

  @Column(name = "is_homepage")
  private Boolean isHomepage;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id")
  private Page parent;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "meta_title", length = 200)
  private String metaTitle;

  @Column(name = "meta_description", length = 500)
  private String metaDescription;

  @Column(name = "og_title", length = 200)
  private String ogTitle;

  @Column(name = "og_description", length = 500)
  private String ogDescription;

  @Column(name = "og_image_url", length = 500)
  private String ogImageUrl;

  /**
   * Full nested block tree stored as JSON.
   * Format: {"version":"1","blocks":[...]}
   * When present, the builder reads/writes this column exclusively.
   * Legacy pages still served via page_sections until migrated.
   */
  @Column(name = "layout_json", columnDefinition = "TEXT")
  private String layoutJson;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  // -------------------------------------------------------------------------
  // CMS Foundation Stage 1 — new columns added in V39 migration (task 1.8)
  // -------------------------------------------------------------------------

  /**
   * Current position in the approval workflow.
   * Allowed values: DRAFT, REVIEW, APPROVED, PUBLISHED.
   * Backfilled to PUBLISHED for existing is_published=true rows.
   *
   * Requirements: 9.1
   */
  @Column(name = "workflow_status", length = 50)
  private String workflowStatus;

  /**
   * Role names permitted to view this page when visibility = 'ROLE_BASED'.
   * Stored as a PostgreSQL TEXT[] array.
   *
   * Requirements: 7.3
   */
  @Column(name = "allowed_roles", columnDefinition = "TEXT[]")
  private String[] allowedRoles;

  /**
   * Page visibility level.
   * Allowed values: PUBLIC, AUTHENTICATED, MEMBERS_ONLY, ROLE_BASED.
   *
   * Requirements: 7.3
   */
  @Column(name = "visibility", length = 50)
  private String visibility;

  /**
   * Groups this page with its translations in other languages.
   * All language variants of the same logical page share the same UUID here.
   *
   * Requirements: 23.4
   */
  @Column(name = "translation_group_id")
  private UUID translationGroupId;

  /**
   * BCP-47 language code for this page's content (e.g. "EN", "AR").
   *
   * Requirements: 22.5
   */
  @Column(name = "language", length = 10)
  private String language;

  /**
   * The user who originally created this page.
   * Used to notify the author on workflow state changes.
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isPublished == null) isPublished = false;
    if (isHomepage == null) isHomepage = false;
    if (sortOrder == null) sortOrder = 0;
    // CMS Foundation Stage 1 defaults (Requirements: 9.1, 7.3, 22.5)
    if (workflowStatus == null) workflowStatus = "DRAFT";
    if (visibility == null) visibility = "PUBLIC";
    if (language == null) language = "EN";
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
