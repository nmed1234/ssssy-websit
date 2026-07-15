# Design Document: page-builder-fixes

## Overview

This document describes the technical design for six targeted fixes to the SSSSY page builder system. The changes fall into two broad categories:

1. **Data-flow fixes** — REQ-1 (public page migration) and REQ-5 (live feed blocks): ensure that data written through the admin builder is what visitors actually see.
2. **Interaction fixes** — REQ-2 (child selection), REQ-3 (drag-and-drop inside containers), REQ-4 (layout presets), and REQ-6 (inline text editing): ensure the editing canvas behaves correctly for all block types.

No backend changes are required. All work is confined to `frontend/src/`.

---

## Architecture

### Current State

```
Public pages (/about, /board, etc.)
  └── useEffect → GET /api/public/pages/{slug}
  └── useEffect → GET /api/public/pages/{slug}/sections
  └── PageSectionRenderer (reads page_sections table data)
  ✗  BlockRenderer never called on static pages

BuilderCanvas.tsx  (container blocks)
  └── <div pointer-events-none>
        <BlockRenderer blocks={[container]} />  ← renders children visually
      </div>
  └── transparent full-block overlay  ← intercepts all clicks
  └── <ChildrenOverlay />             ← separate tree below visuals
  ✗  Clicks on children are eaten by the overlay; ChildrenOverlay is misaligned

news-feed / events-feed blocks
  └── DynamicFeedPlaceholder (skeleton only, no real data)

Inline text editing
  └── heading, paragraph only
```

### Target State

```
Public pages (/about, /board, etc.)
  └── useBlockPage(slug) hook
        ├── if layoutJson non-null → GET /api/public/pages/{slug} only
        └── if layoutJson null    → GET both endpoints → migrateLegacySections
  └── BlockRenderer (same renderer as /page/[slug])

BuilderCanvas.tsx  (container blocks)
  └── CanvasBlockRenderer per container type
        ├── renders container visual shell (background, padding, title)
        └── renders children via <BlockWrapper> recursively
             ← InnerDropZone interleaved between siblings
             ← no separate ChildrenOverlay tree

news-feed / events-feed blocks
  └── NewsFeedBlock / EventsFeedBlock with real API calls
  └── BuilderModeContext suppresses API calls in canvas

Inline text editing
  └── heading, paragraph, button (label), banner (title), hero (title),
      card (title), cta (title)
```

---

## Components and Interfaces

### REQ-1: `useBlockPage` hook

**File:** `src/hooks/useBlockPage.ts`

```ts
interface UseBlockPageResult {
  layout:  PageLayout | null;
  loading: boolean;
  error:   boolean;
  retry:   () => void;
}

function useBlockPage(slug: string): UseBlockPageResult
```

**Logic:**
1. `GET /api/public/pages/{slug}` — always fetched.
2. If `page.layoutJson` is non-null → call `resolvePageLayout(page.layoutJson, [])`, skip sections fetch.
3. If `page.layoutJson` is null → `GET /api/public/pages/{slug}/sections` in parallel with step 1 (use `Promise.all` so both are inflight simultaneously; the sections result is only consumed when layoutJson is null).
4. Returns `{ layout, loading, error, retry }`.
5. `retry` re-runs the fetch sequence.

**Optimisation detail:**  
Because both requests are sent via `Promise.all`, response time is bounded by the slower of the two requests when `layoutJson` is null. When `layoutJson` is set, the sections response is fetched but discarded — a future optimisation can skip it entirely by first fetching the page record alone, then conditionally fetching sections. The current design keeps the implementation simple while still satisfying REQ-1.8 (the sections data is never passed to `resolvePageLayout` when `layoutJson` is populated).

**Each static public page becomes a thin wrapper:**

```tsx
// src/app/(public)/about/page.tsx  (and the other 5)
"use client";
import { useBlockPage } from "@/hooks/useBlockPage";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export default function AboutPage() {
  const { layout, loading, error, retry } = useBlockPage("about");
  return <PublicPageShell layout={layout} loading={loading} error={error} retry={retry} />;
}
```

**`PublicPageShell`** (`src/components/public/PublicPageShell.tsx`) — shared loading/error/empty/render states extracted once to avoid repeating across 6 page files.

---

### REQ-2 & REQ-3: Canvas Rearchitecture

**File:** `src/components/page-builder/builder/BuilderCanvas.tsx`

#### The Problem in Detail

`BlockWrapper` for container blocks currently:
1. Renders `<div pointer-events-none><BlockRenderer blocks={[container]} /></div>` — this draws the container AND all its children visually.
2. Places a full-block transparent overlay (`position: absolute; inset: 0`) — intercepts every click, including clicks meant for children.
3. Renders `<ChildrenOverlay>` below the visual output — a separate DOM tree with its own `BlockWrapper` instances. This tree's positions don't align with the visual output from step 1, causing misaligned selection rings and broken drop zones.

#### Solution: Single Interactive Render Tree

For **container blocks**, replace the `pointer-events-none BlockRenderer + ChildrenOverlay` pattern with a `CanvasBlockRenderer` that renders the container's visual shell directly in React while placing children via recursive `BlockWrapper` calls.

```
BlockWrapper (container)
  └── CanvasBlockRenderer (renders container shell JSX directly)
        ├── container background / padding / title header
        └── children area:
              InnerDropZone [index=0]
              BlockWrapper [child 0]    ← recursive, also interactive
              InnerDropZone [index=1]
              BlockWrapper [child 1]
              InnerDropZone [index=2]
              ...
```

The container shell receives `onClick` directly on its background (`z-index` lower than children). Children are positioned normally in the flow — no absolute overlay, no misalignment.

For **leaf blocks** (heading, paragraph, image, button, etc.) — the existing approach is kept unchanged:
```
BlockWrapper (leaf)
  └── <div pointer-events-none><BlockRenderer blocks={[leaf]} /></div>
  └── transparent overlay (absolute inset-0)  ← still correct for leaves
```

#### `CanvasBlockRenderer` Interface

```ts
interface CanvasBlockRendererProps {
  block: Block;                         // the container block
  depth: number;
  onBreadcrumb: (b: Block) => void;
  onSelectSelf: () => void;             // called when container background clicked
}
```

Renders the container's visual shell by type (`section`, `row`, `column`, `grid`, `flexbox`, `card-group`). For each type it replicates the wrapper JSX from `BlockRenderer.tsx`'s `BlockSwitch` — but renders children via `BlockWrapper` recursively rather than via `<BlockRenderer>`. The `BlockRenderer` component itself is not modified.

#### `BlockWrapper` change summary

```tsx
// NEW: for container blocks
if (schema.isContainer && !isDragging) {
  return (
    <div ref={setNodeRef} style={wrapperStyle} className={ringClasses}>
      <BlockToolbar ... />
      <CanvasBlockRenderer
        block={block}
        depth={depth}
        onBreadcrumb={onBreadcrumb}
        onSelectSelf={() => setSelectedId(block.id)}
      />
    </div>
  );
}

// UNCHANGED: for leaf blocks
return (
  <div ref={setNodeRef} style={wrapperStyle} className={ringClasses}>
    <div className="pointer-events-none select-none">
      <BlockRenderer blocks={[block]} ignoreVisibility />
    </div>
    {!isEditing && (
      <div className="absolute inset-0 z-10 cursor-pointer"
           onClick={handleClick} onDoubleClick={handleDoubleClick} />
    )}
    <BlockToolbar ... />
    {isEditing && isInlineEditable && <InlineEditor ... />}
  </div>
);
```

`ChildrenOverlay` is removed entirely. `EmptyContainerDropZone` is retained and used inside `CanvasBlockRenderer` when `block.children.length === 0`.

---

### REQ-4: Layout Presets Panel

**File:** `src/components/page-builder/LayoutPresetsPanel.tsx`

```ts
interface LayoutPreset {
  id:    string;
  label: string;
  icon:  string;  // emoji or small SVG string
  build: () => Block[];
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "2-col",      label: "2 Columns",         icon: "⎢ ⎢",    build: build2Col },
  { id: "3-col",      label: "3 Columns",         icon: "⎢ ⎢ ⎢",  build: build3Col },
  { id: "full-width", label: "Full Width Section", icon: "▭",      build: buildFullWidth },
  { id: "hero-text",  label: "Hero + Text",        icon: "🎯 ¶",   build: buildHeroText },
  { id: "2-col-img",  label: "Image + Text",       icon: "🖼 ¶",   build: build2ColImg },
  { id: "4-card",     label: "4-Card Grid",        icon: "▣▣▣▣",  build: build4Card },
]
```

Each `build()` function calls `createBlock(type)` for every node — `createBlock` calls `generateId()` internally, so every invocation produces a fresh UUID tree. There is no shared state between calls.

```ts
interface LayoutPresetsPanelProps {
  isOpen:   boolean;
  onClose:  () => void;
  onInsert: (blocks: Block[]) => void;  // called with preset.build() result
}
```

The panel is a floating card (not a modal) anchored below the "+ Layout" button in the toolbar. It closes on outside click (via `useEffect` with `mousedown` listener) or Escape.

**Integration in `BuilderCanvas`:**
```tsx
// In the toolbar div:
<button onClick={() => setPresetsOpen(true)}>+ Layout</button>
{presetsOpen && (
  <LayoutPresetsPanel
    isOpen={presetsOpen}
    onClose={() => setPresetsOpen(false)}
    onInsert={(presetBlocks) => {
      const next = [...blocks, ...presetBlocks];
      onBlocksChange(next);
      onSelect(presetBlocks[0].id);
      setPresetsOpen(false);
    }}
  />
)}
```

---

### REQ-5: Dynamic Feed Blocks

#### `BuilderModeContext`

**File:** `src/components/page-builder/BuilderModeContext.tsx`

```ts
const BuilderModeContext = createContext<boolean>(false);
export const BuilderModeProvider = ({ children }: { children: React.ReactNode }) => (
  <BuilderModeContext.Provider value={true}>{children}</BuilderModeContext.Provider>
);
export const useIsBuilderMode = () => useContext(BuilderModeContext);
```

`BuilderCanvas` wraps its output in `<BuilderModeProvider>`. `BlockRenderer` and `PublicPageShell` do not — so the context defaults to `false` for public pages.

#### `NewsFeedBlock`

**File:** `src/components/page-builder/blocks/NewsFeedBlock.tsx`

```ts
interface NewsFeedBlockProps {
  block: Block;
}
```

```tsx
export function NewsFeedBlock({ block }: NewsFeedBlockProps) {
  const isBuilderMode = useIsBuilderMode();
  const limit = Math.min(num(block.props.limit, 6), 12);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(!isBuilderMode);
  const [error, setError]       = useState(false);
  const bil = useBilingual(block.props);

  useEffect(() => {
    if (isBuilderMode) return;   // ← REQ-5.8: no API calls in canvas
    setLoading(true);
    api.get(`/public/content?type=article&status=PUBLISHED&page=0&size=${limit}`)
      .then(...)
      .catch(...)
      .finally(() => setLoading(false));
  }, [isBuilderMode, limit]);

  if (isBuilderMode) return <DynamicFeedPlaceholder type="news" limit={limit} />;
  if (loading)       return <FeedSkeleton count={limit} />;
  if (error || articles.length === 0) return <FeedEmpty type="news" />;

  return (
    <section>
      {bil("title") && <h2>{bil("title")}</h2>}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => <ArticleCard key={a.id} article={a} language={language} />)}
      </div>
    </section>
  );
}
```

Each `ArticleCard` renders: bilingual title, publication date, `<a href="/news/{slug}">Read More</a>`.

#### `EventsFeedBlock`

**File:** `src/components/page-builder/blocks/EventsFeedBlock.tsx`

Same pattern as `NewsFeedBlock`. Fetches from `/public/events/upcoming?limit={limit}`. Each `EventCard` renders: bilingual title, start date, `<a href="/events/{id}">View Details</a>`.

#### `BlockRenderer.tsx` changes

Add `BuilderModeContext` import. In `BlockSwitch`:
```tsx
case "news-feed":   return <NewsFeedBlock block={block} />;
case "events-feed": return <EventsFeedBlock block={block} />;
```

The `isBuilderMode` value is read from context inside each feed component — no prop threading needed.

---

### REQ-6: Extended Inline Text Editing

**File:** `src/components/page-builder/builder/BuilderCanvas.tsx`

```ts
const INLINE_EDITABLE_TYPES: Record<string, string> = {
  heading:   "text",
  paragraph: "text",
  button:    "label",
  banner:    "title",
  hero:      "title",
  card:      "title",
  cta:       "title",
};

const isInlineEditable = block.type in INLINE_EDITABLE_TYPES;
const inlinePropKey    = INLINE_EDITABLE_TYPES[block.type] ?? "text";
```

**`handleTextBlur` updated:**
```ts
const handleTextBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
  const newText = e.currentTarget.textContent ?? "";
  onBlocksChange(updateBlockProps(blocks, block.id, { [inlinePropKey]: newText }));
  setEditingTextId(null);
}, [blocks, block.id, inlinePropKey, onBlocksChange, setEditingTextId]);
```

**Initial value in contentEditable:** reads `block.props[inlinePropKey]` (falling back to `block.props[inlinePropKey + "En"]` for bilingual blocks).

**Escape key:** clears `editingTextId` without calling `onBlocksChange`, leaving props unchanged.

**`handleDoubleClick` updated:**
```ts
if (schema.isContainer) {
  onBreadcrumb(block);
} else if (isInlineEditable) {
  setEditingTextId(block.id);
}
```

No change to the container branch. Containers are never in `INLINE_EDITABLE_TYPES`.

---

## Data Models

No new data models are introduced. The existing models are used as-is:

| Model | Location | Used by |
|-------|----------|---------|
| `Block` / `PageLayout` | `src/types/block.ts` | All |
| `LegacyPageSection` (internal) | `src/components/page-builder/schema/page-layout.ts` | `useBlockPage` |
| `BlockProps` | `src/types/block.ts` | inline editing, feed blocks |

### API shapes consumed (read-only)

**Article** (from `/api/public/content`):
```ts
interface Article {
  id: string;
  slug: string;
  titleAr?: string;
  titleEn?: string;
  publishedAt?: string;
  // ...
}
```

**Event** (from `/api/public/events/upcoming`):
```ts
interface UpcomingEvent {
  id: string;
  titleAr?: string;
  titleEn?: string;
  startDate?: string;
  // ...
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: resolvePageLayout prefers layoutJson over legacy sections

*For any* non-null `layoutJson` string, `resolvePageLayout(layoutJson, legacySections)` shall return the same value as `parseLayout(layoutJson)`, regardless of the content of `legacySections`.

**Validates: Requirements 1.8**

---

### Property 2: resolvePageLayout fallback produces correct migration

*For any* non-empty array of `LegacyPageSection` objects, `resolvePageLayout(null, sections)` shall return the same value as `migrateLegacySections(sections)`.

**Validates: Requirements 1.7**

---

### Property 3: Clicking a child selects the child, not the parent

*For any* container block with at least one child, simulating a click on child[i]'s interactive element shall set `selectedId` to `child[i].id`, never to the container's ID.

**Validates: Requirements 2.1, 2.3**

---

### Property 4: insertBlock places the block at the exact requested index

*For any* block tree, *any* `parentId` that exists in the tree (or `"__root__"`), and *any* valid insertion index `i` (0 ≤ i ≤ children.length), calling `insertBlock(blocks, parentId, i, newBlock)` shall result in a tree where `newBlock` is at position `i` in the parent's children array and all other blocks remain in their original relative order.

**Validates: Requirements 3.2, 3.5**

---

### Property 5: moveBlock at root level preserves all blocks

*For any* root-level block list with N blocks and *any* valid (sourceIndex, targetIndex) pair, `moveBlock(blocks, sourceId, "__root__", targetIndex)` shall return a list of the same N blocks with `sourceId` at the new position and all other blocks in their original relative order.

**Validates: Requirements 3.6**

---

### Property 6: Layout preset IDs are unique across repeated invocations

*For any* preset `p` in `LAYOUT_PRESETS`, calling `p.build()` twice in succession shall produce two Block subtrees where the union of all IDs across both calls contains no duplicate values.

**Validates: Requirements 4.4**

---

### Property 7: Layout preset insertion appends blocks at the end

*For any* existing `blocks` array of length N and *any* preset `p`, inserting `p.build()` shall produce a new array of length N + |p.build()| where the first N elements are identical to the original `blocks`.

**Validates: Requirements 4.3**

---

### Property 8: Article card renders required fields for any article

*For any* valid `Article` object (non-empty id, slug, at least one of titleAr/titleEn, publishedAt), the rendered `ArticleCard` HTML shall contain the article's resolved title, a formatted publication date string, and an anchor element with `href` equal to `/news/{article.slug}`.

**Validates: Requirements 5.3**

---

### Property 9: Event card renders required fields for any event

*For any* valid `UpcomingEvent` object (non-empty id, at least one of titleAr/titleEn, startDate), the rendered `EventCard` HTML shall contain the event's resolved title, a formatted start date string, and an anchor element with `href` equal to `/events/{event.id}`.

**Validates: Requirements 5.4**

---

### Property 10: Feed blocks make no API calls in builder mode

*For any* `news-feed` or `events-feed` block (any `block.props` values), when rendered inside a `BuilderModeProvider`, no calls to `api.get` or `fetch` shall be made.

**Validates: Requirements 5.8**

---

### Property 11: Inline edit commit writes the correct prop key

*For any* block type in `INLINE_EDITABLE_TYPES` and *any* text string `t`, when an inline edit session is committed with content `t`, `updateBlockProps` shall be called with `{ [INLINE_EDITABLE_TYPES[block.type]]: t }` — never with a different key.

**Validates: Requirements 6.6, 6.10**

---

### Property 12: Escape during inline edit leaves props unchanged

*For any* inline-editable block with initial prop value `v` at the editable key, pressing Escape during an active edit session shall leave `block.props[inlinePropKey]` equal to `v` (no `updateBlockProps` call is made).

**Validates: Requirements 6.8**

---

### Property Reflection

After review, no redundancy was found worth eliminating:
- Properties 1 and 2 test opposite branches of the same conditional — both are needed.
- Properties 3 and (implicit from CanvasBlockRenderer) test child click vs container click — distinct.
- Properties 4 and 5 test `insertBlock` vs `moveBlock` — different functions.
- Properties 8 and 9 test different data shapes (Article vs UpcomingEvent) — different card types.
- Properties 11 and 12 test the commit path vs the cancel path — complementary, not redundant.

---

## Error Handling

### `useBlockPage`
- Network error → `error: true`, `layout: null`. `retry()` re-runs the full sequence.
- API returns `success: false` → treated as error.
- `resolvePageLayout` never throws (both `parseLayout` and `migrateLegacySections` are defensive).

### Feed Blocks (`NewsFeedBlock`, `EventsFeedBlock`)
- Network error → `error: true` → renders `<FeedEmpty>` with a message.
- Empty array response → same `<FeedEmpty>` path (REQ-5.6).
- `limit` is clamped to [1, 12] before use to prevent runaway requests.

### `CanvasBlockRenderer`
- Unknown container type → falls back to a generic `<div>` shell with children rendered normally. No crash.
- Container with `children === undefined` (schema mismatch) → treated as empty children array.

### Inline Text Editing
- `contentEditable` content is plain text only — no HTML injection risk since `textContent` (not `innerHTML`) is read on blur.
- Blur fires before the component unmounts on navigation, so the commit always runs.

### Layout Presets
- `createBlock` has a fallback default props path for unknown types — preset `build()` functions only use known types, so this path is not reached.

---

## Testing Strategy

### Property-Based Testing

The project uses TypeScript/Next.js. The recommended PBT library is **fast-check** (well-maintained, TypeScript-native, integrates with Jest/Vitest).

Each property test runs a minimum of 100 iterations.

```ts
// Tag format: Feature: page-builder-fixes, Property {N}: {title}
import fc from "fast-check";
```

**Property 1 & 2 tests** — in `src/hooks/__tests__/useBlockPage.test.ts` and `src/components/page-builder/schema/__tests__/page-layout.test.ts`:
```ts
// Feature: page-builder-fixes, Property 1: resolvePageLayout prefers layoutJson
it("P1: resolvePageLayout always uses layoutJson when non-null", () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    fc.array(arbitraryLegacySection()),
    (layoutJson, sections) => {
      const result = resolvePageLayout(layoutJson, sections);
      expect(result).toEqual(parseLayout(layoutJson));
    }
  ));
});
```

**Property 4 & 5 tests** — in `src/components/page-builder/schema/__tests__/tree-utils.test.ts`:
```ts
// Feature: page-builder-fixes, Property 4: insertBlock places block at correct index
it("P4: insertBlock always inserts at the requested index", () => {
  fc.assert(fc.property(
    arbitraryBlockTree(),
    fc.integer({ min: 0, max: 5 }),
    (blocks, index) => {
      const clamped = Math.min(index, blocks.length);
      const newBlock = createBlock("paragraph");
      const result = insertBlock(blocks, "__root__", clamped, newBlock);
      expect(result[clamped].id).toBe(newBlock.id);
      expect(result.length).toBe(blocks.length + 1);
    }
  ));
});
```

**Property 6 & 7 tests** — in `src/components/page-builder/__tests__/LayoutPresetsPanel.test.ts`:
```ts
// Feature: page-builder-fixes, Property 6: preset IDs are globally unique
it("P6: two consecutive build() calls produce no duplicate IDs", () => {
  fc.assert(fc.property(
    fc.constantFrom(...LAYOUT_PRESETS),
    (preset) => {
      const tree1 = preset.build();
      const tree2 = preset.build();
      const ids = [...flatIds(tree1), ...flatIds(tree2)];
      expect(new Set(ids).size).toBe(ids.length);
    }
  ));
});
```

**Properties 8, 9, 10 tests** — in `src/components/page-builder/blocks/__tests__/FeedBlocks.test.tsx`:
```ts
// Feature: page-builder-fixes, Property 8: article card renders required fields
it("P8: ArticleCard always contains title, date, and read-more link", () => {
  fc.assert(fc.property(
    arbitraryArticle(),
    (article) => {
      const { getByText, getByRole } = render(<ArticleCard article={article} language="en" />);
      expect(getByText(article.titleEn ?? article.titleAr!)).toBeInTheDocument();
      expect(getByText(/\d{4}/)).toBeInTheDocument(); // date contains a year
      expect(getByRole("link", { name: /read more/i }))
        .toHaveAttribute("href", `/news/${article.slug}`);
    }
  ));
});
```

**Properties 11, 12 tests** — in `src/components/page-builder/builder/__tests__/inlineEdit.test.tsx`:
```ts
// Feature: page-builder-fixes, Property 11: inline edit commit writes correct prop key
it("P11: blur always writes to the correct prop key for any inline-editable type", () => {
  fc.assert(fc.property(
    fc.constantFrom(...Object.keys(INLINE_EDITABLE_TYPES)),
    fc.string(),
    (blockType, newText) => {
      // render BlockWrapper for the given type, activate edit, change text, blur
      // verify updateBlockProps was called with { [INLINE_EDITABLE_TYPES[blockType]]: newText }
    }
  ));
});
```

### Unit / Example Tests

Example tests (not PBT) cover:
- Loading skeleton renders while `loading=true` in `useBlockPage` (REQ-1.9)
- Error state with retry button when API fails (REQ-1.10)
- `NewsFeedBlock` calls the correct API URL when `isBuilderMode=false` (REQ-5.1, 5.2)
- Skeleton count matches `limit` prop (REQ-5.5)
- Empty state renders when API returns 0 results (REQ-5.6)
- Double-click on each inline-editable type activates editing on the correct field (REQ-6.1–6.5)
- Transparent overlay is absent when inline edit is active (REQ-6.7)
- Pressing Escape closes the edit without committing (REQ-6.8)
- Existing heading/paragraph inline edit works correctly after refactor (REQ-6.9)
- "+ Layout" button renders in toolbar (REQ-4.1)
- Preset palette has ≥ 4 presets (REQ-4.2)
- Selecting a preset selects the outermost inserted block (REQ-4.5)
- Pressing Escape closes the preset palette (REQ-4.6)

### Integration Tests

- Each of the 6 static public pages renders without error when mounted with mock API data (smoke, one test per route).
- `BuilderCanvas` with a container block containing children renders children as selectable (interaction integration test).

### Test Configuration

- Framework: **Vitest** (already in the Next.js project) + `@testing-library/react`
- PBT library: **fast-check** (`npm install --save-dev fast-check`)
- Each property test: `{ numRuns: 100 }` minimum
- Run command: `npx vitest --run` (single execution, no watch mode)
