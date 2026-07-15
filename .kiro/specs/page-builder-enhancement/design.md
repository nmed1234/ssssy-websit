# Design Document

## Overview

The page builder enhancement modifies the frontend block-tree page builder to support full editability of all section types (including 24 legacy section types), free child component insertion, image upload, undo/redo, auto-save, rich text editing, event actions, canvas zoom, and animation controls. The backend requires no schema changes — all needed APIs (`/api/media/upload`, `/api/pages/{id}`, `/api/component-presets`) already exist.

## Architecture

```
Frontend Changes (Next.js/TypeScript)
├── block-schema.ts          ← ADD 24 legacy types + animation/events/visibility fields
├── PropertyPanel.tsx        ← ADD Events tab, upgrade image/richtext widgets
├── BuilderCanvas.tsx        ← FIX child selection, EXTEND inline editing
├── PageBuilderRoot.tsx      ← ADD undo/redo, zoom, device state
├── BlockRenderer.tsx        ← ADD animation, conditional visibility, event handlers
├── page-layout.ts           ← ADD legacy type mapping constant
├── admin/pages/[id]/page.tsx← ADD auto-save, zoom toolbar, migrate button
└── NEW FILES:
    ├── ImageFieldWidget.tsx
    ├── MediaLibraryModal.tsx
    ├── EventsTab.tsx
    ├── TipTapField.tsx
    ├── InlineComponentPicker.tsx
    └── GradientBuilder.tsx

Backend (no changes required)
├── POST /api/media/upload     — already exists
├── PUT  /api/pages/{id}       — already exists (accepts layoutJson)
└── POST /api/component-presets— already exists
```

## Components and Interfaces

### ImageFieldWidget

```typescript
// frontend/src/components/page-builder/ImageFieldWidget.tsx
interface ImageFieldWidgetProps {
  value: string;
  onChange: (url: string) => void;
}

// Renders: URL input | [Upload from PC] [Browse Library] | thumbnail preview
// Upload flow: hidden file input → FormData POST /api/media/upload → set url
// Browse flow: opens MediaLibraryModal
```

### MediaLibraryModal

```typescript
// frontend/src/components/page-builder/MediaLibraryModal.tsx
interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

// Fetches GET /api/media?page=0&size=20&mimeType=image
// Renders 4-col thumbnail grid, search input, Load More pagination
```

### EventsTab

```typescript
// frontend/src/components/page-builder/EventsTab.tsx
interface EventsTabProps {
  block: Block;
  onPropsChange: (id: string, props: BlockProps) => void;
}

// Renders click action type selector + type-specific fields
// Stores result in block.props.events = { onClick: EventAction }
```

### TipTapField

```typescript
// frontend/src/components/page-builder/TipTapField.tsx
interface TipTapFieldProps {
  value: string;          // HTML string
  onChange: (html: string) => void;
  dir?: "rtl" | "ltr";
}

// Uses @tiptap/react useEditor + StarterKit + Link + TextAlign
// Compact toolbar: Bold/Italic/Underline/H2/H3/BulletList/OrderedList/Link/Align/Clear
// Max-height 280px with overflow scroll
```

### InlineComponentPicker

```typescript
// frontend/src/components/page-builder/InlineComponentPicker.tsx
interface InlineComponentPickerProps {
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

// Compact floating panel (200px wide) with category tabs
// Shows all BLOCK_SCHEMA types grouped by category
// onClick calls onSelect(type)
```

### BlockToolbar changes

```typescript
// builder/BlockToolbar.tsx — ADD new props:
interface BlockToolbarProps {
  // existing...
  onSaveAsPreset?: () => void;   // new
}
// ADD "..." context menu with: Save as Preset, and for containers: Add Child
```

### PageBuilderRoot state additions

```typescript
// State additions
const [history, setHistory]         = useState<Block[][]>([[]]); 
const [historyIndex, setHistoryIndex] = useState(0);
const [zoom, setZoom]               = useState(100);
const [device, setDevice]           = useState<"desktop"|"tablet"|"mobile">("desktop");

// Modified handleBlocksChange: push previous state to history before update
// New: undo(), redo(), canUndo, canRedo
```

### EventAction type (new in types/block.ts)

```typescript
export type EventAction =
  | { type: "navigate"; url: string; target?: "_self" | "_blank" }
  | { type: "modal"; modalId: string }
  | { type: "toggle"; targetId: string }
  | { type: "scroll"; anchor: string }
  | { type: "download"; url: string; filename?: string }
  | { type: "clipboard"; text: string }
  | { type: "api"; method: "GET"|"POST"|"PUT"; url: string; body?: string; successMsg?: string; errorMsg?: string };

export type VisibilityRule =
  | { type: "auth"; level: "loggedIn"|"loggedOut"|"member"|"editor"|"publisher"|"admin" }
  | { type: "dateRange"; start?: string; end?: string }
  | { type: "device"; device: "mobile"|"tablet"|"desktop" };
```

## Data Models

All data model changes are in-memory within the `Block.props` object (stored as JSON in `pages.layout_json`). No DB migrations required.

### New standard block props (all types)

```json
{
  "animation": "fadeIn",
  "animationDelay": 200,
  "animationDuration": 600,
  "animationTrigger": "scroll",
  "visibilityRules": [
    { "type": "dateRange", "start": "2026-01-01", "end": "2026-12-31" }
  ],
  "events": {
    "onClick": { "type": "navigate", "url": "/about", "target": "_self" }
  }
}
```

### Legacy section type mapping (page-layout.ts)

```typescript
export const LEGACY_TYPE_MAP: Record<string, string> = {
  "about-hero-banner":                 "about-hero-banner",   // kept as-is, now in BLOCK_SCHEMA
  "about-overview-section":            "about-overview-section",
  "about-vision-mission-section":      "about-vision-mission-section",
  "about-organizational-chart-section":"about-organizational-chart-section",
  "about-timeline-section":            "about-timeline-section",
  "about-documents-section":           "about-documents-section",
  "about-gallery-section":             "about-gallery-section",
  "board-hero-banner":                 "board-hero-banner",
  "board-members-intro-grid":          "board-members-intro-grid",
  "board-members-grid":                "board-members-grid",
  "board-term-information-section":    "board-term-information-section",
  "contact-hero-banner":               "contact-hero-banner",
  "contact-form-section":              "contact-form-section",
  "newsletter-hero-banner":            "newsletter-hero-banner",
  "president-message-hero-banner":     "president-message-hero-banner",
  "president-message-content-section": "president-message-content-section",
  "publications-hero-banner":          "publications-hero-banner",
  "news-list-section":                 "news-list-section",
  "events-list-section":               "events-list-section",
  "jobs-list-section":                 "jobs-list-section",
  "members-list-section":              "members-list-section",
  "publications-list-section":         "publications-list-section",
  "board-list-section":                "board-list-section",
};
// All types are kept in-place; they gain full BLOCK_SCHEMA definitions.
```

## Error Handling

- **Image upload failure**: Show inline error message "Upload failed: {message}" below the upload button. Re-enable the upload button. Do not change the current field value.
- **Image too large**: Validate client-side before upload. Show "File too large (max 10MB)" without calling the API.
- **API event action failure**: Show a toast using `react-hot-toast` with the configured `errorMsg` or the default "Action failed. Please try again."
- **TipTap initialization failure**: Fall back to a plain `<textarea>` if TipTap fails to initialize (try/catch in useEditor).
- **Auto-save failure**: Show a red "● Save failed" indicator. Retry once after 10 seconds. If retry fails, show toast "Auto-save failed. Please save manually."
- **Missing BLOCK_SCHEMA entry**: PropertyPanel renders a Raw JSON Editor rather than crashing.

## Testing Strategy

- **TypeScript**: Run `cd frontend && npx tsc --noEmit` after each task — zero errors required.
- **Lint**: Run `cd frontend && npm run lint` — zero errors required.
- **Manual verification** (checklist in Task 14):
  - Every legacy section type shows full PropertyPanel fields
  - Clicking a child block selects only that child
  - Adding a component via palette/toolbar inserts it into the container
  - Image upload works end-to-end (file → MinIO → URL set in field)
  - Undo/redo reverts/restores layout
  - Auto-save fires 30s after last change
  - Legacy page migration converts page_sections to layout_json

## Correctness Properties

Property 1: Undo/redo MUST NOT cause a DB save — history is purely in-memory client-side state.
**Validates: REQ-7**

Property 2: The `migrateLegacySections` function MUST be idempotent — calling it twice on the same sections produces the same result.
**Validates: REQ-10**

Property 3: Block IDs MUST remain stable during migration — the original `page_sections.id` is preserved as the block ID.
**Validates: REQ-10**

Property 4: Image upload MUST use JWT auth from the auth context — unauthenticated uploads SHALL be rejected by the backend with 401.
**Validates: REQ-4**

Property 5: The Events system SHALL NOT execute arbitrary JavaScript from user input — only predefined action types (navigate, scroll, api, toggle, clipboard, download) are supported.
**Validates: REQ-5**
