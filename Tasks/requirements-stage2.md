# Stage 2 Requirements: Advanced CMS & Page Builder SRS
## Document Overview
- Project: Syrian Soil Science Society (SSSSY) Website
- Stage: 2 (Enhanced CMS & Advanced Page Builder)
- Version: 2.0.0
- Last Updated: 2026‑07‑10

## 1. Introduction
### 1.1 Purpose
This document defines detailed requirements for Stage 2 of the SSSSY website project, focusing on building an **advanced, no‑code/low‑code CMS & Page Builder** that empowers authorized users to:
- Build and edit all sections and pages with granular control
- Manage content workflow with role‑based approval
- Use advanced layout, styling, and dynamic features

### 1.2 Scope
Stage 2 applies only to the **admin/editor interfaces** for managing the public website; it does not change the public‑facing UI design or core content models (articles/events/etc.), but significantly enhances how they’re created and managed.

## 2. Page Builder Enhancements
### 2.1 Advanced Section & Component Management
#### 2.1.1 Hierarchical Component Tree
- Every section and component (including nested components, like items in a card grid, testimonial list, etc.) must be visible in an **expandable tree view** on the page builder sidebar
- Users can select any item in the tree to edit its properties
- Drag/drop reordering within the tree (supports moving items between parent components where applicable)

#### 2.1.2 Granular Property Editing
Every property of every item (section, component, sub‑component) must be editable via the property editor:
- **Text properties**: Support both plain text and rich HTML editor (CKEditor 5 / TinyMCE with AR/EN language support)
- **Image/media properties**: Full integration with existing media library (image picker, uploader, alt text, caption, aspect ratio presets)
- **Color properties**: Visual color picker with presets, hex/RGB/HSL input, and saved theme colors
- **Layout properties**:
  - Flexbox/Grid controls (gap, justify, align, direction, wrap)
  - Margin/padding controls with pixel/rem inputs and visual sliders
  - Width/height (min/max/fixed), aspect ratio lock
  - Responsive breakpoints (sm/md/lg/xl/2xl) for all layout properties (per‑breakpoint overrides)
- **Typography properties**:
  - Font family (theme fonts + custom)
  - Font size (fluid & fixed, responsive)
  - Font weight, line height, letter spacing
  - Text align, transform, decoration
  - Text color, shadow
- **Border/shadow properties**:
  - Border style, width, color, radius (per‑corner overrides)
  - Box shadow, text shadow presets + custom
- **Position/display**: Display mode (block/inline‑block/flex/grid/none), position (static/relative/absolute/fixed/sticky), z‑index, overflow

#### 2.1.3 Icon Selection System
- **Built‑in icon library**: Curated, high‑quality icon packs integrated (Lucide, Heroicons, Tabler, Font Awesome Free; ~10k+ icons total)
- **Icon library UI**:
  - Search/filter by keyword or icon pack
  - Category browsing
  - Preview icon in context
- **Icon properties**:
  - Color (fill/stroke for SVGs)
  - Size (fixed/responsive)
  - Stroke width (for outline icons)
  - Rotation, flip
- **Custom icon upload**: Allow users to upload custom SVG icons

### 2.2 Advanced Background & Layout System
#### 2.2.1 Background Choices
For every section/container:
- **Solid color**: Color picker + opacity slider
- **Gradient**: Linear/radial/conic gradient builder with custom color stops and angle/position controls
- **Image**: Media library picker + properties for:
  - Position (cover/contain/auto)
  - Repeat, attachment (scroll/fixed/local)
  - Overlay (solid/gradient over image)
- **Pattern**: Preset SVG patterns (dots, grid, stripes, etc.) with customizable color/size
- **Video**: Background video (MP4/WebM via media library, or YouTube/Vimeo embed) with mute/autoplay controls

#### 2.2.2 Advanced Grid & Layout
- **Responsive grid system**: Extend existing Tailwind grid with:
  - Visual grid editor (drag column/row sizes)
  - Custom grid tracks (auto, minmax, fr units)
  - Gap controls (row/column)
  - Item placement (grid‑area, span controls)
- **Flexible sections**: Support full‑width, contained, or custom max‑width sections
- **Advanced layout techniques**: Allow CSS Grid/Flexbox customizations plus:
  - CSS transforms (translate/rotate/scale/skew with transitions)
  - Blend modes for backgrounds/overlays
  - CSS backdrop‑filter (blur, contrast, etc.)
- **Saved layout templates**: Allow saving/loading entire section/layout presets

### 2.3 Section & Component Presets
- **Preset library**: 50+ pre‑built, responsive section presets (Hero, Features, Testimonials, CTA, Contact, Stats, Pricing, FAQ, Gallery, Blog, Team, etc.)
- **Custom presets**: Allow users to save their own sections/components as presets for reuse
- **One‑click application**: Apply preset to a new or existing section with one click, then customize properties

## 3. Content Workflow & Role‑Based Approval
### 3.1 Content Status System
Every piece of manageable content (pages, articles, events, publications, board members, etc.) must have these statuses:
1. **Draft**: Initial state, editable only by author/editor
2. **In Review**: Submitted for approval, locked for editing by author
3. **Approved**: Ready for scheduling/publishing
4. **Published**: Live on public site
5. **Archived**: No longer live, but retained for history

### 3.2 Role‑Based Workflow Permissions
- **Author**: Can create/edit draft content → submit to review
- **Editor**: Can create/edit any draft → submit to review, can approve/reject in‑review content
- **Publisher**: Can schedule/publish approved content → can archive published content
- **Admin**: Full access (all of above + can manage users/roles)

### 3.3 Approval & History
- **Approval request flow**: When author submits to review, editors get in‑app notification + email alert with preview link
- **Reject with feedback**: Editor can reject and leave comments; author sees comments and can re‑submit
- **Version history**: Full audit trail of all changes to content/sections, with:
  - Who made the change and when
  - Side‑by‑side diff view
  - One‑click rollback to any previous version
- **Scheduled publishing**: Set a future date/time for approved content to go live; auto‑publish via existing cron scheduler

## 4. Component & Page Event System
### 4.1 Interactive Component Events
Allow users to define events for interactive components (buttons, links, forms, cards, etc.):
- **Event triggers**:
  - Click
  - Hover (mouseenter/mouseleave)
  - Focus/blur
  - Scroll into view
- **Event actions**:
  - Navigate to URL (internal/external)
  - Open modal/popup
  - Toggle element visibility (show/hide another component)
  - Scroll to anchor (smooth scroll)
  - Copy to clipboard
  - Download file
  - Call API endpoint (configurable URL/method/body)
  - Custom JavaScript (for advanced users, with code editor and security sandboxing)

### 4.2 Component Logic Builder
- **Conditional visibility**: Show/hide a component based on:
  - User role (logged‑in/out, member/non‑member)
  - Date/time range (seasonal content)
  - Device type (mobile/desktop)
  - Custom conditions (from API responses or user data)
- **Dynamic data binding**: For list components (card grids, testimonials, etc.), allow binding to:
  - Static manual data (existing behavior)
  - Dynamic CMS data (latest articles, upcoming events, board members, etc.)
  - Custom API endpoints

## 5. Advanced CMS Features
### 5.1 Global Theme & Design System
- **Theme customization**:
  - Full site‑wide color palette editor (primary, secondary, accent, neutral, background, text colors)
  - Typography theme (heading/body fonts, sizes, line heights)
  - Border radius, spacing, shadow presets
  - Save/load custom themes
- **Design tokens**: Use CSS custom properties (variables) so theme changes apply everywhere instantly
- **Preview mode**: Live preview of theme changes on a staging version of the site before publishing

### 5.2 Bulk Operations
- **Bulk edit**: Select multiple pages/content items and bulk edit properties (status, tags, categories, publish date, etc.)
- **Bulk duplicate**: Duplicate multiple pages/sections/components
- **Bulk delete/archive**: Batch operations with confirmation

### 5.3 Staging & Preview
- **Staging environment**: Full staging mode where all changes are saved to a staging database/media store, visible only to authorized users
- **One‑click publish to production**: When ready, sync all staging changes to production
- **Preview links**: Generate temporary public preview links for stakeholders to review without logging in

### 5.4 SEO & Meta Enhancements
- **Per‑section SEO**: Allow setting meta‑tags, OpenGraph, Twitter Cards, and structured data (schema.org) at the section level (for sections that represent content like hero/CTA)
- **SEO checklist**: Built‑in checklist with suggestions (meta length, keyword usage, alt text, etc.)

## 6. Technical Requirements
### 6.1 Backend (Java/Spring Boot)
- New API endpoints for:
  - Managing component properties and presets
  - Content workflow/status changes with validation
  - Version history and diff generation
  - Theme management
  - Staging/production sync
  - Icon library metadata
- WebSocket support for real‑time collaboration (future‑proofing)
- Role‑based security annotations for all new endpoints
- Database schema additions:
  - `component_presets` table
  - `content_version_history` table
  - `themes` table
  - `content_approval_log` table
  - Update `site_sections`/`page_sections` to support JSON‑blob properties for advanced CSS/layout/events

### 6.2 Frontend (Next.js/React/Tailwind)
- New `admin/page‑builder` route with:
  - Drag‑and‑drop canvas (React DnD or dnd‑kit)
  - Property editor sidebar (all the property controls from 2.1/2.2)
  - Component tree navigator
  - Preset library modal
  - Icon picker modal
  - Color picker, gradient picker, media picker
- New `admin/workflow` route for managing approval queue and content status
- New `admin/themes` route for theme customization
- Reusable UI controls for all properties (slider, color picker, grid editor, etc.)
- Rich text editor integration with AR/EN support
- Use React Query/TanStack Query for data fetching/caching

### 6.3 Security & Performance
- **Sanitize all user input**: Especially HTML/JS for rich text and custom event scripts
- **XSS protection**: Content Security Policy (CSP) headers, sanitize all dynamic content before rendering
- **Performance**: Lazy‑load icon library, only load needed icons; optimize media assets in page builder preview
- **Accessibility**: All admin interfaces must be fully keyboard‑navigable and screen‑reader accessible

### 6.4 Testing
- **Unit tests**: >80% coverage for new backend services
- **Integration tests**: Page builder workflow, approval flow, staging sync
- **E2E tests**: Cypress tests for critical page builder and CMS workflows

## 7. Glossary
- **Component Tree**: Expandable sidebar showing all sections and nested components on a page
- **Property Editor**: Right sidebar for editing all properties of selected item
- **Content Status**: Draft → In Review → Approved → Published → Archived
- **Preset**: Saved reusable section/component template
- **Staging**: Non‑public environment for previewing changes before publishing
