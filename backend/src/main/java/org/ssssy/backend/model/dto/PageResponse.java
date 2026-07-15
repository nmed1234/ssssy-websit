package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageResponse {
  private UUID id;
  private String titleAr;
  private String titleEn;
  private String slug;
  private String layoutType;
  private Boolean isPublished;
  private Boolean isHomepage;
  private UUID parentId;
  private Integer sortOrder;
  private String authorName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
  private String metaTitle;
  private String metaDescription;
  private String ogTitle;
  private String ogDescription;
  private String ogImageUrl;
  /** Full nested block tree as JSON — new builder format */
  private String layoutJson;

  // -------------------------------------------------------------------------
  // CMS Foundation Stage 1 — new fields (Requirements: 7.3, 9.1, 22.5, 23.4)
  // -------------------------------------------------------------------------

  /** Current workflow state: DRAFT, REVIEW, APPROVED, PUBLISHED */
  private String workflowStatus;

  /** Role names allowed to view this page when visibility = ROLE_BASED */
  private String[] allowedRoles;

  /** Page visibility: PUBLIC, AUTHENTICATED, MEMBERS_ONLY, ROLE_BASED */
  private String visibility;

  /** BCP-47 language code, e.g. "EN", "AR" */
  private String language;

  /** UUID (as String) linking all language variants of the same logical page */
  private String translationGroupId;

  /** Display name of the user who made the last workflow transition */
  private String lastTransitionBy;

  /** Timestamp of the last workflow transition */
  private LocalDateTime lastTransitionAt;

  /**
   * Sections array — populated only when fetching a single page (getPageForAdmin).
   * Null in list responses.
   */
  private List<PageSectionResponse> sections;
}
