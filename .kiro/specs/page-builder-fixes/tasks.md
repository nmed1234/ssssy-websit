# Implementation Plan: page-builder-fixes

## Overview

Six targeted fixes to the page builder system, all confined to `frontend/src/`. Work is split into three waves: Wave 1 tasks are fully independent and can run in parallel; Wave 2 tasks depend on a stable canvas architecture from Wave 1; Wave 3 is final verification.

No backend changes are required.

---

## Tasks

- [x] 1. Create `useBlockPage` hook and `PublicPageShell` component
  - [x] 1.1 Create `src/hooks/useBlockPage.ts`
    - Define the `UseBlockPageResult` interface: `{ layout, loading, error, retry }`
    - Use `Promise.all` to fire `GET /api/public/pages/{slug}` and `GET /api/public/pages/{slug}/sections` simultaneously
    - If `page.layoutJson` is non-null, call `resolvePageLayout(page.layoutJson, [])` — discard sections response
    - If `page.layoutJson` is null, call `resolvePageLayout(null, legacySections)` using the sections result
    - Expose a `retry` callback that re-runs the full fetch sequence by toggling a `trigger` state integer
    - On API `success: false` or network error, set `error: true, layout: null`
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 1.11_
  - [ ]* 1.2 Write property tests for `resolvePageLayout` (P1, P2)
    - **Property 1: resolvePageLayout prefers layoutJson over legacy sections**
    - **Validates: Requirements 1.8**
    - **Property 2: resolvePageLayout fallback produces correct migration**
    - **Validates: Requirements 1.7**
    - Install `fast-check` as dev dependency: `npm install --save-dev fast-check`
    - Create `src/components/page-builder/schema/__tests__/page-layout.test.ts`
    - Write `fc.property` tests with `numRuns: 100` for both properties
    - Run TypeScript check: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors
  - [x] 1.3 Create `src/components/public/PublicPageShell.tsx`
    - Accept props: `{ layout: PageLayout | null; loading: boolean; error: boolean; retry: () => void }`
    - Loading state: animated skeleton with at least one `animate-pulse` placeholder element (REQ-1.9)
    - Error state: show error message and a "Retry" `<button>` that calls `retry` (REQ-1.10)
    - Empty state (layout with zero blocks): render a centered "This page has no content yet." message
    - Render state: `<BlockRenderer blocks={layout.blocks} />` without `ignoreVisibility`
    - _Requirements: 1.9, 1.10, 1.11_
  - [x] 1.4 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors in the new files

- [x] 2. Migrate all 6 static public pages to use `useBlockPage`
  - [x] 2.1 Migrate `src/app/(public)/about/page.tsx`
    - Replace the existing `useEffect` + `PageSectionRenderer` implementation
    - Import `useBlockPage` from `@/hooks/useBlockPage` and `PublicPageShell` from `@/components/public/PublicPageShell`
    - Body becomes: `const { layout, loading, error, retry } = useBlockPage("about"); return <PublicPageShell ... />;`
    - Remove all imports of `PageSectionRenderer`, `Page`, `PageSection`, `AlertCircle`, `Button` that are no longer used
    - _Requirements: 1.1_
  - [x] 2.2 Migrate `src/app/(public)/board/page.tsx`
    - Same pattern as 2.1 — slug `"board"`
    - _Requirements: 1.2_
  - [x] 2.3 Migrate `src/app/(public)/contact/page.tsx`
    - Same pattern as 2.1 — slug `"contact"`
    - _Requirements: 1.3_
  - [x] 2.4 Migrate `src/app/(public)/newsletter/page.tsx`
    - Same pattern as 2.1 — slug `"newsletter"`
    - _Requirements: 1.4_
  - [x] 2.5 Migrate `src/app/(public)/president-message/page.tsx`
    - Same pattern as 2.1 — slug `"president-message"`
    - _Requirements: 1.5_
  - [x] 2.6 Migrate `src/app/(public)/publications/page.tsx`
    - Same pattern as 2.1 — slug `"publications"`
    - _Requirements: 1.6_
  - [x] 2.7 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors across all 6 migrated pages

- [x] 3. Canvas rearchitecture — `CanvasBlockRenderer` and fixed `BlockWrapper`
  - [x] 3.1 Create `src/components/page-builder/builder/CanvasBlockRenderer.tsx`
    - Define `CanvasBlockRendererProps`: `{ block: Block; depth: number; onBreadcrumb: (b: Block) => void; onSelectSelf: () => void }`
    - For each container type (`section`, `row`, `column`, `grid`, `flexbox`, `card-group`), replicate the outer wrapper JSX from `BlockRenderer.tsx`'s `BlockSwitch` — but render children via `<BlockList>` (recursive `BlockWrapper`) instead of `<BlockRenderer>`
    - Container background/click area calls `onSelectSelf` directly; its `onClick` has lower z-index than children so child clicks still propagate to their own `BlockWrapper` overlays
    - For unknown container types, fall back to a plain `<div>` shell
    - When `block.children` is empty, render `<EmptyContainerDropZone containerId={block.id} />`
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.3, 3.4_
  - [x] 3.2 Update `BlockWrapper` in `src/components/page-builder/builder/BuilderCanvas.tsx`
    - Remove the `pointer-events-none BlockRenderer + ChildrenOverlay` branch for containers
    - For container blocks (`schema.isContainer && !isDragging`): render `<BlockToolbar>` then `<CanvasBlockRenderer>` — no absolute overlay, no separate `ChildrenOverlay` tree
    - For leaf blocks: keep the existing `pointer-events-none` + `absolute inset-0 overlay` pattern unchanged
    - Delete the `ChildrenOverlay` component entirely
    - Keep `EmptyContainerDropZone` — it is used inside `CanvasBlockRenderer`
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.2, 3.5, 3.6_
  - [ ]* 3.3 Write property tests for `insertBlock` and `moveBlock` (P4, P5)
    - **Property 4: insertBlock places the block at the exact requested index**
    - **Validates: Requirements 3.2, 3.5**
    - **Property 5: moveBlock at root level preserves all blocks**
    - **Validates: Requirements 3.6**
    - Create `src/components/page-builder/schema/__tests__/tree-utils.test.ts`
    - Write `fc.property` tests using `arbitraryBlockTree()` helper; `numRuns: 100`
    - Run TypeScript check: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors
  - [x] 3.4 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors in the canvas files

- [x] 4. Dynamic feed blocks — `BuilderModeContext`, `NewsFeedBlock`, `EventsFeedBlock`
  - [x] 4.1 Create `src/components/page-builder/BuilderModeContext.tsx`
    - `const BuilderModeContext = createContext<boolean>(false)`
    - Export `BuilderModeProvider` — wraps children in `<BuilderModeContext.Provider value={true}>`
    - Export `useIsBuilderMode` — returns `useContext(BuilderModeContext)`
    - Wrap `BuilderCanvas`'s root output in `<BuilderModeProvider>` (one line change in `BuilderCanvas.tsx`)
    - `PublicPageShell` and `BlockRenderer` do NOT wrap with provider — context defaults to `false` for public pages
    - _Requirements: 5.8_
  - [x] 4.2 Create `src/components/page-builder/blocks/NewsFeedBlock.tsx`
    - Accept `{ block: Block }` prop
    - Read `isBuilderMode` from `useIsBuilderMode()`; read `limit` from `block.props.limit`, clamped to `[1, 12]`, defaulting to 6
    - When `isBuilderMode === true`: return `<DynamicFeedPlaceholder>` immediately — no API call (REQ-5.8)
    - When `isBuilderMode === false`: fetch `GET /api/public/content?type=article&status=PUBLISHED&page=0&size={limit}` in `useEffect`
    - Loading state: render `limit` skeleton cards (`animate-pulse`) (REQ-5.5)
    - Error or empty-array state: render `<FeedEmpty type="news" />` with a graceful message (REQ-5.6)
    - Success state: render a CSS grid of `ArticleCard` components — one card per article
    - `ArticleCard` renders: bilingual title (via `useLanguage`), formatted `publishedAt` date, `<a href="/news/{slug}">Read More</a>` (REQ-5.3)
    - If `bil("title")` is non-empty, render a `<h2>` above the grid (REQ-5.7)
    - _Requirements: 5.1, 5.3, 5.5, 5.6, 5.7, 5.8_
  - [x] 4.3 Create `src/components/page-builder/blocks/EventsFeedBlock.tsx`
    - Same structure as `NewsFeedBlock`
    - Fetches `GET /api/public/events/upcoming?limit={limit}`
    - `EventCard` renders: bilingual title, formatted `startDate`, `<a href="/events/{id}">View Details</a>` (REQ-5.4)
    - _Requirements: 5.2, 5.4, 5.5, 5.6, 5.7, 5.8_
  - [x] 4.4 Wire feed blocks into `BlockRenderer.tsx`
    - Replace the two `DynamicFeedPlaceholder` return statements in `BlockSwitch`:
      - `case "news-feed": return <NewsFeedBlock block={block} />;`
      - `case "events-feed": return <EventsFeedBlock block={block} />;`
    - Add necessary imports at the top of `BlockRenderer.tsx`
    - `DynamicFeedPlaceholder` function body remains in `BlockRenderer.tsx` — it is still used by `NewsFeedBlock` and `EventsFeedBlock` in builder mode
    - _Requirements: 5.1, 5.2_
  - [ ]* 4.5 Write property tests for feed blocks (P8, P9, P10)
    - **Property 8: ArticleCard renders required fields for any article**
    - **Validates: Requirements 5.3**
    - **Property 9: EventCard renders required fields for any event**
    - **Validates: Requirements 5.4**
    - **Property 10: Feed blocks make no API calls in builder mode**
    - **Validates: Requirements 5.8**
    - Create `src/components/page-builder/blocks/__tests__/FeedBlocks.test.tsx`
    - Use `@testing-library/react` + `fast-check`; wrap with `BuilderModeProvider` for P10
    - Run TypeScript check: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors
  - [x] 4.6 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors in feed block files

- [~] 5. Checkpoint — Wave 1 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Layout presets panel
  - [x] 6.1 Create `src/components/page-builder/LayoutPresetsPanel.tsx`
    - Define `LayoutPreset` interface: `{ id, label, icon, build: () => Block[] }`
    - Implement `LAYOUT_PRESETS` array with exactly these 6 presets using `createBlock` and `generateId` from `tree-utils`:
      - `"2-col"` — `row` block containing two equal `column` children
      - `"3-col"` — `row` block containing three equal `column` children
      - `"full-width"` — `section` block with no children
      - `"hero-text"` — `hero` block followed by a `section` containing a `paragraph`
      - `"2-col-img"` — `row` block with an `image` column and a `column` containing a `paragraph`
      - `"4-card"` — `card-group` block containing four `card` children
    - Each `build()` invocation calls `createBlock()` fresh — no shared mutable state between calls
    - Define `LayoutPresetsPanelProps`: `{ isOpen: boolean; onClose: () => void; onInsert: (blocks: Block[]) => void }`
    - Render as a floating card (not a modal) anchored below the "+ Layout" button
    - Close on `mousedown` outside the panel (via `useEffect` + `mousedown` event listener) or `Escape` key (REQ-4.6)
    - Each preset tile shows `icon`, `label`, and calls `onInsert(preset.build())` on click
    - _Requirements: 4.2, 4.3, 4.4, 4.6_
  - [x] 6.2 Wire `LayoutPresetsPanel` into `BuilderCanvas.tsx`
    - Add `presetsOpen` state (`useState(false)`)
    - Add a "+ Layout" button to the toolbar `div` (alongside zoom controls): `onClick={() => setPresetsOpen(true)}` (REQ-4.1)
    - Conditionally render `<LayoutPresetsPanel>` below the button
    - In `onInsert` handler: spread preset blocks onto root: `onBlocksChange([...blocks, ...presetBlocks])`, select `presetBlocks[0].id` (REQ-4.3, REQ-4.5), close panel
    - _Requirements: 4.1, 4.3, 4.5_
  - [ ]* 6.3 Write property tests for layout presets (P6, P7)
    - **Property 6: Layout preset IDs are unique across repeated invocations**
    - **Validates: Requirements 4.4**
    - **Property 7: Layout preset insertion appends blocks at the end**
    - **Validates: Requirements 4.3**
    - Create `src/components/page-builder/__tests__/LayoutPresetsPanel.test.ts`
    - Use `fc.constantFrom(...LAYOUT_PRESETS)` as the arbitrary; implement `flatIds()` helper to collect all block IDs recursively
    - Run TypeScript check: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors
  - [x] 6.4 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 7. Extended inline text editing
  - [x] 7.1 Extend `BlockWrapper` inline editing in `src/components/page-builder/builder/BuilderCanvas.tsx`
    - Replace the binary `heading | paragraph` check with:
      ```ts
      const INLINE_EDITABLE_TYPES: Record<string, string> = {
        heading: "text", paragraph: "text",
        button: "label", banner: "title",
        hero: "title", card: "title", cta: "title",
      };
      const isInlineEditable = block.type in INLINE_EDITABLE_TYPES;
      const inlinePropKey    = INLINE_EDITABLE_TYPES[block.type] ?? "text";
      ```
    - Update `handleTextBlur` to write `{ [inlinePropKey]: newText }` instead of the hardcoded `{ text: newText }` (REQ-6.6)
    - Update the `contentEditable` initial value to read `block.props[inlinePropKey]` with fallback to `block.props[inlinePropKey + "En"]`
    - Update the `onKeyDown` handler so pressing `Escape` calls `setEditingTextId(null)` WITHOUT calling `onBlocksChange` (REQ-6.8)
    - Update `handleDoubleClick` — `isInlineEditable` now covers all 7 types; the container branch remains unchanged (REQ-6.6 existing behaviour for heading/paragraph preserved per REQ-6.9)
    - Remove the overlay `<div className="absolute inset-0 z-10">` when `isEditing === true` so the contentEditable receives pointer events (REQ-6.7)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_
  - [ ]* 7.2 Write property tests for inline editing (P11, P12)
    - **Property 11: Inline edit commit writes the correct prop key**
    - **Validates: Requirements 6.6, 6.10**
    - **Property 12: Escape during inline edit leaves props unchanged**
    - **Validates: Requirements 6.8**
    - Create `src/components/page-builder/builder/__tests__/inlineEdit.test.tsx`
    - For P11: use `fc.constantFrom(...Object.keys(INLINE_EDITABLE_TYPES))` + `fc.string()`; render `BlockWrapper`, activate inline edit, fire blur, assert `updateBlockProps` called with correct key
    - For P12: activate edit, press Escape, assert `updateBlockProps` is NOT called
    - Run TypeScript check: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors
  - [x] 7.3 Run TypeScript check
    - Run: `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [~] 8. Checkpoint — Wave 2 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Final TypeScript, lint, and verification pass
  - [~] 9.1 Full TypeScript check across the entire frontend
    - Run: `cd frontend && npx tsc --noEmit`
    - Fix every TypeScript error reported — zero errors required before this task is complete
  - [~] 9.2 Lint check
    - Run: `cd frontend && npm run lint`
    - Fix all lint errors and warnings
  - [~] 9.3 Verify all 6 static public pages use `useBlockPage`
    - Confirm no remaining imports of `PageSectionRenderer` in `about`, `board`, `contact`, `newsletter`, `president-message`, `publications` page files
    - Confirm no remaining `useState<PageSection[]>` or `useState<Page | null>` in those files
  - [~] 9.4 Verify `ChildrenOverlay` is fully removed
    - Confirm `ChildrenOverlay` function and all its call sites are deleted from `BuilderCanvas.tsx`
    - Confirm `CanvasBlockRenderer` is used for all container blocks in `BlockWrapper`
  - [~] 9.5 Verify feed blocks are wired in `BlockRenderer.tsx`
    - Confirm `case "news-feed"` returns `<NewsFeedBlock>` and `case "events-feed"` returns `<EventsFeedBlock>`
    - Confirm `BuilderModeProvider` wraps the `BuilderCanvas` output

- [~] 10. Final checkpoint — all checks pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for an MVP; they implement property-based tests that validate correctness guarantees from the design
- All new files go under `frontend/src/` — no backend changes needed
- Windows paths: use `cd frontend && npx tsc --noEmit` (cmd shell) for TypeScript checks
- `fast-check` must be installed before running property tests: `cd frontend && npm install --save-dev fast-check`
- `DynamicFeedPlaceholder` stays in `BlockRenderer.tsx` — it is reused by both feed block components in builder mode
- The public `page/[slug]/page.tsx` dynamic route is already correct and is NOT modified by this spec
- Checkpoints at tasks 5, 8, and 10 ensure incremental validation across waves

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "1.4", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "3.2", "4.2", "4.3"] },
    { "id": 2, "tasks": ["2.7", "3.3", "3.4", "4.4", "4.6"] },
    { "id": 3, "tasks": ["4.5", "6.1", "7.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "6.4", "7.2", "7.3"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5"] }
  ]
}
```
