# Implementation Plan: CMS Foundation — Stage 1

## Overview

This plan transforms the SSSSY page builder into an enterprise-grade CMS through six dependency-ordered waves:
Wave 0 establishes the database schema and backend foundation services; Wave 1 wires up all new and extended API controllers; Wave 2 fixes the two critical frontend bugs in parallel with Wave 1; Wave 3 builds the new React component library; Wave 4 integrates those components into the admin UX pages; Wave 5 adds optional property-based tests; and Wave 6 performs end-to-end integration verification.

All backend code is Java 21 / Spring Boot 3. All frontend code is TypeScript / Next.js 14 / Tailwind CSS.

---

## Tasks

### Wave 0 — Database & Backend Foundation

- [x] 1. Write Flyway migration `V39__cms_foundation_stage1.sql`
  - [x] 1.1 Create `page_audit_trail` table with indexes on `(page_id, timestamp DESC)` and `user_id`
    - File: `backend/src/main/resources/db/migration/V39__cms_foundation_stage1.sql`
    - Columns: `id UUID PK`, `page_id UUID FK pages`, `user_id UUID FK users`, `action VARCHAR(50) CHECK(...)`, `timestamp TIMESTAMPTZ DEFAULT NOW()`, `changed_fields JSONB DEFAULT '{}'`
    - _Requirements: 12.1, 12.6_

  - [x] 1.2 Create `page_workflow_transitions` table with index on `(page_id, timestamp DESC)`
    - Columns: `id UUID PK`, `page_id UUID FK pages`, `from_state`, `to_state`, `user_id UUID FK users`, `timestamp TIMESTAMPTZ`, `notes VARCHAR(1000)`
    - Note: named `page_workflow_transitions` (not `workflow_transitions`) to avoid collision with existing V11 table
    - _Requirements: 9.3_

  - [x] 1.3 Create `page_templates` table
    - Columns: `id UUID PK`, `name VARCHAR(100)`, `category VARCHAR(50) CHECK(...)`, `description VARCHAR(500)`, `layout_json TEXT NOT NULL`, `thumbnail_url VARCHAR(1000)`, `usage_count INT DEFAULT 0`, `created_by UUID FK users`, `created_at`, `updated_at`
    - _Requirements: 20.2_

  - [x] 1.4 Add missing columns to `media_files` via `ALTER TABLE` + create FTS `TSVECTOR` generated column + GIN index
    - Columns to add: `caption_en VARCHAR(500)`, `caption_ar VARCHAR(500)`, `tags TEXT`, `uploader_id UUID FK users`, `fts_index TSVECTOR GENERATED ALWAYS AS (...) STORED`
    - Index: `CREATE INDEX IF NOT EXISTS idx_media_files_fts ON media_files USING GIN (fts_index)`
    - _Requirements: 18.5, 15.7_

  - [x] 1.5 Create `preview_tokens` table with unique index on `token`
    - Columns: `id UUID PK`, `page_id UUID FK pages`, `token CHAR(64) UNIQUE NOT NULL`, `layout_json TEXT NOT NULL`, `created_by UUID FK users`, `expires_at TIMESTAMPTZ NOT NULL`, `created_at TIMESTAMPTZ`
    - _Requirements: 8.4, 8.5_

  - [x] 1.6 Create `url_redirects` table with index on `from_path`
    - Columns: `id UUID PK`, `from_path VARCHAR(500)`, `to_path VARCHAR(500)`, `redirect_type INT DEFAULT 301`, `page_id UUID FK pages`, `created_at TIMESTAMPTZ`
    - _Requirements: 6.7_

  - [x] 1.7 Create `page_sections_backup` table (`CREATE TABLE ... AS TABLE page_sections WITH NO DATA`)
    - _Requirements: 3.5_

  - [x] 1.8 Add new columns to `pages` table via `ALTER TABLE` + indexes for `workflow_status`, `translation_group_id`, `deleted_at`
    - Columns: `workflow_status VARCHAR(50) DEFAULT 'DRAFT'`, `allowed_roles TEXT[]`, `visibility VARCHAR(50) DEFAULT 'PUBLIC'`, `translation_group_id UUID`, `language VARCHAR(10) DEFAULT 'EN'`, `deleted_at TIMESTAMPTZ`, `created_by UUID FK users`
    - Backfill: `workflow_status = 'PUBLISHED'` where `is_published = true`, else `'DRAFT'`; `language = 'EN'`, `visibility = 'PUBLIC'` for all existing rows
    - _Requirements: 7.3, 9.1, 23.4, 22.5_


- [x] 2. Implement backend entity classes for all new tables
  - [x] 2.1 Create `PageAuditTrail` JPA entity
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/PageAuditTrail.java`
    - _Requirements: 12.1_

  - [x] 2.2 Create `PageWorkflowTransition` JPA entity
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/PageWorkflowTransition.java`
    - Include `fromState`, `toState`, `notes` (max 1000 chars) fields
    - _Requirements: 9.3_

  - [x] 2.3 Create `PageTemplate` JPA entity
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/PageTemplate.java`
    - _Requirements: 20.2_

  - [x] 2.4 Create `PreviewToken` JPA entity
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/PreviewToken.java`
    - _Requirements: 8.5_

  - [x] 2.5 Create `UrlRedirect` JPA entity
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/UrlRedirect.java`
    - _Requirements: 6.7_

  - [x] 2.6 Extend `Page` entity with new columns added in task 1.8
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/Page.java`
    - Add fields: `workflowStatus`, `allowedRoles` (`String[]`), `visibility`, `translationGroupId`, `language`, `deletedAt`, `createdBy`
    - _Requirements: 7.3, 9.1, 22.5, 23.4_

  - [x] 2.7 Extend `MediaFile` entity with columns added in task 1.4
    - File: `backend/src/main/java/org/ssssy/backend/model/entity/MediaFile.java`
    - Add: `captionEn`, `captionAr`, `tags`, `uploaderId`; do NOT map `fts_index` (DB-generated)
    - _Requirements: 18.2, 18.5_

  - [x] 2.8 Create Spring Data JPA repositories for all new entities
    - Files: `PageAuditTrailRepository.java`, `PageWorkflowTransitionRepository.java`, `PageTemplateRepository.java`, `PreviewTokenRepository.java`, `UrlRedirectRepository.java`
    - Add query methods: `findByPageIdOrderByTimestampDesc(UUID, Pageable)` on audit/transition repos; `findByTokenAndExpiresAtAfter(String, Instant)` on preview repo
    - _Requirements: 12.5, 9.3, 8.4_


- [x] 3. Implement `LayoutJsonValidator` utility class
  - [x] 3.1 Write `LayoutJsonValidator` with `validate(String json): ValidationResult`
    - File: `backend/src/main/java/org/ssssy/backend/common/LayoutJsonValidator.java`
    - Steps: parse JSON → check `version` string and `blocks` array → DFS collect all IDs → per-block validate `id` / `type` / `props` → recurse into `children` → check duplicate IDs
    - Return `ValidationResult` containing `List<{path, message}>` errors; empty list = success
    - Unknown `type` values are accepted (log WARN) and treated as leaf blocks
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

  - [x] 3.2 Write unit tests for `LayoutJsonValidator`
    - File: `backend/src/test/java/org/ssssy/backend/common/LayoutJsonValidatorTest.java`
    - Cases: valid JSON passes; missing `version` fails with correct path; missing `blocks` fails; block missing `id`/`type`/`props` fails; duplicate IDs detected; nested children validated; unknown block type accepted
    - _Requirements: 24.1–24.7_


- [x] 4. Implement `PageWorkflowService`
  - [x] 4.1 Write `PageWorkflowService` with transition validation and persistence
    - File: `backend/src/main/java/org/ssssy/backend/service/PageWorkflowService.java`
    - Allowed transitions: `DRAFT→REVIEW` (EDITOR/PUBLISHER/ADMIN), `REVIEW→APPROVED` (PUBLISHER/ADMIN), `REVIEW→DRAFT` (PUBLISHER/ADMIN, rejection requires non-empty notes), `APPROVED→PUBLISHED` (PUBLISHER/ADMIN)
    - Validate source state and role; throw `InvalidStateTransitionException` (→ 400) or `InsufficientPermissionsException` (→ 403)
    - Within `@Transactional`: UPDATE `pages.workflow_status`, INSERT `page_workflow_transitions`, INSERT `page_audit_trail` with `action='WORKFLOW_TRANSITION'`
    - After commit: call `EmailNotificationService` via `@Async` for reviewer/author emails
    - _Requirements: 9.2–9.10_

  - [x] 4.2 Write unit tests for `PageWorkflowService`
    - File: `backend/src/test/java/org/ssssy/backend/service/PageWorkflowServiceTest.java`
    - Test every valid transition is accepted; every invalid (state, role) pair is rejected; rejection without notes is rejected; `page_workflow_transitions` row inserted on success; page state unchanged on rejection
    - _Requirements: 9.2–9.10_


- [x] 5. Implement `PageAuditService`
  - [x] 5.1 Write `PageAuditService` with `record(pageId, userId, action, changedFields)` method
    - File: `backend/src/main/java/org/ssssy/backend/service/PageAuditService.java`
    - Insert into `page_audit_trail`; `changedFields` is a `Map<String, {before, after}>` serialised to JSONB
    - Called from `PageService` `@Transactional` after-save hooks for CREATE / UPDATE / DELETE / PUBLISH / UNPUBLISH actions
    - Records are append-only; no delete logic
    - _Requirements: 12.1, 12.2, 12.6, 12.7_

  - [x] 5.2 Integrate `PageAuditService` into `PageService` save/delete/publish paths
    - File: `backend/src/main/java/org/ssssy/backend/service/PageService.java`
    - Capture `before` snapshot at start of each mutating operation; capture `after` on success; call `PageAuditService.record()`
    - _Requirements: 12.1, 12.2_


- [x] 6. Implement `PreviewService`
  - [x] 6.1 Write `PreviewService` with `generateToken` and `resolveToken` methods
    - File: `backend/src/main/java/org/ssssy/backend/service/PreviewService.java`
    - `generateToken(pageId, layoutJson, createdBy)`: use `SecureRandom` to generate 32 bytes, hex-encode to 64-char string; insert `preview_tokens` row with `expires_at = NOW() + 1 hour`; return `{token, previewUrl, expiresAt}`
    - `resolveToken(pageId, token)`: query `preview_tokens` where `token = ?` AND `expires_at > NOW()`; return `layoutJson` or throw `PreviewTokenExpiredException` (→ 403)
    - _Requirements: 8.4, 8.5, 8.7_


- [x] 7. Implement `MediaLibraryService` extensions
  - [x] 7.1 Extend `MediaService` with folder management methods
    - File: `backend/src/main/java/org/ssssy/backend/service/MediaService.java` (extend existing)
    - Add: `createFolder(name, parentId, userId)`, `renameFolder(id, name)`, `deleteFolder(id)` (sets `folder_id=NULL` on all images, then deletes folder row)
    - _Requirements: 16.2, 16.5, 16.6, 16.7_

  - [x] 7.2 Extend `MediaService` with FTS search and metadata update
    - Add: `search(query, folderId, page, size)` using `WHERE fts_index @@ plainto_tsquery('english', ?)` PostgreSQL query
    - Add: `updateMetadata(id, altTextEn, altTextAr, captionEn, captionAr, tags, folderId)` updating `media_files`
    - _Requirements: 15.7, 18.3, 18.5, 18.6_

  - [x] 7.3 Extend `MediaService` with thumbnail generation
    - Add: `generateThumbnail(originalBytes, mimeType): byte[]` producing a 300×300 cover-crop thumbnail using Thumbnailator
    - File naming convention: `{uuid}-{originalFilename}_thumb.{ext}`; store in MinIO `thumbs/` prefix
    - _Requirements: 15.5_

  - [x] 7.4 Extend `MediaService` upload pipeline with UUID-prefixed filenames and MinIO-first, DB-second logic
    - Generate `UUID.randomUUID() + "-" + originalFilename`; upload to MinIO `originals/` first; generate and upload thumbnail; ONLY then `INSERT` into `media_files`; on MinIO failure return HTTP 500 without writing DB row
    - _Requirements: 15.4, 15.6, 17.6_


- [x] 8. Implement `MigrateLegacySectionsScript` (server-side migration runner)
  - [x] 8.1 Write `MigrateLegacySectionsScript` as a `CommandLineRunner` / `ApplicationRunner` bean guarded by a config flag
    - File: `backend/src/main/java/org/ssssy/backend/migration/MigrateLegacySectionsScript.java`
    - Step 1: `INSERT INTO page_sections_backup SELECT * FROM page_sections` (full backup before any mutations)
    - Step 2: For each page group in `page_sections`, within a `SAVEPOINT` per page: flatten `data`/`config`/`styling`, UPDATE `page_sections.data`, UPDATE `pages.layout_json`, UPDATE `updated_at`
    - Step 3: On any exception — rollback savepoint, log `{sectionId, componentType, error}`; continue other pages
    - Step 4: Post-migration validation — for each migrated page fetch sections, confirm no parse errors
    - _Requirements: 3.1–3.9_

  - [x] 8.2 Add `migration.legacy-sections.enabled=false` config property; set `true` only for one-time run
    - _Requirements: 3.7_

- [x] 9. Wave 0 checkpoint — compile and unit test backend foundation
  - Run `mvn clean compile` from `backend/`; resolve any compilation errors
  - Run `mvn test -pl backend` for tasks 3.2 and 4.2; ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 3.1–3.9, 24.1–24.7, 9.2–9.10_


---

### Wave 1 — Backend API

- [x] 10. Extend `PageController` with new endpoints
  - [x] 10.1 Add `POST /api/admin/pages` — create page
    - File: `backend/src/main/java/org/ssssy/backend/controller/PageController.java`
    - Validate `layoutJson` via `LayoutJsonValidator` if provided; set `workflow_status='DRAFT'`, `is_published=false`; call `PageAuditService.record(CREATE)`
    - _Requirements: 5.5, 5.6, 9.1_

  - [x] 10.2 Add `GET /api/admin/pages` — list with workflow filter and sort
    - Support `?workflowStatus=REVIEW`, `?sort=updated_at,desc`; exclude soft-deleted rows (`deleted_at IS NULL`)
    - Include `workflowStatus`, `lastTransitionBy`, `lastTransitionAt` in each page item
    - _Requirements: 10.5, 10.6, 10.7_

  - [x] 10.3 Extend `GET /api/admin/pages/{id}` to return `layoutJson` and `sections` array; exclude soft-deleted
    - Return HTTP 404 if `deleted_at IS NOT NULL`
    - _Requirements: 4.3_

  - [x] 10.4 Extend `PUT /api/admin/pages/{id}` to accept and validate `layoutJson`; persist `visibility`, `allowedRoles`, `language`, SEO/OG fields
    - Validate `layoutJson` via `LayoutJsonValidator` before persisting; return 400 with `errors` array on failure
    - When slug changes: insert `url_redirects` row; check slug uniqueness; return 409 on conflict
    - _Requirements: 1.3, 4.5, 4.6, 4.7, 6.4, 6.5, 6.7, 7.3_

  - [x] 10.5 Add `DELETE /api/admin/pages/{id}` (soft delete) and `POST /api/admin/pages/{id}/restore`
    - Soft delete: set `deleted_at=NOW()`, `is_published=false`; also set `deleted_at=NOW()` on matching `page_sections` rows
    - Restore: only if `deleted_at` within 30 days; clear `deleted_at`
    - _Requirements: 22.5, 22.6, 22.7_

  - [x] 10.6 Add `POST /api/admin/pages/{id}/duplicate`
    - Copy `layout_json`, `meta_*`, `og_*`, `visibility`, `allowed_roles`; set `workflow_status='DRAFT'`, `is_published=false`; regenerate all block UUIDs recursively
    - Accept `newTitle` and `newSlug` in request body; validate slug
    - _Requirements: 21.3, 21.4, 21.5, 21.7_

  - [x] 10.7 Add `GET /api/admin/pages/check-slug?slug=…&excludeId=…`
    - Return `{available: true/false, suggestion: "slug-2"}` — suggestion increments suffix until unique
    - _Requirements: 5.7, 5.8, 6.4_

  - [x] 10.8 Add `GET /api/admin/pages/{id}/sections?format=flat`
    - Deserialise `data`, `config`, `styling` as JSON objects; `?format=flat` merges into single `props` object per section
    - _Requirements: 4.1, 4.2_

  - [x] 10.9 Add `GET /api/admin/pages/{id}/layout-json` (ADMIN only)
    - Return `layout_json` pretty-printed with 2-space indent; `Content-Type: application/json; charset=utf-8`; raw UTF-8 (no `\uXXXX` escaping); HTTP 404 if page not found or soft-deleted
    - _Requirements: 25.1, 25.2, 25.4, 25.6, 25.7_


- [x] 11. Implement `PageWorkflowController` for pages
  - [x] 11.1 Add `GET /api/admin/pages/{id}/workflow`
    - File: `backend/src/main/java/org/ssssy/backend/controller/PageWorkflowController.java`
    - Returns `{currentState, availableTransitions[], history[]}` — availableTransitions filtered by caller's role
    - _Requirements: 9.1_

  - [x] 11.2 Add `PATCH /api/admin/pages/{id}/workflow`
    - Body: `WorkflowTransitionRequest {toState, notes}`; delegate to `PageWorkflowService`
    - Returns updated `workflowStatus`; HTTP 400 on invalid state; HTTP 403 on role mismatch
    - _Requirements: 9.2–9.10_

- [x] 12. Implement `PreviewController`
  - [x] 12.1 Add `POST /api/preview/pages/{id}` (EDITOR+ auth) — generate preview token
    - File: `backend/src/main/java/org/ssssy/backend/controller/PreviewController.java`
    - Accept `{layoutJson}` in body; delegate to `PreviewService.generateToken()`; return `{token, previewUrl, expiresAt}`
    - _Requirements: 8.4, 8.5_

  - [x] 12.2 Add `GET /api/preview/pages/{id}?token={token}` (no auth)
    - Validate token via `PreviewService.resolveToken()`; return layout JSON; set `X-Robots-Tag: noindex, nofollow`; HTTP 403 on expired/invalid token
    - _Requirements: 8.4, 8.6, 8.7_

- [x] 13. Implement `PageAuditController`
  - [x] 13.1 Add `GET /api/admin/pages/{id}/audit-trail?page=0&size=20`
    - File: `backend/src/main/java/org/ssssy/backend/controller/PageAuditController.java`
    - Return paginated `PageAuditRecord` list sorted by `timestamp DESC`; include `userDisplayName`, `userAvatarUrl` from JOIN with users
    - _Requirements: 12.3, 12.5_


- [x] 14. Extend `MediaController` with folder and metadata endpoints
  - [x] 14.1 Extend `POST /api/admin/media` with UUID-filename, thumb generation, MinIO-first pipeline
    - File: `backend/src/main/java/org/ssssy/backend/controller/MediaController.java`
    - Validate MIME type (jpeg/png/gif/webp) and size (≤ 10 MB); return 422 on failure before any storage
    - Store original in MinIO `originals/`, generate 300×300 thumbnail, store in `thumbs/`; only then INSERT `media_files` row
    - Accept up to 20 files per request; record `uploader_id` from JWT principal
    - _Requirements: 15.3, 15.4, 15.5, 15.6, 17.1, 17.5, 17.6_

  - [x] 14.2 Add `GET /api/admin/media?folderId=&search=&page=0&size=100`
    - FTS search via `fts_index @@ plainto_tsquery(?)` when `search` parameter provided; filter by `folder_id` when provided; paginated
    - Return `MediaLibraryItem` shape with all metadata fields including `uploaderDisplayName`
    - _Requirements: 15.2, 15.7, 15.8_

  - [x] 14.3 Add `PATCH /api/admin/media/{id}` — update metadata
    - Fields: `altTextEn`, `altTextAr`, `captionEn`, `captionAr`, `tags`, `folderId`
    - FTS index is auto-regenerated by PostgreSQL GENERATED column on UPDATE
    - _Requirements: 18.3, 18.5_

  - [x] 14.4 Add media folder endpoints (`GET`, `POST`, `PATCH`, `DELETE /api/admin/media-folders`)
    - GET: return folder tree (recursive); POST: create folder `{name, parentId}`; PATCH: rename; DELETE: set `folder_id=NULL` on all images, delete folder row
    - _Requirements: 16.2, 16.5, 16.6, 16.7_

- [x] 15. Implement `PageTemplateController`
  - [x] 15.1 Add `GET /api/admin/page-templates` grouped by category
    - File: `backend/src/main/java/org/ssssy/backend/controller/PageTemplateController.java`
    - Return templates grouped by `category` field; include `id`, `name`, `category`, `description`, `thumbnailUrl`, `usageCount`, `createdAt`
    - _Requirements: 20.3_

  - [x] 15.2 Add `POST /api/admin/page-templates` (ADMIN only) and `DELETE /api/admin/page-templates/{id}` (ADMIN only)
    - POST: validate `name` (1–100), `category` (enum), `description` (0–500), `layoutJson` via `LayoutJsonValidator`; insert row
    - On page create from template: increment `usage_count` via UPDATE
    - _Requirements: 20.1, 20.2, 20.6_

- [x] 16. Extend `MenuController` with drag-drop and custom link endpoints
  - [x] 16.1 Add `PATCH /api/admin/menus/{menuId}/items` — update `sort_order` and `parent_id` for moved item
    - File: `backend/src/main/java/org/ssssy/backend/controller/MenuController.java`
    - Validate resulting nesting depth ≤ 3 levels; return 200 on success; 500 on DB error
    - _Requirements: 14.4, 14.5_

  - [x] 16.2 Add `GET /api/admin/menus/items?pageId={id}` — find menu items linked to a page
    - Used by the deletion safety dialog to list which menus reference this page
    - _Requirements: 22.2_

  - [x] 16.3 Extend menu items save (triggered from page settings) to create/update/delete `menu_items` for page-menu linking
    - Set `menu_items.page_id`, `url = /{slug}`, `label_en`, `label_ar`, `parent_id`, `is_visible` based on page `is_published`
    - When `is_published=false`: set all linked `menu_items.is_visible=false`; on republish restore to `true`
    - _Requirements: 13.4, 13.5, 13.6, 13.7_

- [x] 17. Wave 1 checkpoint — verify all new backend endpoints compile and respond correctly
  - Run `mvn clean compile` from `backend/`
  - Smoke-test key endpoints via curl or Swagger UI: POST pages, PATCH workflow, POST preview, GET audit-trail, POST media, GET page-templates
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: all Wave 1 requirements_


---

### Wave 2 — Critical Frontend Bug Fixes

- [x] 18. Fix `migrateLegacySections()` in `page-layout.ts`
  - [x] 18.1 Replace the shallow spread merge with the correct algorithm from the design document
    - File: `frontend/src/components/page-builder/schema/page-layout.ts`
    - Merge scalars: `{ ...styling, ...config, ...data }` for non-array keys
    - Route items: look up `BLOCK_SCHEMA` for the field with `kind === 'items'`; assign any array found via `findItemsArray`
    - Ensure bilinguals: for every field key ending in `En` or `Ar`, default to `""` if `undefined` in merged result
    - Preserve `visibility` from section if present
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 18.2 Implement `findItemsArray(obj, itemsKey)` helper function
    - First check `obj[itemsKey]` is an array; then scan all values for any array (legacy nested keys like `panels`, `paragraphs`, `images`, `members`)
    - _Requirements: 1.5_

  - [x] 18.3 Write unit tests for `migrateLegacySections()` with representative inputs for all 24 legacy section types
    - File: `frontend/src/lib/__tests__/page-layout.test.ts`
    - Cover: scalar merge precedence; items array extraction; bilingual defaulting; unknown component type (raw JSON textarea fallback path); empty `data`/`config`/`styling`
    - _Requirements: 1.4, 1.5, 1.6, 1.7_


- [x] 19. Fix admin page editor navigation state (`admin/pages/[id]/page.tsx`)
  - [x] 19.1 Rewrite the `useEffect` to synchronously clear stale state before each async fetch
    - File: `frontend/src/app/admin/pages/[id]/page.tsx`
    - At top of effect (before any await): call `setPage(null)`, `setLayout(emptyLayout())`, `setLegacySections([])`, `setLoading(true)`
    - Introduce `cancelled` flag; guard all state-setting inside the `.then()` callback with `if (cancelled) return`
    - Cleanup: `return () => { cancelled = true; }`
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x] 19.2 Implement retry logic for page load API errors
    - On API failure: show error banner with "Retry" button; track attempt count (max 3); re-issue `Promise.all([getPage, getPageSections])` on retry click
    - _Requirements: 2.7_

  - [x] 19.3 Run TypeScript check after fixes
    - Run `npx tsc --noEmit` from `frontend/`; resolve any type errors introduced by this change
    - _Requirements: 2.1–2.7_

- [ ] 20. Wave 2 checkpoint — verify frontend bug fixes
  - Run `npx tsc --noEmit` from `frontend/`; run `npm run lint` from `frontend/`
  - Run Vitest unit tests: `npx vitest run src/lib/__tests__/page-layout.test.ts`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.4–1.7, 2.1–2.7_


---

### Wave 3 — Core Frontend Components


- [x] 21. Implement `CreatePageWizard` component
  - [x] 21.1 Build 3-step modal shell with step indicator
    - File: `frontend/src/components/admin/pages/CreatePageWizard.tsx`
    - Modal with step indicator `current / total`; "Back" / "Next" / "Create" buttons; keyboard trap; accessible `role="dialog"` with `aria-modal`
    - Language selector (EN / AR) on Step 1
    - _Requirements: 5.1_

  - [x] 21.2 Implement Step 1 — Title fields
    - Title EN: required, 1–200 chars with inline validation
    - Title AR: optional, 0–200 chars
    - _Requirements: 5.2_

  - [x] 21.3 Implement Step 2 — Slug field with real-time validation + uniqueness check
    - Real-time regex validation against `^[a-z0-9]+(?:-[a-z0-9]+)*$`; inline error display
    - Uniqueness check: debounced call to `GET /api/admin/pages/check-slug?slug=…`; on conflict show "This slug is already taken" + suggest alternative
    - Live URL preview: `{APP_URL}/{slug}` displayed below field; max length 200
    - Block "Next" until slug valid AND unique
    - _Requirements: 5.3, 5.7, 5.8, 6.3_

  - [x] 21.4 Implement Step 3 — Template selection grid
    - Fetch templates from `GET /api/admin/page-templates`; group by category
    - Display 4 built-in options (Blank, Article Layout, Landing Page, About Page) + any saved templates
    - Show thumbnail and description for each; highlight selected
    - _Requirements: 5.4, 20.3_

  - [x] 21.5 Wire "Create" action — `POST /api/admin/pages` and redirect
    - On success: redirect to `/admin/pages/[new-id]`; increment `usage_count` if template was selected
    - On network/server error: display error banner, retain all entered data, allow resubmit
    - _Requirements: 5.5, 5.6, 5.9_


- [x] 22. Implement `WorkflowStatusBadge` and `WorkflowPanel` components
  - [x] 22.1 Build `WorkflowStatusBadge`
    - File: `frontend/src/components/admin/WorkflowStatusBadge.tsx`
    - Props: `status: string`, `lastTransitionBy?: string`, `lastTransitionAt?: string`
    - Apply exact CSS: `DRAFT→bg-gray-100 text-gray-600`, `REVIEW→bg-yellow-100 text-yellow-700`, `APPROVED→bg-green-100 text-green-700`, `PUBLISHED→bg-blue-100 text-blue-700`, unknown→neutral gray
    - Tooltip on hover: `{status} by {displayName} on {DD MMM YYYY HH:mm}` (use `date-fns` or existing date util)
    - _Requirements: 10.2, 10.4_

  - [x] 22.2 Build `WorkflowPanel`
    - File: `frontend/src/components/admin/pages/WorkflowPanel.tsx`
    - Display current `WorkflowStatusBadge`; show available action buttons filtered by `currentUserRole` and `currentState`
    - "Submit for Review", "Approve", "Reject", "Publish" buttons; rejection opens a textarea requiring 1–1000 chars
    - On action: `PATCH /api/admin/pages/{id}/workflow`; on success update local state; on failure show error toast without changing displayed status
    - _Requirements: 9.2, 9.5, 9.6, 9.7_


- [x] 23. Implement full `MediaLibraryModal` component
  - Note: A basic `MediaLibraryModal` already exists at `frontend/src/components/page-builder/MediaLibraryModal.tsx`
    with grid, search, and load-more. It lacks folder tree sidebar, upload zone, per-file progress,
    metadata details panel, and alt-text warning badges. This task upgrades it to the full CMS spec.
  - [x] 23.1 Add folder tree sidebar to existing modal shell
    - File: `frontend/src/components/page-builder/MediaLibraryModal.tsx` (extend existing)
    - Left sidebar: folder tree from `GET /api/admin/media-folders`; root node "All Media"; expand/collapse folders
    - Context menu on folder nodes: "Rename" → inline input; "Delete" → confirmation with image count warning
    - "New Folder" button: inline input to enter name, calls `POST /api/admin/media-folders`
    - _Requirements: 16.1, 16.2, 16.5, 16.6_

  - [x] 23.2 Upgrade image grid: 300×300 thumbnails, 100 per page, alt-text warning badge, details panel trigger
    - Show `altTextEn` (truncated to 30 chars) or filename below each thumb; yellow ⚠ badge if `altTextEn` empty
    - On thumbnail click: open details panel without closing modal; on "Select" button: call `onSelect(url)` and close
    - _Requirements: 15.2, 15.8, 15.9, 18.4, 18.7_

  - [x] 23.3 Implement upload zone with per-file progress and batch summary
    - Drag-and-drop zone + file picker; concurrency limit 5; per-file progress bar (0–100%)
    - On per-file failure: show error row with "Retry" button; other files continue independently
    - On batch complete: summary "X uploaded, Y failed"
    - On upload complete: update grid without full page refresh (prepend new items to grid)
    - _Requirements: 15.3, 17.1, 17.2, 17.3, 17.4, 17.7_

  - [x] 23.4 Implement image metadata details panel
    - Slides in when thumbnail is clicked without closing library
    - Fields: alt text EN/AR (max 300), caption EN/AR (max 500), tags (comma-separated)
    - On save: `PATCH /api/admin/media/{id}`; on error: toast notification
    - On image drag onto folder: `PATCH /api/admin/media/{id}` updating `folder_id`; on failure revert and show error toast
    - _Requirements: 18.1, 18.2, 18.3, 16.3, 16.4_


- [x] 24. Implement `SeoEditorPanel` component
  - [x] 24.1 Build SEO tab fields with live character counters
    - File: `frontend/src/components/admin/pages/SeoEditorPanel.tsx`
    - Fields: `meta_title` (counter: green ≤60, yellow=0, red >60), `meta_description` (160-char limit), `og_title`, `og_description`, `og_image_url` (image picker button opening `MediaLibraryModal`)
    - `meta_title` counter: green when 1≤n≤60, yellow when n=0, red when n>60
    - `meta_description` counter: same logic with 160-char limit
    - When `meta_title` is empty: show page title as placeholder fallback
    - _Requirements: 19.1, 19.2, 19.3, 19.6_

  - [x] 24.2 Build Google SERP preview card and Open Graph preview card
    - SERP card below meta fields: shows page title, URL slug, meta description as they appear in search results
    - OG card: shows `og_title`, `og_description`, `og_image`
    - When `og_image_url` set: issue HEAD request to validate reachability; if non-image content-type or 4xx/5xx display inline non-blocking warning
    - _Requirements: 19.4, 19.5, 19.7_

- [x] 25. Implement `AuditTimeline` component
  - [ ] 25.1 Build vertical timeline with filter controls
    - File: `frontend/src/components/admin/pages/AuditTimeline.tsx`
    - Fetch from `GET /api/admin/pages/{id}/audit-trail?page=0&size=20`
    - Each entry: action label, user avatar + display name, relative timestamp ("3 hours ago") with full `DD MMM YYYY HH:mm` on hover
    - Filters: user dropdown (users who made changes), action type checkboxes; re-fetch on filter change
    - Paginated: page controls or infinite scroll; load next page appends to existing list
    - _Requirements: 12.3, 12.4, 12.5_

- [x] 26. Wave 3 checkpoint — TypeScript check and lint
  - Run `npx tsc --noEmit` from `frontend/`; run `npm run lint`
  - Resolve all type errors in new components
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: all Wave 3 requirements_


---

### Wave 4 — Page Management UX


- [x] 27. Wire `CreatePageWizard` into `/admin/pages` page list
  - [x] 27.1 Add "Create Page" button to `/admin/pages` that opens `CreatePageWizard`
    - File: `frontend/src/app/admin/pages/page.tsx`
    - Replace current "New Page" link with `<CreatePageWizard>` modal; pass `onSuccess` callback to refresh page list on creation
    - _Requirements: 5.1_

  - [x] 27.2 Add `WorkflowStatusBadge` to each row in the page list table
    - Render badge using `workflowStatus`, `lastTransitionBy`, `lastTransitionAt` from list API response
    - _Requirements: 10.1, 10.2, 10.4_

  - [x] 27.3 Add "Status" dropdown filter above page list
    - Options: All, Draft, Review, Approved, Published; on change append `?workflowStatus=…` query param to list API call
    - _Requirements: 10.3, 10.7_

- [x] 28. Wire `WorkflowPanel` into page editor sidebar
  - [ ] 28.1 Mount `WorkflowPanel` in page builder settings sidebar
    - File: `frontend/src/app/admin/pages/[id]/page.tsx` (or the sidebar component it uses)
    - Pass `pageId`, `currentStatus`, `currentUserRole` as props
    - On workflow action success: refetch page data and update local `workflowStatus` display
    - _Requirements: 9.2–9.7_

- [x] 29. Wire full `MediaLibraryModal` into `ImageFieldWidget`
  - [x] 29.1 Verify existing "Browse Library" button in `ImageFieldWidget` uses the upgraded `MediaLibraryModal`
    - File: `frontend/src/components/page-builder/ImageFieldWidget.tsx`
    - Confirm `onSelect(url)` callback wires correctly after modal upgrade in task 23
    - _Requirements: 15.1, 15.9_

- [x] 30. Wire `SeoEditorPanel` into page settings
  - [x] 30.1 Replace current inline SEO fields in page editor with `SeoEditorPanel` tab
    - File: `frontend/src/app/admin/pages/[id]/page.tsx`
    - Pass current `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`, `ogImageUrl` as initial values; wire `onChange` to update page form state
    - Add "Preview" button that calls `POST /api/preview/pages/{id}` and opens the preview URL in a new tab
    - _Requirements: 8.1, 8.2, 8.3, 19.1_

- [x] 31. Wire `AuditTimeline` into `/admin/pages/[id]/history`
  - [x] 31.1 Create `/admin/pages/[id]/history` route and page component
    - File: `frontend/src/app/admin/pages/[id]/history/page.tsx`
    - Mount `<AuditTimeline pageId={id} />`; breadcrumb link back to editor
    - _Requirements: 12.3_

- [x] 32. Build enhanced menu builder at `/admin/menus`
  - [x] 32.1 Render menu item tree with @dnd-kit `SortableTree` pattern
    - File: `frontend/src/app/admin/menus/page.tsx` (enhance existing)
    - Tree with indentation for parent-child relationships; display all menus and their items
    - _Requirements: 14.1_

  - [x] 32.2 Implement drag-and-drop reorder within same parent level
    - On drop: calculate new `sort_order` between siblings; call `PATCH /api/admin/menus/{menuId}/items`
    - Depth guard: if drop would exceed 3 nesting levels, reject drop and show tooltip "Maximum 3 levels of nesting"; leave tree unchanged
    - On backend error: revert tree to pre-drag state; show error toast
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.8, 14.9_

  - [x] 32.3 Add "Add Custom Link" form
    - Button opens inline form; fields: label EN (1–100, required), label AR (0–100), URL (required, URL pattern, max 2048), target (`_self`/`_blank`)
    - Validate label EN non-empty and URL matches pattern before enabling save button
    - On save: POST to create `menu_items` row
    - _Requirements: 14.6, 14.7_

- [x] 33. Build page templates management at `/admin/templates`
  - [x] 33.1 Create `/admin/templates` page listing all templates
    - File: `frontend/src/app/admin/templates/page.tsx`
    - Columns: thumbnail (placeholder if not captured), name, category, usage count, created date
    - "Save as Template" modal (accessible from page builder toolbar): fields name (1–100), category (select), description (0–500); calls `POST /api/admin/page-templates`
    - Delete template button (ADMIN only): calls `DELETE /api/admin/page-templates/{id}`
    - _Requirements: 20.1, 20.5_

- [x] 34. Implement page duplication dialog
  - [ ] 34.1 Add "Duplicate" action to page list row and build `PageDuplicateDialog`
    - File: `frontend/src/components/admin/pages/PageDuplicateDialog.tsx`
    - Pre-fill title with `{original title} (Copy)` and slug with suggested alternative from `check-slug` API
    - Validate slug with same rules as Requirement 5.3 before enabling "Duplicate" button
    - On confirm: `POST /api/admin/pages/{id}/duplicate`; on success redirect to `/admin/pages/[new-id]`
    - _Requirements: 21.1, 21.2, 21.6_

- [x] 35. Implement page deletion safety dialog
  - [ ] 35.1 Build `PageDeleteDialog` with safety checks
    - File: `frontend/src/components/admin/pages/PageDeleteDialog.tsx`
    - On open: call `GET /api/admin/menus/items?pageId={id}` to list linked menus; display them
    - If `is_published=true`: display warning with last published date; require user to type exact page title (case-sensitive) in a text input before "Delete" button is enabled
    - On confirm: `DELETE /api/admin/pages/{id}`; on success navigate back to page list
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 36. Add "Menu Placement" section to page settings panel
  - [x] 36.1 Implement collapsible "Menu Placement" section in page settings
    - Fetch menus from `GET /api/admin/menus`; display checkbox per menu
    - On menu check: show "Parent item" dropdown with top-level items + "(None — top level)" option
    - On save: update `menu_items` rows via MenuController endpoints
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 37. Add multi-language management to page settings
  - [x] 37.1 Display language badge (EN / AR) in page builder toolbar and language selector in creation wizard
    - File: page builder toolbar component + `CreatePageWizard`
    - _Requirements: 23.1, 23.2_

  - [x] 37.2 Add "Add Translation" button in page settings
    - Opens `CreatePageWizard` pre-filled with current slug and title, language toggled
    - On create: links new page via `translation_group_id`
    - _Requirements: 23.3, 23.4_

  - [x] 37.3 Add "⚠ Other language version not published" badge to page list
    - Show badge when one language version in a `translation_group_id` is published and the paired translation is not
    - _Requirements: 23.5_

- [x] 38. Add `LayoutJsonDebugModal` (ADMIN only)
  - [x] 38.1 Add "Debug: View JSON" button in page builder toolbar, visible only to ADMIN role
    - File: page builder toolbar component
    - On click: fetch `GET /api/admin/pages/{id}/layout-json`; display in a read-only code editor modal with syntax highlighting
    - _Requirements: 25.5_

- [x] 39. Wave 4 checkpoint — full frontend TypeScript and lint pass
  - Run `npx tsc --noEmit` from `frontend/`; run `npm run lint`
  - Resolve all type errors
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: all Wave 4 requirements_


---

### Wave 5 — Property-Based Tests (Optional)


- [ ] 40. PBT for migration correctness properties (Properties 1–3)
  - [ ]* 40.1 Write property test for Property 1 — Migration Merge Precedence
    - File: `frontend/src/lib/__tests__/page-layout.pbt.test.ts`
    - Use `fast-check`: generate random `{data, config, styling}` objects with overlapping scalar keys; assert `migrateLegacySections()` `props` value matches `data` value when present, else `config`, else `styling`
    - **Property 1: Migration Merge Precedence** | **Validates: Requirements 1.4, 3.2** | 500 runs
    - _Requirements: 1.4, 3.2_

  - [ ]* 40.2 Write property test for Property 2 — Bilingual Field Completeness
    - Generate random legacy sections with partial bilingual fills (some `En`/`Ar` variants missing); assert both variants present in `props`, empty string for missing
    - **Property 2: Bilingual Field Completeness** | **Validates: Requirements 1.6** | 500 runs
    - _Requirements: 1.6_

  - [ ]* 40.3 Write property test for Property 3 — Items Array Routing
    - Generate random sections with known items-having block types; assert items array lands in `props[itemsField.key]`, not as spread scalar keys
    - **Property 3: Items Array Routing** | **Validates: Requirements 1.5** | 500 runs
    - _Requirements: 1.5_

- [ ] 41. PBT for layout JSON properties (Properties 4–6)
  - [ ]* 41.1 Write property test for Property 4 — Layout Resolution Precedence
    - Generate random `{layoutJson?, sections[]}` combinations; assert `resolvePageLayout()` returns layout parsed from `layoutJson` whenever it is a non-empty string
    - **Property 4: Layout Resolution Precedence** | **Validates: Requirements 2.4** | 500 runs
    - _Requirements: 2.4_

  - [ ]* 41.2 Write property test for Property 5 — Slug Format Validation
    - Use `fc.string()` with all printable chars; assert slug validator accepts string if and only if it matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`
    - **Property 5: Slug Format Validation** | **Validates: Requirements 5.3, 6.2** | 1000 runs
    - _Requirements: 5.3, 6.2_

  - [ ]* 41.3 Write property test for Property 6 — Layout JSON Round-Trip Integrity
    - Use `arbitraryPageLayout({maxDepth: 5})` including Arabic Unicode strings; serialize → parse → assert deep equality; run 500 iterations with `seed: 42`; report seed + inputs on failure
    - **Property 6: Layout JSON Round-Trip Integrity** | **Validates: Requirements 26.1–26.7** | 500 runs
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7_


- [ ] 42. PBT for state machine and file validation properties (Properties 7–11)
  - [ ]* 42.1 Write property test for Property 7 — Block ID Uniqueness After Duplication
    - Generate random `PageLayout` objects; simulate the `duplicate` ID-regeneration logic; assert every block ID in output differs from every block ID in input (at all nesting depths)
    - **Property 7: Block ID Uniqueness After Duplication** | **Validates: Requirements 21.7** | 500 runs
    - _Requirements: 21.7_

  - [ ]* 42.2 Write property test for Property 8 — Layout JSON Validator Rejects Malformed Input
    - Generate valid layouts then randomly corrupt them (remove `version`, remove `blocks`, remove per-block `id`/`type`/`props`); assert `LayoutJsonValidator.validate()` returns non-empty errors with correct `path`
    - **Property 8: Layout JSON Validator Rejects Malformed Input** | **Validates: Requirements 24.1–24.5** | 500 runs
    - Note: backend property — write as a JUnit 5 test using `net.jqwik:jqwik` or adapt to a Vitest PBT targeting the TS port of the validator
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

  - [ ]* 42.3 Write property test for Property 9 — Duplicate Block ID Detection
    - Generate valid layouts; inject duplicate IDs at random nesting depths; assert validator returns error identifying the duplicate
    - **Property 9: Duplicate Block ID Detection** | **Validates: Requirements 24.6** | 500 runs
    - _Requirements: 24.6_

  - [ ]* 42.4 Write property test for Property 10 — File Upload Type and Size Gate
    - Generate random `{mimeType: string, sizeBytes: number}` pairs; assert upload is accepted iff MIME ∈ {jpeg/png/gif/webp} AND sizeBytes ≤ 10485760
    - **Property 10: File Upload Type and Size Gate** | **Validates: Requirements 15.3, 15.6, 17.5** | 1000 runs
    - _Requirements: 15.3, 15.6, 17.5_

  - [ ]* 42.5 Write property test for Property 11 — Workflow State Machine Validity
    - Generate random `(fromState, toState, userRole)` triples; assert backend transition logic approves iff pair is in allowed set AND role has permission
    - **Property 11: Workflow State Machine Validity** | **Validates: Requirements 9.8, 9.9, 9.10** | 500 runs
    - _Requirements: 9.8, 9.9, 9.10_

- [ ] 43. PBT for UI logic properties (Properties 12–14)
  - [ ]* 43.1 Write property test for Property 12 — Workflow Status Badge Color Mapping
    - Use `fc.string()` for status values; assert rendered `WorkflowStatusBadge` applies exact CSS classes for known statuses; unknown values render neutral gray without throwing
    - **Property 12: Workflow Status Badge Color Mapping** | **Validates: Requirements 10.2** | 500 runs
    - _Requirements: 10.2_

  - [ ]* 43.2 Write property test for Property 13 — SEO Character Counter Color Rules
    - Use `fc.integer({min: 0, max: 300})` for character counts; assert counter shows green when 1≤n≤60, yellow when n=0, red when n>60 (meta_title); same with 160-char threshold for meta_description
    - **Property 13: SEO Character Counter Color Rules** | **Validates: Requirements 19.2, 19.3** | 500 runs
    - _Requirements: 19.2, 19.3_

  - [ ]* 43.3 Write property test for Property 14 — Menu Nesting Depth Constraint
    - Generate random tree structures and drop targets; assert any drop that would produce nesting depth > 3 is rejected and tree state is left unchanged
    - **Property 14: Menu Nesting Depth Constraint** | **Validates: Requirements 14.3, 14.8** | 500 runs
    - _Requirements: 14.3, 14.8_


---

### Wave 6 — Integration & Verification

- [ ] 44. End-to-end verification of legacy page loading
  - [ ] 44.1 Write integration tests for `migrateLegacySections()` covering all 24 legacy component types with real database fixture data
    - File: `frontend/src/lib/__tests__/page-layout.integration.test.ts`
    - Load fixture JSON from real `page_sections` rows (or representative fixtures); verify no parse errors after migration; verify all blocks have populated `props`
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [ ] 44.2 Write backend integration test for `GET /api/admin/pages/{id}` returning `layoutJson` and `sections`
    - File: `backend/src/test/java/org/ssssy/backend/controller/PageControllerIntegrationTest.java`
    - Use Spring Boot test slice with in-memory or testcontainers PostgreSQL; verify response shape matches `PageResponse`
    - _Requirements: 4.3_

- [ ] 45. Workflow integration tests
  - [ ] 45.1 Write integration test for full workflow lifecycle: `DRAFT → REVIEW → APPROVED → PUBLISHED`
    - File: `backend/src/test/java/org/ssssy/backend/service/PageWorkflowIntegrationTest.java`
    - Assert `page_workflow_transitions` row inserted at each step; `page.workflow_status` updated; prior state unchanged on invalid transition (wrong role, wrong source state)
    - _Requirements: 9.2–9.10_

  - [ ] 45.2 Write integration test verifying email notification is dispatched asynchronously on REVIEW transition
    - Use `@MockBean EmailService`; verify `emailService.send()` called after state transition; verify API response returned before email dispatch
    - _Requirements: 9.4, 11.1, 11.6_

- [ ] 46. Media library integration tests
  - [ ] 46.1 Write integration test for `POST /api/admin/media` with real MinIO (testcontainers or mock)
    - Verify: file stored in MinIO `originals/`; thumb stored in `thumbs/`; DB row created after MinIO success; DB row NOT created on MinIO failure (returns 500)
    - _Requirements: 15.4, 15.5_

  - [ ] 46.2 Write integration test for `GET /api/preview/pages/{id}?token=` with expired token
    - Create preview token with `expires_at` in the past; assert HTTP 403 returned
    - _Requirements: 8.7_

  - [ ] 46.3 Write integration test for slug conflict returning HTTP 409
    - Create two pages with the same slug; assert second PUT returns 409 with `conflictingPageId`
    - _Requirements: 6.4, 6.5_

- [ ] 47. Final TypeScript check, lint, and build verification
  - [ ] 47.1 Run full TypeScript check across entire frontend
    - Run `npx tsc --noEmit` from `frontend/`; resolve any remaining type errors
    - _Requirements: all frontend requirements_

  - [ ] 47.2 Run ESLint across frontend
    - Run `npm run lint` from `frontend/`; fix any new lint errors introduced by Wave 3/4 changes
    - _Requirements: all frontend requirements_

  - [ ] 47.3 Run backend compile and test suite
    - Run `mvn clean compile` then `mvn test` from `backend/`; ensure all existing tests still pass plus all new tests added in Waves 0–1
    - _Requirements: all backend requirements_

- [ ] 48. Final integration checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `npx tsc --noEmit` and `npm run lint` both exit 0
  - Verify `mvn clean compile` exits 0
  - Confirm Flyway migration `V39__cms_foundation_stage1.sql` runs without errors on a clean database
  - _Requirements: all requirements_


---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP (all PBT tasks in Wave 5)
- Wave 2 runs in parallel with Wave 1 — both depend only on Wave 0
- The Flyway migration was deployed as `V39__cms_foundation_stage1.sql` (not V17 as originally planned — V17 through V38 were already taken by other migrations)
- The entity for workflow transitions was created as `PageWorkflowTransition` (not `WorkflowTransition`) to avoid naming collision with the existing general-purpose `WorkflowTransition` entity
- Task 23 upgrades the existing basic `MediaLibraryModal` at `frontend/src/components/page-builder/MediaLibraryModal.tsx` rather than creating a new file
- Task 29 is a verification step since the `ImageFieldWidget` already references `MediaLibraryModal` — just confirm the wiring still works after task 23's upgrade
- The migration script (`MigrateLegacySectionsScript`) should run exactly once; guard with `migration.legacy-sections.enabled=false` config flag and flip only after a database backup
- Thumbnail generation requires an image-processing library on the backend (e.g., Thumbnailator); verify it is in `pom.xml` before Wave 1 work on task 7.3
- The `fast-check` library is used for Wave 5 PBT tests; verify it is in `frontend/package.json` before starting Wave 5


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"]
    },
    {
      "id": 2,
      "tasks": ["2.8", "3.1", "4.1", "5.1", "6.1", "7.1", "7.2", "7.3", "7.4", "8.1", "8.2"]
    },
    {
      "id": 3,
      "tasks": ["3.2", "4.2", "5.2"]
    },
    {
      "id": 4,
      "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9", "11.1", "11.2", "12.1", "12.2", "13.1", "14.1", "14.2", "14.3", "14.4", "15.1", "15.2", "16.1", "16.2", "16.3", "18.1", "18.2", "19.1"]
    },
    {
      "id": 5,
      "tasks": ["18.3", "19.2", "19.3"]
    },
    {
      "id": 6,
      "tasks": ["21.1", "21.2", "21.3", "21.4", "21.5", "22.1", "22.2", "23.1", "23.2", "23.3", "23.4", "24.1", "24.2", "25.1"]
    },
    {
      "id": 7,
      "tasks": ["27.1", "27.2", "27.3", "28.1", "29.1", "30.1", "31.1", "32.1", "32.2", "32.3", "33.1", "34.1", "35.1", "36.1", "37.1", "37.2", "37.3", "38.1"]
    },
    {
      "id": 8,
      "tasks": ["40.1", "40.2", "40.3", "41.1", "41.2", "41.3", "42.1", "42.2", "42.3", "42.4", "42.5", "43.1", "43.2", "43.3"]
    },
    {
      "id": 9,
      "tasks": ["44.1", "44.2", "45.1", "45.2", "46.1", "46.2", "46.3"]
    },
    {
      "id": 10,
      "tasks": ["47.1", "47.2", "47.3"]
    }
  ]
}
```
