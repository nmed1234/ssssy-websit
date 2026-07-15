# Implementation Plan: Page Builder Enhancement

## Overview

14 tasks implementing the page builder enhancements in priority order: P1 (legacy section schema, child selection, free insertion, image upload), P2 (undo/redo, auto-save, migration), P3 (events, TipTap, animation, zoom), P4 (visibility rules, presets).

## Tasks

- [x] 1. Add all 24 legacy section types to BLOCK_SCHEMA
  - Add `about-hero-banner` to BLOCK_SCHEMA with: bilingual title (EN/AR), bilingual subtitle/description (textarea EN/AR), background image field (image kind), overlay color (color), min-height (text, layout), primary button label (bilingual), primary button URL (url), secondary button label (bilingual), secondary button URL (url), SPACING_FIELDS, BG_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-overview-section` with: heading bilingual, paragraphs ItemsField (itemSchema: text EN rows:4, text AR rows:4 dir:rtl), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-vision-mission-section` with: heading/subheading bilingual (textarea), panels ItemsField (icon text, title EN/AR, content EN/AR textarea, gradient-class text, button-label EN/AR, button-url url), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-organizational-chart-section` with: heading bilingual, paragraphs ItemsField (text EN/AR), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-timeline-section` with: heading/subheading bilingual, items ItemsField (year text, title EN/AR, desc EN/AR textarea), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-documents-section` with: heading bilingual, documents ItemsField (label EN/AR, url, fileType text), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `about-gallery-section` with: heading/subheading bilingual, images ItemsField (src image, alt text, caption text), columns number (1-6), columnsMobile number (1-3), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `board-hero-banner`, `board-members-intro-grid`, `board-members-grid`, `board-term-information-section` with appropriate fields; all isContainer: true
  - Add `contact-hero-banner`, `contact-form-section` (heading bilingual, show-phone toggle, show-subject toggle), `newsletter-hero-banner`, `president-message-hero-banner` with full fields; isContainer: true
  - Add `president-message-content-section` with: heading bilingual, paragraphs ItemsField (text EN/AR), quote (textarea EN/AR), quote-author text, president-name bilingual, president-title bilingual, photo URL (image), social-links ItemsField (platform select, url), BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `publications-hero-banner` with bilingual title/subtitle, background image, BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: true
  - Add `news-list-section`, `events-list-section`, `jobs-list-section`, `members-list-section`, `publications-list-section`, `board-list-section` each with: bilingual title/subtitle, maxItems number (1-20), showViewAll toggle, viewAllUrl url, BG_FIELDS, SPACING_FIELDS, ADVANCED_FIELDS; isContainer: false
  - Add animation fields to ADVANCED_FIELDS: animation select (None/fadeIn/slideUp/slideLeft/slideRight/zoomIn/bounce), animationDelay number (0-5000 step 50ms), animationDuration number (100-3000 step 50ms), animationTrigger select (scroll/load)
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors before completing this task

- [x] 2. Fix child block selection and sync with Layers panel
  - Audit `BlockWrapper` in `BuilderCanvas.tsx`: verify `e.stopPropagation()` is called on child click overlays so parent container click handler does NOT fire when a child is clicked
  - Verify `ChildrenOverlay` renders individual `BlockWrapper` nodes for every child block, each with its own `onClick={() => setSelectedId(child.id)}`
  - Add visual distinction in `BlockWrapper` CSS: selected block gets `ring-2 ring-blue-500`, parent-of-selected block gets `ring-1 ring-blue-200` (compute "isParentOfSelected" by checking if `selectedId` appears in children)
  - In `LayersPanel.tsx` `LayerNode`, add `ref={nodeRef}` and a `useEffect` that calls `nodeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })` when `isSelected` becomes true
  - In `PropertyPanel.tsx`, add a fallback case when `getBlockSchema(block.type)` returns a stub (type not found): render a `<textarea>` showing `JSON.stringify(block.props, null, 2)`, on blur parse the JSON and call `onPropsChange(block.id, parsedProps)`
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 3. Add free child component insertion to container blocks
  - Create `frontend/src/components/page-builder/InlineComponentPicker.tsx`: compact floating panel, receives `onSelect(type)` and `onClose()` props; renders the same categories and block types as the left palette but in a 200px-wide scrollable dropdown; each type button calls `onSelect(type)` then `onClose()`
  - In `BlockToolbar.tsx`, add a "+ Add" button that shows only when `onAddChild` prop is provided (containers); clicking it opens `<InlineComponentPicker>` as an absolutely-positioned overlay below the toolbar button
  - In `PageBuilderRoot.tsx`, pass `onAddChild` to `BuilderCanvas` which passes it to `BlockWrapper`; the handler calls `createBlock(type)` then `insertBlock(blocks, block.id, block.children.length, newBlock)` then selects the new block
  - Verify drag-from-palette onto an existing container section already works: test by dragging "Button" block onto any hero section in the canvas — the button should appear as a child in the Layers panel
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 4. Image field widget with upload and media library
  - Create `frontend/src/components/page-builder/ImageFieldWidget.tsx` with props `{ value: string; onChange: (url: string) => void }`: render a URL text input (existing behavior), an "📁 Upload" button, a "🖼 Browse Library" button, and a thumbnail preview (shown when value is a non-empty URL)
  - Upload button implementation: add hidden `<input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" ref={fileRef}>` — clicking the button calls `fileRef.current.click()`; in `onChange` handler validate file.size ≤ 10MB (show inline error if exceeded); create `FormData` with `file` key; call `POST /api/media/upload` with JWT `Authorization` header (read token from `useAuth()` context); show an `<UploadProgress>` bar using `XMLHttpRequest.upload.onprogress`; on success set `onChange(res.data.url)`
  - Create `frontend/src/components/page-builder/MediaLibraryModal.tsx`: modal overlay, on open fetch `GET /api/media?page=0&size=20&mimeType=image` with React Query; render images in 4-column thumbnail grid; clicking a thumbnail calls `onSelect(image.url)` and closes; include a search input that re-fetches with `&search=keyword`; "Load More" button appends the next page
  - In `PropertyPanel.tsx` `FieldWidget`, replace the `case "image":` block to use `<ImageFieldWidget value={strVal} onChange={onChange} />`
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 5. TipTap rich text editor in PropertyPanel
  - Verify `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-text-align` are in `frontend/package.json`; if any are missing add them with `npm install --save-exact @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align`
  - Create `frontend/src/components/page-builder/TipTapField.tsx` with props `{ value: string; onChange: (html: string) => void; dir?: "rtl"|"ltr" }`: use `useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: false }), TextAlign.configure({ types: ["heading", "paragraph"] })], content: value, onUpdate: ({ editor }) => onChange(editor.getHTML()) })`; render a compact toolbar row with icon buttons (Bold, Italic, Underline, H2, H3, BulletList, OrderedList, Link, AlignLeft, AlignCenter, AlignRight, ClearFormatting) using Lucide icons; wrap `<EditorContent>` in `max-h-[280px] overflow-y-auto border rounded`; when `dir === "rtl"` add `className="text-right"` and `dir="rtl"` to the editor content wrapper
  - In `PropertyPanel.tsx` `FieldWidget`, replace `case "richtext":` to use `<TipTapField value={strVal} onChange={onChange} dir={field.dir} />`
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 6. Undo / Redo history stack
  - In `PageBuilderRoot.tsx` add state: `const [history, setHistory] = useState<Block[][]>([initialLayout.blocks])` and `const [historyIndex, setHistoryIndex] = useState(0)`
  - Modify `handleBlocksChange` to: first push the current blocks to history (slice to last 50), increment historyIndex, THEN set new blocks
  - Add `undo` function: if `historyIndex > 0`, set `historyIndex - 1`, set blocks to `history[historyIndex - 1]`, call `notifyChange` — do NOT push to history stack during undo
  - Add `redo` function: if `historyIndex < history.length - 1`, set `historyIndex + 1`, set blocks to `history[historyIndex + 1]`, call `notifyChange`
  - In `admin/pages/[id]/page.tsx`, add `useEffect` with `window.addEventListener("keydown", handler)` where handler calls `undo()` on Ctrl+Z and `redo()` on Ctrl+Y/Ctrl+Shift+Z; remove on cleanup
  - Add Undo (↩) and Redo (↪) icon buttons to the builder topbar in `admin/pages/[id]/page.tsx`; disable them via `canUndo = historyIndex > 0` and `canRedo = historyIndex < history.length - 1`
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 7. Auto-save and dirty state indicator
  - In `admin/pages/[id]/page.tsx`, add `const autoSaveRef = useRef<ReturnType<typeof setTimeout>>()`
  - In `handleLayoutChange` (called when builder reports a change): set `isDirty(true)`, clear `autoSaveRef.current`, set new timeout of 30000ms calling `handleSave()`; add `useEffect` cleanup to clear the timer on unmount
  - Update the topbar status indicator from a post-save "Saved ✓" to a persistent status: show green "● Saved" (not dirty, not saving), amber "● Unsaved changes" (isDirty), gray "Saving…" with animated spinner (isSaving)
  - Add `useEffect` that calls `window.addEventListener("beforeunload", e => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } })` and removes listener on cleanup
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 8. Legacy section migration tool
  - In `page-layout.ts`, add constant `LEGACY_SECTION_TYPES: Set<string>` containing all 24 legacy type strings
  - Verify `migrateLegacySections` in `page-layout.ts` correctly merges `config + data + styling` into a flat `props` object for every section, using `getDefaultProps(componentType)` as the base
  - In `admin/pages/[id]/page.tsx`, show a "Migrate to Block Builder" banner/button in the topbar when `!page.layoutJson`: clicking it calls `migrateLegacySections(legacySections)` to get the converted layout, calls `updatePage` to save `layoutJson`, then does `window.location.reload()`
  - After migration the topbar button MUST NOT appear (layoutJson is now set), verify by reloading
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 9. Canvas zoom and device preview controls
  - In `PageBuilderRoot.tsx` add: `const [zoom, setZoom] = useState(100)` and `const [device, setDevice] = useState<"desktop"|"tablet"|"mobile">("desktop")` — pass both + setters to `BuilderCanvas`
  - In `BuilderCanvas.tsx`: add a thin toolbar strip above the canvas scroll area containing zoom buttons (−, zoom% display, +, dropdown) and device buttons (🖥 Desktop, □ Tablet, □ Mobile); clicking device buttons sets the device state
  - Apply zoom to canvas inner content: wrap the `max-w-5xl` div with `style={{ transform: \`scale(\${zoom/100})\`, transformOrigin: "top center" }}`; adjust scroll container to `overflow: "auto"` to handle scaled content
  - Apply device constraint: wrap the inner canvas div with a fixed-width container — `style={{ width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "375px", margin: device !== "desktop" ? "0 auto" : undefined, border: device !== "desktop" ? "1px solid #e5e7eb" : undefined, borderRadius: device !== "desktop" ? "12px" : undefined }}`
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 10. Event and Action system
  - Add `EventAction` and `VisibilityRule` types to `frontend/src/types/block.ts` as defined in the design document
  - Create `frontend/src/components/page-builder/EventsTab.tsx` with props `{ block: Block; onPropsChange: (id: string, props: BlockProps) => void }`: parse `block.props.events` as JSON; render "CLICK ACTION" section with type selector dropdown; show type-specific fields (URL input + target select for navigate; anchor ID text for scroll; method/URL/body/messages for api; target block ID for toggle); on any field change update `block.props.events` and call `onPropsChange`
  - In `PropertyPanel.tsx`: define `INTERACTIVE_TYPES = new Set(["button","card","cta","hero","banner","image"])`; add `"events"` to `availableTabs` when `INTERACTIVE_TYPES.has(block.type)`; render `<EventsTab>` when `tab === "events"`; update `TAB_LABELS` to include `events: "Events"`; update `PropGroup` type to include `"events"`
  - In `BlockRenderer.tsx` `BlockSwitch`, for interactive block types: read `(props.events as any)?.onClick` as `EventAction`; attach `onClick` handler to the rendered element that executes the configured action (router.push for navigate, scrollIntoView for scroll, fetch for api, document.getElementById toggle for toggle visibility)
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 11. Animation controls and BlockRenderer integration
  - Verify animation fields exist in ADVANCED_FIELDS (added in Task 1); if not: add animation select, animationDelay number, animationDuration number, animationTrigger select
  - In `BlockRenderer.tsx` `SingleBlock`, define `ANIMATION_VARIANTS: Record<string, Variants>` map with framer-motion variants for each animation type (fadeIn: opacity 0→1; slideUp: opacity+y 0→0; slideLeft: opacity+x; zoomIn: opacity+scale; bounce: spring)
  - Wrap the `<BlockSwitch>` output with `<motion.div>` when `block.props.animation` is truthy: use `whileInView="show"` when trigger is "scroll", `animate="show"` when trigger is "load"; pass `initial="hidden"`, `variants`, `transition={{ duration: dur/1000, delay: del/1000 }}`; add `viewport={{ once: true }}` for scroll trigger
  - In the builder canvas (`ignoreVisibility = true` context), still animate blocks so editors can preview — always animate in builder
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 12. Conditional visibility rules in Advanced tab
  - Add a `visibilityRules` ItemsField to `ADVANCED_FIELDS` in `block-schema.ts` with itemSchema: rule type select (auth/dateRange/device), auth level select (loggedIn/loggedOut/member/editor/publisher/admin), start date text, end date text, device select (mobile/tablet/desktop)
  - In `BlockRenderer.tsx` `SingleBlock`, after the existing `visibility === "HIDDEN"` check, evaluate `block.props.visibilityRules` array if present: for each rule, evaluate it against current context (auth, current date, window.innerWidth); if any rule fails, return null (block is hidden); use `useAuth()` for auth context and `typeof window !== "undefined" && window.innerWidth` for device detection
  - In the builder canvas (`ignoreVisibility = true`), skip visibility rule evaluation so editors can always see all blocks
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 13. Save as Preset from BlockToolbar
  - In `BlockToolbar.tsx`: add a "⋯" (more options) button that shows a small popover menu; the menu includes "Save as Preset" option
  - Clicking "Save as Preset" opens an inline popover form with: Name (EN) text input, Name (AR) RTL text input, Cancel and Confirm buttons
  - On confirm: call `POST /api/component-presets` with JWT auth and body `{ nameEn, nameAr, componentType: block.type, configJson: {}, dataJson: { ...block.props, children: block.children }, stylingJson: {} }`; on success show a toast "Preset saved!" and invalidate `["component-presets"]` React Query cache
  - Run `cd frontend && npx tsc --noEmit` — fix all TypeScript errors

- [x] 14. Final integration verification
  - Run `cd frontend && npx tsc --noEmit` — zero errors required
  - Run `cd frontend && npm run lint` — zero errors required
  - Run `cd backend && mvn clean compile -q` — verify backend compiles clean
  - Manually verify in dev browser: open About page builder, select "About Hero Banner" section — confirm PropertyPanel shows all fields (title, subtitle, background image, buttons)
  - Manually verify: click the "About Us" heading text inside the hero section in canvas — confirm only the heading is selected and its PropertyPanel appears (not the hero section's panel)
  - Manually verify: click "+ Add" on a container section, select "Button" from picker — button appears as child in Layers panel
  - Manually verify: use image field, click "Upload from PC", select an image file — progress bar appears, image URL is set, thumbnail shown
  - Manually verify: press Ctrl+Z after making a change — layout reverts to previous state
  - Manually verify: make a change, wait 30 seconds idle — "Saving…" then "● Saved" appears without clicking Save button
  - Manually verify: on a legacy page (layout_json is NULL), click "Migrate to Block Builder" — page reloads with full PropertyPanel fields for all sections

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 2, 4, 5, 6, 7, 9, 10, 13] },
    { "wave": 2, "tasks": [3, 8, 11, 12] },
    { "wave": 3, "tasks": [14] }
  ],
  "dependencies": {
    "3": [2],
    "8": [1],
    "11": [1],
    "12": [1],
    "14": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  }
}
```

Tasks 1-9 can largely be worked in parallel except: Task 3 depends on Task 2 (child selection must work before adding children), and Tasks 8/11/12 depend on Task 1 (schema must exist before migration/animation/visibility can reference the types).

## Notes

- All backend endpoints needed by this spec already exist: `POST /api/media/upload`, `PUT /api/pages/{id}`, `POST /api/component-presets`, `GET /api/media`. No backend code changes are required.
- The `page_sections` table rows remain in the DB after migration — they are simply no longer used for page rendering. They serve as a backup until the migration is confirmed stable.
- The framer-motion library (`framer-motion`) is already used in the public homepage (`(public)/page.tsx`), so it's available in the project.
- The `react-hot-toast` library — check `frontend/package.json`; if not present, add it for Event system toast notifications.
- All new `.tsx` components must have `"use client"` directive since they use React state and browser APIs.
