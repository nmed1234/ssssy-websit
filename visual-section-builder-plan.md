# Visual Section Builder — Plan

## Top-Level Overview

**Goal:** Replace the raw JSON textarea editing in the admin site-sections page with a modern, visual "Section Builder" UI that lets admins edit each section's content through structured, bilingual (Arabic + English) inline form fields — while keeping the existing JSON editors as an optional advanced fallback.

**Scope:**
- A new admin page/panel: `SectionBuilderPanel` — a modal or slide-over that opens when the admin clicks "Edit Content" on any section.
- Per-component-type field schemas (e.g. `hero` gets title/description/buttons fields; `stats` gets a list of stat items; `card-group` gets title + repeatable card items, etc.).
- Every text field has an EN/AR tab pair for bilingual content.
- Live preview panel embedded in the builder (shows the section component rendering with the current field values).
- Drag-to-reorder items within list-based section types (cards, stats, testimonials, etc.).
- Color/background picker for the styling fields (replacing raw CSS class JSON).
- Image upload/picker integrated via existing MinIO/media API.
- The current JSON editors remain accessible as a collapsible "Advanced" panel.
- No backend changes required — the data structure stored in the `data`, `config`, and `styling` JSONB columns is unchanged; only the admin UI changes.

**Approach:** Build a new React component `SectionBuilderPanel` with per-type `FieldSchema` definitions and a generic field renderer. Integrate it into the existing `admin/site-sections/page.tsx` as a replacement for the raw JSON form.

---

## Sub-Tasks

---

### Sub-Task 1 — Define Field Schema Types and Per-Component Field Maps

**Intent:**
Create a TypeScript schema system that maps each `componentType` to a list of named fields with type, label (EN + AR), and sub-structure (for repeatable items). This is the single source of truth used by the builder UI to render the correct inputs.

**Expected Outcomes:**
- A new file `frontend/src/lib/section-field-schemas.ts` exporting a `SECTION_SCHEMAS` map.
- Each schema entry defines: field name, field type (`text | textarea | url | image | color | number | repeater`), bilingual labels, and for `repeater` fields: the sub-field definitions.
- Schemas exist for: `hero`, `cta`, `card-group`, `stats`, `testimonial`, `newsletter`, `contact-form`, `banner`, `timeline`, `faq`, `team`.

**Todo List:**
1. Create `frontend/src/lib/section-field-schemas.ts`.
2. Define the `FieldType` union type: `"text" | "textarea" | "url" | "image" | "color-class" | "number" | "repeater"`.
3. Define `FieldDef` interface with: `key`, `type`, `labelEn`, `labelAr`, `placeholder`, `subFields` (for repeater).
4. Define `SectionSchema` as `{ dataFields: FieldDef[], configFields: FieldDef[], stylingFields: FieldDef[] }`.
5. Write schemas for each component type listed above, matching actual field names used by the homepage components (`title`, `description`, `primaryButtonLabel`, `primaryButtonUrl`, `items[].title`, `items[].description`, etc.).
6. Bilingual labels: each `FieldDef` has `labelEn` and `labelAr` so the UI renders both languages.
7. For repeater items, add a `titleArKey` and `titleEnKey` pair indicating which sub-field is the "display label" for the item row.

**Relevant Context:**
- [`HeroSection`](frontend/src/app/(public)/page.tsx:460) — reads `config.title`, `config.description`, `config.subtitleAr`, `config.primaryButtonLabel`, `config.primaryButtonUrl`, `config.secondaryButtonLabel`, `config.secondaryButtonUrl`
- [`OurFocusAreasSection`](frontend/src/app/(public)/page.tsx:224) — reads `data.items[].title`, `data.items[].description`, `config.title`
- [`TestimonialsSection`](frontend/src/app/(public)/page.tsx:306) — reads `data.items[].name`, `data.items[].role`, `data.items[].quote`
- [`JoinOurCommunitySection`](frontend/src/app/(public)/page.tsx:268) — reads `config.title`, `config.subtitle`, `config.buttonLabel`, `config.buttonUrl`
- Stats section reads `data.items[].value`, `data.items[].title`

**Status:** [ ] pending

---

### Sub-Task 2 — Build the Bilingual Field Renderer Component

**Intent:**
Create a generic `SectionFieldRenderer` React component that, given a `FieldDef` and a current value, renders the appropriate input type with EN/AR tab toggle for text fields, and a drag-to-reorder list for repeater fields.

**Expected Outcomes:**
- New file: `frontend/src/components/admin/SectionFieldRenderer.tsx`.
- Text/textarea fields show an EN/AR tab switcher — clicking EN shows the English value input, clicking AR shows the Arabic value input.
- The value model for bilingual fields: `{ en: string, ar: string }` stored as separate JSON keys like `titleEn` and `titleAr` (the schema maps which key to use per language).
- Repeater fields render a list of item rows with a `+` add button, drag handle (using mouse events for drag-to-reorder), and delete button per row.
- `color-class` fields render a palette of Tailwind color class buttons (e.g. `bg-soil-dark`, `bg-white`, `bg-gray-50`).
- `image` fields render a small image picker with current image preview (URL input + browse from media library).
- `url` fields render a simple URL text input.
- `number` fields render a number input.

**Todo List:**
1. Create `frontend/src/components/admin/SectionFieldRenderer.tsx`.
2. Implement `BilingualInput` sub-component: tab bar (EN | عربي), single text/textarea input bound to the active tab's value.
3. Implement `RepeaterField` sub-component: renders item list with add/remove/drag-handle rows; each row expands to show its sub-fields.
4. Implement `ColorClassPicker` sub-component: grid of color swatches mapped to Tailwind class names.
5. Implement `ImagePickerField` sub-component: URL text input + "Pick from Media" button opening a simple media grid modal using the existing `/api/media` endpoint.
6. Export the main `SectionFieldRenderer` switch component that dispatches to sub-components based on `field.type`.

**Relevant Context:**
- Existing admin pages use `@/lib/api` for API calls and `useLanguage` from `@/lib/language-context` for bilingual UI.
- The media API endpoint is `/api/admin/media` (existing from Phase 2).
- Tailwind color tokens used in the project: `bg-soil-dark`, `bg-soil-clay`, `bg-white`, `bg-gray-50`, `bg-soil-cream`, `text-white`, `text-gray-900`.

**Status:** [ ] pending

---

### Sub-Task 3 — Build the Section Builder Panel (Modal/Slide-over)

**Intent:**
Create the main `SectionBuilderPanel` component — a full-height slide-over panel that opens when the admin clicks "Edit Content" on a section. It shows the structured field editors on the left and a live preview of the section on the right (split-pane layout for desktop, stacked for mobile).

**Expected Outcomes:**
- New file: `frontend/src/components/admin/SectionBuilderPanel.tsx`.
- Opens as a right-side slide-over overlay with a semi-transparent backdrop.
- Header shows section name, component type badge, and Save/Close buttons.
- Left pane (60%): Structured field editors grouped into tabs: "Content" (data fields), "Layout" (config fields), "Style" (styling fields).
- Right pane (40%): Live preview — renders the actual section component with current form values in an iframe-like sandbox div with `pointer-events-none` to prevent interaction. Updates in real time as fields change.
- Bottom of left pane: collapsible "Advanced JSON" section showing the raw JSON editors (existing behavior preserved).
- Save button calls `updateSiteSection` and closes the panel on success with a toast notification.
- Language toggle (EN/AR) at the top of the panel switches the preview rendering language.

**Todo List:**
1. Create `frontend/src/components/admin/SectionBuilderPanel.tsx`.
2. Implement slide-over animation using Framer Motion (slide from right).
3. Implement the 3-tab layout: Content / Layout / Style.
4. Wire the `SectionFieldRenderer` components to the form state.
5. Implement the live preview pane: use a `useMemo` to derive `config`, `data`, `styling` objects from form state and pass them to a `SectionPreviewRenderer` component.
6. Implement `SectionPreviewRenderer` — a component that switches on `componentType` and renders the matching homepage section component (imported from a shared location).
7. Add the "Advanced JSON" collapsible section at the bottom.
8. Implement save logic: serialize form state back to JSON strings and call `updateSiteSection`.
9. Add keyboard shortcut: `Escape` to close, `Ctrl+S` / `Cmd+S` to save.
10. Ensure RTL/LTR layout switching based on content language context.

**Relevant Context:**
- The homepage section components are defined inline in [`frontend/src/app/(public)/page.tsx`](frontend/src/app/(public)/page.tsx). They need to be extracted to a shared file `frontend/src/components/sections/` so both the homepage and the preview renderer can import them.
- Framer Motion is already installed (used on the public homepage).
- `useLanguage` hook at `@/lib/language-context` provides `language` and `t()`.

**Status:** [ ] pending

---

### Sub-Task 4 — Extract Section Components to Shared Location

**Intent:**
Move the inline section components (`HeroSection`, `OurFocusAreasSection`, `JoinOurCommunitySection`, `StatisticsSection`, `TestimonialsSection`, `NewsletterSection`, `ContactFormSection`) from the homepage into a shared `frontend/src/components/sections/` directory so they can be used both on the public homepage and in the admin preview pane.

**Expected Outcomes:**
- New directory: `frontend/src/components/sections/`.
- Each component becomes its own file (e.g. `HeroSection.tsx`, `StatsSection.tsx`, etc.) or grouped in `index.ts`.
- The public homepage imports them from the shared location — no functional change.
- The `SectionPreviewRenderer` in the builder panel imports them from the same location.
- All existing props interfaces preserved.

**Todo List:**
1. Create `frontend/src/components/sections/` directory.
2. Move each section component to its own file, preserving all props and logic.
3. Create `frontend/src/components/sections/index.ts` barrel export.
4. Update `frontend/src/app/(public)/page.tsx` to import from the new location.
5. Verify there are no import cycle issues.

**Relevant Context:**
- Section components are currently all defined in [`frontend/src/app/(public)/page.tsx`](frontend/src/app/(public)/page.tsx:224-458).
- They import from `@/lib/fonts`, `@/components/ui/`, `@/lib/language-context`, `@/lib/SiteSettingsContext`, and other shared utilities — all of which are available to components outside the app directory.

**Status:** [ ] pending

---

### Sub-Task 5 — Integrate Section Builder into Admin Site Sections Page

**Intent:**
Modify the existing admin site-sections page to add an "Edit Content" button to each section row that opens the `SectionBuilderPanel`. Keep the existing full-form edit (with JSON editors) accessible via a separate "Advanced" button for power users.

**Expected Outcomes:**
- [`frontend/src/app/admin/site-sections/page.tsx`](frontend/src/app/admin/site-sections/page.tsx) updated.
- Each section row now has two action buttons: **"Edit Content"** (opens `SectionBuilderPanel`) and **"Advanced"** (existing JSON form edit, renamed from the edit pencil icon).
- The `SectionBuilderPanel` is rendered as a portal-level overlay (using `createPortal` to `document.body`).
- A "Reorder" drag-to-sort mode: a drag handle on each section row allows the admin to drag sections to reorder them (updating `sortOrder` via `updateSiteSection` calls in batch or on drop).
- Visual improvement: section rows show a small "section type" icon, the section heading preview from the `data.title` or `config.title` field, and an active/inactive status pill.

**Todo List:**
1. Import `SectionBuilderPanel` into the admin page.
2. Add `builderSectionId: string | null` state.
3. Add "Edit Content" button to each section row that sets `builderSectionId`.
4. Render `<SectionBuilderPanel>` conditionally when `builderSectionId` is set.
5. Implement drag-to-sort using HTML5 draggable API on section rows: `onDragStart`, `onDragOver`, `onDrop` to reorder and batch-update `sortOrder`.
6. Add section preview text: parse `data`/`config` JSON to show the section's title as a subtitle in the list row.
7. Update action icons: rename pencil icon to "Advanced" with a tooltip.
8. Update styling to show type-specific color badges.

**Relevant Context:**
- Existing admin page: [`frontend/src/app/admin/site-sections/page.tsx`](frontend/src/app/admin/site-sections/page.tsx).
- `updateSiteSection` in [`frontend/src/lib/site-sections.ts`](frontend/src/lib/site-sections.ts) accepts `{ sortOrder: number }` partial update.
- `createPortal` from `react-dom` for overlay rendering.

**Status:** [ ] pending

---

### Sub-Task 6 — Add Bilingual Data Model Support to Section Data

**Intent:**
Ensure the data schema consistently supports bilingual fields. Currently, most sections store only English text (e.g. `data.title`, `config.title`). Add a convention where bilingual fields are stored as `titleEn` / `titleAr` pairs, with the homepage components reading both and falling back gracefully.

**Expected Outcomes:**
- The `FieldDef` schema from Sub-Task 1 drives which keys are EN/AR pairs.
- Homepage section components updated to read `config.titleEn || config.title` (English) and `config.titleAr` (Arabic) and pick based on the active language from `useLanguage()`.
- A new DB migration `V24__section_bilingual.sql` is NOT needed — the JSONB columns are schema-free; only the client-side field keys change.
- Existing sections in the DB still work (English-only fallback).

**Todo List:**
1. Update `HeroSection` to read `config.titleEn || config.title` and `config.titleAr || config.title` based on `language`.
2. Update `OurFocusAreasSection` to read `data.items[].titleEn || item.title` and `data.items[].descriptionAr`.
3. Update `TestimonialsSection` similarly for `item.nameAr`, `item.roleAr`, `item.quoteAr`.
4. Update `JoinOurCommunitySection` for `config.titleEn`, `config.titleAr`, `config.subtitleEn`, `config.subtitleAr`.
5. Update `StatisticsSection` for `data.items[].titleEn`, `data.items[].titleAr`.
6. Ensure all fallbacks preserve backward compatibility (always fall back to `en` key then un-suffixed key).

**Relevant Context:**
- `useLanguage()` hook returns `language: "en" | "ar"`.
- Section components are in `frontend/src/components/sections/` after Sub-Task 4.
- No backend changes needed — JSONB is schema-free.

**Status:** [ ] pending

---

## Architecture Diagram

```
Admin: /admin/site-sections
    │
    ├─ Section List Row
    │       ├─ [Edit Content] ──────► SectionBuilderPanel (slide-over)
    │       │                               ├─ Left Pane: Field Editors
    │       │                               │       ├─ Content Tab (data fields)
    │       │                               │       │     └─ BilingualInput / Repeater / ImagePicker
    │       │                               │       ├─ Layout Tab (config fields)
    │       │                               │       └─ Style Tab (styling fields)
    │       │                               │             └─ ColorClassPicker
    │       │                               └─ Right Pane: Live Preview
    │       │                                       └─ SectionPreviewRenderer
    │       │                                             └─ HeroSection / StatsSection / etc.
    │       │                                                  (from shared /components/sections/)
    │       └─ [Advanced] ──────────► Existing JSON textarea form
    │
    └─ Section Row drag handles ──► Reorder sections (sortOrder update)

Shared section components:
    frontend/src/components/sections/
        HeroSection.tsx
        StatsSection.tsx
        CardGroupSection.tsx
        CtaSection.tsx
        TestimonialsSection.tsx
        NewsletterSection.tsx
        ContactFormSection.tsx
        index.ts

Field Schema (single source of truth):
    frontend/src/lib/section-field-schemas.ts
        SECTION_SCHEMAS[componentType] = { dataFields, configFields, stylingFields }
```

## Key Design Decisions

1. **No backend changes** — all improvements are purely frontend UI. The JSONB data format is unchanged; the builder simply generates the same JSON the textarea was producing manually.
2. **JSON editors kept** — the "Advanced" mode preserves full power-user access via a collapsible raw textarea panel.
3. **Bilingual via key convention** — `titleEn`/`titleAr` keys in the same JSON object; no new DB columns needed.
4. **Shared components** — section components extracted to `frontend/src/components/sections/` to enable the live preview in the admin builder without code duplication.
5. **No new dependencies** — drag-to-sort uses the native HTML5 drag API; Framer Motion (already installed) handles the slide-over animation; no new npm packages needed.

## Confirmed Design Decisions (User-Approved)

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| **Live Preview** | Scaled-down CSS-transform thumbnail | Full-width inside a narrow slide-over breaks layout; a CSS `scale()` transform gives an accurate visual without UI breakage |
| **Bilingual Fields** | AR optional, EN fallback | Avoids friction on quick drafts; public site never shows empty text; a subtle "Fallback active" indicator shown in the AR tab when it is empty |
| **Image Picker** | MinIO media library modal + Paste URL option inside that modal | Primary flow uses existing uploaded assets; URL paste covers external images; single modal keeps the UX clean |
| **Drag-to-Reorder Sections** | Auto-save immediately on drop | Direct manipulation implies immediate effect; a brief toast "Order updated" confirms the background save; no forgotten "Save Order" clicks |

### Sub-Task 3 — Live Preview Implementation Detail
- Preview pane renders the section component inside a `div` with `transform: scale(0.45)` and `transform-origin: top left`, with the container sized to compensate (`width: 222%`).
- A `pointer-events-none` overlay prevents accidental interaction with the preview.
- Preview updates with a 200ms debounce on field changes to avoid excessive re-renders.

### Sub-Task 2 — Bilingual Field Implementation Detail
- AR tab shows a subtle amber badge **"EN fallback active"** (`⚠ using English text`) when the AR value is empty.
- Both EN and AR are saved into the JSON regardless — empty string for unused AR fields so the frontend can detect and fall back.
- The `SectionFieldRenderer` never blocks save for missing AR values.

### Sub-Task 2 — Image Picker Implementation Detail
- "Pick Image" button opens a `MediaPickerModal` component (new shared component).
- Modal shows a paginated grid of media from `/api/admin/media`.
- A "Paste URL" text input sits at the top of the modal for external image URLs.
- Selecting either confirms and closes the modal, populating the image field value.

### Sub-Task 5 — Auto-Save Reorder Implementation Detail
- `onDrop` handler calls `updateSiteSection` for each affected section with its new `sortOrder`.
- Calls are fired in parallel with `Promise.all`.
- A toast notification "Order updated" is shown on success; "Failed to save order" on error.
- The local `sections` state is updated optimistically before the API calls resolve.
