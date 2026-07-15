# CMS Enhancement — Stage 2: Enterprise Content Management

## Overview

Stage 2 builds on the foundation from Stage 1 to add enterprise-grade content management capabilities comparable to Drupal's full feature set. The focus is on advanced content types, taxonomies, versioning, search, personalization, and analytics.

**Dependencies:** Stage 1 must be complete before Stage 2 begins.

---

## Feature Areas

### 1. Advanced Content Types & Fields

**Comparable to:** Drupal Content Types, WordPress Custom Post Types

- **Custom Content Types Builder** — Admin UI to define new content types (beyond Article/Event/Page)
  - Field types: text, textarea, number, date, boolean, reference, file, rich text, JSON
  - Field validation rules (required, min/max, regex, unique)
  - Field groups and tabs
  - Content type versioning (schema migrations)

- **Custom Fields (Block Props Extension)** — Extend any block type with custom props at the page level
  - Override default props schema per-page instance
  - Custom field groups visible in PropertyPanel

- **Taxonomy System** — WordPress/Drupal-like categories and tags
  - Hierarchical categories (unlimited depth)
  - Flat tags
  - Custom vocabulary creation
  - Attach taxonomies to any content type
  - Faceted filtering by taxonomy in public pages

- **Content Relationships** — Link content items to each other
  - One-to-many: Article → Related Articles
  - Many-to-many: Event → Speakers (Users)
  - Bi-directional relationship display

---

### 2. Advanced Versioning & Revision History

**Comparable to:** WordPress Revisions, Drupal Content Moderation + Workspaces

- **Full Page Versioning**
  - Every save creates a new version (not just audit trail)
  - Version list with: version number, author, timestamp, change summary
  - Side-by-side diff view between any two versions
  - One-click rollback to any previous version
  - Version labels (e.g., "Before redesign", "Holiday layout")

- **Draft vs Published Separation**
  - Maintain separate draft and published versions simultaneously
  - Editors can work on next version while current is live
  - "Preview next version" without affecting live site

- **Workspaces** (Drupal-equivalent)
  - Named workspaces (Staging, Campaign, Holiday)
  - Group multiple page changes into a workspace
  - Deploy entire workspace at once (atomic publish)
  - Workspace merge conflict detection

---

### 3. Advanced Search

**Comparable to:** Drupal Search API + Solr, WordPress Relevanssi

- **Full-Text Search Engine**
  - PostgreSQL FTS with ranking (ts_rank) across all content types
  - Highlighted search result snippets
  - Faceted search by content type, date, author, taxonomy
  - Autocomplete / typeahead suggestions
  - Search analytics (popular queries, no-results queries)

- **Admin Content Search**
  - Global search in admin panel across pages, articles, events, media
  - Filter by any field value
  - Saved search filters

- **Public Site Search**
  - Dedicated search results page (`/search?q=...`)
  - Pagination with configurable results per page
  - Relevance-sorted results with content type labels

---

### 4. Personalization & Audience Targeting

**Comparable to:** Drupal Personalization, WordPress Audience modules

- **Block Visibility Rules** (extends existing visibility)
  - Show/hide blocks based on: user role, login status, device type, geolocation, time of day, days of week, URL params
  - Visual rule builder (no code required)
  - A/B testing mode: show variant A to 50% of users, variant B to rest

- **User Segments**
  - Define segments based on: role, registration date, last login, specific page views
  - Target blocks or entire pages to segments

- **Conditional Content**
  - In-block conditional rendering rules
  - Different content for authenticated vs guest users within same block

---

### 5. Advanced Media Management

**Comparable to:** WordPress Media Library + Imagify, Drupal Media module

- **Image Editing in Browser**
  - Crop, resize, rotate via canvas editor
  - Apply filters (brightness, contrast, grayscale)
  - Named crops/focal points per image (for responsive images)

- **Video Support**
  - Upload videos to MinIO with size limits
  - Auto-generate thumbnail from video at configurable frame
  - Embed YouTube/Vimeo by URL (no upload needed)
  - Video transcoding status tracking

- **Document Management (Basic)**
  - Upload PDF, DOCX, XLSX, PPTX files
  - Document preview (embedded PDF viewer)
  - Version tracking per document
  - Download count tracking

- **Image CDN & Optimization**
  - Generate WebP variants automatically on upload
  - Responsive image srcset generation
  - Lazy loading attributes injected in img tags
  - Image compression with configurable quality

---

### 6. Advanced Workflow Engine

**Comparable to:** Drupal Workflows module, Alfresco workflow (preview)

- **Multi-Step Approval Chains**
  - Define custom states beyond DRAFT→REVIEW→APPROVED→PUBLISHED
  - Per-state role assignments
  - Parallel approval paths (all N reviewers must approve)
  - Deadline-based escalation (auto-reject if not reviewed in N days)
  - Conditional transitions (approve if all required fields filled)

- **Workflow Templates**
  - Save workflow definitions as reusable templates
  - Apply different workflows to different content types
  - Import/export workflow definitions as JSON

- **Workflow Analytics**
  - Average time in each state
  - Bottleneck detection (which state has longest dwell time)
  - Per-reviewer performance metrics

---

### 7. Analytics & Reporting Dashboard

**Comparable to:** WordPress Jetpack Stats, Drupal Statistics module

- **Page View Analytics**
  - Views per page per day/week/month
  - Unique visitors (session-based, privacy-preserving)
  - Traffic sources (referrer)
  - Top pages leaderboard

- **Content Performance**
  - Most-read articles with view counts
  - Most-viewed events
  - Search terms that landed on each page

- **Admin Dashboard Widgets**
  - Recent activity feed (last 10 changes across all content)
  - Pending approvals count badge
  - Failed email notifications count
  - Storage usage (MinIO bucket size)

- **Export & Reports**
  - CSV export for all analytics data
  - Scheduled email reports (weekly summary)
  - Custom date range filtering

---

### 8. Advanced SEO Features

**Comparable to:** WordPress Yoast SEO Premium, Drupal Metatag + Pathauto + Redirect modules

- **Structured Data Editor**
  - JSON-LD schema editor for each page
  - Pre-built schemas: Article, Event, Organization, BreadcrumbList, FAQPage
  - Real-time schema validation
  - Preview in Google's Rich Results tool format

- **Automatic Internal Linking**
  - Suggest internal links as editor types content
  - Detect orphaned pages (no internal links pointing to them)
  - Broken link checker (scheduled scan)

- **XML Sitemap Enhancements**
  - Per-content-type sitemap include/exclude rules
  - Priority and changefreq per page
  - Image sitemap support
  - Auto-ping search engines on sitemap update

- **Redirect Manager**
  - Admin UI for managing URL redirects
  - Bulk import redirects from CSV
  - Redirect chain detection (A→B→C collapse to A→C)
  - 404 error log with suggested redirect targets

---

## Technical Architecture (Stage 2)

```
New Services (Backend):
  - ContentTypeService    — custom content type definitions
  - TaxonomyService       — category/tag CRUD + hierarchy
  - VersioningService     — page versions + workspaces + diff
  - SearchService         — FTS with ranking + facets
  - PersonalizationEngine — visibility rule evaluation
  - AnalyticsService      — event recording + aggregation
  - StructuredDataService — JSON-LD generation
  - RedirectService       — URL redirect resolution

New Tables (Database):
  - content_types         — custom type definitions
  - content_type_fields   — field schema per type
  - taxonomies            — vocabulary definitions
  - taxonomy_terms        — hierarchical terms
  - content_taxonomy      — content → term junction
  - page_versions         — full version snapshots
  - workspaces            — named deployment batches
  - workspace_items       — page → workspace junction
  - analytics_events      — raw page view events
  - analytics_aggregates  — pre-computed daily/weekly totals
  - url_redirects_managed — admin-managed redirects
  - structured_data       — per-page JSON-LD
  - visibility_rules      — per-block/page targeting rules
  - user_segments         — audience segment definitions

New Frontend:
  - /admin/content-types  — content type builder
  - /admin/taxonomy       — taxonomy manager
  - /admin/versions/{id}  — version history with diff
  - /admin/workspaces     — workspace manager
  - /admin/analytics      — analytics dashboard
  - /admin/redirects      — redirect manager
  - /admin/seo            — global SEO settings
```

---

## Estimated Complexity

| Area | Backend Effort | Frontend Effort | Database Changes |
|------|---------------|-----------------|-----------------|
| Content Types | High | High | 3 new tables |
| Taxonomy | Medium | Medium | 3 new tables |
| Versioning | High | High | 2 new tables |
| Search | Medium | Medium | FTS indexes |
| Personalization | High | High | 3 new tables |
| Media Enhancement | Medium | High | 2 new tables |
| Advanced Workflow | High | Medium | 2 new tables |
| Analytics | Medium | High | 3 new tables |
| Advanced SEO | Medium | Medium | 2 new tables |

**Total estimated timeline: 6–8 weeks**

---

## Prerequisites for Stage 2

- Stage 1 complete: workflow engine integrated with pages, media library functional, audit trail active
- `translation_group_id` system from Stage 1 (required for multilingual taxonomy)
- `preview_tokens` system from Stage 1 (required for workspace preview)
- `WorkflowEngine` extensible architecture from Stage 1
