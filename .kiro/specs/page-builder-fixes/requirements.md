# Requirements Document

## Introduction

The SSSSY website uses a block-tree page builder that stores pages as `Block[]` in `pages.layout_json`. Six categories of bugs and gaps were discovered through testing. This document captures the fixes needed so that edits made in the admin page builder reliably appear on every public page, the builder canvas is fully interactive (correct child selection, drag-and-drop positioning, layout presets), dynamic content feeds render real data, and inline text editing reaches all text-bearing block types.

The affected surfaces are:
- Seven static public page routes (`/about`, `/board`, `/contact`, `/newsletter`, `/president-message`, `/publications`, and the homepage fallback) that currently read from the legacy `page_sections` table and are blind to `layout_json`.
- `BuilderCanvas.tsx` — the `ChildrenOverlay` architecture that breaks child block selection and container drag-and-drop.
- `BlockRenderer.tsx` — the `news-feed` and `events-feed` block types that render only skeleton placeholders.
- Inline-edit support in `BuilderCanvas.tsx` — currently limited to `heading` and `paragraph` block types.

## Glossary

- **Block**: A node in the page tree with `{ id, type, props, children? }` stored in `pages.layout_json`.
- **BlockRenderer**: The universal React renderer (`BlockRenderer.tsx`) that reads `Block[]` and outputs HTML. Used on public pages and (wrapped) in the builder canvas.
- **BuilderCanvas**: The drag-and-drop editing surface (`BuilderCanvas.tsx`) used in the admin page editor.
- **ChildrenOverlay**: The current strategy in `BuilderCanvas.tsx` that renders an interactive child-block list *below* the parent's `BlockRenderer` visual output, causing click and drop mis-alignment.
- **layout_json**: TEXT column on the `pages` table storing the full `Block[]` tree as JSON.
- **PageSectionRenderer**: The legacy renderer (`PageSectionRenderer.tsx`) that reads from the `page_sections` table. Static public pages currently use this instead of `BlockRenderer`.
- **resolvePageLayout**: Helper in `page-layout.ts` that returns a `PageLayout` — prefers `layout_json`; falls back to migrating flat `page_sections` rows on-the-fly.
- **InnerDropZone**: A drop target rendered between sibling blocks that accepts dragged blocks and palette items.
- **BlockWrapper**: The component in `BuilderCanvas.tsx` that wraps each block with selection ring, transparent click overlay, toolbar, and child-management logic.
- **DynamicFeedPlaceholder**: The current skeleton placeholder used for `news-feed` and `events-feed` blocks when no API data is available.
- **Legacy section**: A `page_sections` row whose `component_type` maps to a block type in `LEGACY_SECTION_TYPES` (e.g. `about-hero-banner`).
- **Public_Page_Route**: Any Next.js page under `src/app/(public)/` that serves content to unauthenticated visitors.
- **API**: The Spring Boot backend accessible at `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api`).

---

## Requirements

### REQ-1: Migrate Static Public Pages to BlockRenderer

**User Story:** As a content editor, I want changes I make in the page builder to appear immediately on every public page of the website, so that I do not have to maintain two separate content systems.

#### Acceptance Criteria

1. WHEN a visitor loads `/about`, THE About_Page SHALL fetch the page record from `GET /api/public/pages/about`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

2. WHEN a visitor loads `/board`, THE Board_Page SHALL fetch the page record from `GET /api/public/pages/board`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

3. WHEN a visitor loads `/contact`, THE Contact_Page SHALL fetch the page record from `GET /api/public/pages/contact`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

4. WHEN a visitor loads `/newsletter`, THE Newsletter_Page SHALL fetch the page record from `GET /api/public/pages/newsletter`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

5. WHEN a visitor loads `/president-message`, THE President_Message_Page SHALL fetch the page record from `GET /api/public/pages/president-message`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

6. WHEN a visitor loads `/publications`, THE Publications_Page SHALL fetch the page record from `GET /api/public/pages/publications`, resolve its layout via `resolvePageLayout(page.layoutJson, legacySections)`, and render the result with `BlockRenderer`.

7. IF `layout_json` is NULL for a given page, THEN THE Public_Page_Route SHALL fall back to fetching `GET /api/public/pages/{slug}/sections` and migrating those legacy sections via `migrateLegacySections`, preserving existing visual output without a blank page.

8. WHEN `layout_json` is populated for a given page, THEN THE Public_Page_Route SHALL NOT fetch the `page_sections` endpoint, avoiding the redundant legacy request.

9. WHILE a public page is loading its layout, THE Public_Page_Route SHALL display a skeleton loading state with at least one animated placeholder element.

10. IF the API request for the page record fails, THEN THE Public_Page_Route SHALL display an error state that includes a retry button.

11. THE migrated public page routes SHALL follow the same fetch-and-render pattern established in `src/app/(public)/page/[slug]/page.tsx`, reusing `resolvePageLayout` and `BlockRenderer` without duplicating fetch logic.

---

### REQ-2: Fix Child Block Selection in the Builder Canvas

**User Story:** As a content editor, I want to click on any block inside a container section in the canvas and have that specific child block selected, so that I can edit its properties in the PropertyPanel without accidentally selecting the parent.

#### Acceptance Criteria

1. WHEN an editor clicks a child block that is visually rendered inside a container block, THE BuilderCanvas SHALL select only that child block and load its properties in the PropertyPanel.

2. WHEN a container block is rendered in the canvas, THE BuilderCanvas SHALL NOT place a transparent full-section click overlay that intercepts clicks intended for child blocks.

3. WHEN a container block has children, THE interactive selection overlays for those children SHALL be positioned to coincide with the actual visual bounding boxes of those children as rendered by `BlockRenderer`.

4. WHEN an editor clicks the background area of a container block that is not occupied by any child block, THE BuilderCanvas SHALL select the container block itself.

5. WHEN a child block is selected, THE selection ring SHALL appear around that child block's visual bounds, not around the parent container.

6. WHEN an editor double-clicks a container block's background area (not a child), THE BuilderCanvas SHALL drill into that container via the `BreadcrumbNav` path, as currently implemented.

7. THE fix to child block selection SHALL NOT break the existing pointer-events-none wrapper around `BlockRenderer` output; the BlockRenderer render SHALL remain non-interactive and the interactive layer SHALL overlay it correctly.

---

### REQ-3: Fix Drag-and-Drop Positioning Inside Container Blocks

**User Story:** As a content editor, I want to drag a block and drop it at a specific position between children inside a container section, so that I can precisely control the order of content without using the Layers panel.

#### Acceptance Criteria

1. WHEN a draggable block or palette item is dragged over a container block's children, THE BuilderCanvas SHALL display `InnerDropZone` indicators at the correct visual positions between those children, aligned with the actual rendered layout.

2. WHEN a block is dropped onto an `InnerDropZone` inside a container, THE BuilderCanvas SHALL insert the block at the corresponding child index within that container's `children` array.

3. WHEN a block is dragged inside a container whose children are rendered in a flex-row or grid layout, THE InnerDropZone indicators SHALL appear between adjacent children, not stacked vertically in a separate area below the container's visual content.

4. WHEN a block is dragged over an empty container block, THE EmptyContainerDropZone SHALL remain visible and accept the drop, inserting the block as the container's first child.

5. WHEN a block is dropped inside a container, THE resulting `Block[]` tree SHALL reflect the new child position immediately without a page refresh.

6. THE drag-and-drop fix inside containers SHALL preserve existing root-level drag-and-drop ordering, which currently works correctly.

---

### REQ-4: Add Layout Presets to the Builder Canvas

**User Story:** As a content editor, I want to insert a pre-built multi-column layout with a single click, so that I do not need to manually create and configure Row and Column blocks one by one.

#### Acceptance Criteria

1. THE BuilderCanvas toolbar SHALL include an "Insert Layout" button that opens a layout preset palette.

2. THE layout preset palette SHALL offer at minimum the following presets:
   - **2 Columns** — a `row` block containing two equal `column` children
   - **3 Columns** — a `row` block containing three equal `column` children
   - **Full Width Section** — a `section` block with no children
   - **Hero + Text** — a `hero` block followed by a `section` block containing a `paragraph`

3. WHEN an editor selects a layout preset, THE BuilderCanvas SHALL insert the corresponding pre-built `Block` subtree at the end of the current root block list (or at the selected insertion point).

4. WHEN a layout preset is inserted, each generated block SHALL receive a unique ID via `generateId()` to avoid ID collisions with existing blocks.

5. WHEN a layout preset is inserted, THE BuilderCanvas SHALL select the outermost block of the newly inserted preset so the editor can immediately configure it.

6. THE layout preset palette SHALL be dismissible by clicking outside it or pressing Escape.

---

### REQ-5: Connect news-feed and events-feed Blocks to Real API Data

**User Story:** As a website visitor, I want to see real news articles and upcoming events in any page section that contains a news feed or events feed block, so that the page reflects actual content from the system.

#### Acceptance Criteria

1. WHEN a `news-feed` block is rendered on a public page, THE News_Feed_Block SHALL fetch articles from `GET /api/public/content?type=article&status=PUBLISHED&page=0&size={limit}` and render the returned articles as content cards.

2. WHEN an `events-feed` block is rendered on a public page, THE Events_Feed_Block SHALL fetch events from `GET /api/public/events/upcoming?limit={limit}` and render the returned events as content cards.

3. WHEN the API returns data for a `news-feed` block, each article card SHALL display at minimum: the article's title (bilingual based on current language), publication date, and a "Read More" link to `/news/{slug}`.

4. WHEN the API returns data for an `events-feed` block, each event card SHALL display at minimum: the event's title (bilingual based on current language), start date, and a "View Details" link to `/events/{id}`.

5. WHILE the API request for a feed block is in progress, THE Feed_Block SHALL display a skeleton loading state with the same number of placeholder cards as the configured `limit` (defaulting to 6, maximum 12).

6. IF the API request for a feed block fails or returns zero results, THEN THE Feed_Block SHALL display a graceful empty state message rather than an error or blank space.

7. WHERE the `news-feed` or `events-feed` block has a `title` prop configured, THE Feed_Block SHALL render that title above the card grid using bilingual resolution.

8. WHEN a `news-feed` or `events-feed` block is rendered inside the BuilderCanvas (editor context, `ignoreVisibility=true`), THE Feed_Block SHALL display the `DynamicFeedPlaceholder` skeleton preview instead of making live API calls, to avoid unnecessary backend traffic during editing.

---

### REQ-6: Extend Inline Text Editing to All Text-Bearing Block Types

**User Story:** As a content editor, I want to double-click any text element in the builder canvas and edit it directly in place, so that I can make quick text changes without opening the PropertyPanel for every word edit.

#### Acceptance Criteria

1. WHEN an editor double-clicks a `button` block in the canvas, THE BuilderCanvas SHALL activate contentEditable inline editing on the button's primary label field (`label` / `labelEn`).

2. WHEN an editor double-clicks a `banner` block in the canvas, THE BuilderCanvas SHALL activate contentEditable inline editing on the banner's `title` / `titleEn` field.

3. WHEN an editor double-clicks a `hero` block in the canvas, THE BuilderCanvas SHALL activate contentEditable inline editing on the hero's `title` / `titleEn` field.

4. WHEN an editor double-clicks a `card` block in the canvas, THE BuilderCanvas SHALL activate contentEditable inline editing on the card's `title` / `titleEn` field.

5. WHEN an editor double-clicks a `cta` block in the canvas, THE BuilderCanvas SHALL activate contentEditable inline editing on the CTA's `title` / `titleEn` field.

6. WHEN an inline edit session ends (on blur or on Enter key without Shift), THE BuilderCanvas SHALL commit the new text to the block's `props` via `updateBlockProps` and exit editing mode.

7. WHEN an inline edit session is active on a block, THE transparent click overlay for that block SHALL be removed so the contentEditable element receives pointer events.

8. WHEN the Escape key is pressed during an inline edit session, THE BuilderCanvas SHALL discard the change and exit editing mode without updating block props.

9. THE existing inline editing behaviour for `heading` and `paragraph` blocks SHALL remain unchanged.

10. WHEN an inline edit is committed, THE change SHALL be reflected immediately in the canvas without requiring a manual save action — the layout change handler SHALL be called so auto-save and dirty state are updated.
