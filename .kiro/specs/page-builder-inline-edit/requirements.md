# Requirements Document

## Introduction

This feature consolidates and hardens inline editing for all block types rendered inside the page builder canvas. Currently, two separate inline-edit mechanisms exist in parallel: `InlineEditContext` / `InlineTextField` (wired for container blocks in `CanvasBlockRenderer`) and a legacy `editingTextId` / `contentEditable` mechanism (wired for leaf blocks in `BuilderCanvas`). This feature unifies them into a single `InlineTextField`-based system, extends it to every key-field-bearing leaf block (heading, paragraph, button, card, hero, cta, banner, blockquote, alert, divider, stats, testimonial, team, accordion, faq, newsletter-form, etc.), adds a per-field EN/AR language toggle so editors can switch between English and Arabic props directly on the canvas, and removes the duplicate `editingTextId` path from `BuilderCanvas`. No backend or database changes are required.

## Glossary

- **InlineTextField**: The React component (`InlineTextField.tsx`) that renders a text value in view mode and activates a `contentEditable` element on double-click, bound to a `blockId` + `propKey` pair.
- **InlineEditContext / InlineEditProvider**: React context that owns the single `{ blockId, propKey }` editing state and exposes `startEditing`, `stopEditing`, and `commitEdit` to all `InlineTextField` instances.
- **CanvasBlockRenderer**: The component (`CanvasBlockRenderer.tsx`) that renders container blocks on the builder canvas using `InlineTextField` for their key text fields.
- **BuilderCanvas**: The top-level canvas component (`BuilderCanvas.tsx`) that hosts `InlineEditProvider`, manages block drag-and-drop, and wraps leaf and container blocks in `BlockWrapper`.
- **BlockWrapper**: The component inside `BuilderCanvas` that wraps every block with selection ring, toolbar, and either `CanvasBlockRenderer` (containers) or leaf rendering (leaves).
- **Leaf Block**: A non-container block rendered via `BlockRenderer` in read-only mode, with a transparent click/drag overlay; types include heading, paragraph, button, card, hero, cta, banner, blockquote, alert, divider, stats, testimonial, team, accordion, faq, newsletter-form, and dynamic list sections.
- **Legacy Inline-Edit Path**: The `editingTextId` / `INLINE_EDITABLE_TYPES` mechanism currently in `BuilderCanvas` that activates a plain `contentEditable` div for certain leaf blocks.
- **Key Fields**: The subset of a block's props exposed to inline editing — titles, subtitles, heading text, paragraph body text, and button labels — as opposed to structural props (URLs, colors, item arrays).
- **EN/AR Language Toggle**: A small two-button toggle rendered inside an editing field's hover chrome that switches the active prop key between the English variant (e.g. `title`) and the Arabic variant (e.g. `titleAr`).
- **BlockRenderer**: The read-only rendering component (`BlockRenderer.tsx`) used to display blocks on the public site and in the canvas preview.
- **InlineLeafRenderer**: A new canvas-side component (to be created) that replaces the legacy `contentEditable` div approach and renders leaf blocks using `InlineTextField` for key fields.

---

## Requirements

### Requirement 1 — Unified Inline-Edit Architecture

**User Story:** As a page editor, I want all block types to use the same inline-edit mechanism, so that the editing experience is consistent and the codebase has a single place to maintain.

#### Acceptance Criteria

1. THE InlineEditProvider SHALL serve as the sole owner of inline-editing state for both container and leaf blocks on the canvas.
2. THE BuilderCanvas SHALL remove the `editingTextId` state variable, the `setEditingTextId` callback, the `registerEditRef` ref map, and the `INLINE_EDITABLE_TYPES` constant from its implementation.
3. WHEN a leaf block's key text field is double-clicked on the canvas, THE InlineTextField SHALL activate inline editing for that specific `blockId` + `propKey` pair via `InlineEditContext`, replacing the legacy `contentEditable` div approach.
4. THE BlockWrapper SHALL delegate leaf block text rendering to the InlineLeafRenderer component instead of directly managing `contentEditable` divs.
5. THE CanvasContext interface SHALL remove the `editingTextId`, `setEditingTextId`, and `registerEditRef` members after the migration.

---

### Requirement 2 — Leaf Block Coverage via InlineLeafRenderer

**User Story:** As a page editor, I want to double-click any key text field on any leaf block directly on the canvas to edit it without opening the Property Panel, so that quick text corrections are fast.

#### Acceptance Criteria

1. THE InlineLeafRenderer SHALL render a leaf block's key text fields using `InlineTextField` components so that each field is individually double-click editable.
2. THE InlineLeafRenderer SHALL cover the following block types and their respective key fields:
   - `heading`: `text` / `textAr`
   - `paragraph`: `text` / `textAr`
   - `button`: `label` / `labelAr`
   - `card`: `title` / `titleAr`, `subtitle` / `subtitleAr`, `buttonLabel` / `buttonLabelAr`
   - `hero`: `title` / `titleAr`, `subtitle` / `subtitleAr`, `buttonLabel` / `buttonLabelAr`
   - `cta`: `title` / `titleAr`, `text` / `textAr`, `buttonLabel` / `buttonLabelAr`
   - `banner`: `title` / `titleAr`, `text` / `textAr`, `buttonLabel` / `buttonLabelAr`
   - `blockquote`: `text` / `textAr`, `attribution` / `attributionAr`
   - `alert`: `title` / `titleAr`, `message` / `messageAr`
   - `stats`: `title` / `titleAr`
   - `testimonial`: `title` / `titleAr`
   - `team`: `title` / `titleAr`
   - `accordion` (leaf): `title` / `titleAr`
   - `faq`: `title` / `titleAr`
   - `newsletter-form`: `title` / `titleAr`, `text` / `textAr`, `buttonLabel` / `buttonLabelAr`
   - `news-feed`, `events-feed`, `contact-form`, `map`, `gallery`, `carousel`, `timeline`, `progress`, `pricing-table`: `title` / `titleAr`
3. WHEN a leaf block type is not in the InlineLeafRenderer's covered list, THE InlineLeafRenderer SHALL fall back to rendering the block via `BlockRenderer` with `pointer-events-none` and no inline fields.
4. WHILE the canvas is in active editing state for a leaf block field, THE InlineLeafRenderer SHALL suppress the transparent click/drag overlay for that block so mouse events reach the active `contentEditable` element.
5. IF a leaf block has no key fields with non-empty values and no active editing session, THE InlineLeafRenderer SHALL still render the `BlockRenderer` output as the visual base layer beneath the `InlineTextField` placeholder overlays.

---

### Requirement 3 — EN/AR Language Toggle on Inline Fields

**User Story:** As a bilingual page editor, I want a compact EN/AR toggle to appear when I hover over any inline-editable text field, so that I can switch between English and Arabic prop editing directly on the canvas without using the Property Panel.

#### Acceptance Criteria

1. WHEN the editor hovers over any `InlineTextField` instance on the canvas, THE InlineTextField SHALL display a small EN/AR toggle badge positioned absolutely above or beside the text element.
2. THE EN/AR toggle SHALL have two buttons labeled "EN" and "AR"; the active language SHALL be visually distinguished (e.g. filled/bold) from the inactive one.
3. WHEN the editor clicks the "EN" button on the toggle, THE InlineTextField SHALL switch its active `propKey` to the English variant (e.g. `title`) and display the English prop value.
4. WHEN the editor clicks the "AR" button on the toggle, THE InlineTextField SHALL switch its active `propKey` to the Arabic variant (e.g. `titleAr`) and display the Arabic prop value.
5. WHEN the editor activates inline editing via double-click after toggling the language, THE InlineTextField SHALL commit the edited value to the language-specific prop key that is currently active.
6. THE EN/AR toggle click events SHALL call `stopPropagation` so that clicking the toggle does not trigger block selection or breadcrumb navigation.
7. IF a block's Arabic variant prop key (e.g. `titleAr`) is not defined in the block schema, THE InlineTextField SHALL hide the "AR" toggle button for that field.
8. THE EN/AR toggle SHALL be hidden while the field is in active `contentEditable` editing mode to avoid layout disruption.

---

### Requirement 4 — InlineTextField Bilingual Prop Management

**User Story:** As a page editor, I want the inline text field component to manage bilingual prop keys internally, so that CanvasBlockRenderer and InlineLeafRenderer call sites do not need to compute the active language key themselves.

#### Acceptance Criteria

1. THE InlineTextField SHALL accept an optional `propKeyAr` prop in addition to the existing `propKey` (English) prop.
2. WHEN `propKeyAr` is provided, THE InlineTextField SHALL render the EN/AR toggle and manage the active language state internally.
3. WHEN `propKeyAr` is not provided, THE InlineTextField SHALL behave identically to its current implementation with no toggle shown.
4. THE InlineTextField SHALL expose the currently active prop key to `InlineEditContext` so that `commitEdit` writes to the correct language-specific key in `block.props`.
5. THE InlineTextField SHALL initialize its active language to "EN" by default on each mount.
6. WHEN `InlineEditProvider.onCommit` is called, THE InlineEditProvider SHALL write the committed value to the prop key that was active at the time editing began (not the current toggle state at blur time).

---

### Requirement 5 — CanvasBlockRenderer Bilingual Simplification

**User Story:** As a developer, I want CanvasBlockRenderer to pass both `propKey` and `propKeyAr` to InlineTextField directly, so that the per-render-site `useBilingualKey` calculation is removed and prop key management is centralized.

#### Acceptance Criteria

1. THE CanvasBlockRenderer SHALL pass both `propKey` (English key, e.g. `"title"`) and `propKeyAr` (Arabic key, e.g. `"titleAr"`) to each `InlineTextField` instance.
2. THE CanvasBlockRenderer SHALL remove the `useBilingualKey` hook and the `bilKey` helper after migrating all call sites to the dual-key pattern.
3. THE CanvasBlockRenderer SHALL pass both the English value (`props.title`) and the Arabic value (`props.titleAr`) to `InlineTextField`; the component SHALL select which to display based on its internal active-language state.
4. THE InlineTextField SHALL accept a `valueAr` prop alongside `value` to allow the parent to supply both language values upfront.

---

### Requirement 6 — Pointer Events and Overlay Correctness

**User Story:** As a page editor, I want clicks and double-clicks on the canvas to behave correctly whether a block is in view mode, hover mode, or active inline-edit mode, so that selection, drag, and editing interactions do not conflict.

#### Acceptance Criteria

1. WHILE no inline editing session is active, THE BlockWrapper's transparent overlay SHALL intercept pointer events for leaf blocks so that single click selects the block and double-click activates inline editing.
2. WHEN an inline editing session is active for a specific `blockId` + `propKey`, THE BlockWrapper overlay for that block SHALL be hidden so that pointer events reach the active `contentEditable` element.
3. WHILE an inline editing session is active, THE BlockToolbar for the actively edited block SHALL be hidden to prevent accidental deletion or duplication during text entry.
4. WHEN the editor presses Escape during an active inline editing session, THE InlineTextField SHALL revert the `contentEditable` content to its original value and call `stopEditing` without committing.
5. WHEN the editor presses Enter (without Shift) in a single-line `InlineTextField`, THE InlineTextField SHALL call `blur()` on the `contentEditable` element to commit the value.
6. WHEN the editor presses Shift+Enter in a multiline `InlineTextField`, THE InlineTextField SHALL insert a newline without committing.
7. WHEN the editor clicks outside any `InlineTextField` while editing is active, THE InlineTextField's blur handler SHALL commit the current value and call `stopEditing`.

---

### Requirement 7 — Existing Container Inline-Edit Preservation

**User Story:** As a page editor, I want the existing inline editing experience for container blocks (section, row, column, grid, flexbox, card-group, and all legacy section types in LegacyContainerWithInlineEdit) to continue working without regression, so that existing pages are unaffected.

#### Acceptance Criteria

1. THE CanvasBlockRenderer SHALL continue to render container blocks (section, card-group, hero-banner types, banner, cta, dynamic list sections, board member grids, president message section, etc.) with `InlineTextField` for their key text fields.
2. WHEN the existing `CanvasBlockRenderer` call sites are updated to use the new dual-key `propKey` + `propKeyAr` pattern, THE rendered output and editing behavior SHALL remain functionally equivalent to the pre-migration behavior.
3. THE `LegacyContainerWithInlineEdit` component SHALL be updated to pass `propKeyAr` to all `InlineTextField` instances so that legacy section types also gain the EN/AR toggle.
4. THE existing `group/inline` hover outline behavior on `InlineTextField` (dashed blue outline on container hover) SHALL be preserved after the migration.

---

### Requirement 8 — Non-Regression with Existing Specs

**User Story:** As a developer, I want the inline-edit unification to not break any behavior defined in the page-builder-enhancement and page-builder-fixes specs, so that previously fixed issues do not reappear.

#### Acceptance Criteria

1. THE unified inline-edit system SHALL preserve the double-click-to-drill-into-container behavior for container blocks handled in `BlockWrapper.handleDoubleClick`.
2. THE drag-and-drop block reordering and palette insertion flows in `BuilderCanvas` SHALL continue to function without modification after removing the legacy `editingTextId` path.
3. THE `InlineEditProvider.onCommit` callback SHALL continue to call `updateBlockProps(blocks, blockId, { [propKey]: value })` so that prop updates are written to the correct block in the tree.
4. THE `BlockRenderer` read-only output used as the visual base layer for leaf blocks SHALL continue to use `pointer-events-none` in view mode so that only the overlay or `InlineTextField` elements receive pointer events.
5. WHEN the page builder is in a non-editing context (e.g. preview mode without `InlineEditProvider`), THE `BlockRenderer` SHALL render without any inline-edit chrome or overlays.


---

### Requirement 9 — Repeating Items Inline Editing via InlineItemsEditor

**User Story:** As a page editor, I want to edit every text field inside each item of a repeating-items block (timeline, accordion, FAQ, stats, testimonial, team, gallery, carousel, pricing-table, progress, and all legacy section types with items/panels/paragraphs/documents/socialLinks arrays) directly on the canvas, add new items with a "+" button, remove items with a "×" button, and optionally reorder items with a drag handle — so I can manage structured list content without opening the Property Panel.

#### Acceptance Criteria

1. A new `InlineItemsEditor` component SHALL be created that renders each item in a block's items array as a compact card-style row on the canvas, where every text field in the item is individually inline-editable via `InlineTextField`.
2. THE `InlineItemsEditor` SHALL accept an `itemsKey` prop (the name of the array prop, e.g. `"items"`, `"panels"`, `"paragraphs"`, `"documents"`, `"socialLinks"`, `"images"`) and an `itemFields` prop (an array of field descriptors matching the block schema's `itemSchema`, filtered to text-editable kinds: `"text"` and `"textarea"` only).
3. WHEN the editor double-clicks any text field inside an item card on the canvas, THE `InlineTextField` within that item SHALL activate inline editing for the composite prop key `"${itemsKey}[${index}].${fieldKey}"` via `InlineEditContext`.
4. THE `InlineItemsEditor` SHALL render an "Add item" button (e.g. a "＋ Add item" row) below the last item card; clicking it SHALL append a new empty item object to the array and commit via `updateBlockProps`.
5. EACH item card SHALL render a delete button (e.g. "×"); clicking it SHALL remove that item from the array and commit via `updateBlockProps`.
6. THE `InlineItemsEditor` SHOULD render a drag handle (⠿) per item card for drag-to-reorder; reordering SHALL commit the reordered array via `updateBlockProps`. This is a nice-to-have and may be deferred.
7. THE item field values committed by `InlineItemsEditor` SHALL be written to `block.props[itemsKey][index][fieldKey]` using an immutable update (spread the array, spread the item at the given index).
8. THE `InlineLeafRenderer` SHALL be updated to use `InlineItemsEditor` for all leaf block types that have an items array, rendering the block-level title fields above and the `InlineItemsEditor` below them.
9. THE `LegacyContainerWithInlineEdit` in `CanvasBlockRenderer` SHALL be updated to use `InlineItemsEditor` for all legacy section types that have items/panels/paragraphs/documents/socialLinks/images arrays, rendering heading fields above and the `InlineItemsEditor` below them.
10. THE `InlineItemsEditor` SHALL use a compact visual style — items rendered as bordered card rows with a small label above each field — so the editor can distinguish fields without opening the Property Panel.
11. WHEN a block's items array is empty, THE `InlineItemsEditor` SHALL render an empty-state placeholder ("No items yet — click ＋ to add one") and the "Add item" button.
12. THE `InlineItemsEditor` SHALL NOT expose inline editing for item fields of kind `"image"`, `"url"`, `"color"`, `"toggle"`, `"number"`, or `"select"` — those fields remain editable only via the Property Panel. Only `"text"` and `"textarea"` kind fields are exposed for inline editing.

#### Items Array Key Registry (Block Type → itemsKey)

| Block Type | itemsKey |
|---|---|
| `timeline`, `accordion`, `faq`, `stats`, `testimonial`, `team`, `gallery`, `carousel`, `pricing-table`, `progress` | `items` |
| `about-vision-mission-section`, `about-timeline-section` | `panels` / `items` (per schema) |
| `about-overview-section`, `about-organizational-chart-section`, `board-term-information-section` | `paragraphs` |
| `about-documents-section` | `documents` |
| `about-gallery-section` | `images` |
| `president-message-content-section` | `paragraphs` (body) and `socialLinks` (links) |
