# Homepage Enhancements Plan

## Top-Level Overview

Four coordinated enhancements to the public website:

1. **Hero Carousel** — Replace the static `HeroSection` with a multi-slide, photo-backed carousel. Default behaviour is autoplay with dots + arrows. Slide transition style (fade/ken-burns/slide) and other options are stored as `config` fields in `site_sections` and editable via the Section Builder panel.

2. **Publications System** — New `publications` DB table + Spring Boot CRUD API + admin management page + public `/publications` listing page (search, filter by year/category, download, inline flip-PDF viewer modal) + homepage `PublicationsCarouselSection` component (horizontal card carousel → flip-PDF modal on click) backed by a `publications-carousel` site_section row.

3. **Seed Real Data** — Add a Flyway migration that seeds realistic bilingual news articles, events (in NEWS / upcoming-event states), and publication records so the homepage LatestNewsSection, UpcomingEventsSection, and PublicationsCarouselSection all display meaningful content without manual DB entry.

4. **Section Builder Wiring** — Register the two new component types (`hero-carousel`, `publications-carousel`) in: the Section Builder panel preview renderer, the admin site-sections dropdown, and the `section-field-schemas.ts` schema map so they are fully editable via the visual builder.

**What is NOT changing:**
- `LatestNewsSection` and `UpcomingEventsSection` components remain inline in `page.tsx` — they are not converted to site_section rows
- Existing news and events admin management pages are left untouched
- The `/news` and `/events` public listing pages are left untouched (already functional)

---

## Sub-Tasks

---

### Sub-Task 1 — Hero Carousel Section Component

**Intent**  
Replace the existing static `HeroSection` (which renders a single slide) with a new `HeroCarouselSection` component that renders an autoplay, multi-slide, soil-photo-backed carousel. The original `HeroSection` is kept for backward compatibility. The existing `hero-banner` site_section row has its `componentType` changed to `hero-carousel`. Slide transition style, autoplay speed, and show/hide controls are all config fields.

**Expected Outcomes**
- Homepage hero shows an autoplay carousel with 3 soil-themed slides
- Dots and prev/next arrows are visible by default
- Transition style (slide / fade / ken-burns) is selectable per-section in the Section Builder
- `HeroSection` still exists and works for any row that keeps `componentType = "hero"`

**Todo List**
1. Create `frontend/src/components/sections/HeroCarouselSection.tsx`
   - Props: `{ config?: Record<string, unknown> }` (same pattern as HeroSection)
   - Config keys consumed:
     - `slides[]` — array of `{ titleEn, titleAr, subtitleAr, descriptionEn, descriptionAr, primaryButtonLabelEn, primaryButtonLabelAr, primaryButtonUrl, secondaryButtonLabelEn, secondaryButtonLabelAr, secondaryButtonUrl, backgroundImage }`
     - `transitionStyle` — `"slide"` (default) | `"fade"` | `"ken-burns"`
     - `autoplay` — boolean (default true)
     - `autoplayInterval` — number ms (default 5000)
     - `showArrows` — boolean (default true)
     - `showDots` — boolean (default true)
   - Implementation: CSS scroll-snap or framer-motion `AnimatePresence` for transitions; no external library
   - For ken-burns: CSS `@keyframes kenBurns` scale animation on the background image
   - Maintain bilingual text rendering via `useLanguage()`
   - Preserve `ParticleField`, wave SVG decoration from existing HeroSection

2. Export `HeroCarouselSection` from `frontend/src/components/sections/index.ts`

3. Register `hero-carousel` in `frontend/src/app/(public)/page.tsx` section renderer map (alongside existing `hero` type)

4. Add `HERO_CAROUSEL_SCHEMA` to `frontend/src/lib/section-field-schemas.ts`
   - `configFields`: transitionStyle (select), autoplay (boolean), autoplayInterval (number), showArrows (boolean), showDots (boolean)
   - `dataFields`: slides (repeater) with bilingual sub-fields: title, subtitle, description, primaryButtonLabel, primaryButtonUrl, secondaryButtonLabel, secondaryButtonUrl, backgroundImage

5. Add `hero-carousel` to the admin dropdown in `frontend/src/app/admin/site-sections/page.tsx` component type list

6. Wire `HeroCarouselSection` preview into `SectionBuilderPanel.tsx` `SectionPreviewRenderer`

7. Add Flyway migration `V48__update_hero_banner_to_carousel.sql`:
   - Update `component_type = 'hero-carousel'` for slug `hero-banner`
   - Move existing single-slide config into a `slides: [...]` array
   - Add default transition/autoplay config fields
   - Add 2 additional seed slides with soil-science content (bilingual)

**Relevant Context**
- `frontend/src/components/sections/HeroSection.tsx` — existing component to model from
- `frontend/src/components/sections/index.ts` — export barrel
- `frontend/src/app/(public)/page.tsx` lines 79–108 — section type→component switch
- `frontend/src/lib/section-field-schemas.ts` — add new schema entry
- `frontend/src/components/admin/SectionBuilderPanel.tsx` — `SectionPreviewRenderer` function
- `frontend/src/app/admin/site-sections/page.tsx` — component type dropdown
- `backend/src/main/resources/db/migration/V46__seed_homepage_sections_bilingual.sql` — migration pattern

**Status** — `[ ] pending`

---

### Sub-Task 2 — Publications Backend (DB + API)

**Intent**  
Create the full backend for a standalone Publications feature: Flyway migration for the `publications` table, JPA entity, DTO, repository, service, and REST controller. Public read endpoints (list, search, filter by year/category, get by slug) and admin CRUD endpoints.

**Expected Outcomes**
- `publications` table exists in the DB with fields: id, title_en, title_ar, slug, abstract_en, abstract_ar, authors, year, category, cover_image_url, pdf_url, file_size_kb, is_active, sort_order, created_at, updated_at
- `GET /api/public/publications` — paginated list with optional `?search=`, `?year=`, `?category=`
- `GET /api/public/publications/{slug}` — single publication by slug
- `POST/PUT/DELETE /api/admin/publications` — admin CRUD (requires EDITOR+ role)
- Seed data: 6 realistic soil-science publications (bilingual)

**Todo List**
1. Create Flyway migration `V49__publications_table.sql`:
   - Table: `publications (id UUID PK, title_en, title_ar, slug UNIQUE, abstract_en, abstract_ar, authors VARCHAR(500), year INTEGER, category VARCHAR(100), cover_image_url, pdf_url, file_size_kb INTEGER, is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at, updated_at)`
   - Indexes on: slug, year, category, is_active
   - Seed 6 bilingual publication records with realistic soil-science titles, authors, and placeholder PDF URLs

2. Create `backend/src/main/java/org/ssssy/backend/model/entity/Publication.java`
   - JPA `@Entity`, `@Table(name = "publications")`
   - Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
   - `@PrePersist/@PreUpdate` for timestamps

3. Create `backend/src/main/java/org/ssssy/backend/model/dto/PublicationRequest.java` and `PublicationResponse.java`
   - Request: validation annotations on required fields
   - Response: all fields including computed ones

4. Create `backend/src/main/java/org/ssssy/backend/repository/PublicationRepository.java`
   - Extends `JpaRepository<Publication, UUID>`
   - Methods: `findBySlug`, `findByIsActiveTrueOrderBySortOrderAsc`, `findByYearAndIsActiveTrue`, `findByCategoryAndIsActiveTrue`, full-text search method with `@Query`

5. Create `backend/src/main/java/org/ssssy/backend/service/PublicationService.java`
   - `getPublications(search, year, category, pageable)` — public filtered list
   - `getBySlug(slug)` — public single
   - `getAll(pageable)` — admin list
   - `create(request)` — admin create
   - `update(id, request)` — admin update
   - `delete(id)` — admin delete

6. Create `backend/src/main/java/org/ssssy/backend/controller/PublicationController.java`
   - `GET /api/public/publications` — paginated, with search/year/category params (no auth)
   - `GET /api/public/publications/{slug}` — single (no auth)
   - `GET /api/admin/publications` — admin list (EDITOR+)
   - `POST /api/admin/publications` — create (EDITOR+)
   - `PUT /api/admin/publications/{id}` — update (EDITOR+)
   - `DELETE /api/admin/publications/{id}` — delete (PUBLISHER+)

7. Verify backend compiles clean: `mvn clean compile`

**Relevant Context**
- `backend/src/main/java/org/ssssy/backend/controller/SiteSectionController.java` — controller pattern to follow
- `backend/src/main/java/org/ssssy/backend/service/SiteSectionService.java` — service pattern
- `backend/src/main/java/org/ssssy/backend/model/entity/SiteSection.java` — entity pattern
- `backend/src/main/resources/db/migration/V46__seed_homepage_sections_bilingual.sql` — seed pattern
- Next migration number is V49 (V47 and V48 used in sub-tasks 1 & 2)

**Status** — `[ ] pending`

---

### Sub-Task 3 — Publications Admin Management Page

**Intent**  
Create the admin page at `/admin/publications` for full CRUD of publication records, following the exact same pattern as the existing `admin/events/page.tsx` and `admin/board-members/page.tsx`. Add a link to it in the admin sidebar.

**Expected Outcomes**
- `/admin/publications` lists all publications with search, sortable columns, and pagination
- Admin can create, edit, and delete publications via a slide-over form panel
- Form fields: title (EN/AR), slug (auto-generated), abstract (EN/AR), authors, year, category, cover image URL, PDF URL, file size, sort order, active toggle
- Admin sidebar has a "Publications" link

**Todo List**
1. Create `frontend/src/app/admin/publications/page.tsx`
   - Follow `admin/board-members/page.tsx` pattern exactly (list + inline slide-over form)
   - Table columns: Title (EN/AR), Authors, Year, Category, Active, Sort Order, Actions
   - Form fields: titleEn (required), titleAr, slug, abstractEn, abstractAr, authors, year (number), category (text), coverImageUrl, pdfUrl, fileSizeKb (number), sortOrder (number), isActive (toggle)
   - CRUD via `createPublication`, `updatePublication`, `deletePublication` API methods

2. Create `frontend/src/lib/publications.ts` API client
   - `getAdminPublications()` — GET `/admin/publications`
   - `createPublication(data)` — POST `/admin/publications`
   - `updatePublication(id, data)` — PUT `/admin/publications/{id}`
   - `deletePublication(id)` — DELETE `/admin/publications/{id}`
   - `getPublicPublications(params?)` — GET `/public/publications` (used by public pages too)
   - `getPublicationBySlug(slug)` — GET `/public/publications/{slug}`

3. Add the `Publication` type to `frontend/src/types/index.ts`
   - Match backend `PublicationResponse` fields

4. Add "Publications" link to the admin sidebar (`frontend/src/components/layout/AdminSidebar.tsx`)

**Relevant Context**
- `frontend/src/app/admin/board-members/page.tsx` — exact pattern to replicate
- `frontend/src/app/admin/events/page.tsx` — secondary pattern reference
- `frontend/src/components/layout/AdminSidebar.tsx` — add nav link
- `frontend/src/lib/site-sections.ts` — API client pattern to follow

**Status** — `[ ] pending`

---

### Sub-Task 4 — Public Publications Listing Page

**Intent**  
Create the public `/publications` page with search + filter by year/category + download button + inline flip-PDF viewer modal. Follows the same pattern as `/news/page.tsx` and `/events/page.tsx`.

**Expected Outcomes**
- `/publications` shows a card grid of all active publications
- Search bar filters by title (debounced, client-side on loaded data)
- Year filter dropdown and Category filter buttons (derived from data)
- Each card shows: cover image/icon, title (bilingual), authors, year, category badge, abstract excerpt, Download button, "View PDF" button
- Clicking "View PDF" opens the `StylePdfBook` component inside a Dialog/modal
- Download button is a direct `<a href={pdfUrl} download>` link
- Loading, empty, and error states present

**Todo List**
1. Create `frontend/src/app/(public)/publications/page.tsx`
   - Fetch from `getPublicPublications()` on mount
   - State: publications[], loading, error, searchQuery, yearFilter, categoryFilter, selectedPdf (for modal)
   - Derive available years and categories from loaded data for filter controls
   - Search: filter `publications` array client-side by `searchQuery` against title fields
   - Card layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (same as news page)
   - Card content: cover image or `BookOpen` icon placeholder, title (respect `language`), authors, year, category badge, abstract (line-clamp-3), two action buttons
   - PDF modal: `Dialog` component wrapping `StylePdfBook`. Build `BookPage[]` from the PDF URL — use an `<iframe>` or `<embed>` as the page `content` prop (one page = the full PDF in a scrollable iframe). Set `aspectRatio="a4"`
   - Page header: `PageHero` component (same as news/events pages)

2. Add `<link>` / route entry — Next.js file-based routing handles this automatically

**Relevant Context**
- `frontend/src/app/(public)/news/page.tsx` — exact pattern to replicate
- `frontend/src/components/ui/style-pdf-book.tsx` — BookPage interface and StylePdfBookProps
- `frontend/src/components/ui/dialog.tsx` — Dialog primitive
- `frontend/src/lib/publications.ts` — API client (created in Sub-Task 3)
- `frontend/src/types/index.ts` — Publication type (created in Sub-Task 3)

**Status** — `[ ] pending`

---

### Sub-Task 5 — Homepage Publications Carousel Section

**Intent**  
Create a `PublicationsCarouselSection` shared component that renders a horizontal card carousel of publications on the homepage. Clicking a card opens the flip-PDF viewer in a modal. The section heading and "View More" link text are DB-configurable via the site_section `config` field. The section pulls live data from `/api/public/publications`. A new `publications-carousel` site_section row is seeded for the homepage.

**Expected Outcomes**
- Homepage shows a "Publications" horizontal scroll carousel section between the existing sections
- Cards show cover image/icon, title (bilingual), authors, year
- Clicking a card opens the `StylePdfBook` modal inline
- "View More" link navigates to `/publications`
- Section heading is editable from the Section Builder
- Section is ordered correctly among existing homepage sections (after testimonials, before newsletter)

**Todo List**
1. Create `frontend/src/components/sections/PublicationsCarouselSection.tsx`
   - Props: `{ config?: Record<string, unknown> }`
   - On mount: fetch `getPublicPublications({ size: 8 })`
   - Config keys: `titleEn`, `titleAr`, `viewMoreLabelEn`, `viewMoreLabelAr`, `viewMoreUrl` (default `/publications`)
   - Renders:
     - Section heading (bilingual, from config or fallback `"Publications"`)
     - Horizontal scroll strip: `flex gap-4 overflow-x-auto snap-x pb-4` (same custom carousel pattern as existing codebase)
     - Each card: fixed width `w-56 flex-shrink-0 snap-start`, StyleCard with cover image/BookOpen icon, title (line-clamp-2), authors, year
     - Click card → set `selectedPublication` state → open Dialog with `StylePdfBook`
     - "View More →" link to `/publications`
   - Returns `null` when no publications loaded (consistent with other sections)

2. Export `PublicationsCarouselSection` from `frontend/src/components/sections/index.ts`

3. Register `publications-carousel` componentType in `frontend/src/app/(public)/page.tsx` section renderer

4. Add `PUBLICATIONS_CAROUSEL_SCHEMA` to `frontend/src/lib/section-field-schemas.ts`
   - `configFields`: titleEn/titleAr (bilingual text), viewMoreLabel (bilingual text), viewMoreUrl (url)

5. Add `publications-carousel` to admin site-sections dropdown

6. Wire `PublicationsCarouselSection` preview into `SectionBuilderPanel.tsx`

7. Add Flyway migration `V50__seed_publications_carousel_section.sql`
   - Insert `publications-carousel` site_section row with `location = 'homepage'`, `sort_order = 6` (before newsletter at 6 — shift newsletter to 7, contact-form to 8)
   - Bilingual config: `{ titleEn: "Publications", titleAr: "المنشورات", viewMoreLabelEn: "View All Publications", viewMoreLabelAr: "جميع المنشورات", viewMoreUrl: "/publications" }`

**Relevant Context**
- `frontend/src/components/sections/OurFocusAreasSection.tsx` — data-fetching section pattern
- `frontend/src/components/sections/NewsletterSection.tsx` — config-only section pattern
- `frontend/src/components/ui/style-pdf-book.tsx` — flip viewer component
- `frontend/src/components/ui/dialog.tsx` — modal wrapper
- `frontend/src/app/(public)/page.tsx` — section renderer switch
- `frontend/src/lib/section-field-schemas.ts` — schema map
- `frontend/src/components/admin/SectionBuilderPanel.tsx` — preview renderer
- `backend/src/main/resources/db/migration/V46__seed_homepage_sections_bilingual.sql` — migration pattern

**Status** — `[ ] pending`

---

### Sub-Task 6 — Seed Real News, Events, and Publications Data

**Intent**  
Add a Flyway migration that seeds realistic bilingual data so all homepage dynamic sections (LatestNewsSection, UpcomingEventsSection, PublicationsCarouselSection) display meaningful content immediately after a fresh DB setup.

**Expected Outcomes**
- At least 4 published NEWS content items with bilingual titles, excerpts, and realistic soil-science content
- At least 4 upcoming events with future dates, bilingual titles, locations, and event types
- 6 publication records already seeded in Sub-Task 2 (V49) — no duplicate seeding needed
- All seeded content items have `status = 'PUBLISHED'` and `published_at = CURRENT_TIMESTAMP`
- All seeded events have `is_published = true` and `event_date` in the future
- Seeds use `ON CONFLICT (slug) DO NOTHING` pattern to be safe on re-run

**Todo List**
1. Create Flyway migration `V51__seed_homepage_demo_data.sql`
   - Identify a valid `author_id` via subquery: `(SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)`
   - Insert 4 NEWS content items:
     - Realistic bilingual titles about soil science research, conferences, member achievements, conservation projects
     - Excerpts of 1–2 sentences
     - `status = 'PUBLISHED'`, `published_at = CURRENT_TIMESTAMP`
     - Unique slugs
   - Insert 4 events:
     - Future `event_date` values (e.g., `CURRENT_DATE + INTERVAL '30 days'`, `+60 days`, `+90 days`, `+120 days`)
     - Bilingual titles: workshops, conferences, field trips, webinars
     - Syrian locations (Damascus, Aleppo, Homs, Latakia)
     - `is_published = true`
     - Unique slugs, varied `event_type` values

**Relevant Context**
- `backend/src/main/resources/db/migration/V15__seed_default_data.sql` — existing seed pattern
- `backend/src/main/java/org/ssssy/backend/model/entity/ContentItem.java` — content fields
- `backend/src/main/java/org/ssssy/backend/model/entity/Event.java` — event fields (check this file)
- Publication seeding is in V49 (Sub-Task 2)
- Must use `ON CONFLICT (slug) DO NOTHING` for safety

**Status** — `[ ] pending`

---

## Implementation Order

Sub-tasks must be implemented in this order due to dependencies:

```
Sub-Task 2 (Backend API)
       ↓
Sub-Task 3 (Admin Page + API client types)   ← depends on Sub-Task 2
       ↓
Sub-Task 4 (Public /publications page)       ← depends on Sub-Tasks 2 & 3
       ↓
Sub-Task 5 (Homepage carousel section)       ← depends on Sub-Tasks 2, 3, 4
       ↓
Sub-Task 6 (Seed data)                       ← depends on Sub-Tasks 2 & backend events fields
       ↑
Sub-Task 1 (Hero carousel) — INDEPENDENT, can be done first or in parallel with Sub-Task 2
```

Recommended order: **1 → 2 → 3 → 4 → 5 → 6**

---

## Flyway Migration Sequence

| Version | File | Purpose |
|---------|------|---------|
| V47 | `V47__remove_legacy_homepage_section_duplicates.sql` | Already created (fixes duplication bug) |
| V48 | `V48__update_hero_banner_to_carousel.sql` | Sub-Task 1 — hero-carousel seed data |
| V49 | `V49__publications_table.sql` | Sub-Task 2 — publications table + 6 seed records |
| V50 | `V50__seed_publications_carousel_section.sql` | Sub-Task 5 — homepage publications-carousel row |
| V51 | `V51__seed_homepage_demo_data.sql` | Sub-Task 6 — news + events seed data |

---

## Design Decisions

- **No external carousel library** — existing codebase uses CSS scroll-snap + vanilla JS; maintain this pattern
- **PDF viewing** — `StylePdfBook` wraps an `<iframe src={pdfUrl}>` as the page content; one BookPage per publication (the whole PDF scrolls inside the iframe pane)
- **Publication storage** — new dedicated table (per user request), not content_items
- **Hero keeps existing visual identity** — ParticleField, wave SVG, magnetic buttons, gradient all preserved per slide
- **Bilingual everywhere** — all new components follow `{fieldEn, fieldAr}` + `useLanguage()` pattern
- **Section Builder** — both new component types get proper schemas in `section-field-schemas.ts` and preview wiring in `SectionBuilderPanel.tsx`
