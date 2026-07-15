package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PageRequest {
  private String titleAr;
  private String titleEn;
  private String slug;
  private String layoutType;
  private Boolean isPublished;
  private Boolean isHomepage;
  private UUID parentId;
  private Integer sortOrder;
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

  /** Page visibility: PUBLIC, AUTHENTICATED, MEMBERS_ONLY, ROLE_BASED */
  private String visibility;

  /** Role names allowed to view this page when visibility = ROLE_BASED */
  private String[] allowedRoles;

  /** BCP-47 language code, e.g. "EN", "AR" */
  private String language;

  /** Optional UUID of the translation group this page belongs to */
  private UUID translationGroupId;

  /** Optional UUID of a page template to base this page on */
  private UUID templateId;
}
