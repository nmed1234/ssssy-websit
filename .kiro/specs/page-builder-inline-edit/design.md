# Design Document — page-builder-inline-edit

## Overview

This feature unifies inline editing for all page-builder block types under a single `InlineTextField`-based system, eliminates the legacy `editingTextId` / `INLINE_EDITABLE_TYPES` mechanism from `BuilderCanvas`, and adds a per-field EN/AR language toggle so bilingual editors can switch between English and Arabic props directly on the canvas.

### Scope of Changes

| File | Action |
|---|---|
| `InlineTextField.tsx` | Extend with `propKeyAr`, `valueAr` props; add internal language state; add EN/AR toggle badge |
| `BuilderCanvas.tsx` | Remove `editingTextId`, `setEditingTextId`, `registerEditRef`, `INLINE_EDITABLE_TYPES`; remove legacy leaf editing branch |
| `CanvasBlockRenderer.tsx` | Pass `propKey` + `propKeyAr` (and both values) to all `InlineTextField` instances; remove `useBilingualKey` |
| `InlineLeafRenderer.tsx` | **New file** — renders leaf blocks with `InlineTextField` for key fields |

No backend, database, or API changes are required.

---

## Architecture

### Unified Inline-Edit State Machine

The `InlineEditProvider` (already mounted at the root of `BuilderCanvas`) becomes the **single source of truth** for all inline editing. After the migration the state machine is:

```
              ┌──────────────────────────────────────────┐
              │  InlineEditProvider                       │
              │  editing: { blockId, propKey } | null     │
              └──────────┬───────────────────────────────┘
                         │ startEditing / stopEditing / commitEdit
              ┌──────────▼───────────────────────────────┐
              │  InlineTextField (any field, any block)    │
              │  internal: activeLanguage ("en"|"ar")      │
              │  internal: originalValue (escape revert)   │
              └──────────────────────────────────────────┘
```

Previously, two paths existed:
1. Container blocks → `InlineTextField` via `CanvasBlockRenderer` (new path)
2. Leaf blocks → raw `contentEditable` div via `BuilderCanvas.BlockWrapper` + `editingTextId` (legacy path)

After migration, **only path 1 exists**, and it covers both containers and leaf blocks.

### Component Hierarchy

```
BuilderCanvas
  InlineEditProvider  ← single owner of editing state
    BlockList
      BlockWrapper (container blocks)
        CanvasBlockRenderer  ← InlineTextField for container key fields
      BlockWrapper (leaf blocks)
        InlineLeafRenderer   ← InlineTextField for leaf key fields  [NEW]
        transparent overlay  ← hidden when block.id matches editing.blockId
        BlockToolbar         ← hidden when block.id matches editing.blockId
```

---

## Component Designs

### 1. InlineTextField (extended)

#### New Props

```typescript
interface InlineTextFieldProps {
  blockId: string;
  /** English prop key — always required */
  propKey: string;
  /** Arabic prop key — optional; when provided, EN/AR toggle is shown */
  propKeyAr?: string;
  /** English display value */
  value: string;
  /** Arabic display value — optional; used when propKeyAr is provided */
  valueAr?: string;
  tag?: TagName;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}
```

#### Internal State

```typescript
// Active language — determines which propKey and value are "live"
const [activeLang, setActiveLang] = useState<"en" | "ar">("en");

// Derived from activeLang:
//   activeKey  = activeLang === "ar" && propKeyAr ? propKeyAr : propKey
//   activeValue = activeLang === "ar" && valueAr   ? valueAr   : value
```

#### Editing Start Protocol (snapshot pattern)

When the user double-clicks to start editing:
1. `originalValue.current` is set to `activeValue` (the displayed value at that moment).
2. `startEditing(blockId, activeKey)` is called — this **snapshots the propKey** into context.
3. When `blur` fires (or Enter), `commitEdit(blockId, activeKey, textContent)` is called using the **key that was passed to `startEditing`**, not the current `activeLang` state.

This satisfies Requirement 4.6: the commit always targets the key that was active when editing began, regardless of any toggle state changes after edit activation.

#### EN/AR Toggle Badge

```tsx
// Rendered only when: propKeyAr is defined AND !isEditing
{propKeyAr && !isEditing && (
  <span
    className="absolute -top-5 right-0 flex gap-0.5 opacity-0 group-hover/inline:opacity-100 transition-opacity z-20"
    style={{ fontSize: "9px" }}
  >
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setActiveLang("en"); }}
      className={`px-1 py-0.5 rounded text-[9px] font-medium border ${
        activeLang === "en"
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-500 border-gray-300"
      }`}
    >EN</button>
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setActiveLang("ar"); }}
      className={`px-1 py-0.5 rounded text-[9px] font-medium border ${
        activeLang === "ar"
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-500 border-gray-300"
      }`}
    >AR</button>
  </span>
)}
```

The parent element must be `position: relative` to anchor this badge. `InlineTextField`'s wrapper element already carries `group-hover/inline` classes for the dashed outline — the badge piggybacks on that same hover group.

---

### 2. InlineLeafRenderer (new)

`InlineLeafRenderer` replaces the legacy `contentEditable` div branch in `BlockWrapper` for leaf blocks. It renders the real `BlockRenderer` output as the visual base layer and overlays `InlineTextField` components for every key field.

#### Architecture

```
InlineLeafRenderer
  ├── <div className="pointer-events-none select-none">  ← BlockRenderer visual base
  │     <BlockRenderer blocks={[block]} ignoreVisibility />
  └── <div className="absolute inset-0 group/inline z-[5]">  ← InlineTextField overlay
        <IT propKey="title" propKeyAr="titleAr" value=… valueAr=… … />
        <IT propKey="subtitle" propKeyAr="subtitleAr" value=… valueAr=… … />
        …
```

The `BlockRenderer` provides the full visual fidelity (images, colors, responsive layout) while the `InlineTextField` overlay positions itself to match the rendered text using absolute positioning or the same structural layout used by the renderer.

For most leaf blocks, a simpler approach is practical: the overlay div displays a compact set of labeled inline-editable fields that match the key text content. This avoids the pixel-perfect overlay alignment problem while still being visually intuitive.

#### Key Field Registry

```typescript
const LEAF_KEY_FIELDS: Record<string, Array<{ propKey: string; propKeyAr: string; tag: TagName; className: string; multiline?: boolean; placeholder: string }>> = {
  heading:         [{ propKey: "text",         propKeyAr: "textAr",         tag: "h2", className: "font-heading text-2xl font-bold",       placeholder: "Heading…" }],
  paragraph:       [{ propKey: "text",         propKeyAr: "textAr",         tag: "p",  className: "text-base leading-relaxed",              placeholder: "Paragraph…", multiline: true }],
  button:          [{ propKey: "label",        propKeyAr: "labelAr",        tag: "span", className: "font-medium",                          placeholder: "Button label…" }],
  card:            [
    { propKey: "title",       propKeyAr: "titleAr",       tag: "h3", className: "font-heading text-lg font-semibold", placeholder: "Card title…" },
    { propKey: "subtitle",    propKeyAr: "subtitleAr",    tag: "p",  className: "text-sm text-muted-foreground",       placeholder: "Subtitle…" },
    { propKey: "buttonLabel", propKeyAr: "buttonLabelAr", tag: "span", className: "text-sm font-medium",              placeholder: "Button…" },
  ],
  hero:            [
    { propKey: "title",       propKeyAr: "titleAr",       tag: "h1", className: "font-heading text-4xl font-bold",    placeholder: "Hero title…" },
    { propKey: "subtitle",    propKeyAr: "subtitleAr",    tag: "p",  className: "text-lg",                            placeholder: "Subtitle…", multiline: true },
    { propKey: "buttonLabel", propKeyAr: "buttonLabelAr", tag: "span", className: "font-medium",                      placeholder: "Button…" },
  ],
  cta:             [
    { propKey: "title",       propKeyAr: "titleAr",       tag: "h2", className: "font-heading text-2xl font-bold",    placeholder: "CTA title…" },
    { propKey: "text",        propKeyAr: "textAr",        tag: "p",  className: "text-base",                          placeholder: "Body text…", multiline: true },
    { propKey: "buttonLabel", propKeyAr: "buttonLabelAr", tag: "span", className: "font-medium",                      placeholder: "Button…" },
  ],
  banner:          [
    { propKey: "title",       propKeyAr: "titleAr",       tag: "h2", className: "font-heading text-2xl font-bold",    placeholder: "Title…" },
    { propKey: "text",        propKeyAr: "textAr",        tag: "p",  className: "text-base",                          placeholder: "Body text…", multiline: true },
    { propKey: "buttonLabel", propKeyAr: "buttonLabelAr", tag: "span", className: "font-medium",                      placeholder: "Button…" },
  ],
  blockquote:      [
    { propKey: "text",        propKeyAr: "textAr",        tag: "p",  className: "italic text-lg",                     placeholder: "Quote…", multiline: true },
    { propKey: "attribution", propKeyAr: "attributionAr", tag: "span", className: "text-sm font-medium",              placeholder: "Attribution…" },
  ],
  alert:           [
    { propKey: "title",   propKeyAr: "titleAr",   tag: "h3", className: "font-semibold",      placeholder: "Alert title…" },
    { propKey: "message", propKeyAr: "messageAr", tag: "p",  className: "text-sm",            placeholder: "Message…", multiline: true },
  ],
  stats:           [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Stats title…" }],
  testimonial:     [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Section title…" }],
  team:            [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Team title…" }],
  accordion:       [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Section title…" }],
  faq:             [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "FAQ title…" }],
  "newsletter-form": [
    { propKey: "title",       propKeyAr: "titleAr",       tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Form title…" },
    { propKey: "text",        propKeyAr: "textAr",        tag: "p",  className: "text-base",                       placeholder: "Body text…", multiline: true },
    { propKey: "buttonLabel", propKeyAr: "buttonLabelAr", tag: "span", className: "font-medium",                   placeholder: "Button…" },
  ],
  // Title-only leaf types
  "news-feed":        [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Section title…" }],
  "events-feed":      [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Section title…" }],
  "contact-form":     [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Form title…" }],
  "map":              [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Map title…" }],
  "gallery":          [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Gallery title…" }],
  "carousel":         [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Carousel title…" }],
  "timeline":         [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Timeline title…" }],
  "progress":         [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Section title…" }],
  "pricing-table":    [{ propKey: "title", propKeyAr: "titleAr", tag: "h2", className: "font-heading text-2xl font-bold", placeholder: "Pricing title…" }],
};
```

#### Component Signature

```typescript
export interface InlineLeafRendererProps {
  block: Block;
}

export function InlineLeafRenderer({ block }: InlineLeafRendererProps) {
  const fields = LEAF_KEY_FIELDS[block.type];

  // Fallback: no key fields defined → render BlockRenderer only
  if (!fields) {
    return (
      <div className="pointer-events-none select-none">
        <BlockRenderer blocks={[block]} ignoreVisibility />
      </div>
    );
  }

  return (
    <div className="relative group/inline">
      {/* Visual base — real rendered output */}
      <div className="pointer-events-none select-none">
        <BlockRenderer blocks={[block]} ignoreVisibility />
      </div>
      {/* Inline-editable fields overlay */}
      <div className="absolute inset-0 z-[5] p-2 flex flex-col gap-1 pointer-events-none">
        {fields.map((f) => (
          <InlineTextField
            key={f.propKey}
            blockId={block.id}
            propKey={f.propKey}
            propKeyAr={f.propKeyAr}
            value={String(block.props[f.propKey] ?? "")}
            valueAr={String(block.props[f.propKeyAr] ?? "")}
            tag={f.tag}
            className={f.className}
            placeholder={f.placeholder}
            multiline={f.multiline}
          />
        ))}
      </div>
    </div>
  );
}
```

> **Note on overlay pointer events**: The InlineTextField elements within the overlay need `pointer-events-auto` applied to them individually (the wrapping `div` stays `pointer-events-none` so the visual base layer is not blocked outside field areas). InlineTextField already handles this internally for its view-mode and edit-mode elements.

---

### 3. BuilderCanvas Changes

#### Removals

```typescript
// REMOVE: state variable
const [editingTextId, setEditingTextId] = useState<string | null>(null);

// REMOVE: ref map
const editRefs = useRef<Record<string, HTMLElement | null>>({});
const registerEditRef = useCallback(...);

// REMOVE: constant
const INLINE_EDITABLE_TYPES: Record<string, string> = { ... };

// REMOVE: from CanvasContextValue interface
editingTextId: string | null;
setEditingTextId: (id: string | null) => void;
registerEditRef: (id: string, ref: HTMLElement | null) => void;
```

#### BlockWrapper Changes

The leaf block branch in `BlockWrapper` is simplified:

```typescript
// BEFORE: two branches (isEditing contentEditable div vs BlockRenderer)
// AFTER: always render InlineLeafRenderer; overlay visibility is conditional

// Leaf blocks
return (
  <div ref={setNodeRef} style={wrapperStyle} className={`group relative mb-2 rounded-sm transition-all ${ringClasses}`}>
    {/* InlineLeafRenderer replaces both the contentEditable div and the plain BlockRenderer div */}
    <InlineLeafRenderer block={block} />

    {/* Transparent overlay — hidden when this block is actively being edited */}
    {!isActivelyEditing && (
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
    )}

    {/* BlockToolbar — hidden during active editing */}
    {!isActivelyEditing && (
      <BlockToolbar ... />
    )}
  </div>
);
```

Where `isActivelyEditing` is derived from `InlineEditContext`:

```typescript
const { editing } = useInlineEdit();
const isActivelyEditing = editing?.blockId === block.id;
```

`BlockWrapper` no longer needs `editingTextId` from `CanvasContext` for this check.

#### handleDoubleClick Simplification

```typescript
// BEFORE
const handleDoubleClick = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedId(block.id);
  if (schema.isContainer) {
    onBreadcrumb(block);
  } else if (isInlineEditable) {      // ← legacy check
    setEditingTextId(block.id);        // ← legacy activation
  }
}, [...]);

// AFTER
const handleDoubleClick = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedId(block.id);
  if (schema.isContainer) {
    onBreadcrumb(block);
  }
  // InlineTextField handles double-click activation internally for leaf blocks
}, [...]);
```

---

### 4. CanvasBlockRenderer Changes

#### Dual-Key Pattern

Every `InlineTextField` call site is updated from the `bilKey(key)` single-key pattern to the `propKey` + `propKeyAr` dual-key pattern:

```typescript
// BEFORE
<IT propKey={bilKey("title")} value={bil("title")} tag="h2" ... />

// AFTER
<InlineTextField
  blockId={block.id}
  propKey="title"
  propKeyAr="titleAr"
  value={str(props.title)}
  valueAr={str(props.titleAr)}
  tag="h2"
  ...
/>
```

#### Removals

```typescript
// REMOVE: entire hook
function useBilingualKey(props: BlockProps) { ... }

// REMOVE: usage
const bilKey = useBilingualKey(props);

// REMOVE: the makeIT factory (replaced by direct InlineTextField usage or
// a simpler factory that accepts dual keys)
```

The `useBilingual` hook and `bil()` helper that reads the display value can also be simplified or removed since `InlineTextField` now selects which value to display internally.

---

## Data Models

No new data model is introduced. The existing `Block.props: BlockProps` flat record continues to store both language variants at sibling keys (e.g. `{ title: "About Us", titleAr: "من نحن" }`).

The only data-flow change is that `InlineEditProvider.onCommit` now receives the **exact active prop key** (either `"title"` or `"titleAr"`) from the `InlineTextField` at commit time, ensuring writes target the correct sibling key.

```
commitEdit(blockId: string, propKey: string, value: string)
    ↓
onBlocksChange(updateBlockProps(blocks, blockId, { [propKey]: value }))
```

This is unchanged from the current implementation — the novelty is that `propKey` can now be the Arabic variant key.

---

## Error Handling

| Scenario | Handling |
|---|---|
| `useInlineEdit()` called outside `InlineEditProvider` | Throws descriptive error (existing behavior, preserved) |
| `propKeyAr` provided but `valueAr` not provided | `valueAr` defaults to `""` — treated as empty Arabic value |
| Block type not in `LEAF_KEY_FIELDS` | `InlineLeafRenderer` falls back to `BlockRenderer` with `pointer-events-none` |
| `commitEdit` called with empty string | Empty string is committed; the field shows placeholder styling in view mode |
| Language toggled while `contentEditable` is active | Toggle is hidden during edit mode (Req 3.8), so this cannot occur |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single Active Editing Session

*For any* sequence of `startEditing`, `stopEditing`, and `commitEdit` calls, the `InlineEditProvider` state SHALL contain at most one active `{ blockId, propKey }` pair at any point in time.

**Validates: Requirements 1.1**

---

### Property 2: Editing Activation Targets the Correct Field

*For any* `blockId` and `propKey`, after a double-click on the corresponding `InlineTextField`, the `InlineEditContext.editing` state SHALL equal `{ blockId, propKey }` where `propKey` is the active language key at the time of double-click.

**Validates: Requirements 1.3, 4.4**

---

### Property 3: Leaf Renderer Produces InlineTextField for All Covered Key Fields

*For any* block whose `type` is in the covered list, `InlineLeafRenderer` SHALL render exactly one `InlineTextField` per entry in `LEAF_KEY_FIELDS[block.type]`, with `propKey` and `propKeyAr` matching the registry entry.

**Validates: Requirements 2.1, 2.2**

---

### Property 4: Uncovered Block Types Fall Back to BlockRenderer

*For any* block whose `type` is not present as a key in `LEAF_KEY_FIELDS`, `InlineLeafRenderer` SHALL render a `<div className="pointer-events-none select-none">` wrapping `BlockRenderer` and SHALL NOT render any `InlineTextField` elements.

**Validates: Requirements 2.3**

---

### Property 5: Overlay and Toolbar Hidden During Active Editing

*For any* leaf block whose `block.id` matches `InlineEditContext.editing.blockId`, the transparent click/drag overlay and `BlockToolbar` SHALL be absent from the rendered output.

**Validates: Requirements 2.4, 6.2, 6.3**

---

### Property 6: EN/AR Toggle Shown if and Only if propKeyAr is Defined and Not Editing

*For any* `InlineTextField` instance, the EN/AR toggle badge SHALL be present in the rendered output if and only if `propKeyAr` is a non-empty string AND the field is NOT in active editing mode.

**Validates: Requirements 3.1, 3.7, 3.8, 4.2, 4.3**

---

### Property 7: Language Toggle Changes Displayed Value

*For any* `InlineTextField` with `propKeyAr` defined, after clicking the "EN" button the displayed text SHALL equal `value`, and after clicking the "AR" button the displayed text SHALL equal `valueAr`.

**Validates: Requirements 3.3, 3.4, 5.3**

---

### Property 8: Commit Targets the Active-at-Start PropKey

*For any* `InlineTextField`, the `propKey` argument passed to `commitEdit` SHALL equal the prop key (`propKey` or `propKeyAr`) that was **active when `startEditing` was called**, regardless of any language toggle changes that occur after editing begins.

**Validates: Requirements 3.5, 4.4, 4.6**

---

### Property 9: No propKeyAr Means No Toggle and Single-Key Commit

*For any* `InlineTextField` rendered without a `propKeyAr` prop, the component SHALL exhibit identical behavior to the pre-migration implementation: no toggle appears, `startEditing` is always called with `propKey`, and `commitEdit` always writes to `propKey`.

**Validates: Requirements 4.3, 8.3**

---

### Property 10: InlineEditProvider commit propagates to the block tree

*For any* triple `(blockId, propKey, value)` that reaches `InlineEditProvider.commitEdit`, the `onCommit` callback SHALL be invoked with exactly `(blockId, propKey, value)`, resulting in `updateBlockProps(blocks, blockId, { [propKey]: value })` being applied to the block tree.

**Validates: Requirements 8.3**

---

### Property 11: Container InlineTextField Fields Preserve Dual-Key Coverage

*For any* container block rendered by `CanvasBlockRenderer` that has a text field with a known bilingual pair (e.g. `title` / `titleAr`), the rendered output SHALL contain an `InlineTextField` with `propKey="title"` and `propKeyAr="titleAr"` (and corresponding values), preserving the same editing behavior as before the migration.

**Validates: Requirements 5.1, 7.1, 7.2**


---

## Section 5 — InlineItemsEditor Component Design

### Overview

`InlineItemsEditor` is a new canvas-only component that renders a block's repeating items array as a list of compact, editable cards directly on the builder canvas. Each card exposes the item's text fields as `InlineTextField` instances. An "Add item" button appends a new empty item; a per-card "×" button removes the item; a per-card drag handle (optional) enables reorder. All mutations are committed immediately via the `onCommit` callback (which maps to `updateBlockProps`).

---

### 5.1 Item Schema Registry

The registry maps each block type to its `itemsKey` (the `block.props` key holding the array) and an `itemFields` list (only `"text"` and `"textarea"` kind fields from the block schema's `itemSchema`, filtered at call-site by `InlineItemsEditor`).

```typescript
export interface ItemsEditorRegistryEntry {
  itemsKey: string;
  /** Full itemSchema from BLOCK_SCHEMA — InlineItemsEditor filters to text/textarea internally */
  itemSchema: FieldDef[];
}

export const ITEMS_EDITOR_REGISTRY: Record<string, ItemsEditorRegistryEntry> = {
  // ── Leaf blocks ──────────────────────────────────────────────────────────
  timeline: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "date",      label: "Date / Year",      group: "content" },
      { kind: "text",     key: "title",     label: "Event Title (EN)", group: "content" },
      { kind: "text",     key: "titleAr",   label: "العنوان (AR)",     group: "content" },
      { kind: "textarea", key: "content",   label: "Description (EN)", group: "content" },
      { kind: "textarea", key: "contentAr", label: "الوصف (AR)",       group: "content" },
    ],
  },
  accordion: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "title",     label: "Heading (EN)",  group: "content" },
      { kind: "text",     key: "titleAr",   label: "العنوان (AR)", group: "content" },
      { kind: "textarea", key: "content",   label: "Body (EN)",     group: "content" },
      { kind: "textarea", key: "contentAr", label: "المحتوى (AR)", group: "content" },
    ],
  },
  faq: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "question",   label: "Question (EN)", group: "content" },
      { kind: "text",     key: "questionAr", label: "السؤال (AR)",   group: "content" },
      { kind: "textarea", key: "answer",     label: "Answer (EN)",   group: "content" },
      { kind: "textarea", key: "answerAr",   label: "الإجابة (AR)", group: "content" },
    ],
  },
  stats: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text", key: "value",   label: "Value (e.g. 1,200+)", group: "content" },
      { kind: "text", key: "label",   label: "Label (EN)",          group: "content" },
      { kind: "text", key: "labelAr", label: "التسمية (AR)",        group: "content" },
      // "icon" is text kind — included
      { kind: "text", key: "icon",    label: "Icon (emoji)",        group: "content" },
    ],
  },
  testimonial: {
    itemsKey: "items",
    itemSchema: [
      { kind: "textarea", key: "quote",   label: "Quote (EN)",     group: "content" },
      { kind: "textarea", key: "quoteAr", label: "الاقتباس (AR)", group: "content" },
      { kind: "text",     key: "name",    label: "Author Name",    group: "content" },
      { kind: "text",     key: "role",    label: "Role / Company", group: "content" },
      // "avatar" is image kind — excluded
    ],
  },
  team: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "name",     label: "Name (EN)",             group: "content" },
      { kind: "text",     key: "nameAr",   label: "الاسم (AR)",            group: "content" },
      { kind: "text",     key: "role",     label: "Role / Title (EN)",     group: "content" },
      { kind: "text",     key: "roleAr",   label: "الدور / اللقب (AR)",   group: "content" },
      { kind: "textarea", key: "bio",      label: "Bio (EN)",              group: "content" },
      { kind: "textarea", key: "bioAr",    label: "السيرة الذاتية (AR)",  group: "content" },
      // "avatar" image and "linkedin" url excluded
    ],
  },
  gallery: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text", key: "alt",     label: "Alt Text", group: "content" },
      { kind: "text", key: "caption", label: "Caption",  group: "content" },
      // "src" image excluded
    ],
  },
  carousel: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "title",   label: "Slide Title", group: "content" },
      { kind: "textarea", key: "content", label: "Slide Body",  group: "content" },
      // "src" image and "url" excluded
    ],
  },
  "pricing-table": {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "name",        label: "Plan Name",   group: "content" },
      { kind: "text",     key: "price",       label: "Price",       group: "content" },
      { kind: "text",     key: "period",      label: "Period",      group: "content" },
      { kind: "textarea", key: "description", label: "Description", group: "content" },
      { kind: "text",     key: "cta",         label: "CTA Button",  group: "content" },
      // "url" url and "featured" toggle excluded
    ],
  },
  progress: {
    itemsKey: "items",
    itemSchema: [
      { kind: "text", key: "label", label: "Skill / Label", group: "content" },
      // "value" number and "color" excluded
    ],
  },

  // ── Legacy container blocks ───────────────────────────────────────────────
  "about-vision-mission-section": {
    itemsKey: "panels",
    itemSchema: [
      { kind: "text",     key: "icon",          label: "Icon (emoji or Lucide name)", group: "content" },
      { kind: "text",     key: "titleEn",        label: "Panel Title (EN)",            group: "content" },
      { kind: "text",     key: "titleAr",        label: "عنوان اللوحة (AR)",          group: "content" },
      { kind: "textarea", key: "contentEn",      label: "Panel Content (EN)",          group: "content" },
      { kind: "textarea", key: "contentAr",      label: "محتوى اللوحة (AR)",          group: "content" },
      { kind: "text",     key: "buttonLabelEn",  label: "Button Label (EN)",           group: "content" },
      { kind: "text",     key: "buttonLabelAr",  label: "نص الزر (AR)",               group: "content" },
      // "gradientClass" text excluded (style, not content), "buttonUrl" url excluded
    ],
  },
  "about-timeline-section": {
    itemsKey: "items",
    itemSchema: [
      { kind: "text",     key: "year",    label: "Year",            group: "content" },
      { kind: "text",     key: "titleEn", label: "Title (EN)",      group: "content" },
      { kind: "text",     key: "titleAr", label: "العنوان (AR)",    group: "content" },
      { kind: "textarea", key: "descEn",  label: "Description (EN)", group: "content" },
      { kind: "textarea", key: "descAr",  label: "الوصف (AR)",      group: "content" },
    ],
  },
  "about-overview-section": {
    itemsKey: "paragraphs",
    itemSchema: [
      { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content" },
      { kind: "textarea", key: "textAr", label: "الفقرة (AR)",    group: "content" },
    ],
  },
  "about-organizational-chart-section": {
    itemsKey: "paragraphs",
    itemSchema: [
      { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content" },
      { kind: "textarea", key: "textAr", label: "الفقرة (AR)",    group: "content" },
    ],
  },
  "board-term-information-section": {
    itemsKey: "paragraphs",
    itemSchema: [
      { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content" },
      { kind: "textarea", key: "textAr", label: "الفقرة (AR)",    group: "content" },
    ],
  },
  "about-documents-section": {
    itemsKey: "documents",
    itemSchema: [
      { kind: "text", key: "labelEn",  label: "Label (EN)",   group: "content" },
      { kind: "text", key: "labelAr",  label: "التسمية (AR)", group: "content" },
      { kind: "text", key: "fileType", label: "File Type",    group: "content" },
      // "url" excluded
    ],
  },
  "about-gallery-section": {
    itemsKey: "images",
    itemSchema: [
      { kind: "text", key: "alt",     label: "Alt Text", group: "content" },
      { kind: "text", key: "caption", label: "Caption",  group: "content" },
      // "src" image excluded
    ],
  },
  // president-message-content-section has two separate arrays
  "president-message-content-section-paragraphs": {
    itemsKey: "paragraphs",
    itemSchema: [
      { kind: "textarea", key: "textEn", label: "Paragraph (EN)", group: "content" },
      { kind: "textarea", key: "textAr", label: "الفقرة (AR)",    group: "content" },
    ],
  },
  // socialLinks: only "platform" select and "url" url — neither is text/textarea kind
  // so InlineItemsEditor would produce an empty card; these remain Property Panel only
};
```

---

### 5.2 Component Signature

```typescript
export interface ItemFieldDef {
  key: string;
  label: string;
  multiline?: boolean; // true when kind === "textarea"
  dir?: "rtl";
}

export interface InlineItemsEditorProps {
  /** The block this items array belongs to */
  blockId: string;
  /** The prop key of the array in block.props (e.g. "items", "panels", "paragraphs") */
  itemsKey: string;
  /** Current array value from block.props[itemsKey] */
  items: Record<string, unknown>[];
  /** Text-editable fields derived from the block schema's itemSchema */
  itemFields: ItemFieldDef[];
  /** Called with the full updated array when any item is added, removed, or a field is committed */
  onItemsChange: (newItems: Record<string, unknown>[]) => void;
}

export function InlineItemsEditor({
  blockId,
  itemsKey,
  items,
  itemFields,
  onItemsChange,
}: InlineItemsEditorProps): React.ReactElement
```

The `onItemsChange` callback maps directly to `updateBlockProps(blocks, blockId, { [itemsKey]: newItems })` at the call-site in `InlineLeafRenderer` / `LegacyContainerWithInlineEdit`.

---

### 5.3 Composite Prop Key Convention

`InlineTextField` instances inside `InlineItemsEditor` use a composite `propKey` that encodes the array, index, and field key:

```
propKey = `${itemsKey}[${index}].${fieldKey}`
// e.g. "items[0].title", "panels[2].contentEn", "paragraphs[1].textAr"
```

`InlineEditProvider.onCommit` receives this composite key. The call-site (`InlineItemsEditor`) intercepts the commit via its own `onCommit`-like handler: rather than writing directly to a flat `block.props` key, it:

1. Parses the composite key to extract `index` and `fieldKey`.
2. Performs an immutable update: `items.map((item, i) => i === index ? { ...item, [fieldKey]: value } : item)`.
3. Calls `onItemsChange(updatedItems)`.

This means `InlineItemsEditor` does **not** go through `InlineEditProvider.commitEdit` for the final write. Instead, it wraps `InlineEditContext` usage locally: the `InlineTextField` within a card calls `startEditing` / `stopEditing` normally (for UI state), but the `commitEdit` is intercepted by a local `onCommit` prop passed to a nested `InlineEditProvider` or handled by a specialized callback. 

**Simpler implementation approach**: Rather than using a nested `InlineEditProvider`, each `InlineTextField` in `InlineItemsEditor` is given a synthetic `blockId` of `"${blockId}::${itemsKey}[${index}]"` and a `propKey` of `fieldKey`. The `InlineItemsEditor` registers a commit handler on the parent `InlineEditProvider` that intercepts commits for synthetic blockIds matching this pattern, performs the immutable item update, and calls `onItemsChange`. This avoids context nesting entirely.

**Alternative (preferred for simplicity)**: `InlineItemsEditor` renders each item's fields using **uncontrolled `contentEditable` spans** with the same visual style as `InlineTextField`, but manages its own local edit state (no context dependency per-field). On blur, it calls `onItemsChange` directly. This decouples items editing from the single-session constraint of `InlineEditProvider` (only one field active globally at a time), which is acceptable since items have multiple fields that may each need separate editing sessions.

The **preferred approach** is the local contentEditable approach, keeping `InlineItemsEditor` self-contained.

---

### 5.4 Add / Remove / Reorder Mechanics

#### Add Item

```typescript
const handleAddItem = () => {
  // Build an empty item using the itemFields list
  const emptyItem = Object.fromEntries(itemFields.map(f => [f.key, ""]));
  onItemsChange([...items, emptyItem]);
};
```

#### Remove Item

```typescript
const handleRemoveItem = (index: number) => {
  onItemsChange(items.filter((_, i) => i !== index));
};
```

#### Reorder Item (nice-to-have)

Drag state managed with a `dragIndex` ref. On `dragStart` record index; on `drop` over another card, splice the array:

```typescript
const handleDrop = (fromIndex: number, toIndex: number) => {
  const updated = [...items];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  onItemsChange(updated);
};
```

---

### 5.5 Visual Structure

```
┌─ InlineItemsEditor ─────────────────────────────────────────────────────────┐
│                                                                               │
│  ┌─ Item Card 0 ──────────────────────────────────────────────── [×] [⠿] ─┐ │
│  │  [label: "Date / Year"]  [label: "Event Title (EN)"]                    │ │
│  │  ┌────────────────────┐  ┌──────────────────────────────────────────┐  │ │
│  │  │ 2008               │  │ Foundation of the Society                │  │ │
│  │  └────────────────────┘  └──────────────────────────────────────────┘  │ │
│  │  [label: "العنوان (AR)"]  [label: "Description (EN)"]                  │ │
│  │  ┌────────────────────┐  ┌──────────────────────────────────────────┐  │ │
│  │  │ تأسيس الجمعية      │  │ The society was established…             │  │ │
│  │  └────────────────────┘  └──────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─ Item Card 1 ─ … ─ [×] [⠿] ─────────────────────────────────────────┐   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  [ ＋ Add item ]                                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```

Each card renders with:
- `border border-dashed border-blue-200 rounded-md p-2 mb-1 relative` container
- Field label as `<span className="text-[9px] text-gray-400 uppercase tracking-wide block mb-0.5">`
- Field value as an inline contentEditable span styled like `InlineTextField` view mode
- `×` button: `absolute top-1 right-6 text-red-400 hover:text-red-600 text-xs cursor-pointer`
- `⠿` drag handle: `absolute top-1 right-1 text-gray-300 hover:text-gray-500 text-xs cursor-grab`
- "Add item" row: `border border-dashed border-gray-300 rounded-md p-2 text-center text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer`

---

### 5.6 Integration Points

#### InlineLeafRenderer

For leaf block types present in `ITEMS_EDITOR_REGISTRY`, `InlineLeafRenderer` renders:

```tsx
// After the block-level title InlineTextField fields:
{registryEntry && (
  <InlineItemsEditor
    blockId={block.id}
    itemsKey={registryEntry.itemsKey}
    items={(block.props[registryEntry.itemsKey] as Record<string, unknown>[] | undefined) ?? []}
    itemFields={registryEntry.itemSchema
      .filter(f => f.kind === "text" || f.kind === "textarea")
      .map(f => ({ key: f.key, label: f.label, multiline: f.kind === "textarea", dir: (f as TextField | TextareaField).dir }))}
    onItemsChange={(newItems) => onCommit(block.id, registryEntry.itemsKey, newItems as unknown as string)}
  />
)}
```

Note: `onCommit` in `InlineLeafRenderer` needs to be extended to accept non-string values for items arrays. The signature becomes `onCommit(blockId, propKey, value: string | unknown[])` or items updates go directly via a separate `updateBlockProps` call passed as a prop.

#### LegacyContainerWithInlineEdit

For legacy container types that have items arrays (e.g. `about-vision-mission-section`, `about-timeline-section`, `about-overview-section`, `about-documents-section`, `about-gallery-section`, `board-term-information-section`, `president-message-content-section`), the existing rendering branch is extended:

```tsx
// After the existing heading/subheading InlineTextField fields:
<InlineItemsEditor
  blockId={block.id}
  itemsKey={entry.itemsKey}
  items={(props[entry.itemsKey] as Record<string, unknown>[] | undefined) ?? []}
  itemFields={...}
  onItemsChange={(newItems) => {
    // passed via a new `onUpdateItems` prop from CanvasBlockRenderer
    onUpdateItems(block.id, entry.itemsKey, newItems);
  }}
/>
```

`onUpdateItems` is a new prop on `LegacyContainerWithInlineEdit` (and by extension on `CanvasBlockRenderer`) that calls `updateBlockProps(blocks, blockId, { [itemsKey]: newItems })`.

---

## Additional Correctness Properties (for Requirement 9)

### Property 12: InlineItemsEditor Add Item Produces Non-Empty Array

*For any* `InlineItemsEditor` instance whose current `items` array has length N, after clicking the "Add item" button, `onItemsChange` SHALL be called with an array of length N+1 where the last element has all text fields set to `""`.

**Validates: Requirements 9.4**

---

### Property 13: InlineItemsEditor Remove Item Decrements Array

*For any* `InlineItemsEditor` instance with N > 0 items, after clicking the "×" button on item at index I, `onItemsChange` SHALL be called with an array of length N−1 where items at indices 0..I−1 and I+1..N−1 are preserved in order.

**Validates: Requirements 9.5**

---

### Property 14: InlineItemsEditor Field Commit Updates Correct Item and Field

*For any* item at index I and field key K, after editing the field and committing, `onItemsChange` SHALL be called with an array identical to the original except at index I, where `item[K]` equals the committed value and all other fields of item I are unchanged.

**Validates: Requirements 9.3, 9.7**

---

### Property 15: InlineItemsEditor Only Exposes Text and Textarea Fields

*For any* block type in `ITEMS_EDITOR_REGISTRY`, the `InlineItemsEditor` rendered for that block SHALL contain editable fields only for schema entries whose `kind` is `"text"` or `"textarea"`. Fields with `kind` in `{"image", "url", "color", "toggle", "number", "select"}` SHALL NOT appear as inline-editable elements.

**Validates: Requirements 9.2, 9.12**
