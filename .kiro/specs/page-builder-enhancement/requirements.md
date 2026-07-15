# Requirements Document

## Introduction

The SSSSY page builder (`/admin/pages/[id]`) has a block-tree architecture storing pages as `Block[]` in `pages.layout_json`. Three critical gaps exist: (1) legacy section types (e.g. `about-hero-banner`, `about-overview-section`) are not registered in `BLOCK_SCHEMA`, so the PropertyPanel shows only minimal fields; (2) editors cannot add arbitrary components (Button, Heading, Image) as children of container sections; (3) image fields only accept URLs, with no upload or media library browse capability. Additional enhancements requested: undo/redo, auto-save, TipTap rich text, event/action system, canvas zoom, responsive preview, animation controls, and conditional visibility rules.

## Glossary

- **Block**: A node in the page tree with `{ id, type, props, children? }`.
- **BLOCK_SCHEMA**: TypeScript registry in `block-schema.ts` that defines editable fields per block type.
- **PropertyPanel**: Right sidebar that auto-renders form fields from BLOCK_SCHEMA for the selected block.
- **Legacy section**: A `page_sections` row with `component_type` like `about-hero-banner` that has no BLOCK_SCHEMA entry.
- **Container**: A block that holds child blocks (section, row, column, grid, flexbox, card-group, tabs, accordion).
- **layout_json**: TEXT column on `pages` table storing the full `Block[]` tree as JSON.
- **ItemsField**: A BLOCK_SCHEMA field kind (`"items"`) that renders a repeating list of sub-records with their own field schema.

## Requirements

### REQ-1: Legacy Section BLOCK_SCHEMA Registration

WHEN an editor selects any section in the page builder canvas, THEN the PropertyPanel SHALL display all editable fields defined for that section's type in BLOCK_SCHEMA.

The following legacy section component types SHALL be added to BLOCK_SCHEMA with complete field definitions:
- `about-hero-banner` — bilingual title/subtitle, background image, overlay color, min-height, primary + secondary button (bilingual label + URL)
- `about-overview-section` — bilingual heading, paragraphs as repeating items (EN text + AR text each)
- `about-vision-mission-section` — bilingual heading/subheading, panels items array (icon, title EN/AR, content EN/AR, gradient class, button EN/AR + URL)
- `about-organizational-chart-section` — bilingual heading, paragraphs items array
- `about-timeline-section` — bilingual heading/subheading, timeline items (year, title EN/AR, description EN/AR)
- `about-documents-section` — bilingual heading, document items (label EN/AR, URL, file type)
- `about-gallery-section` — bilingual heading/subheading, image items (src, alt, caption), columns number
- `board-hero-banner` — same structure as about-hero-banner
- `board-members-intro-grid` — bilingual heading/subheading, intro text, column count
- `board-members-grid` — bilingual heading, board member data source toggle
- `board-term-information-section` — bilingual heading, term info paragraphs items
- `contact-hero-banner` — bilingual title/subtitle, background image
- `contact-form-section` — bilingual heading, show-phone toggle, show-subject toggle
- `newsletter-hero-banner` — bilingual title/subtitle, background image
- `president-message-hero-banner` — bilingual title/subtitle, background image
- `president-message-content-section` — bilingual heading, body paragraphs items, quote EN/AR, quote author, president name/title EN/AR, photo URL, social links items
- `publications-hero-banner` — bilingual title/subtitle, background image
- `news-list-section` — bilingual title/subtitle, max items number, show-view-all toggle, button URL
- `events-list-section` — same as news-list-section
- `jobs-list-section` — same as news-list-section
- `members-list-section` — same as news-list-section
- `publications-list-section` — same as news-list-section
- `board-list-section` — same as news-list-section

WHERE the block type is a legacy section type with an items-based structure, the items array SHALL use an `ItemsField` with a complete `itemSchema` so editors can add, remove, edit, and reorder items within the PropertyPanel.

### REQ-2: Universal Child Block Editability

WHEN an editor clicks a child block inside a container section on the canvas, THEN only that child block SHALL be selected and the PropertyPanel SHALL display that child's type-specific fields from BLOCK_SCHEMA.

WHEN a block type is selected but not found in BLOCK_SCHEMA, THEN the PropertyPanel SHALL render a "Raw JSON Editor" textarea displaying the block's `props` as formatted JSON, allowing manual editing and saving.

WHEN the selected block ID changes, THEN the Layers panel tree SHALL scroll the corresponding node into view and highlight it.

### REQ-3: Add Component to Container Section

WHEN a container block is selected in the canvas, THEN a "+ Add Component" button SHALL appear in that block's toolbar. Clicking it SHALL open a compact inline component picker showing all 50+ block types grouped by category.

WHEN a block type is selected in the inline picker, THEN a new block of that type SHALL be inserted as the last child of the container.

WHEN an editor drags a component from the left Component Palette and drops it onto a container section in the canvas, THEN the new component SHALL be inserted at the drop position between existing children.

Legacy section types that structurally contain sub-items (e.g. `about-vision-mission-section`) SHALL have `isContainer: true` in BLOCK_SCHEMA to support child block insertion.

### REQ-4: Image Upload from PC and Media Library

WHEN an `image` field is displayed in the PropertyPanel, THEN the widget SHALL show: a URL text input, an "Upload from PC" button, and a "Browse Library" button.

WHEN the editor clicks "Upload from PC", THEN a native file picker SHALL open accepting image types (jpeg, png, gif, webp, svg). On file selection, the file SHALL be validated (≤ 10MB, image MIME type). If valid, it SHALL be uploaded to `POST /api/media/upload` with JWT auth. A progress indicator SHALL be shown during upload. On success, the returned URL SHALL be set as the field value.

WHEN the editor clicks "Browse Library", THEN a modal SHALL open fetching `GET /api/media?page=0&size=20&mimeType=image`. Images SHALL be shown as a thumbnail grid. Clicking a thumbnail SHALL set that image's URL as the field value and close the modal.

WHEN a URL is set in any image field, THEN a thumbnail preview SHALL be shown at max 80px height below the input.

### REQ-5: Event & Action System

WHEN an interactive block type (button, card, cta, hero, banner, image) is selected, THEN an "Events" tab SHALL appear in the PropertyPanel.

WHEN the Events tab is active, THEN the editor SHALL be able to configure a click action of type: navigate URL, scroll to anchor, toggle visibility (by block ID), download file, copy text to clipboard, or call API endpoint.

WHEN "Call API endpoint" is selected as the click action, THEN the editor SHALL be able to configure: HTTP method (GET/POST/PUT), URL (supporting `/api/*` paths), request body (JSON textarea), success message, and error message.

WHEN a block with a configured click event is rendered on the public page, THEN the appropriate handler SHALL be attached (router.push for navigate, fetch for API, scrollIntoView for anchor, etc.).

### REQ-6: TipTap Rich Text Editor

WHEN a `richtext` field is rendered in the PropertyPanel, THEN a TipTap WYSIWYG editor SHALL be displayed instead of a plain textarea.

The TipTap editor SHALL include a compact toolbar with: Bold, Italic, Underline, Heading (H2/H3), Bullet List, Ordered List, Link, Text Align (left/center/right), Clear Formatting.

WHERE the field has `dir: "rtl"`, the editor SHALL render in RTL mode with right-aligned text by default.

### REQ-7: Undo / Redo

WHEN the editor makes any change to the page layout in the builder, THEN the previous state SHALL be pushed onto a history stack (maximum 50 entries).

THE builder SHALL provide Ctrl+Z (undo) and Ctrl+Y / Ctrl+Shift+Z (redo) keyboard shortcuts. Undo and Redo buttons SHALL be visible in the builder topbar.

WHEN undo is performed, THEN the layout SHALL revert to the previous state without a DB save. WHEN redo is performed, THEN the layout SHALL advance to the next state.

### REQ-8: Auto-Save and Dirty State

WHEN the page layout changes and 30 seconds pass without further changes, THEN the layout SHALL be automatically saved to the DB via `PUT /api/pages/{id}` with the serialised `layoutJson`.

THE builder topbar SHALL always display: "● Saved" (green) when no unsaved changes exist, "● Unsaved changes" (amber) when dirty, and "Saving…" (gray) while a save is in progress.

WHEN the editor attempts to navigate away from the builder with unsaved changes, THEN a browser confirmation dialog SHALL appear.

### REQ-9: Canvas Zoom and Device Preview

THE builder canvas toolbar SHALL include zoom controls (−, current%, +, dropdown: 50%/75%/100%/125%/150%) and device preview buttons (Desktop / Tablet 768px / Mobile 375px).

WHEN a zoom level is selected, THEN the canvas content SHALL scale using CSS transform. WHEN a device is selected other than Desktop, THEN the canvas SHALL be constrained to that device's width, centred, with a device-frame outline.

### REQ-10: Legacy Section Migration Tool

WHEN a page is loaded in the builder and `layout_json` is NULL, THEN a "Migrate to Block Builder" button SHALL appear in the topbar.

WHEN clicked, THEN all `page_sections` rows for that page SHALL be converted to a `Block[]` tree using the legacy type mapping table, `layout_json` SHALL be saved to the DB, and the builder SHALL reload with the migrated layout.

### REQ-11: Animation Controls

EVERY block SHALL have animation configuration in its Advanced tab: entrance animation type (None/Fade In/Slide Up/Slide from Left/Slide from Right/Zoom In/Bounce), delay (ms), duration (ms), and trigger (on load / on scroll into view).

WHEN a block with a scroll-triggered animation enters the viewport on the public page, THEN the animation SHALL play once using IntersectionObserver / framer-motion `whileInView`.

### REQ-12: Conditional Visibility Rules

EVERY block SHALL support a `visibilityRules` array in its Advanced tab. Each rule SHALL be of type: authentication level, date range, or device type. All rules are evaluated with AND logic — all must pass for the block to be visible.

WHEN a date range rule is applied and the current date is outside the range, THEN the block SHALL NOT be rendered. WHEN a device rule is applied and the device does not match, THEN the block SHALL NOT be rendered.

### REQ-13: Save as Preset

WHEN a block is selected in the canvas, THEN a "Save as Preset" option SHALL be available in the BlockToolbar context menu (via "..." button).

WHEN the editor provides a name and confirms, THEN the block SHALL be saved via `POST /api/component-presets` and SHALL appear in the PresetLibraryModal under "My Presets".

### REQ-14: Inline Text Editing Enhancement

WHEN the editor double-clicks any block whose primary content field is a text string (button, card, hero, cta, banner), THEN contentEditable inline editing SHALL activate for that text field. On blur or Enter, the change SHALL be committed to block props.
