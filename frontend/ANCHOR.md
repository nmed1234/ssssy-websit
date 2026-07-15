## Goal
Comprehensive UI enhancements: animations, shadcn components, CSS architecture, admin dashboards, interactive micro-interactions, email inbox, page builder, role editor, comment moderation, and mobile refinements.

## Constraints & Preferences
- Use existing framer-motion, tailwindcss, shadcn patterns already in the project
- All new shadcn components must match existing style (spring animations, CSS variable theming)
- `bg-white` replaced with `bg-card`/`bg-background` in admin/email only, not in public page sections
- Must compile cleanly with `npx tsc --noEmit`
- Ripple effect on buttons, shimmer over pulse, TiltCard over plain Card

## Progress
### Done
- **System theme detection**: `theme-context.tsx` checks `prefers-color-scheme`, listens for OS changes
- **bg-white → bg-card**: ~30 files across `admin/`, `email/`, `components/` migrated
- **12 new shadcn components**: `Sheet`, `Tabs`, `Avatar`, `Table`, `Switch`, `Progress`, `Checkbox`, `Collapsible`, `HoverCard`, `Popover`, `ScrollArea`, `Breadcrumb`
- **Shimmer loading**: `globals.css` shimmer keyframe; `skeleton.tsx` uses shimmer
- **Stagger animations**: `(public)/page.tsx` news/events/stats grids use `staggerContainer` + `listItem`
- **Counting animation**: `animated-counter.tsx` + homepage stats
- **Card tilt**: `tilt-card.tsx` with framer-motion spring 3D rotation
- **Admin mobile bottom nav**: `AdminBottomNav.tsx` — 5-item bottom tab, `pb-16` on admin main
- **Fluid typography**: `tailwind.config.ts` — 9 `fluid-*` sizes via `clamp()`
- **Ripple effect**: `button.tsx` — expanding circle on click
- **Smooth route transitions**: `(public)/layout.tsx` — `AnimatePresence mode="wait"`
- **CSS tokens**: `color-scheme`, `--shadow-*` elevation, `animate-gradient`, `bg-noise`, `text-gradient`, `shadow-elevation-*`
- **Admin dashboard**: stat cards, stagger, Progress bar, Avatar, quick actions grid
- **Magnetic button wrapper**: `magnetic-wrapper.tsx` — mouse-follow spring displacement
- **Animated hero gradients**: `animate-gradient` + `bg-noise` on home, about, events detail, events list, board heroes
- **Magnetic buttons on hero**: Hero CTA buttons wrapped with `MagneticWrapper`
- **Newsletter animated form**: Input scale on focus, submit spinner, success checkmark + exit animation
- **RichTextEditor v2**: lucide icons toolbar, image/undo/redo/code support, dark prose styling, `minHeight` prop
- **Admin breadcrumbs**: `AdminPageHeader` component with `Breadcrumb` — integrated on Dashboard, Content, Email, Settings pages. `BreadcrumbItem` type exported
- **Mobile sidebar drawer**: Admin sidebar hidden below `lg:`, hamburger opens `Sheet` with `AdminSidebar` mobile prop
- **Masonry gallery**: `MasonryGrid` via CSS `column-count` with stagger. About page 8 varied-aspect items with hover overlays
- **Hero particles**: `ParticleField` canvas with connection lines on home (25), about (20), events detail (15), events list (15), board (20) heroes
- **Container queries**: `@tailwindcss/container-queries` plugin installed + configured
- **Newsletter campaign form**: `/admin/newsletter/campaign` page — subject + Tiptap body + preview toggle + send to subscribers
- **Search/filter bars**: `SearchBar` component (icon + clear). Content list has search + status filter chips. Settings page has search.
- **Content detail tabs**: Edit page uses `Tabs` (Edit / SEO & Social / Versions). `AdminPageHeader` with breadcrumbs, status badge, actions.
- **Settings with tabs**: Settings page redesigned with `Tabs` per config group, inline search + search results view.
- **Accessibility**: Skip-to-content link in root layout. `id="main-content"` on public and admin `main` elements.
- **Public page animations**: `ScrollReveal` wraps content sections on about page (5 sections) and board page (2 sections). Particles + noise on events list + board heroes.
- **Email inbox UI**: `/admin/email/inbox` page with folder sidebar, message list, star/read/delete, pagination, shimmer loading
- **Page builder component library**: Enhanced `ComponentPalette` — search field, collapsible categories by icon, 60+ components in 4 categories, drag support
- **Admin role/permission editor**: Inline edit mode with `Switch` per permission, permission grid (26 permissions across 10 groups), save/cancel
- **Public search enhancements**: Particles + noise on hero, ScrollReveal animations, shimmer skeletons
- **Comment moderation dashboard**: `/admin/comments` page with status filters (ALL/PENDING/APPROVED), search bar, approve/reject/delete actions per row
- **Mobile homepage refinements**: Compact hero padding (`py-16 md:py-32`), shimmer loading on news/events skeletons
- **TextReveal component**: `text-reveal.tsx` — word/char-level scroll-triggered fade+slide animation using `useInView`. Applied to hero `<h1>` and section `<h2>` headings across 12 public pages (home, about, board, events, contact, search, jobs, news, members, newsletter, publications, and 3 detail pages)
- **Theme & CSS Architecture overhaul**:
  - `color-scheme: light dark` on `:root` for OS-level native element theming
  - `@container` applied to 15 card grids across 9 files (events, news, jobs, about, members detail)
  - Fluid typography (`fluid-sm` through `fluid-6xl`) applied to ~100+ text elements across 17 public page files
  - Shadow elevation tokens (`shadow-elevation-sm`/`md`) applied to Card component (`card.tsx`)
  - Hardcoded hex colors → theme tokens across 16 public pages (63+ `bg-`, 100+ `text-`, 47+ `border-` replacements)
  - Scroll-driven CSS animations: `scroll-parallax` (hero SVGs) and `scroll-fade-in` (stats section) via `animation-timeline: scroll()/view()`
- **Missing shadcn components**: `Command` (cmd-k palette with `cmdk` library, 9 subcomponents) and `RadioGroup` (with `@radix-ui/react-radio-group`) added
- **Layout & responsive improvements**:
  - Email layout: mobile-responsive with Sheet drawer + `lg:hidden`/`hidden lg:flex` breakpoints, `pt-14 lg:pt-0` for mobile header, `bg-card`/`bg-muted` instead of `bg-gray-*`
  - Focus management: `useFocusTrap` hook in `dialog.tsx` and `sheet.tsx` — Tab cycle, Escape close, `aria-modal`/`role="dialog"`, focus restore on close
  - Consistent page layouts: `PageContent` and `PageSection` components (`PageLayout.tsx`)
  - AdminPageHeader applied to all 27 admin pages (100% coverage), each with breadcrumbs + actions

### Blocked
- (none)

## Key Decisions
- Public page section `bg-white` kept intact (design contrast), only admin/email internal containers migrated
- New components use `HTMLMotionProps<"div">` to avoid framer-motion type conflicts
- Dashboard stat cards use two staggered rows of 4 for visual rhythm
- Avatar displays initials from username (no first/last name in `AuthResponse`)
- `RichTextEditor` uses lucide icons with `ToolbarButton` wrapper for consistent styling
- Email inbox uses system folder types (INBOX, SENT, DRAFTS, TRASH) with icon mapping
- Component palette uses collapsible categories with live search filter
- Role editor uses `Switch` toggle per permission with visual permission count

## Next Steps
- Polish: apply AdminPageHeader + breadcrumbs to remaining admin pages (users, board-members, workflow, media, crm)

## Critical Context
- `AuthResponse` type has no `firstNameEn`/`lastNameEn` — only `username`, `email`, `role`, `userId`
- All new components compile cleanly (0 TypeScript errors)
- `lib/animation-variants.ts` exports `staggerContainer` and `listItem` for reuse
- Tiptap v3 already installed with StarterKit, Image, Link, Underline, Placeholder extensions
- Email lib (`src/lib/email.ts`) exports `getFolders()`, `getMessages()`, `markAsRead()`, `toggleStar()`, `deleteMessages()`, `moveToFolder()`
- `ScrollReveal` uses `useInView` with `margin: "-50px"` and `fadeIn` variants

## Relevant Files
- `src/components/ui/*.tsx`: All UI components (29 total)
- `src/app/globals.css`: Theme vars, shadow tokens, shimmer/gradient/noise utilities
- `tailwind.config.ts`: fluid-* sizes, shadow-elevation-*, shimmer/gradient keyframes, container-queries plugin
- `src/app/(public)/page.tsx`: Homepage with tilt cards, stagger, counting stats, magnetic buttons, animated newsletter
- `src/app/(public)/about/page.tsx`: ScrollReveal sections, MasonryGrid gallery, particles hero
- `src/app/(public)/board/page.tsx`: ScrollReveal sections, particles hero
- `src/app/(public)/events/page.tsx`: Particles hero, animate-gradient
- `src/app/(public)/events/[slug]/page.tsx`: Particles hero, animate-gradient, noise texture
- `src/app/(public)/search/page.tsx`: Enhanced search with particles + noise hero, ScrollReveal animations, shimmer skeletons
- `src/app/admin/layout.tsx`: Mobile Sheet drawer, Avatar, theme toggle, NotificationBell
- `src/app/admin/page.tsx`: Dashboard stat cards, stagger, Progress, quick actions
- `src/app/admin/email/page.tsx`: Email stats dashboard
- `src/app/admin/email/inbox/page.tsx`: Email inbox with folder sidebar, message list, pagination
- `src/app/admin/content/page.tsx`: Content list with search + status filter chips
- `src/app/admin/content/[id]/page.tsx`: Content edit with Tabs (Edit/SEO/Versions), AdminPageHeader
- `src/app/admin/content/new/page.tsx`: Content create with AdminPageHeader
- `src/app/admin/newsletter/page.tsx`: Newsletter subscriber list
- `src/app/admin/newsletter/campaign/page.tsx`: Campaign compose/preview/send form
- `src/app/admin/roles/page.tsx`: Role editor with inline permission toggles
- `src/app/admin/comments/page.tsx`: Comment moderation with status filters, search, approve/reject/delete
- `src/app/admin/settings/page.tsx`: Settings with Tabs per group + search
- `src/components/editor/RichTextEditor.tsx`: Enhanced Tiptap editor with lucide icons toolbar
- `src/components/admin/AdminPageHeader.tsx`: Reusable header with breadcrumbs + actions slot
- `src/components/admin/SearchBar.tsx`: Search input with icon + clear button
- `src/components/layout/AdminSidebar.tsx`: Desktop sidebar with collapse, mobile prop
- `src/components/layout/AdminBottomNav.tsx`: Mobile bottom tab navigation
- `src/components/page-builder/ComponentPalette.tsx`: Enhanced palette with search + collapsible categories
- `src/components/page-builder/PageBuilder.tsx`: Drag-and-drop page builder with canvas + property editor
- `src/components/ui/scroll-reveal.tsx`: ScrollReveal with useInView + fadeIn variants
- `src/components/ui/tilt-card.tsx`: 3D mouse-follow rotation card
- `src/components/ui/magnetic-wrapper.tsx`: Mouse-follow spring displacement
- `src/components/ui/masonry-grid.tsx`: CSS column-count masonry with stagger
- `src/components/ui/particle-field.tsx`: Canvas particles with connection lines
- `src/components/ui/animated-counter.tsx`: Count-up on scroll-into-view
- `src/components/ui/breadcrumb.tsx`: Breadcrumb nav with chevron/slash separator
- `src/components/ui/sheet.tsx`: Sheet dialog (used for mobile sidebar)
- `src/lib/theme-context.tsx`: System preference detection + listener
- `src/lib/use-media-query.ts`: Responsive hook
- `src/app/layout.tsx`: Skip-to-content link
