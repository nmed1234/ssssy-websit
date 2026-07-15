# Stage 2 Task Breakdown
## Overview
- Project: Syrian Soil Science Society (SSSSY) Website
- Stage: 2 (Enhanced CMS & Advanced Page Builder)
- Version: 2.0.0
- Last Updated: 2026‑07‑10

## Task Groups
### Group 1: Backend – Database Schema & API Enhancements
- [ ] **1.1 Update DB Schema**
  - [ ] Create `component_presets` table with `id`, `name_ar`, `name_en`, `component_type`, `config_json`, `data_json`, `styling_json`, `is_system`, `created_by`, `created_at`, `updated_at`
  - [ ] Create `content_version_history` table with `id`, `content_type`, `content_id`, `version_number`, `data_snapshot`, `change_description`, `created_by`, `created_at`
  - [ ] Create `themes` table with `id`, `name_ar`, `name_en`, `theme_json`, `is_active`, `is_system`, `created_by`, `created_at`, `updated_at`
  - [ ] Create `content_approval_log` table with `id`, `content_type`, `content_id`, `old_status`, `new_status`, `comments`, `action_by`, `created_at`
  - [ ] Add columns to `site_sections`/`page_sections`: `events_json`, `conditions_json`, `version`
  - [ ] Write Flyway DB migration script for all schema changes
- [ ] **1.2 Backend API Endpoints**
  - [ ] Component Presets API (`GET /api/admin/component-presets`, `POST /api/admin/component-presets`, `PUT /api/admin/component-presets/:id`, `DELETE /api/admin/component-presets/:id`)
  - [ ] Content Workflow API (`PUT /api/admin/content/:type/:id/status`, `GET /api/admin/content/:type/:id/history`, `POST /api/admin/content/:type/:id/rollback`)
  - [ ] Themes API (`GET /api/admin/themes`, `POST /api/admin/themes`, `PUT /api/admin/themes/:id`, `DELETE /api/admin/themes/:id`, `POST /api/admin/themes/:id/activate`)
  - [ ] Icon Library Metadata API (`GET /api/admin/icons`, `GET /api/admin/icons/:pack`)
  - [ ] Staging Sync API (`POST /api/admin/staging/sync-to-production`, `GET /api/admin/staging/status`)
  - [ ] Update existing `page-sections`/`site-sections` APIs to support new JSON fields
- [ ] **1.3 Backend Services**
  - [ ] `ComponentPresetService`: CRUD for presets, system vs custom presets
  - [ ] `ContentWorkflowService`: Manage status changes, approval/reject with comments
  - [ ] `ContentVersionService`: Create snapshots, diff generation, rollback
  - [ ] `ThemeService`: CRUD themes, activate/deactivate
  - [ ] `StagingSyncService`: Sync staging DB/media to production
  - [ ] Update `ContentSchedulerService` to handle more content types

---

### Group 2: Frontend – Advanced Page Builder
- [ ] **2.1 Core Page Builder Infrastructure**
  - [ ] Create `admin/page-builder/[pageId]` route
  - [ ] Implement drag‑and‑drop canvas (use dnd‑kit or React DnD)
  - [ ] Build expandable **Component Tree** sidebar with drag/drop reorder
  - [ ] Build **Property Editor** sidebar with tabs (Content, Layout, Style, Events, Conditions)
- [ ] **2.2 Property Editor Controls**
  - [ ] Text controls: Simple text input + Rich Text Editor (CKEditor 5 / TinyMCE with AR/EN)
  - [ ] Media picker: Reuse existing media library integration with alt text/caption
  - [ ] Color picker: Visual picker, presets, hex/RGB/HSL, opacity
  - [ ] Gradient builder: Linear/radial/conic, color stops, angle/position
  - [ ] Layout controls: Flexbox/Grid visual editor, margin/padding sliders (per‑breakpoint)
  - [ ] Typography controls: Font selector, size (fluid/fixed), weight, line height, letter spacing
  - [ ] Border/shadow controls: Border style/radius, box/text shadow presets
  - [ ] Background controls: Solid/gradient/image/pattern/video, overlay options
- [ ] **2.3 Icon System Integration**
  - [ ] Build **Icon Picker Modal**: Search/filter, categories, preview
  - [ ] Integrate icon packs (Lucide, Heroicons, Tabler, Font Awesome Free)
  - [ ] Icon properties controls: Color, size, stroke width, rotation, flip
  - [ ] Custom SVG icon upload
- [ ] **2.4 Preset Library**
  - [ ] Build **Preset Library Modal**: Browse system presets, custom presets, preview
  - [ ] Implement save custom preset function
  - [ ] One‑click preset application to sections
- [ ] **2.5 Event & Condition Builder**
  - [ ] Build **Event Builder UI**: Select trigger → select/configure action
  - [ ] Build **Condition Builder UI**: Add conditional visibility rules
  - [ ] Implement dynamic data binding for list components (CMS data, custom APIs)

---

### Group 3: Frontend – Content Workflow & Approval
- [ ] **3.1 Workflow Management UI**
  - [ ] Create `admin/workflow` route (approval queue dashboard)
  - [ ] Add status badge/selector to all content edit pages
  - [ ] Build approval request form (with comments)
  - [ ] Build reject feedback form (with comments)
  - [ ] Add in‑app notifications for approval requests/feedback
  - [ ] Add email alerts for approval requests/feedback
- [ ] **3.2 Version History UI**
  - [ ] Build version history list view (who/when)
  - [ ] Build side‑by‑side diff viewer
  - [ ] One‑click rollback button

---

### Group 4: Frontend – Theme & Global Design
- [ ] **4.1 Theme Customization UI**
  - [ ] Create `admin/themes` route
  - [ ] Build full theme editor (color palette, typography, spacing, borders, shadows)
  - [ ] Save/load custom themes
  - [ ] Live preview of theme changes in staging mode
- [ ] **4.2 Global Design Tokens**
  - [ ] Refactor Tailwind config to use CSS custom properties (variables) for all theme values
  - [ ] Update all components to use these CSS variables

---

### Group 5: Frontend – Staging & Bulk Operations
- [ ] **5.1 Staging System**
  - [ ] Add staging toggle in admin header
  - [ ] Build staging/production sync UI
  - [ ] Generate temporary public preview links
- [ ] **5.2 Bulk Operations UI**
  - [ ] Add bulk select checkboxes to content list pages
  - [ ] Build bulk edit modal
  - [ ] Build bulk duplicate/delete/archive modals

---

### Group 6: Page Builder Components Updates
- [ ] **6.1 Extend Existing Components**
  - [ ] Update all `page-section` components to use the new dynamic properties from `config_json`/`styling_json`/`events_json`/`conditions_json`
  - [ ] Add support for responsive breakpoint overrides
  - [ ] Add support for custom CSS/JS (sandboxed)
- [ ] **6.2 New Components (Optional Enhancements)**
  - [ ] Pricing tables
  - [ ] FAQ accordions
  - [ ] Advanced sliders/carousels
  - [ ] Interactive maps

---

### Group 7: Testing & QA
- [ ] **7.1 Backend Tests**
  - [ ] Unit tests for all new services (>80% coverage)
  - [ ] Integration tests for new API endpoints
- [ ] **7.2 Frontend Tests**
  - [ ] Component tests for all new page builder controls
  - [ ] Cypress E2E tests for critical workflows (page build, approval, staging sync)
- [ ] **7.3 Accessibility & Security**
  - [ ] Full accessibility audit of all new admin interfaces
  - [ ] Security audit (XSS, input sanitization, CSP)
