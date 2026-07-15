# Implementation Plan: page-builder-inline-edit

## Overview

Unify all inline editing for the page builder canvas under a single `InlineTextField`-based system. The work falls into four incremental steps: extend `InlineTextField` with bilingual props and the EN/AR toggle, create the new `InlineLeafRenderer` component, migrate `BuilderCanvas` to remove the legacy `editingTextId` path, and update `CanvasBlockRenderer` to use the dual-key prop pattern throughout.

---

## Tasks

- [x] 1. Extend InlineTextField with bilingual props and EN/AR toggle
  - [x] 1.1 Add `propKeyAr`, `valueAr` props to `InlineTextField`; add `activeLang` internal state; derive `activeKey` and `activeValue` from it
    - Add `propKeyAr?: string` and `valueAr?: string` to `InlineTextFieldProps`
    - Add `const [activeLang, setActiveLang] = useState<"en" | "ar">("en")` inside the component
    - Derive `activeKey = activeLang === "ar" && propKeyAr ? propKeyAr : propKey` and `activeValue = activeLang === "ar" && valueAr ? valueAr : value`
    - Replace all uses of bare `propKey` and `value` in the edit-mode and view-mode branches with `activeKey` and `activeValue`
    - Snapshot `activeValue` (not `value`) into `originalValue.current` on double-click; call `startEditing(blockId, activeKey)` so the context records the correct key
    - Pass `activeKey` to `commitEdit` in the blur handler (not `propKey`)
    - Export the updated `TagName` type so `InlineLeafRenderer` can import it
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.2 Render the EN/AR toggle badge inside `InlineTextField` view mode
    - Add the toggle markup from the design (two small buttons, `activeLang` controls active styling)
    - Show badge only when `propKeyAr` is a non-empty string AND `!isEditing`
    - Both toggle buttons must call `e.stopPropagation()` to prevent block selection
    - Wrap the returned element in a `relative` container so the absolutely-positioned badge anchors correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8_

  - [ ]* 1.3 Write property tests for InlineTextField bilingual behavior
    - **Property 6: EN/AR Toggle Shown if and Only if propKeyAr is Defined and Not Editing**
    - **Validates: Requirements 3.1, 3.7, 3.8, 4.2, 4.3**
    - **Property 9: No propKeyAr Means No Toggle and Single-Key Commit**
    - **Validates: Requirements 4.3, 8.3**
    - Use `@testing-library/react` to render `InlineTextField` inside a test `InlineEditProvider`
    - _Requirements: 3.1, 3.7, 3.8, 4.2, 4.3, 8.3_

- [x] 2. Create InlineLeafRenderer
  - [x] 2.1 Create `InlineLeafRenderer.tsx` with the `LEAF_KEY_FIELDS` registry
    - Create `frontend/src/components/page-builder/builder/InlineLeafRenderer.tsx`
    - Define `LEAF_KEY_FIELDS` record exactly as specified in the design (all block types listed in Requirement 2.2, plus title-only types)
    - Export `InlineLeafRendererProps` interface and `InlineLeafRenderer` function
    - For types NOT in the registry: render `<div className="pointer-events-none select-none"><BlockRenderer blocks={[block]} ignoreVisibility /></div>`
    - Import `TagName` from `InlineTextField`; import `BlockRenderer` from the correct path; import `useInlineEdit` for the active-editing check
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Implement the overlay rendering in `InlineLeafRenderer`
    - For covered types: render a `relative group/inline` wrapper containing (a) a `pointer-events-none select-none` div with `<BlockRenderer blocks={[block]} ignoreVisibility />` and (b) an `absolute inset-0 z-[5] p-2 flex flex-col gap-1 pointer-events-none` overlay div
    - Map `LEAF_KEY_FIELDS[block.type]` to `InlineTextField` instances, each with `propKey`, `propKeyAr`, `value={String(block.props[f.propKey] ?? "")}`, `valueAr={String(block.props[f.propKeyAr] ?? "")}`, `tag`, `className`, `placeholder`, `multiline`
    - Each `InlineTextField` in the overlay needs `pointer-events-auto` via its own class or by overriding the parent; ensure the overlay wrapper stays `pointer-events-none` so non-field areas don't block the transparent click overlay in `BlockWrapper`
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ]* 2.3 Write property tests for InlineLeafRenderer coverage rules
    - **Property 3: Leaf Renderer Produces InlineTextField for All Covered Key Fields**
    - **Validates: Requirements 2.1, 2.2**
    - **Property 4: Uncovered Block Types Fall Back to BlockRenderer**
    - **Validates: Requirements 2.3**
    - Render `InlineLeafRenderer` for a covered type and assert count of `InlineTextField` equals registry entry count
    - Render with an uncovered type and assert no `InlineTextField` and presence of the `pointer-events-none` wrapper
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Checkpoint — ensure TypeScript compiles cleanly
  - Run `npx tsc --noEmit` in the `frontend` directory; fix any type errors before proceeding. Ask the user if any ambiguities arise.

- [x] 4. Migrate BuilderCanvas to remove the legacy editingTextId system
  - [x] 4.1 Remove legacy state, refs, and constants from `BuilderCanvas`
    - Delete `const [editingTextId, setEditingTextId] = useState<string | null>(null)`
    - Delete `const editRefs = useRef<...>({})` and the `registerEditRef` callback
    - Delete the `INLINE_EDITABLE_TYPES` constant
    - Remove `editingTextId`, `setEditingTextId`, and `registerEditRef` from `CanvasContextValue` interface and from the `ctxValue` object
    - Remove the `useCanvas()` destructuring of those three values inside `BlockWrapper`
    - Remove the `isInlineEditable`, `inlinePropKey`, and `isEditing` derived variables in `BlockWrapper` (they were based on `editingTextId`)
    - _Requirements: 1.2, 1.5_

  - [x] 4.2 Replace the leaf-block rendering branch in `BlockWrapper` with `InlineLeafRenderer`
    - Import `InlineLeafRenderer` and `useInlineEdit` at the top of `BuilderCanvas.tsx`
    - In `BlockWrapper`, add `const { editing } = useInlineEdit()` and derive `const isActivelyEditing = editing?.blockId === block.id`
    - In the leaf-block rendering section, replace the `isEditing`/`contentEditable` branch and the plain `BlockRenderer` div with `<InlineLeafRenderer block={block} />`
    - Conditionally render the transparent click overlay: `{!isActivelyEditing && <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleClick} onDoubleClick={handleDoubleClick} />}`
    - Conditionally render `BlockToolbar`: `{!isActivelyEditing && <BlockToolbar ... />}`
    - Simplify `handleDoubleClick`: remove the `else if (isInlineEditable) { setEditingTextId(...) }` branch; only call `onBreadcrumb` for containers
    - Remove the `handleTextBlur` callback (no longer needed)
    - _Requirements: 1.3, 1.4, 2.4, 6.1, 6.2, 6.3_

  - [ ]* 4.3 Write property tests for BlockWrapper overlay and toolbar visibility
    - **Property 5: Overlay and Toolbar Hidden During Active Editing**
    - **Validates: Requirements 2.4, 6.2, 6.3**
    - Mock `useInlineEdit` to return `editing = { blockId: "test-id", propKey: "title" }`; assert overlay and toolbar are absent from the render
    - Also assert they ARE present when `editing` is `null`
    - _Requirements: 2.4, 6.2, 6.3_

- [x] 5. Checkpoint — ensure TypeScript compiles cleanly
  - Run `npx tsc --noEmit` in the `frontend` directory; fix any type errors. Ask the user if questions arise.

- [x] 6. Migrate CanvasBlockRenderer to dual-key pattern
  - [x] 6.1 Remove `useBilingualKey`, the `bilKey` variable, and the `makeIT` factory from `CanvasBlockRenderer`
    - Delete the `useBilingualKey` function definition
    - Delete `const bilKey = useBilingualKey(props)` in `CanvasBlockRenderer`
    - Delete the `makeIT` factory function and `const IT = makeIT(block.id)`
    - Keep `useBilingual` / `bil` for now (still used in some rendering logic); it can be cleaned up later once all call sites are updated
    - _Requirements: 5.1, 5.2_

  - [x] 6.2 Update all `IT` call sites in the `section`, `card-group`, `tabs`, `accordion` cases to use `<InlineTextField>` directly with `propKey` + `propKeyAr`
    - Replace every `<IT propKey={bilKey("x")} value={bil("x")} ...>` with `<InlineTextField blockId={block.id} propKey="x" propKeyAr="xAr" value={str(props.x)} valueAr={str(props.xAr)} ...>`
    - Specific call sites to update:
      - `section`: `title` / `titleAr`, `subtitle` / `subtitleAr`
      - `card-group`: `title` / `titleAr`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_

  - [x] 6.3 Update all `IT` call sites inside `LegacyContainerWithInlineEdit` to the dual-key pattern
    - `isHeroBanner` branch: update `titleAr`/`title`/`subtitle`/`primaryButtonLabel`/`buttonLabel` fields — note the hero banner currently renders `titleAr` separately as a decorative line; preserve this layout while switching to direct `<InlineTextField>` with `propKey="titleAr" propKeyAr="titleAr"` (single-key, no toggle) for that element, and dual-key for `title` and `subtitle`
    - `banner` / `cta` branch: update `title` / `titleAr`, `text` / `textAr`, `buttonLabel` / `buttonLabelAr`
    - `about-overview-section` / `about-organizational-chart-section` / `board-term-information-section`: update `heading` / `headingAr` (falls back via `bil`)
    - `about-vision-mission-section`: update `heading` / `headingAr`, `subheading` / `subheadingAr`
    - `about-timeline-section`: update `heading` / `headingAr`, `subheading` / `subheadingAr`
    - `about-gallery-section`: update `heading` / `headingAr`, `subheading` / `subheadingAr`
    - `board-members-intro-grid` / `board-members-grid`: update `heading` / `headingAr`
    - `president-message-content-section`: update `heading` / `headingAr`, `presidentName` / `presidentNameAr`, `presidentTitle` / `presidentTitleAr`
    - `isDynamicList` branch: update `title` / `titleAr`, `subtitle` / `subtitleAr`
    - Pass the `LegacyContainerWithInlineEdit` the `block.id` directly instead of the `IT` factory; remove `IT` and `bilKey` from its props signature
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3_

  - [ ]* 6.4 Write property tests for CanvasBlockRenderer dual-key coverage
    - **Property 11: Container InlineTextField Fields Preserve Dual-Key Coverage**
    - **Validates: Requirements 5.1, 7.1, 7.2**
    - Render `CanvasBlockRenderer` for `section` and `card-group` blocks; assert each rendered `InlineTextField` has both `propKey` and `propKeyAr` set to the expected values
    - _Requirements: 5.1, 7.1, 7.2_

- [x] 7. Final checkpoint after core migration — compile check
  - Run `npx tsc --noEmit` in the `frontend` directory; confirm zero type errors
  - Run `npm run lint` in the `frontend` directory; fix any lint errors
  - Ensure all tests pass, ask the user if questions arise

- [x] 8. Create InlineItemsEditor component
  - [x] 8.1 Create `InlineItemsEditor.tsx` with the `ITEMS_EDITOR_REGISTRY` and component implementation
    - Create `frontend/src/components/page-builder/builder/InlineItemsEditor.tsx`
    - Define the `ITEMS_EDITOR_REGISTRY` record (all block types listed in Requirement 9 items registry table) with `itemsKey` and `itemSchema` arrays as specified in Design Section 5.1
    - Export `ItemFieldDef` interface and `InlineItemsEditorProps` interface
    - Implement `InlineItemsEditor` function component using local `contentEditable` state (not `InlineEditProvider`) for per-field inline editing, matching the visual style described in Design Section 5.5
    - Each item card renders: a bordered dashed card wrapper, field labels as tiny uppercase spans, field values as `contentEditable` spans (with `onBlur` commit), a "×" delete button, and a "⠿" drag handle placeholder
    - On blur of any field span, call `onItemsChange` with the immutable update: `items.map((item, i) => i === index ? { ...item, [fieldKey]: newValue } : item)`
    - Filter `itemSchema` entries to only `kind === "text" || kind === "textarea"` before rendering
    - _Requirements: 9.1, 9.2, 9.3, 9.7, 9.10, 9.12_

  - [x] 8.2 Implement Add Item and Remove Item in `InlineItemsEditor`
    - "Add item" button at the bottom of the list: `handleAddItem` builds an empty item from `itemFields` keys (all set to `""`), calls `onItemsChange([...items, emptyItem])`
    - Per-card "×" button: `handleRemoveItem(index)` calls `onItemsChange(items.filter((_, i) => i !== index))`
    - Empty state: when `items.length === 0`, render placeholder text "No items yet — click ＋ to add one" above the "Add item" button
    - _Requirements: 9.4, 9.5, 9.11_

  - [x] 8.3 Implement optional drag-to-reorder in `InlineItemsEditor`
    - Add `draggable` attribute to each item card wrapper
    - Track `dragIndexRef` with `useRef<number | null>(null)`
    - On `dragStart`, set `dragIndexRef.current = index`
    - On `dragOver` of a different card, call `handleDrop(dragIndexRef.current, targetIndex)` which splices the array immutably
    - Call `onItemsChange(reorderedItems)` on successful drop
    - _Requirements: 9.6_

  - [ ]* 8.4 Write property tests for InlineItemsEditor add/remove/edit mechanics
    - **Property 12: InlineItemsEditor Add Item Produces Non-Empty Array**
    - **Validates: Requirements 9.4**
    - **Property 13: InlineItemsEditor Remove Item Decrements Array**
    - **Validates: Requirements 9.5**
    - **Property 14: InlineItemsEditor Field Commit Updates Correct Item and Field**
    - **Validates: Requirements 9.3, 9.7**
    - **Property 15: InlineItemsEditor Only Exposes Text and Textarea Fields**
    - **Validates: Requirements 9.2, 9.12**
    - Use `@testing-library/react` to render `InlineItemsEditor` with a test items array and assert the above properties
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.7, 9.12_

- [x] 9. Integrate InlineItemsEditor into InlineLeafRenderer and LegacyContainerWithInlineEdit
  - [x] 9.1 Update `InlineLeafRenderer` to render `InlineItemsEditor` for items-bearing leaf block types
    - Import `InlineItemsEditor` and `ITEMS_EDITOR_REGISTRY` in `InlineLeafRenderer.tsx`
    - After rendering the block-level title `InlineTextField` fields (from `LEAF_KEY_FIELDS`), check if `ITEMS_EDITOR_REGISTRY[block.type]` exists
    - If it exists, render `<InlineItemsEditor blockId={block.id} itemsKey={entry.itemsKey} items={...} itemFields={...} onItemsChange={...} />`
    - The `onItemsChange` callback must call the parent `onCommit` prop (add `onCommit` prop to `InlineLeafRenderer` if not already present) or receive `updateBlockProps` directly via a new `onUpdateItems` prop
    - Derive `items` from `block.props[entry.itemsKey] as Record<string, unknown>[] ?? []`
    - Derive `itemFields` by filtering `entry.itemSchema` to `kind === "text" || kind === "textarea"` and mapping to `ItemFieldDef`
    - Cover leaf types: `timeline`, `accordion`, `faq`, `stats`, `testimonial`, `team`, `gallery`, `carousel`, `pricing-table`, `progress`
    - _Requirements: 9.1, 9.2, 9.8_

  - [x] 9.2 Update `LegacyContainerWithInlineEdit` to render `InlineItemsEditor` for items-bearing legacy section types
    - Import `InlineItemsEditor` and `ITEMS_EDITOR_REGISTRY` in `CanvasBlockRenderer.tsx`
    - Add an `onUpdateItems: (blockId: string, itemsKey: string, newItems: Record<string, unknown>[]) => void` prop to `LegacyContainerWithInlineEdit`
    - In each legacy branch that has an items array (`about-overview-section`, `about-organizational-chart-section`, `board-term-information-section`, `about-vision-mission-section`, `about-timeline-section`, `about-documents-section`, `about-gallery-section`, `president-message-content-section`), add `<InlineItemsEditor ... />` after the heading inline fields
    - For `president-message-content-section`, render two `InlineItemsEditor` instances: one for `paragraphs` (body) and one for `socialLinks` — but since `socialLinks` has no text/textarea fields, the second one will render empty and should be omitted (the registry entry `"president-message-content-section-paragraphs"` is used for the `paragraphs` array; `socialLinks` stays Property Panel only)
    - Pass `onUpdateItems` down from `CanvasBlockRenderer` — the caller (`BuilderCanvas`) already provides an `onBlocksChange` or `updateBlockProps` callback; wire `onUpdateItems` to call `updateBlockProps(blocks, blockId, { [itemsKey]: newItems })`
    - _Requirements: 9.1, 9.2, 9.9_

  - [ ]* 9.3 Write integration smoke tests for InlineItemsEditor in context
    - Render a `timeline` block inside a minimal test `InlineEditProvider` + `InlineLeafRenderer`; assert item cards render, add/remove work, and a field edit triggers `onCommit` / `onUpdateItems` with the correct updated array
    - Render an `about-overview-section` block inside `LegacyContainerWithInlineEdit`; assert paragraph cards render
    - _Requirements: 9.8, 9.9_

- [x] 10. Final checkpoint — full compile, lint, and test pass
  - Run `npx tsc --noEmit` in the `frontend` directory; confirm zero type errors
  - Run `npm run lint` in the `frontend` directory; fix any lint errors
  - Ensure all tests pass, ask the user if questions arise

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation — do not skip them
- The design has 15 correctness properties (11 original + 4 new for Req 9); optional test tasks cover the most important ones
- The `useBilingual` / `bil` helper can remain in `CanvasBlockRenderer` during migration as it is still used for read-only display logic in some branches; it should not be removed until all call sites are confirmed updated
- The `pointer-events-auto` concern in `InlineLeafRenderer` task 2.2: `InlineTextField` already applies pointer-events to its own rendered element, but the overlay wrapper div must stay `pointer-events-none` to keep non-field canvas areas transparent for the `BlockWrapper` overlay
- `InlineItemsEditor` uses local `contentEditable` state rather than `InlineEditProvider` to avoid the single-session constraint when multiple item fields need independent editing sessions
- `socialLinks` in `president-message-content-section` has only `select` and `url` kind fields — neither is text/textarea — so `InlineItemsEditor` renders nothing for it; that array remains Property Panel only

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "2.2"] },
    { "id": 3, "tasks": ["2.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1", "8.1"] },
    { "id": 5, "tasks": ["4.3", "6.2", "8.2"] },
    { "id": 6, "tasks": ["6.3", "8.3"] },
    { "id": 7, "tasks": ["6.4", "8.4", "9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["9.3"] }
  ]
}
```
