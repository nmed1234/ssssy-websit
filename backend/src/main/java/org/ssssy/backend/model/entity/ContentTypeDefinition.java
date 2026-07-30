package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Phase 3 — Dynamic Content Type Engine.
 *
 * Represents an admin-defined content type (e.g. "Research Paper", "Workshop Report").
 * The fields of the type are stored in content_type_fields (one-to-many).
 * Actual entries are stored in dynamic_content_entries using JSONB.
 */
@Entity
@Table(name = "content_type_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeDefinition {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** URL-safe identifier, e.g. "research-paper". Must be unique and lowercase. */
  @Column(nullable = false, unique = true, length = 100)
  private String name;

  @Column(name = "label_en", nullable = false, length = 255)
  private String labelEn;

  @Column(name = "label_ar", length = 255)
  private String labelAr;

  @Column(columnDefinition = "TEXT")
  private String description;

  /** Lucide icon name shown in admin UI sidebar (default: FileText). */
  @Column(length = 100)
  @Builder.Default
  private String icon = "FileText";

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workflow_id")
  private Workflow workflow;

  @Column(name = "allow_comments")
  @Builder.Default
  private Boolean allowComments = false;

  /** When true, users with MEMBER role can submit entries for this type. */
  @Column(name = "allow_member_submit")
  @Builder.Default
  private Boolean allowMemberSubmit = false;

  /** When true, submitted entries require EDITOR approval before publishing. */
  @Column(name = "requires_approval")
  @Builder.Default
  private Boolean requiresApproval = true;

  @Column(name = "is_active")
  @Builder.Default
  private Boolean isActive = true;

  @Column(name = "sort_order")
  @Builder.Default
  private Integer sortOrder = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @OneToMany(mappedBy = "contentType", cascade = CascadeType.ALL, orphanRemoval = true,
             fetch = FetchType.LAZY)
  @OrderBy("sortOrder ASC")
  @Builder.Default
  private List<ContentTypeField> fields = new ArrayList<>();

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
