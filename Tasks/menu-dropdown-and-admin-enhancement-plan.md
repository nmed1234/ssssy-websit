# Menu Dropdown & Admin Panel Enhancement Plan

## Top-Level Overview

**Goal:** Add full dropdown menu rendering on the public navigation (desktop hover-reveal panel + mobile tap-accordion), and overhaul the admin Menu Management page into a modern, tabbed control panel that lets admins choose dropdown templates, configure animations, override colours, and set a global default style — all backed by new persisted fields on the `menus` table.

**Current nav style (the default):** Pill-style links with a shared `layoutId` morphing spring background on the active item, hover underline that scale-x from center, glass header on scroll, framer-motion throughout. **This style is the baseline that all dropdown designs must harmonise with.**

**Key discovery — how nesting works today:**
- The backend `MenuItemResponse` DTO is **flat** (has `parentId` but no `children` list).
- Both the admin page and the public nav receive a flat list from the API.
- The admin page already builds a tree client-side using `flattenItems()`.
- The public nav currently ignores `parentId` entirely — it must be updated to build a tree before rendering dropdowns.

**Decisions confirmed by user:**
1. **All 4 templates** (classic, mega, minimal, modern) implemented in this phase.
2. **CSS variable defaults + optional DB overrides** — dropdowns inherit the soil palette by default; `style_config` stores optional hex/rgba overrides that are applied as inline styles.
3. **Progressive enhancement via component extraction** — existing DnD logic extracted into `<StructureTab />`, new `<DesignStudioTab />` and `<LivePreview />` built alongside it. No risky full rewrite.

**Scope:**
1. Backend: new style config columns on `menus` + `setAsDefault` endpoint
2. Frontend types + API client update
3. Public nav: build item tree + desktop hover-dropdown (4 templates × 4 animations)
4. Public nav: mobile tap-accordion
5. Admin page: extract `<StructureTab />`, new tabbed layout, modern left sidebar
6. Admin page: `<DesignStudioTab />` with template picker, animation picker, colour overrides, Make Default action
7. Admin page: `<MenuStylePreview />` live preview component
8. Integration: wire style config end-to-end, RTL, type-check, lint, backend compile

---

## Architecture Overview

```
menus table
┌──────────────────────────────────────────────────────────────┐
│  id | name | location | is_active | menu_template           │
│  dropdown_style | is_default_style | style_config (JSONB)   │
└──────────────────────────────────────────────────────────────┘
         ↑ read/write via PUT /admin/menus/{id}
         ↑ set-default via POST /admin/menus/{id}/set-default

Admin Page  frontend/src/app/admin/menus/page.tsx
┌──────────────────────────────────────────────────────────────┐
│  Left Sidebar (menu list)   │  Right Panel (tabs)           │
│  ─────────────────────────  │  ────────────────────────     │
│  Menu cards with badges     │  [Structure] [Design Studio]  │
│  (template, default star)   │                               │
│                             │  Structure: <StructureTab />  │
│                             │  - existing DnD item tree     │
│                             │  - cleaner row cards          │
│                             │                               │
│                             │  Design: <DesignStudioTab />  │
│                             │  - Template picker (4 cards)  │
│                             │  - Animation picker (4 btns)  │
│                             │  - Colour overrides           │
│                             │  - Make Default button        │
│                             │  - <MenuStylePreview />       │
└──────────────────────────────────────────────────────────────┘

Public Nav  frontend/src/components/layout/PublicLayoutContent.tsx
┌──────────────────────────────────────────────────────────────┐
│  Desktop: flat items → buildMenuTree() → navTree            │
│                                                              │
│  Top-level item (no children) → pill Link (unchanged)       │
│  Top-level item (has children) → pill trigger + chevron     │
│                                   → <NavDropdown />          │
│                                     templates: classic|mega  │
│                                                |minimal|modern│
│                                     animations: fade|slide   │
│                                                |scale|flip   │
│  Mobile: tap parent → accordion expand → child links        │
└──────────────────────────────────────────────────────────────┘
```

---

## Sub-Tasks

---

### Sub-Task 1 — Backend: Add Style Config Fields to Menu Table

**Status:** `[x] done`

**Intent:**
Add four new nullable columns to the `menus` table so the admin can persist which dropdown template, animation style, and colour overrides are active for each menu. A `set-default` endpoint flags one menu as the site-wide style default (others are unflagged atomically).

**Expected Outcomes:**
- Flyway migration `V42__menu_style_config.sql` runs cleanly.
- `Menu.java` entity has `menuTemplate`, `dropdownStyle`, `isDefaultStyle`, `styleConfig` fields.
- `MenuRequest.java` and `MenuResponse.java` DTOs include all four new fields.
- `MenuService.updateMenu()` persists all four fields when present in the request (null-safe: don't overwrite with null if not sent).
- New `POST /api/admin/menus/{id}/set-default` endpoint in `MenuController` calls a new `setMenuAsDefault(id)` service method that sets `is_default_style = true` on the target and `false` on all others in a single transaction.
- `mvn clean compile` passes with no errors.

**Todo List:**
1. Create `backend/src/main/resources/db/migration/V42__menu_style_config.sql`:
   ```sql
   ALTER TABLE menus
     ADD COLUMN menu_template    VARCHAR(50)  DEFAULT 'classic',
     ADD COLUMN dropdown_style   VARCHAR(50)  DEFAULT 'fade',
     ADD COLUMN is_default_style BOOLEAN      DEFAULT FALSE,
     ADD COLUMN style_config     JSONB;
   ```
2. Add fields to `Menu.java`:
   - `@Column(name = "menu_template", length = 50) private String menuTemplate;`
   - `@Column(name = "dropdown_style", length = 50) private String dropdownStyle;`
   - `@Column(name = "is_default_style") private Boolean isDefaultStyle;`
   - `@Column(name = "style_config", columnDefinition = "jsonb") private String styleConfig;` (stored as JSON text string)
3. Add the four fields to `MenuRequest.java` (all nullable).
4. Add the four fields to `MenuResponse.java` (all nullable).
5. Update `MenuService.updateMenu()` to apply new fields from the request (use null-check so partial updates don't wipe values — use `if (request.getMenuTemplate() != null)` pattern).
6. Update `MenuService.toMenuResponse()` to map the four new fields.
7. Update `MenuService.createMenu()` to accept and persist template/style fields when provided.
8. Add `MenuService.setMenuAsDefault(UUID id)`: sets `is_default_style = true` on the target menu, then sets `is_default_style = false` on all other menus. Use `menuRepository.findAll()` + save loop or a custom `@Modifying @Query`.
9. Add `POST /api/admin/menus/{id}/set-default` endpoint to `MenuController.java` (same `@PreAuthorize` as other admin endpoints).
10. Run `mvn clean compile` to verify.

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/model/entity/Menu.java`
- `backend/src/main/java/org/ssssy/backend/model/dto/MenuRequest.java`
- `backend/src/main/java/org/ssssy/backend/model/dto/MenuResponse.java`
- `backend/src/main/java/org/ssssy/backend/service/MenuService.java` (lines 49–68 `createMenu`/`updateMenu`, lines 290–303 `toMenuResponse`)
- `backend/src/main/java/org/ssssy/backend/controller/MenuController.java`
- Latest migration: `V41__rebrand_ssss_and_add_logo_setting.sql` → next is V42

---

### Sub-Task 2 — Frontend: Update Types and API Client

**Status:** `[x] done`

**Intent:**
Update the TypeScript `Menu` interface and `menus.ts` API client to include the new style fields and expose `updateMenuStyle` + `setMenuAsDefault` helper functions.

**Expected Outcomes:**
- `Menu` interface has `menuTemplate?`, `dropdownStyle?`, `isDefaultStyle?`, `styleConfig?` optional fields.
- `menus.ts` has `updateMenuStyle(id, data)` function (calls `PUT /admin/menus/{id}` with style fields only).
- `menus.ts` has `setMenuAsDefault(id)` function (calls `POST /admin/menus/{id}/set-default`).
- `npx tsc --noEmit` passes after this sub-task.

**Todo List:**
1. In `frontend/src/types/index.ts`, add to the `Menu` interface:
   ```ts
   menuTemplate?: string;
   dropdownStyle?: string;
   isDefaultStyle?: boolean;
   styleConfig?: string; // JSON string
   itemCount?: number;
   ```
   (Also add `itemCount` which is already returned by the backend but not in the type.)
2. In `frontend/src/lib/menus.ts`, add:
   ```ts
   export async function updateMenuStyle(id: string, data: {
     menuTemplate?: string;
     dropdownStyle?: string;
     isDefaultStyle?: boolean;
     styleConfig?: string;
   }) {
     return api.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
   }
   
   export async function setMenuAsDefault(id: string) {
     return api.post<ApiResponse<{ message: string }>>(`/admin/menus/${id}/set-default`, {});
   }
   ```

**Relevant Context:**
- `frontend/src/types/index.ts` lines 284–306
- `frontend/src/lib/menus.ts`
- The `updateMenuStyle` call reuses the existing `PUT /admin/menus/{id}` endpoint (updated in Sub-Task 1 to accept style fields)

---

### Sub-Task 3 — Public Navigation: Build Tree + Desktop Dropdown

**Status:** `[x] done`

**Intent:**
The public nav currently receives a flat list and only renders top-level items. This sub-task adds a `buildMenuTree()` helper, stores `menuTemplate` and `dropdownStyle` from the loaded menu, and renders an animated dropdown `<NavDropdown />` panel for top-level items that have children.

The dropdown must look and feel like a natural extension of the existing pill-nav: same font, same soil colour palette, same glass-blur surface from the scrolled header state, same spring physics from framer-motion.

**4 Template Behaviours:**
- `classic` — standard vertical list panel anchored below the trigger item, min-width 180px
- `mega` — wide panel (full container width or 480px) with child items in 2 columns, group label above
- `minimal` — no background panel; items appear as a plain floating list with no box shadow or border
- `modern` — card panel with left-border accent per item, subtle icon badge area

**4 Animation Variants (framer-motion):**
- `fade` — `{ opacity: 0 }` → `{ opacity: 1 }`
- `slide` — `{ opacity: 0, y: -8 }` → `{ opacity: 1, y: 0 }`
- `scale` — `{ opacity: 0, scale: 0.95, y: -4 }` → `{ opacity: 1, scale: 1, y: 0 }` with `transformOrigin: "top"`
- `flip` — `{ opacity: 0, rotateX: -12 }` → `{ opacity: 1, rotateX: 0 }` with `perspective: 800px` on wrapper

**Expected Outcomes:**
- `navItems` state replaced with `navTree` (array of top-level `MenuItem` objects with populated `children`).
- `menuTemplate` and `dropdownStyle` stored in component state.
- `buildMenuTree(flat: MenuItem[]): MenuItem[]` helper function added.
- `<NavDropdown />` sub-component renders the correct template × animation combination.
- Desktop: hovering a parent item reveals the dropdown; moving mouse away closes it (with a 120ms leave delay to prevent flicker on mouse travel).
- `ChevronDown` rotates 180° when dropdown is open.
- RTL-aware: in `direction === "rtl"` mode the dropdown panel aligns to the right edge of the trigger.
- Items without children are unchanged (still plain `<Link>` pills).

**Todo List:**
1. Add `buildMenuTree(items: MenuItem[]): MenuItem[]` helper function at the top of `PublicLayoutContent.tsx` (above the component):
   ```ts
   function buildMenuTree(items: { id: string; parentId?: string; isActive: boolean; [key: string]: unknown }[]): MenuItem[] {
     const map = new Map<string, MenuItem>();
     const roots: MenuItem[] = [];
     items.forEach(i => map.set(i.id, { ...i, children: [] } as MenuItem));
     items.forEach(i => {
       if (i.parentId && map.has(i.parentId)) {
         map.get(i.parentId)!.children!.push(map.get(i.id)!);
       } else {
         roots.push(map.get(i.id)!);
       }
     });
     return roots;
   }
   ```
2. Update state:
   - Replace `navItems` state with: `const [navTree, setNavTree] = useState<MenuItem[]>([]);`
   - Add: `const [menuTemplate, setMenuTemplate] = useState("classic");`
   - Add: `const [dropdownStyle, setDropdownStyle] = useState("slide");`
   - Add: `const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);`
   - Add: `const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);`
3. Update the `useEffect` that loads menus:
   - Extract `menuTemplate` and `dropdownStyle` from the returned header menu and call the setters.
   - Pass the full flat `items` list (not just top-level) to `buildMenuTree()`, then `setNavTree`.
4. Add `ChevronDown` to the lucide-react imports.
5. Create the `NavDropdown` component (typed sub-component inside the same file or extracted):
   - Props: `items: MenuItem[]`, `isOpen: boolean`, `template: string`, `animStyle: string`, `direction: string`
   - Define animation `variants` object keyed by `animStyle` value (fade/slide/scale/flip).
   - Template branching: `if (template === "mega")` render 2-column grid; `if (template === "minimal")` render plain list without panel wrapper; `if (template === "modern")` render left-accent card items; default (`classic`) renders vertical list in a rounded panel.
   - Each child `<Link>` uses: `text-sm font-medium text-soil-dark/75 hover:text-soil-clay hover:bg-soil-clay/6 px-3 py-1.5 rounded-lg transition-colors`.
   - Panel wrapper (classic/mega/modern): `absolute top-full mt-1.5 z-50 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.10)] rounded-2xl overflow-hidden py-1.5 min-w-[180px]`.
   - RTL: add `right-0` class when `direction === "rtl"`, else `left-0`.
   - Mega template: `min-w-[360px] grid grid-cols-2 gap-0.5 p-2`.
6. In the desktop nav `navItems.map(...)` (line 193), replace with `navTree.map(topItem => ...)`:
   - If `!topItem.children?.length` → render the existing `<Link>` pill exactly as before.
   - If `topItem.children?.length > 0` → wrap in a `<div className="relative">` with:
     - `onMouseEnter` → clears close timer, sets `openDropdownId` to `topItem.id`
     - `onMouseLeave` → starts 120ms timer to set `openDropdownId` to null
     - Trigger: a `<button>` (not Link) with same pill classes as the current Link; add `<ChevronDown>` that rotates `openDropdownId === topItem.id ? 180 : 0` degrees via a `motion.span` with `animate={{ rotate }}`.
     - Below the button: `<NavDropdown isOpen={openDropdownId === topItem.id} items={topItem.children} template={menuTemplate} animStyle={dropdownStyle} direction={direction} />`
7. Update all references from `navItems` to `navTree` in the mobile section (handled in Sub-Task 4).

**Relevant Context:**
- `frontend/src/components/layout/PublicLayoutContent.tsx`
- `navItems` state: line 43; `useEffect` loading menus: lines 77–88; desktop nav: lines 191–232
- framer-motion `AnimatePresence` already imported
- `MenuItem` type (with `children?: MenuItem[]`) at `frontend/src/types/index.ts:293`
- Soil palette classes: `soil-clay`, `soil-dark`, `soil-sand` — already used throughout the component

---

### Sub-Task 4 — Public Navigation: Mobile Accordion Dropdowns

**Status:** `[x] done`

**Intent:**
In the mobile menu, top-level items with children become accordion toggles. Tapping expands child links in an animated height-collapse. Tapping a child closes the whole mobile menu and navigates.

**Expected Outcomes:**
- Mobile nav items with children show a rotating `ChevronDown` on the right.
- Tapping the parent item toggles the accordion; it does NOT navigate (no `href` on the toggle).
- Child links are indented with a left border accent and animate in with height + opacity.
- Tapping any child link closes the mobile menu (`setMenuOpen(false)`) and navigates.
- Items without children behave exactly as before.

**Todo List:**
1. Add `const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);` state.
2. In the mobile nav links section (lines 361–386 of `PublicLayoutContent.tsx`), update the `navTree.map(...)` (already updated by Sub-Task 3):
   - If `!item.children?.length` → render existing `<Link>` exactly as before.
   - If `item.children?.length > 0` → render:
     ```tsx
     <motion.div key={item.id} variants={mobileItemVariants}>
       {/* Parent toggle button */}
       <button
         className="relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium ..."
         onClick={() => setMobileOpenId(mobileOpenId === item.id ? null : item.id)}
       >
         <span>{label}</span>
         <motion.span animate={{ rotate: mobileOpenId === item.id ? 180 : 0 }}>
           <ChevronDown className="h-4 w-4 text-soil-dark/40" />
         </motion.span>
       </button>
       {/* Accordion children */}
       <AnimatePresence initial={false}>
         {mobileOpenId === item.id && (
           <motion.div
             key="acc"
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
             className="overflow-hidden"
           >
             <div className="pl-4 pb-1 flex flex-col gap-0.5 border-l-2 border-soil-clay/20 ml-3.5 mt-0.5">
               {item.children!.filter(c => c.isActive).map(child => {
                 const cLabel = (language === "ar" && child.labelAr) ? child.labelAr : child.labelEn || child.labelAr || "";
                 return (
                   <Link
                     key={child.id}
                     href={child.url || "/"}
                     onClick={() => setMenuOpen(false)}
                     className="px-3 py-2 rounded-lg text-sm text-soil-dark/70 hover:text-soil-clay hover:bg-soil-clay/6 transition-colors"
                   >
                     {cLabel}
                   </Link>
                 );
               })}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
     ```
3. Reset `mobileOpenId` to null when the mobile menu closes (`setMenuOpen(false)` already called on route change; add `setMobileOpenId(null)` alongside `setMenuOpen(false)` in the route-change `useEffect`).

**Relevant Context:**
- `frontend/src/components/layout/PublicLayoutContent.tsx` lines 329–423 (mobile menu section)
- `AnimatePresence` already imported; `ChevronDown` added in Sub-Task 3

---

### Sub-Task 5 — Admin: Extract StructureTab + New Tabbed Layout

**Status:** `[x] done`

**Intent:**
Refactor the admin menus page using progressive enhancement: extract all existing working DnD logic into a `<StructureTab />` sub-component (same file), wrap it in a new tabbed layout, and redesign the left menu selector sidebar with a modern card list. No DnD logic is changed.

**Expected Outcomes:**
- Page has a two-column layout: `w-80` left sidebar (menu list) + flex-1 right panel (tabs).
- Left sidebar shows richer menu cards: icon, name, location badge, active toggle, template chip, gold star for default.
- Tab bar: `[Structure]` and `[Design Studio]` buttons switching `activeTab` state.
- `<StructureTab />` contains all the existing DnD code unchanged (flatItems, drag handlers, SortableItemRow, custom link form, item edit modal — all moved into the component, props passed down).
- Item row (`SortableItemRow`) upgraded: coloured left-border indent indicator instead of `└` char, edit/delete icon buttons (always visible on mobile), item depth badge.
- "Add Item" and "Add Link" toolbar polished with icon buttons.
- New/Edit menu modal and Edit item modal kept as-is (they already work well); just minor style polish.
- New/Edit menu modal: integrate the new template + style fields (dropdown selects in the modal).
- DnD depth tooltip upgraded to use `toast.error()` instead of the fixed-position div.

**Todo List:**
1. Add `activeTab` state: `const [activeTab, setActiveTab] = useState<"structure" | "design">("structure");`.
2. Create a `StructureTab` function component inside `page.tsx` that receives all necessary state and handlers as props. Move into it:
   - `flatItems`, `activeItem`, `preDragRef`, `showDepthTooltip` state (or lift to parent)
   - `loadMenuItems`, `handleDragStart`, `handleDragOver`, `handleDragEnd` handlers
   - `showItemForm`, `editItem`, item form state and handlers
   - `showCustomLinkForm` and custom link form state/handlers
   - The JSX that currently renders inside `md:col-span-2` (item tree + forms + overlays)
   - Receives `selectedMenu` as a prop (owned by parent)
3. Redesign `SortableItemRow`:
   - Replace `└` with a coloured left-border accent div: `<div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-soil-clay/30" />` (positioned relative to the row)
   - Use `bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200` row card
   - Add item type badge: external link vs internal page vs custom
   - Edit/delete become icon buttons with tooltip labels (pencil-line, trash-2 from lucide-react)
4. Redesign left sidebar menu cards:
   - Each menu is a card (`border border-gray-100 rounded-xl p-3`) with: name (font-semibold), location pill badge, active status dot, template chip, and a gold `★` if `isDefaultStyle`.
   - Selected menu: `ring-2 ring-soil-clay/40 border-soil-clay/30 bg-soil-clay/4`
   - Edit/delete icon buttons aligned right on each card
5. Add tab bar above the right panel: two pill buttons with an animated underline using `layoutId="menu-tab-indicator"`.
6. Replace the `DepthTooltip` component with `toast.error("Maximum 3 levels of nesting", { id: "depth-toast" })` call in `handleDragEnd`.
7. Polish menu create/edit modal to include dropdown selects for `menuTemplate` and `dropdownStyle`.
8. Remove the `md:grid-cols-3` layout and replace with the new sidebar + right-panel layout.

**Relevant Context:**
- `frontend/src/app/admin/menus/page.tsx` (full 737-line file)
- All DnD imports (`@dnd-kit/core`, `@dnd-kit/sortable`) stay as-is
- `toast` from `react-hot-toast` already imported
- `useLanguage` context already imported

---

### Sub-Task 6 — Admin: Design Studio Tab + Live Preview

**Status:** `[x] done`

**Intent:**
Build the `<DesignStudioTab />` component and the `<MenuStylePreview />` live preview. The Design Studio lets admins pick from 4 templates, 4 animation styles, and set optional colour overrides. The preview reacts instantly to every selection.

**Expected Outcomes:**
- Design Studio tab shows: Template Picker (4 visual cards), Animation Picker (4 segmented buttons), Colour Overrides section (bg + text colour inputs), Make Default button, Save Style button.
- Template cards display a small icon/illustration and description of each template type.
- Selecting a template or animation updates `MenuStylePreview` instantly (controlled state, not saved yet).
- "Save Style" calls `updateMenuStyle()` and shows a success toast.
- "Make This the Default Style" calls `setMenuAsDefault()`, shows confirmation toast, and re-fetches menus so the gold star updates in the sidebar.
- `<MenuStylePreview />` renders a 300px mock header with 3 fake nav items, the middle one having 3 fake children (triggers the dropdown). A "Show Dropdown" toggle button simulates the hover state.
- The preview applies the exact same Tailwind classes + framer-motion variants as the real public nav (`NavDropdown` component is reused or its variants are shared via a constants file).

**Todo List:**
1. Add design-specific state to the parent `AdminMenusPage`:
   - `draftTemplate`: initialised from `selectedMenu?.menuTemplate ?? "classic"` when a menu is selected
   - `draftDropdownStyle`: from `selectedMenu?.dropdownStyle ?? "slide"`
   - `draftBgColor`: from parsed `styleConfig` or `""`
   - `draftTextColor`: from parsed `styleConfig` or `""`
   - `styleConfigSaving: boolean`
2. When `selectedMenu` changes, reset all draft* state from the new menu's values.
3. Create `DesignStudioTab` function component (inside `page.tsx`), receiving draft state + setters + selectedMenu + save/setDefault handlers as props.
4. Template picker: 4 cards in a `grid grid-cols-2 gap-3`:
   - `classic`: icon of a simple list arrow, title "Classic", description "Standard dropdown list"
   - `mega`: icon of a grid, title "Mega Menu", description "Wide panel with 2 columns"
   - `minimal`: icon of plain text lines, title "Minimal", description "Clean floating links, no panel"
   - `modern`: icon of card stack, title "Modern", description "Card items with accent borders"
   - Selected card: `ring-2 ring-soil-clay bg-soil-clay/6 border-soil-clay/40`
5. Animation picker: 4 segmented buttons in a `flex rounded-lg border border-gray-200 overflow-hidden`:
   - `fade`, `slide`, `scale`, `flip` — each a button that fills when selected
6. Colour override section: two `<input type="color">` fields (Background, Text) with a "Reset to default" link below each.
7. Action buttons row:
   - "Save Style" button → calls `handleSaveStyle()` which calls `updateMenuStyle(selectedMenu.id, { menuTemplate: draftTemplate, dropdownStyle: draftDropdownStyle, styleConfig: JSON.stringify({ bgColor: draftBgColor, textColor: draftTextColor }) })`
   - "⭐ Make This the Default Style" button → calls `setMenuAsDefault(selectedMenu.id)` then re-fetches menus
8. Create `MenuStylePreview` function component (inside `page.tsx`):
   - Props: `template: string`, `animStyle: string`, `bgColor?: string`, `textColor?: string`, `direction: string`
   - State: `previewOpen: boolean` (for the mock dropdown toggle)
   - Render: a `div` with `max-w-xl mx-auto border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 p-4`
     - A mock header bar: `[Logo] [Item 1] [Item 2 ▾] [Item 3]` using same pill-style classes
     - "Item 2" is the trigger; clicking it toggles `previewOpen`
     - Below "Item 2", render `<NavDropdown>` (imported or replicated) with 3 fake children, controlled by `previewOpen`
   - Inline style overrides: if `bgColor` set, pass as `--menu-dropdown-bg` CSS variable; if `textColor` set, pass as `--menu-dropdown-text`
   - The `NavDropdown` component reads these CSS variables via `style={{ background: 'var(--menu-dropdown-bg, ...)' }}`

**Note:** `NavDropdown` is defined in `PublicLayoutContent.tsx`. To reuse it in the admin page, extract it to a shared file: `frontend/src/components/layout/NavDropdown.tsx` — and import it in both `PublicLayoutContent.tsx` and `admin/menus/page.tsx`.

**Relevant Context:**
- `frontend/src/app/admin/menus/page.tsx`
- `frontend/src/lib/menus.ts` (new `updateMenuStyle`, `setMenuAsDefault` from Sub-Task 2)
- `frontend/src/types/index.ts` (new `Menu` fields from Sub-Task 2)
- Lucide icons available: `Layout`, `LayoutGrid`, `Minus`, `CreditCard`, `Sparkles`, `Star`, `Save`

---

### Sub-Task 7 — Extract NavDropdown to Shared Component

**Status:** `[x] done`

**Intent:**
Extract the `<NavDropdown />` component built in Sub-Task 3 into its own file so it can be used in both the public layout and the admin live preview without duplication.

**Expected Outcomes:**
- `frontend/src/components/layout/NavDropdown.tsx` — standalone exported component.
- `PublicLayoutContent.tsx` imports `NavDropdown` from the shared file.
- `admin/menus/page.tsx` (Design Studio preview) imports `NavDropdown` from the shared file.
- Shared animation variant definitions (`DROPDOWN_VARIANTS`) exported from the same file or from a `menuConstants.ts` file.

**Todo List:**
1. Create `frontend/src/components/layout/NavDropdown.tsx` with:
   - The `NavDropdown` component (props: `items`, `isOpen`, `template`, `animStyle`, `direction`, `bgColor?`, `textColor?`)
   - Exported `DROPDOWN_VARIANTS` map
   - CSS variable support for colour overrides
2. In `PublicLayoutContent.tsx`, remove the inlined `NavDropdown` and replace with the import.
3. In `admin/menus/page.tsx`, import `NavDropdown` for use in `MenuStylePreview`.

**Relevant Context:**
- `frontend/src/components/layout/PublicLayoutContent.tsx`
- `frontend/src/app/admin/menus/page.tsx`

---

### Sub-Task 8 — Integration, RTL, Validation

**Status:** `[x] done`

**Intent:**
Wire everything together end-to-end: ensure the public nav reads style config from the loaded menu, RTL works correctly, and all validation passes.

**Expected Outcomes:**
- Full end-to-end flow works: admin sets template → saves → public nav renders with that template.
- RTL: dropdown panels align to the right edge in Arabic, accordion indent border is on the right side.
- `npx tsc --noEmit` passes from `frontend/` with zero errors.
- `npm run lint` passes with zero new warnings.
- `mvn clean compile` passes from `backend/`.

**Todo List:**
1. Verify `PublicLayoutContent.tsx` correctly sets `menuTemplate` and `dropdownStyle` from the API response header menu.
2. RTL dropdown alignment: in `NavDropdown.tsx`, use `direction === "rtl" ? "right-0" : "left-0"` for positioning class.
3. RTL accordion: in mobile menu, use `border-l-2` → `border-r-2` + `pl-4` → `pr-4` + `ml-3.5` → `mr-3.5` when `direction === "rtl"`.
4. RTL chevron: the `ChevronDown` trigger already works both ways; confirm `rotate-180` on open is direction-neutral.
5. Run `npx tsc --noEmit` from `frontend/`, fix any type errors.
6. Run `npm run lint` from `frontend/`, fix any lint warnings.
7. Run `mvn clean compile` from `backend/`, confirm clean.

**Relevant Context:**
- All files modified in Sub-Tasks 1–7
- `direction` from `useLanguage()` already available in `PublicLayoutContent.tsx`
- `direction` can be passed to `NavDropdown` as a prop (already planned in Sub-Tasks 3 + 7)

---

## Files to Create or Modify

| File | Action | Sub-Tasks |
|------|--------|-----------|
| `backend/src/main/resources/db/migration/V42__menu_style_config.sql` | **Create** | 1 |
| `backend/.../entity/Menu.java` | Modify (+4 fields) | 1 |
| `backend/.../dto/MenuRequest.java` | Modify (+4 fields) | 1 |
| `backend/.../dto/MenuResponse.java` | Modify (+4 fields) | 1 |
| `backend/.../service/MenuService.java` | Modify (update + setDefault) | 1 |
| `backend/.../controller/MenuController.java` | Modify (add set-default endpoint) | 1 |
| `frontend/src/types/index.ts` | Modify (Menu interface) | 2 |
| `frontend/src/lib/menus.ts` | Modify (add 2 functions) | 2 |
| `frontend/src/components/layout/NavDropdown.tsx` | **Create** (extracted shared component) | 7 |
| `frontend/src/components/layout/PublicLayoutContent.tsx` | Modify (tree builder, dropdown, accordion) | 3, 4, 8 |
| `frontend/src/app/admin/menus/page.tsx` | Modify (progressive enhancement, tabs) | 5, 6 |

---

## Key Design Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Default template | `classic` (current pill-link style unchanged for items without children) | Backward compatible; existing menus look identical until children are added |
| Dropdown trigger (desktop) | Mouse hover with 120ms leave-delay | Standard UX; prevents flicker on mouse travel to dropdown |
| Dropdown trigger (mobile) | Tap to toggle accordion | Touch-friendly; no hover available |
| Animation | framer-motion variants (4 choices) | Zero bundle cost (already imported); matches existing spring animations |
| Colour system | CSS variables for defaults + inline style for overrides from `styleConfig` | Theme-adaptable by default; override still possible per-menu |
| Admin approach | Progressive enhancement — extract `StructureTab`, add `DesignStudioTab` | Preserves working DnD; zero regression risk |
| `NavDropdown` location | Shared `frontend/src/components/layout/NavDropdown.tsx` | Reused in both public nav and admin live preview without duplication |
| `buildMenuTree()` location | Top of `PublicLayoutContent.tsx` | Keeps it co-located with the only consumer (public nav); moved to a util if needed later |
| Backend nesting for API | Keep flat response — build tree on frontend | API contract unchanged; no migration risk to existing admin DnD code |
