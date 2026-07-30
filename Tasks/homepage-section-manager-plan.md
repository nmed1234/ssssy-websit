# Homepage Section Manager — Complete Overhaul Plan

## Top-Level Overview

**Goal**: Replace the current JSON-based site sections admin with a world-class, friendly Homepage Section Manager that supports:
- A visual template gallery to add pre-built sections in one click
- A block-based custom section builder (with column/grid as a block type) for empty sections
- Dual admin views: List View (enhanced) and Canvas View (live-stacked preview)
- Draft/Publish workflow with full version history and rollback
- All content block types: Core + Dynamic + Advanced

**Scope**:
- Backend: new DB columns for status/draft snapshot, new endpoints for publish/history/rollback, section templates seeding
- Frontend Admin: new template gallery modal, rebuilt section manager page with dual views, new custom block builder panel
- Frontend Public: no breaking changes — homepage rendering adapts to new published_data field

**Approach**:
- Evolve the existing `site_sections` table (additive DB migration — no breaking changes)
- Keep all existing API endpoints working; add new ones
- Replace the admin page UI fully; the public homepage page.tsx is unchanged except to read `publishedData` for rendering

### Additional Confirmed Details
- **Canvas View frame**: Two modes the admin can toggle between during session:
  1. **Borderless Canvas** — no device frame, sections stacked with subtle drop shadow (Webflow/Framer style, maximizes working area) — default
  2. **Browser Chrome** — flat minimal browser chrome (address bar + tab dots at top), simulates a real browser viewport
- **Dynamic blocks in preview**: Placeholder/skeleton UI — shows correct layout shape with grey boxes, no real API data fetched inside the builder
- **Publish permission**: `PUBLISHER`, `ADMIN`, `SUPER_ADMIN` only — `EDITOR` role can save drafts but cannot publish to the live site
- **Template language**: All pre-built templates ship with **fully bilingual** placeholder text — both `titleEn`/`descriptionEn` and `titleAr`/`descriptionAr` populated

---

## Confirmed Design Decisions

| Decision | Choice |
|---|---|
| Add section UI | Full visual template gallery with SVG mockup previews |
| Empty section builder | Block-based vertical builder with Columns/Grid as a block type |
| Admin homepage view | Both modes: List View toggle + Canvas View toggle |
| Save/Publish flow | Draft/Publish workflow + version history with rollback |
| Content block types | ALL blocks: Core + Dynamic + Advanced (25+ block types) |
| Canvas View frame | Two toggleable styles: Borderless Canvas (default) + Browser Chrome frame — admin switches during session |
| Dynamic blocks in live preview | Placeholder/skeleton UI — correct layout shape, no real data fetched |
| Publish permission | PUBLISHER, ADMIN, SUPER_ADMIN only — EDITOR can only save drafts |
| Template default language | Fully bilingual — English + Arabic placeholder text in all templates |

---

## Architecture Overview

### New DB Shape (additive, V62 migration)
- Add `status` column: `DRAFT | PUBLISHED` (default `DRAFT`)
- Add `published_data` JSONB column: stores the last-published snapshot of `data`
- Add `published_config` JSONB column: stores the last-published snapshot of `config`
- Add `published_styling` JSONB column: stores last-published snapshot of `styling`
- Add `published_at` timestamp
- New table: `site_section_versions` — stores full snapshots per version number (for history/rollback)

### New Section Type: `custom`
- Sections with `componentType = "custom"` use a new `CustomSection` renderer
- The `data` JSON stores an array of `blocks[]` — each block has `type`, `props`, `children[]`
- Block types: heading, paragraph, image, button, divider, spacer, columns, video, icon, card, accordion, timeline, team-grid, map, form-embed, alert, quote, code, html, latest-news, upcoming-events, publications-carousel, board-members, statistics-counter

### Draft/Publish Flow
1. Admin edits → changes written to `data/config/styling` (always draft)
2. Admin clicks Publish → `published_data/config/styling` updated, `status=PUBLISHED`, snapshot saved to history table
3. Public homepage reads `published_data/config/styling` (not `data/config/styling`) for PUBLISHED sections
4. Rollback: copy a version's snapshot back to `data/config/styling` (sets back to draft)

---

## Sub-Tasks

---

### Sub-Task 1 — DB Migration: Extend `site_sections` + Create Version History Table

**Intent**: Add the draft/publish columns to `site_sections` and create the `site_section_versions` table for version history. This is a pure additive migration — no existing data is touched.

**Expected Outcomes**:
- New columns exist in `site_sections`: `status`, `published_data`, `published_config`, `published_styling`, `published_at`
- New table `site_section_versions` with columns: `id`, `section_id`, `version_number`, `data`, `config`, `styling`, `published_by`, `created_at`, `change_summary`
- All existing rows default to `status='PUBLISHED'` and `published_data` = current `data` (safe rollout)
- Indexes added for performance

**Todo List**:
1. Create `backend/src/main/resources/db/migration/V62__site_sections_versioning.sql`
2. `ALTER TABLE site_sections ADD COLUMN status VARCHAR(20) DEFAULT 'PUBLISHED'`
3. `ALTER TABLE site_sections ADD COLUMN published_data JSONB`
4. `ALTER TABLE site_sections ADD COLUMN published_config JSONB`
5. `ALTER TABLE site_sections ADD COLUMN published_styling JSONB`
6. `ALTER TABLE site_sections ADD COLUMN published_at TIMESTAMP`
7. `UPDATE site_sections SET published_data=data, published_config=config, published_styling=styling, published_at=updated_at WHERE status IS NULL OR status='PUBLISHED'`
8. Create `site_section_versions` table with all required columns + FK to site_sections
9. Add index on `site_section_versions(section_id, version_number DESC)`

**Relevant Context**:
- Follow pattern from `V49__publications_table.sql` for migration style
- Highest current migration: V61 → use V62
- Entity file: `backend/src/main/java/org/ssssy/backend/model/entity/SiteSection.java`

**Status**: [ ] pending

---

### Sub-Task 2 — Backend: Extend Entity, DTOs, Service & Controller

**Intent**: Update the backend to support the new draft/publish workflow, version history, and the new `status` field. Add new endpoints for publish, revert-to-draft, version history list, and rollback.

**Expected Outcomes**:
- `SiteSection` entity has new fields: `status`, `publishedData`, `publishedConfig`, `publishedStyling`, `publishedAt`
- New entity `SiteSectionVersion` maps to `site_section_versions`
- `SiteSectionRequest` accepts optional `status` field
- `SiteSectionResponse` returns new fields including `status`, `publishedAt`, `publishedData/Config/Styling`
- New endpoints:
  - `POST /api/admin/site-sections/{id}/publish` — publish current draft
  - `POST /api/admin/site-sections/{id}/unpublish` — revert to draft-only (hide from public)
  - `GET /api/admin/site-sections/{id}/versions` — list all versions
  - `POST /api/admin/site-sections/{id}/rollback/{versionNumber}` — restore a version to draft
- Public endpoint continues to work but now returns `publishedData/Config/Styling` instead of `data/config/styling` for PUBLISHED sections
- Existing save (PUT) writes to draft fields only; does not auto-publish

**Todo List**:
1. Update `SiteSection.java` — add 5 new fields with JPA annotations
2. Create `SiteSectionVersion.java` entity (maps to `site_section_versions`)
3. Create `SiteSectionVersionRepository.java` extends `JpaRepository`
4. Update `SiteSectionRequest.java` — add optional `status` field
5. Update `SiteSectionResponse.java` — add new fields, add `versionCount` (Long)
6. Update `SiteSectionService.java`:
   - `update()` must NOT auto-publish; writes only to draft fields
   - Add `publish(UUID id, String publishedBy)` — snapshots to published fields + inserts into versions table
   - Add `unpublish(UUID id)` — sets status back to DRAFT
   - Add `getVersionHistory(UUID id)` — returns list of `SiteSectionVersionResponse`
   - Add `rollback(UUID id, int versionNumber)` — copies version snapshot back to draft fields
   - Update `getActiveSectionsByLocation()` — public endpoint returns `publishedData/Config/Styling` for rendering
7. Update `SiteSectionController.java` — add 4 new endpoints with proper `@PreAuthorize`:
   - `publish` and `unpublish` require `hasAnyRole('PUBLISHER','ADMIN','SUPER_ADMIN')`
   - `getVersions` and `rollback` require `hasAnyRole('EDITOR','PUBLISHER','ADMIN','SUPER_ADMIN')`
8. Add `SiteSectionVersionResponse.java` DTO

**Relevant Context**:
- Controller: `backend/src/main/java/org/ssssy/backend/controller/SiteSectionController.java`
- Service: `backend/src/main/java/org/ssssy/backend/service/SiteSectionService.java`
- Entity: `backend/src/main/java/org/ssssy/backend/model/entity/SiteSection.java`
- Pattern for responses: see `SiteSectionResponse.java` in `backend/src/main/java/org/ssssy/backend/model/dto/`
- Cache eviction: all mutations must call `@CacheEvict(allEntries=true)` on `siteSections` cache

**Status**: [ ] pending

---

### Sub-Task 3 — Frontend: Update Types & API Client

**Intent**: Update TypeScript types and API wrapper functions to support the new backend fields and endpoints, keeping everything backward-compatible.

**Expected Outcomes**:
- `SiteSection` type in `types/index.ts` has new fields: `status`, `publishedData`, `publishedConfig`, `publishedStyling`, `publishedAt`
- New `SiteSectionVersion` type defined
- `site-sections.ts` API lib has new functions: `publishSiteSection()`, `unpublishSiteSection()`, `getSiteSectionVersions()`, `rollbackSiteSection()`
- Public homepage page.tsx reads `publishedData/Config/Styling` when available, falls back to `data/config/styling`

**Todo List**:
1. Update `frontend/src/types/index.ts` — extend `SiteSection` interface with 5 new optional fields
2. Add `SiteSectionVersion` interface to `types/index.ts`
3. Update `frontend/src/lib/site-sections.ts`:
   - Add `publishSiteSection(id: string)`
   - Add `unpublishSiteSection(id: string)`
   - Add `getSiteSectionVersions(id: string)`
   - Add `rollbackSiteSection(id: string, versionNumber: number)`
4. Update `frontend/src/app/(public)/HomepageClient.tsx`:
   - `sectionConfig()` helper: prefer `section.publishedConfig` over `section.config`
   - `sectionData()` helper: prefer `section.publishedData` over `section.data`
   - Add renderer case for `"custom"` component type → `<CustomSection blocks={data.blocks} />`

**Relevant Context**:
- Types file: `frontend/src/types/index.ts` — SiteSection interface at line ~426
- API lib: `frontend/src/lib/site-sections.ts`
- Homepage client: `frontend/src/app/(public)/HomepageClient.tsx`

**Status**: [ ] pending

---

### Sub-Task 4 — Frontend: Section Template Library (Template Gallery Modal)

**Intent**: Build a full-screen modal that presents all pre-built section templates as a visual gallery with SVG/HTML mockup previews. When an admin clicks a template, it creates a new section pre-populated with that template's default content and navigates straight into the builder.

**Expected Outcomes**:
- New component: `frontend/src/components/admin/SectionTemplateGallery.tsx`
- Gallery shows 20+ template cards organized by category tabs: Layout, Hero, Content, Media, Interactive, Dynamic, Custom
- Each card shows: section type name, description, SVG wireframe mockup preview, "Add Section" button
- Clicking a template: creates section with template defaults in draft, opens builder panel immediately
- "Start from blank" option: creates empty `custom` type section, opens block builder
- Gallery replaces the current "New Section" inline form
- Templates cover all supported componentTypes plus the new `custom` type

**Todo List**:
1. Create `frontend/src/lib/section-templates.ts` — define 20+ template definitions:
   - Each template: `{ id, name, description, componentType, defaultData, defaultConfig, defaultStyling, category, mockupSvg }`
   - Categories: Hero, Content, Cards, Statistics, Media, Forms, Custom
   - Cover: hero, hero-carousel, card-group, cta, stats, testimonials, newsletter, contact-form, publications-carousel, latest-news-feed, upcoming-events-feed, faq, team, timeline, banner, divider, spacer, custom (blank)
2. Create SVG wireframe mockup for each template type (inline SVG, not images)
3. Create `frontend/src/components/admin/SectionTemplateGallery.tsx`:
   - Full-screen modal with backdrop blur
   - Category tab filter bar at top
   - Grid of template cards (3 or 4 columns)
   - Each card: mockup SVG preview area, type badge, name, description, "Use Template" button
   - Search box to filter by name/type
   - "Start from Blank" special card with "+" icon
4. Update `frontend/src/app/admin/site-sections/page.tsx`:
   - Replace "New Section" button behavior — opens template gallery instead of inline form
   - After template selection: call `createSiteSection()` then immediately open `SectionBuilderPanel`

**Relevant Context**:
- Existing schemas: `frontend/src/lib/section-field-schemas.ts` (use for default data structures)
- Builder panel: `frontend/src/components/admin/SectionBuilderPanel.tsx` (will be opened after template selection)
- Current page: `frontend/src/app/admin/site-sections/page.tsx`

**Status**: [ ] pending

---

### Sub-Task 5 — Frontend: Custom Block Builder

**Intent**: Build a new block-based content builder panel (separate from `SectionBuilderPanel`) specifically for `custom` type sections. This panel allows admins to add, reorder, and configure individual content blocks vertically, with Columns/Grid as a block type.

**Expected Outcomes**:
- New component: `frontend/src/components/admin/CustomSectionBuilder.tsx`
- Block palette sidebar with all block types organized by group
- Full block type coverage:
  - **Core**: Heading, Paragraph, Image, Button, Divider, Spacer, Columns/Grid, Video, Icon, Card
  - **Advanced**: Accordion/FAQ, Timeline, Team Grid, Map, Form Embed, Alert/Banner, Quote, Code Block, HTML Embed
  - **Dynamic**: Latest News, Upcoming Events, Publications Carousel, Board Members, Statistics Counter
- Each block has a properties panel (sidebar or inline expand) for editing its props
- Drag-to-reorder blocks within the section
- Columns block: defines 1-4 columns, each column contains its own nested block list
- Live preview on the right at 45% scale (same as SectionBuilderPanel)
- **Dynamic blocks in preview** render as skeleton/placeholder UI — correct layout shape with grey shimmer boxes, no real API calls made in the builder
- Save writes blocks array to `section.data.blocks[]`
- Block schema type: `{ id: string, type: BlockType, props: Record<string, unknown>, children?: Block[] }`

**Todo List**:
1. Create `frontend/src/lib/block-types.ts`:
   - Define `BlockType` union type (all 25+ block type strings)
   - Define `Block` interface: `{ id, type, props, children? }`
   - Define block palette registry: for each type, define `{ type, label, icon, defaultProps, category }`
2. Create `frontend/src/lib/block-prop-schemas.ts`:
   - Define prop editor schemas for each block type (similar to `section-field-schemas.ts`)
   - Core: heading (text, level, align, bilingual), paragraph (content, bilingual), image (src, alt, width, height, rounded), button (label, url, variant, bilingual), divider (style), spacer (height), video (src, autoplay, controls), icon (name, size, color), card (title, desc, image, link), columns (count, gap, blocks[])
   - Advanced: accordion (items[]), timeline (items[]), team-grid (members[]), map (embedUrl), alert (variant, message), quote (text, author), code (language, code), html (rawHtml)
   - Dynamic: latest-news (count, layout), upcoming-events (count), publications-carousel (title), board-members (title, layout), statistics-counter (items[])
3. Create `frontend/src/components/admin/CustomSectionBuilder.tsx` (main component):
   - Left sidebar: block palette with grouped categories + search
   - Center: vertical block list (drag-to-reorder using HTML5 drag)
   - Right pane: live preview (scaled) OR prop editor for selected block (toggle)
   - "Add block" click from palette: appends block with default props to list
   - Block item row: drag handle, type icon, label/summary, expand props button, delete button
   - Prop editor: renders field inputs based on `block-prop-schemas.ts` definition
4. Create `frontend/src/components/admin/BlockPropEditor.tsx`:
   - Renders fields for a given block's props based on schema
   - Re-uses `SectionFieldRenderer` patterns where possible
   - Handles nested blocks for Columns type (recursive mini block list)
5. Create `frontend/src/components/ui/CustomSection.tsx` (public renderer):
   - Renders a `custom` section's `blocks[]` array for the public homepage
   - Renders each block by type, passes its `props` to the right sub-renderer
   - All sub-renderers use Tailwind, are responsive, bilingual-aware
6. Update `frontend/src/app/admin/site-sections/page.tsx`:
   - If section `componentType === 'custom'`, clicking "Edit Content" opens `CustomSectionBuilder` instead of `SectionBuilderPanel`

**Relevant Context**:
- `SectionBuilderPanel.tsx` — pattern to follow for the panel layout and preview integration
- `SectionFieldRenderer.tsx` — existing field renderer to reuse for prop editing
- `HomepageClient.tsx` — must register `"custom"` type to render `<CustomSection blocks={data.blocks} />`
- Public section components in `frontend/src/components/sections/` — sub-renderers for dynamic blocks can re-use these

**Status**: [ ] pending

---

### Sub-Task 6 — Frontend: Rebuilt Admin Section Manager Page (Dual View)

**Intent**: Completely rebuild `frontend/src/app/admin/site-sections/page.tsx` with a polished, feature-rich UI that has dual view modes (List View and Canvas View), integrates all new features, and makes section management intuitive.

**Expected Outcomes**:
- **Page Header**: Title, subtitle, view toggle buttons (List/Canvas), "Add Section" button (opens template gallery)
- **Filter Bar**: Filter by location (All / Homepage / Footer / Sidebar / General), filter by status (All / Draft / Published), search by name
- **List View** (default, enhanced):
  - Rich section cards — not plain rows
  - Each card shows: section thumbnail/icon, name, type badge, location badge, status badge (Draft/Published), last edited, sort handle
  - Action buttons: Edit Content, Publish/Unpublish, Version History, Duplicate, Delete
  - Inline status indicator (green dot = Published, amber dot = Draft with unpublished changes)
  - Drag-to-reorder preserved
- **Canvas View** (new):
  - Shows sections stacked in a device-frame mockup (simulated webpage view)
  - Each stacked section renders as a mini live preview card at ~30% scale
  - Click any section in the canvas to jump to its builder
  - Drag-to-reorder sections in canvas view (updates sortOrder)
  - Toggle between "Desktop" and "Mobile" canvas frame
- **Version History Drawer** (slide-over panel):
  - Opens when admin clicks "Version History" on a section
  - Lists all versions: version number, published_at date, published_by user, change summary
  - Each row has "Restore to Draft" button
  - Currently-live version is highlighted

**Todo List**:
1. Rewrite `frontend/src/app/admin/site-sections/page.tsx`:
   - Replace old state structure with new: `viewMode: 'list' | 'canvas'`, `statusFilter`, `locationFilter`, `searchQuery`
   - Replace inline new form with template gallery modal trigger
   - Remove the old JSON textarea inline form entirely
   - Add filter bar component (inline, not a separate file needed)
   - Add view mode toggle buttons in header
2. Build `SectionCard.tsx` (new component in `frontend/src/components/admin/`):
   - Full-featured section card for list view
   - Props: section data, onEdit, onPublish, onUnpublish, onHistory, onDuplicate, onDelete, onDragStart/End
3. Build `CanvasView.tsx` (new component in `frontend/src/components/admin/`):
   - **Canvas style toggle** (persisted in `localStorage`): two modes the admin can switch between at any time:
     - **Borderless Canvas** (default) — no device frame, sections stacked with subtle card drop shadow and hover ring, full working width (Webflow/Framer style)
     - **Browser Chrome** — flat minimal browser chrome wrapper (grey top bar with 3 dot buttons + address bar showing site URL) around the stacked sections
   - Each section in both modes renders as a mini-preview card at scale 0.30 with hover highlight
   - Each item is clickable (opens builder), draggable (updates sortOrder)
   - Toggle between Desktop (1280px) and Mobile (390px) preview width (separate from canvas style toggle)
   - Canvas style toggle button group sits in the toolbar alongside the Desktop/Mobile toggle
4. Build `VersionHistoryDrawer.tsx` (new component in `frontend/src/components/admin/`):
   - Slide-over panel from right
   - Fetches `getSiteSectionVersions(id)` on open
   - Lists versions as timeline rows
   - "Restore to Draft" calls `rollbackSiteSection(id, versionNumber)` then shows success toast
5. Update `SectionBuilderPanel.tsx`:
   - Replace "Save" button with two-button cluster: "Save Draft" + "Save & Publish"
   - "Save Draft" calls `updateSiteSection()` — no publish
   - "Save & Publish" calls `updateSiteSection()` then `publishSiteSection()`
   - Add status chip in header showing current section status + last published date

**Relevant Context**:
- Current page: `frontend/src/app/admin/site-sections/page.tsx` (to be replaced/rewritten)
- Builder panel: `frontend/src/components/admin/SectionBuilderPanel.tsx` (to be updated)
- API helpers: `frontend/src/lib/site-sections.ts`
- Types: `frontend/src/types/index.ts`

**Status**: [ ] pending

---

### Sub-Task 7 — Frontend: Register New Components & Wire Everything Together

**Intent**: Register all new components into the system — the `custom` section renderer in `HomepageClient`, new block renderers, update barrel exports, and verify the full end-to-end flow works.

**Expected Outcomes**:
- `HomepageClient.tsx` renders `custom` sections using `CustomSection`
- All new admin components are properly imported in the page
- `AdminSidebar.tsx` navigation item for site-sections remains; no changes needed
- `section-field-schemas.ts` gets schemas for any new predefined section types (faq, team, timeline) that are newly wired up in HomepageClient
- HomepageClient handles the new section types: `faq`, `team`, `timeline`, `banner` that already have schemas but no renderer registration
- Section preview in `SectionBuilderPanel` gets a case for `custom` type (renders `CustomSection` for live preview)
- Frontend compiles with `npm run build` cleanly

**Todo List**:
1. Update `frontend/src/app/(public)/HomepageClient.tsx`:
   - Add case for `"custom"` → `<CustomSection blocks={sectionData(s).blocks || []} />`
   - Add cases for `"faq"` → `<FaqSection>`, `"team"` → `<TeamSection>`, `"timeline"` → `<TimelineSection>`, `"banner"` → `<BannerSection>` (create these if they don't exist yet as simple renderers)
   - Prefer `publishedData/Config/Styling` over draft for rendering
2. Create `frontend/src/components/sections/FaqSection.tsx` — renders FAQ accordion from `data.items[]`
3. Create `frontend/src/components/sections/TeamSection.tsx` — renders team member grid from `data.members[]`
4. Create `frontend/src/components/sections/TimelineSection.tsx` — renders vertical timeline from `data.items[]`
5. Create `frontend/src/components/sections/BannerSection.tsx` — renders full-width announcement banner
6. Update `frontend/src/components/sections/index.ts` barrel to export all new sections
7. Update `SectionBuilderPanel.tsx` preview map to include `custom` type and new section types
8. Run `npx tsc --noEmit` to verify zero TypeScript errors
9. Run `npm run lint` to verify zero lint errors

**Relevant Context**:
- `HomepageClient.tsx`: `frontend/src/app/(public)/HomepageClient.tsx`
- `SectionBuilderPanel.tsx` preview section component map
- Sections barrel: `frontend/src/components/sections/index.ts`
- New `CustomSection` renderer: `frontend/src/components/ui/CustomSection.tsx` (created in Sub-Task 5)

**Status**: [ ] pending

---

## File Change Map

### New Files (to be created)
| File | Purpose |
|---|---|
| `backend/.../db/migration/V62__site_sections_versioning.sql` | DB migration |
| `backend/.../model/entity/SiteSectionVersion.java` | Version history entity |
| `backend/.../repository/SiteSectionVersionRepository.java` | JPA repository |
| `backend/.../model/dto/SiteSectionVersionResponse.java` | DTO |
| `frontend/src/lib/section-templates.ts` | Template definitions with defaults |
| `frontend/src/lib/block-types.ts` | Block type definitions and palette registry |
| `frontend/src/lib/block-prop-schemas.ts` | Prop editor schemas per block type |
| `frontend/src/components/admin/SectionTemplateGallery.tsx` | Template picker modal |
| `frontend/src/components/admin/CustomSectionBuilder.tsx` | Block builder panel |
| `frontend/src/components/admin/BlockPropEditor.tsx` | Block property editor |
| `frontend/src/components/admin/SectionCard.tsx` | Enhanced section card for list view |
| `frontend/src/components/admin/CanvasView.tsx` | Visual canvas view of sections |
| `frontend/src/components/admin/VersionHistoryDrawer.tsx` | Version history slide-over panel |
| `frontend/src/components/ui/CustomSection.tsx` | Public renderer for custom sections |
| `frontend/src/components/sections/FaqSection.tsx` | FAQ accordion section |
| `frontend/src/components/sections/TeamSection.tsx` | Team grid section |
| `frontend/src/components/sections/TimelineSection.tsx` | Timeline section |
| `frontend/src/components/sections/BannerSection.tsx` | Banner/announcement section |

### Modified Files (existing files changed)
| File | Change |
|---|---|
| `backend/.../model/entity/SiteSection.java` | Add 5 new fields |
| `backend/.../model/dto/SiteSectionRequest.java` | Add `status` field |
| `backend/.../model/dto/SiteSectionResponse.java` | Add new response fields |
| `backend/.../service/SiteSectionService.java` | Add publish/history/rollback methods |
| `backend/.../controller/SiteSectionController.java` | Add 4 new endpoints |
| `frontend/src/types/index.ts` | Extend SiteSection, add SiteSectionVersion |
| `frontend/src/lib/site-sections.ts` | Add 4 new API functions |
| `frontend/src/app/admin/site-sections/page.tsx` | Full rewrite with dual view |
| `frontend/src/components/admin/SectionBuilderPanel.tsx` | Add Save Draft/Publish buttons + status |
| `frontend/src/app/(public)/HomepageClient.tsx` | Prefer publishedData, add custom/faq/team/timeline renderers |
| `frontend/src/components/sections/index.ts` | Add new section exports |

---

## Key Data Structures

### Block (for custom sections)
```typescript
interface Block {
  id: string;           // nanoid
  type: BlockType;
  props: Record<string, unknown>;
  children?: Block[];   // for Columns type: one children[] per column
}

interface ColumnsBlockProps {
  columnCount: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
  columns: Block[][];   // array of column block arrays
}
```

### SiteSection extended
```typescript
interface SiteSection {
  // ... existing fields ...
  status?: 'DRAFT' | 'PUBLISHED';
  publishedData?: Record<string, unknown>;
  publishedConfig?: Record<string, unknown>;
  publishedStyling?: Record<string, unknown>;
  publishedAt?: string;
}

interface SiteSectionVersion {
  id: string;
  sectionId: string;
  versionNumber: number;
  data: Record<string, unknown>;
  config: Record<string, unknown>;
  styling: Record<string, unknown>;
  publishedBy?: string;
  changeSummary?: string;
  createdAt: string;
}
```

---

## Implementation Order

Sub-tasks must be done in order: 1 → 2 → 3 → 4 → 5 → 6 → 7

- Sub-task 1 (DB) must precede Sub-task 2 (Backend)
- Sub-task 2 (Backend) must precede Sub-task 3 (Frontend types/API)
- Sub-tasks 4, 5, 6 can run in any order after Sub-task 3 — they are independent frontend features
- Sub-task 7 (wiring) must be last

---

## Validation Criteria

After all sub-tasks are complete:
- [ ] `cd backend && mvn clean compile` passes with zero errors
- [ ] `cd frontend && npx tsc --noEmit` passes with zero errors
- [ ] `cd frontend && npm run lint` passes with zero warnings
- [ ] Admin can navigate to `/admin/site-sections` and see the new dual-view page
- [ ] "Add Section" opens the template gallery with 20+ templates
- [ ] Selecting a template creates a section and opens the builder immediately
- [ ] "Start from blank" creates a `custom` section and opens the block builder
- [ ] Adding blocks in the block builder updates the live preview
- [ ] "Save Draft" saves without publishing; public site does not change
- [ ] "Save & Publish" saves and publishes; public site immediately reflects changes
- [ ] Version history drawer lists all versions; "Restore to Draft" works
- [ ] Canvas View shows visual stacked preview of all homepage sections
- [ ] All existing sections still render correctly on the public homepage
