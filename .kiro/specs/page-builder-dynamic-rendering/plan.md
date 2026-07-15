# Page Builder — Dynamic Rendering Plan

## Goal

Every page on the public website — whether it is the existing "About" page, the existing
"Board" page, or a brand-new page created by an admin tomorrow — must be built and rendered
through exactly one system: the Page Builder.

An admin creates a page, opens the builder, drags blocks onto the canvas, fills in content
via the Property Panel, clicks Publish, and the visitor sees it correctly at the page's URL.
No hardcoded React files are needed per page.

---

## Current State — What Works and What Doesn't

### What already works correctly

| Component | File | Role |
|---|---|---|
| Block tree type | `src/types/block.ts` | Data structure: `Block { id, type, props, children }` |
| Block schema | `src/components/page-builder/schema/block-schema.ts` | Defines every block type's editable fields |
| Block renderer | `src/components/page-builder/BlockRenderer.tsx` | Renders any block tree to HTML, reads ONLY from `block.props` |
| Page builder root | `src/components/page-builder/builder/PageBuilderRoot.tsx` | Drag/drop canvas + property panel, saves to `layout_json` |
| Property panel | `src/components/page-builder/builder/PropertyPanel.tsx` | Auto-generated form from block schema |
| Dynamic page route | `src/app/(public)/page/[slug]/page.tsx` | Fetches any page by slug, passes `layout_json` to `BlockRenderer` |
| `useBlockPage` hook | `src/hooks/useBlockPage.ts` | Fetches page + sections, resolves `layout_json` |
| `PublicPageShell` | `src/components/public/PublicPageShell.tsx` | Loading/error/empty/render states for public pages |
| Admin page editor | `src/app/admin/pages/[id]/page.tsx` | Full builder UI, saves `layout_json` to DB |
| DB column | `pages.layout_json TEXT` | Stores the full block tree JSON |

**The public rendering pipeline is already correct:**
```
Admin saves page → pages.layout_json in DB
Visitor visits /page/[slug] → fetches API → resolvePageLayout → BlockRenderer → HTML
```

### What is broken / wrong

#### Problem 1 — Static per-page files bypass the dynamic system

```
src/app/(public)/about/page.tsx       ← just calls useBlockPage("about")
src/app/(public)/board/page.tsx       ← just calls useBlockPage("board")
src/app/(public)/contact/page.tsx     ← just calls useBlockPage("contact")
src/app/(public)/newsletter/page.tsx
src/app/(public)/president-message/page.tsx
src/app/(public)/publications/page.tsx
```

These files themselves are harmless (`useBlockPage` + `PublicPageShell`) but:
- They exist as Next.js static routes — a separate URL structure (`/about`) from the dynamic
  system (`/page/[slug]`)
- They create two parallel rendering paths for the same content

#### Problem 2 — 24 "legacy section types" in BLOCK_SCHEMA are page-specific names

`about-hero-banner`, `board-hero-banner`, `contact-hero-banner`, etc. are in `BLOCK_SCHEMA`
as if they are distinct block types. They are NOT meaningfully different. They are all just
"Hero Banner" blocks with specific default content for one specific page.

Having page-specific block types in the schema means:
- The block palette shows "About Hero Banner" and "Board Hero Banner" as separate things
- A user creating a new page cannot reuse the "about" visual style without knowing to
  pick "About Hero Banner"
- The schema grows forever as new pages are added

#### Problem 3 — Legacy section components ignore `block.props`

```
src/components/page-sections/AboutHeroBanner.tsx
src/components/page-sections/BoardHeroBanner.tsx
... (18 more files)
```

These components read data via content-string keys (`useContentStrings` + `t(data.titleKey)`)
instead of from `block.props.title` directly. So:

- The builder canvas renders these components correctly (they find their text via content-string fallbacks)
- The Property Panel shows EMPTY fields (because `block.props.title` is empty — the title was
  never in props, it was always looked up by key)
- Editing a field in the Property Panel has no visible effect on the canvas
- The data round-trip (PropertyPanel → block.props → layout_json → render) is broken for these types

#### Problem 4 — `LegacySectionRenderer` in `BlockRenderer`

`BlockRenderer.BlockSwitch` has a `default:` case that routes unknown types through:
```
LegacySectionRenderer → PageSectionRenderer → AboutHeroBanner (reads data.titleKey)
```

This bypasses the props-driven rendering entirely. Any block type not explicitly listed in
`BlockSwitch` falls into the legacy path and is disconnected from the Property Panel.

#### Problem 5 — `page_sections` table seeded with content-string key references

The DB seed data stores:
```json
{ "titleKey": "about.hero.title" }
```
instead of the actual text:
```json
{ "title": "About the Syrian Soil Science Society", "titleAr": "عن الجمعية..." }
```

This means even after migration from `page_sections` to `layout_json`, the props contain
key references instead of real content — so the Property Panel shows empty or shows raw key strings.

---

## The Correct Architecture

### Single data flow for ALL pages

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN                                                              │
│                                                                     │
│  Create page → slug: "about", title: "About Us"                    │
│  Open builder → drag "Hero" block → type title in PropertyPanel    │
│  drag "Stats" block → fill numbers                                  │
│  Click Publish                                                      │
│                                                                     │
│  ↓ saves to DB: pages.layout_json = {                               │
│      "version": "1",                                                │
│      "blocks": [                                                    │
│        { "type": "hero", "props": {                                 │
│            "title": "About the Syrian Soil Science Society",        │
│            "titleAr": "عن الجمعية السورية لعلوم التربة",            │
│            "subtitle": "Learn about our society...",                │
│            "backgroundImage": "/uploads/hero-bg.jpg"               │
│          }, "children": []                                          │
│        },                                                           │
│        { "type": "stats", "props": { ... }, "children": [] }       │
│      ]                                                              │
│    }                                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                           │
│  pages table: id, slug="about", layout_json="{...}", is_published  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PUBLIC VISITOR visits /about  (or /page/about, or /[slug])        │
│                                                                     │
│  Next.js route → fetch /api/public/pages/about                     │
│  → get layout_json from response                                    │
│  → parseLayout(layout_json) → Block[]                               │
│  → <BlockRenderer blocks={...} />                                   │
│  → each block case in BlockSwitch renders from block.props ONLY    │
│  → correct HTML output                                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principle:** `block.props` is the ONLY source of truth for rendered content.
No content-string key lookups. No per-page component logic.

---

## Implementation Plan

### Phase 1 — Fix BlockRenderer: remove the legacy rendering path

**File: `src/components/page-builder/BlockRenderer.tsx`**

**What to do:**

Remove the `LegacySectionRenderer` and `PageSectionRenderer` dependency from `BlockSwitch`.

Add explicit `case` entries for each of the 24 legacy section types. Each case renders
directly from `block.props` using the same `bil()`, `str()`, `arr()` helpers already used
for `hero`, `banner`, `stats`, etc.

The visual output of each case should match the existing legacy component's styling exactly
(same CSS classes, same gradient, same layout), but read data from `block.props` not from
content-string keys.

**Example — current (BROKEN):**
```tsx
default:
  return <LegacySectionRenderer block={block} />;
  // → PageSectionRenderer → AboutHeroBanner → t(data.titleKey) ← ignores props.title
```

**Example — fixed (CORRECT):**
```tsx
case "about-hero-banner": {
  const overlay = str(props.overlayColor, "rgba(0,0,0,0.5)");
  const bgImg   = str(props.backgroundImage);
  return (
    <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden">
      {bgImg && (
        <div className="absolute inset-0">
          <img src={bgImg} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
        </div>
      )}
      <div className="container mx-auto px-4 py-20 relative z-10 text-center">
        {bil("titleAr") && <p className="text-soil-sand mb-2">{bil("titleAr")}</p>}
        {bil("title") && <h1 className="font-heading text-5xl font-bold mb-4">{bil("title")}</h1>}
        {bil("subtitle") && <p className="text-white/80 text-xl max-w-2xl mx-auto">{bil("subtitle")}</p>}
        {bil("primaryButtonLabel") && (
          <a href={str(props.primaryButtonUrl, "#")} className="mt-6 inline-block px-8 py-3 bg-white text-soil-dark rounded-lg font-medium">
            {bil("primaryButtonLabel")}
          </a>
        )}
      </div>
    </section>
  );
}
```

**Why this is correct:**
- `bil("title")` reads `block.props.title` (EN) or `block.props.titleAr` (AR) — set by PropertyPanel
- When a new page is created and an "About Hero Banner" block is added, the editor fills in
  `title` and `subtitle` in the PropertyPanel, saves, and it renders correctly
- Works identically for the existing About page (once its `layout_json` has real title values)
- Works for any future page that uses this block type

**Cases to add:**
All 24 types listed in `LEGACY_SECTION_TYPES`:
`about-hero-banner`, `about-overview-section`, `about-vision-mission-section`,
`about-organizational-chart-section`, `about-timeline-section`, `about-documents-section`,
`about-gallery-section`, `board-hero-banner`, `board-members-intro-grid`, `board-members-grid`,
`board-term-information-section`, `contact-hero-banner`, `contact-form-section`,
`newsletter-hero-banner`, `president-message-hero-banner`, `president-message-content-section`,
`publications-hero-banner`, `news-list-section`, `events-list-section`, `jobs-list-section`,
`members-list-section`, `publications-list-section`, `board-list-section`

Note: For types like `board-members-grid` and `news-list-section` that fetch data from the
database at render time, keep their existing data-fetching logic but read configuration
(heading text, maxItems, etc.) from `block.props` instead of hardcoded values.

---

### Phase 2 — Fix default props and seed data for existing pages

**What to do:**

The existing pages (About, Board, etc.) currently have `layout_json` saved with blocks that
have empty or missing `title`/`subtitle` props, because the original migration ran before
`default-props.ts` had entries for these types.

Two sub-tasks:

**2a. Update `default-props.ts`** — add proper default text for all 24 legacy types.
This ensures that when a block of these types is freshly created from the palette, it shows
meaningful placeholder text in the canvas and PropertyPanel immediately.

**2b. Add a new DB migration** — update the `page_sections` seed rows for existing pages to
contain the actual content text instead of content-string key references.

Current (wrong):
```json
{ "titleKey": "about.hero.title" }
```
Correct:
```json
{
  "title": "About the Syrian Soil Science Society",
  "titleAr": "عن الجمعية السورية لعلوم التربة",
  "subtitle": "Learn about our society, our history, and our commitment to advancing soil science in Syria.",
  "subtitleAr": "تعرّف على جمعيتنا وتاريخها والتزامنا بتطوير علوم التربة في سوريا."
}
```

This migration should also clear (set to NULL) the `layout_json` column for the existing
static pages (about, board, contact, newsletter, president-message, publications) so they
are re-migrated fresh on next admin open with correct content.

**2c. Remove `repairLayout` and `resolveKeyAliases` from `page-layout.ts`** — these were
temporary workarounds. Once the seed data is correct and `BlockRenderer` reads from props
directly, they are not needed. Clean code is better than workaround code.

---

### Phase 3 — Consolidate the public routing to one dynamic route

**Current situation:**
- `/about` → `src/app/(public)/about/page.tsx` → `useBlockPage("about")` → `PublicPageShell`
- `/board` → `src/app/(public)/board/page.tsx` → `useBlockPage("board")` → `PublicPageShell`
- `/page/[slug]` → `src/app/(public)/page/[slug]/page.tsx` → inline fetch → `BlockRenderer`
- (no `/[slug]` catch-all exists yet)

**What to do:**

Create `src/app/(public)/[slug]/page.tsx` as the single universal catch-all:
```tsx
"use client";
import { useParams } from "next/navigation";
import { useBlockPage } from "@/hooks/useBlockPage";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { layout, loading, error, retry } = useBlockPage(slug);
  return <PublicPageShell layout={layout} loading={loading} error={error} retry={retry} />;
}
```

Then delete the 6 static page files:
```
src/app/(public)/about/page.tsx       → DELETE
src/app/(public)/board/page.tsx       → DELETE
src/app/(public)/contact/page.tsx     → DELETE
src/app/(public)/newsletter/page.tsx  → DELETE
src/app/(public)/president-message/page.tsx → DELETE
src/app/(public)/publications/page.tsx → DELETE
```

After deletion:
- `/about` → matched by `[slug]` → `useBlockPage("about")` → `BlockRenderer` → renders from `layout_json`
- `/board` → same path
- `/my-new-page` → same path — **works for any page created in the future**

Note: Keep the other special routes that are NOT page-builder pages:
- `/events/` and `/events/[id]` — event listing/detail (data from events table, not page builder)
- `/news/` and `/news/[id]` — article listing/detail
- `/jobs/`, `/members/`, `/search/` — similar
- `/(public)/page.tsx` — homepage (may be a page-builder page or special)

These are NOT affected because they serve content from other tables (events, articles, jobs),
not from `pages.layout_json`.

---

### Phase 4 — Clean up legacy section components

**What to do:**

After Phase 1 (BlockRenderer has proper cases for all 24 types), the following files are no
longer used by the rendering pipeline and can be deleted:

```
src/components/page-sections/AboutHeroBanner.tsx
src/components/page-sections/BoardHeroBanner.tsx
src/components/page-sections/ContactHeroBanner.tsx
src/components/page-sections/NewsletterHeroBanner.tsx
src/components/page-sections/PresidentMessageHeroBanner.tsx
src/components/page-sections/PublicationsHeroBanner.tsx
src/components/page-sections/AboutOverviewSection.tsx
src/components/page-sections/AboutVisionMissionSection.tsx
src/components/page-sections/AboutOrganizationalChartSection.tsx
src/components/page-sections/AboutTimelineSection.tsx
src/components/page-sections/AboutDocumentsSection.tsx
src/components/page-sections/AboutGallerySection.tsx
src/components/page-sections/BoardMembersGrid.tsx
src/components/page-sections/BoardMembersIntroGrid.tsx
src/components/page-sections/BoardTermInformationSection.tsx
src/components/page-sections/ContactFormSection.tsx  ← keep if used elsewhere
src/components/page-sections/DynamicFeedSections.tsx ← check if still needed
src/components/page-sections/PageSectionRenderer.tsx → DELETE
```

Also delete from BlockRenderer:
- `LegacySectionRenderer` function
- `require("@/components/page-sections/PageSectionRenderer")` import

---

### Phase 5 — Reconsider the 24 legacy type names in BLOCK_SCHEMA (optional/future)

This is optional but recommended for long-term cleanliness.

**The problem:**
`about-hero-banner`, `board-hero-banner`, `contact-hero-banner` are not meaningfully different
block types. They are all "Hero Banner" with different default content. Having them as separate
types pollutes the block palette with page-specific names.

**The solution (future):**
Keep the 24 types in `BLOCK_SCHEMA` for now (they work correctly after Phase 1) but rename them
to be semantic rather than page-specific:

| Current name | Better name |
|---|---|
| `about-hero-banner` | `hero` (already exists) |
| `board-hero-banner` | `hero` |
| `about-overview-section` | `section` with `rich-text` child |
| `about-vision-mission-section` | `card-group` with style variant |

OR keep them as named "page section templates" in a separate template library — not in the
main block palette.

**Decision:** Do NOT do this in the current implementation. Keep the 24 types working correctly
first (Phases 1-4). Consolidation is a separate future task.

---

## Summary of Files to Change

### Create
- `src/app/(public)/[slug]/page.tsx` — universal dynamic catch-all page

### Modify
- `src/components/page-builder/BlockRenderer.tsx` — add 24 `case` entries, remove `LegacySectionRenderer`
- `src/components/page-builder/schema/default-props.ts` — add defaults for all 24 types
- `src/components/page-builder/schema/page-layout.ts` — remove `repairLayout`, `resolveKeyAliases`, `CONTENT_STRING_DEFAULTS`
- `backend/src/main/resources/db/migration/V40__fix_page_sections_seed_data.sql` — new migration: seed correct content values, clear stale `layout_json`

### Delete
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/board/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/newsletter/page.tsx`
- `src/app/(public)/president-message/page.tsx`
- `src/app/(public)/publications/page.tsx`
- `src/components/page-sections/PageSectionRenderer.tsx`
- `src/components/page-sections/AboutHeroBanner.tsx`
- `src/components/page-sections/BoardHeroBanner.tsx`
- `src/components/page-sections/ContactHeroBanner.tsx`
- `src/components/page-sections/NewsletterHeroBanner.tsx`
- `src/components/page-sections/PresidentMessageHeroBanner.tsx`
- `src/components/page-sections/PublicationsHeroBanner.tsx`
- `src/components/page-sections/AboutOverviewSection.tsx`
- `src/components/page-sections/AboutVisionMissionSection.tsx`
- (remaining legacy section components after verifying no other references)

### Keep unchanged
- `src/app/(public)/events/` — not a page-builder page
- `src/app/(public)/news/` — not a page-builder page
- `src/app/(public)/jobs/` — not a page-builder page
- `src/app/(public)/members/` — not a page-builder page
- `src/app/(public)/search/` — not a page-builder page
- `src/app/(public)/page/[slug]/page.tsx` — keep as alias or delete after `[slug]` is created
- All builder UI components — already correct
- `useBlockPage` hook — already correct
- `PublicPageShell` — already correct
- `BlockRenderer` cases for generic types (`hero`, `banner`, `stats`, etc.) — already correct

---

## How This Solves the Original Problem

### Existing pages (About, Board, Contact, etc.)

1. Admin opens About page in builder
2. Sees the current blocks with empty props (because old seed data used content-string keys)
3. Clicks "Re-migrate Sections" button — re-runs migration from `page_sections` with correct content values (from Phase 2b migration)
4. Now props have real text: `title: "About the Syrian Soil Science Society"`, etc.
5. PropertyPanel shows the real text in every field
6. Admin can edit any field, change background image, adjust styling
7. Saves → `layout_json` updated
8. Visitor visits `/about` → `[slug]/page.tsx` → `BlockRenderer` → renders correctly from props

### New pages created in the future

1. Admin creates page with slug `our-research`, title "Our Research"
2. Opens builder — empty canvas
3. Drags "Hero" block → fills `Title (EN)` = "Our Research", `Title (AR)` = "أبحاثنا"
4. Drags "Stats" block → fills in statistics
5. Drags "Card Group" → adds cards for each research area
6. Clicks Publish
7. Visitor visits `/our-research` → `[slug]/page.tsx` → fetches page → `BlockRenderer` → renders correctly
8. **No code changes needed. No new files. Works automatically.**

---

## What Each Agent Should Know

If another AI agent reads this plan, here is the essential context:

### The data model
- `pages` table has `slug`, `layout_json` (TEXT), `is_published`
- `layout_json` stores: `{ "version": "1", "blocks": [{ "id", "type", "props", "children" }] }`
- `block.props` is a flat key-value object with all content AND style for that block
- `BLOCK_SCHEMA` in `block-schema.ts` defines the shape of `props` for each block type

### The rendering rule
- `BlockRenderer.tsx` → `BlockSwitch` → one `case` per block type → renders from `block.props`
- This is the ONLY renderer. No other component should render page content.
- `bil(key)` reads `props[key]` (EN) or `props[keyAr]` (AR) based on current language

### The builder rule
- `PropertyPanel.tsx` reads field definitions from `BLOCK_SCHEMA[block.type].fields`
- Each field has a `key` that matches exactly a key in `block.props`
- When user edits a field, `block.props[key]` is updated and saved to `layout_json`

### What NOT to do
- Do NOT add `useContentStrings()` or `t(someKey)` calls inside block renderer cases
- Do NOT read data from anywhere other than `block.props`
- Do NOT create per-page React components (no `AboutHeroBanner.tsx`, no `ContactPage.tsx`)
- Do NOT add new entries to `LEGACY_SECTION_TYPES` — that list should shrink, not grow

### The routing rule
- `src/app/(public)/[slug]/page.tsx` handles ALL page-builder pages
- `src/app/(public)/events/`, `/news/`, `/jobs/` handle their own data-driven routes
- No static per-page files under `(public)/`
