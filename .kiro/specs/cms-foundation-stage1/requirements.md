# Requirements Document

## Introduction

This document specifies the requirements for Stage 1 of the CMS Foundation enhancement, which transforms the SSSSY website's page builder into an enterprise-grade Content Management System. Stage 1 focuses on critical bug fixes, essential page management workflows, content approval integration, and foundational tools required for content team independence.

The SSSSY website currently has a functional page builder with 50+ block types, drag-and-drop capabilities, and a property editor. However, critical issues prevent content editors from effectively using the system, and essential CMS workflows are missing. This stage addresses those gaps.

## Glossary

- **Page_Builder**: The frontend drag-and-drop interface for composing pages with blocks
- **PropertyPanel**: The right-side panel in the page builder that displays editable fields for the selected block
- **Block**: A reusable component (heading, image, card, etc.) placed on a page
- **Block_Schema**: The schema definition in `block-schema.ts` that declares all editable fields for each block type
- **Legacy_Section**: A page_sections database row created before the new block builder system, with data stored in nested `data`/`config`/`styling` JSON columns
- **Page_Sections_Table**: PostgreSQL table storing block/section data with columns: `id`, `page_id`, `component_type`, `config`, `data`, `styling`, `sort_order`, `visibility`
- **Layout_JSON**: New column on pages table storing the full block tree structure
- **Migration_Logic**: Frontend code in `migrateLegacySections` that transforms flat page_sections into the new tree format
- **Workflow_Engine**: Existing system for content approval (Draft → Review → Approved → Published)
- **Menu_Builder**: Interface for creating and organizing navigation menus
- **Media_Library**: System for uploading, organizing, and managing images and files
- **Content_Editor**: User role that creates and edits page content
- **Reviewer**: User role that reviews content before approval
- **Publisher**: User role that approves content for publication
- **Administrator**: User role with full system access

---

## Requirements

### Requirement 1: Fix PropertyPanel Data Binding for Legacy Blocks

**User Story:** As a Content Editor, I want to edit properties of existing legacy pages in the page builder, so that I can update content without developer assistance.

#### Acceptance Criteria

1. WHEN a legacy block (about-hero-banner, board-hero-banner, etc.) is loaded in the page builder, THE PropertyPanel SHALL display all editable field values from the database — each input field SHALL contain the value stored in the block's `props` object at the key matching that field's `key` in BLOCK_SCHEMA
2. WHEN the Content_Editor modifies a field in the PropertyPanel, THE Page_Builder SHALL update the block's `props` object with the new value immediately, without requiring a save action
3. WHEN the Content_Editor saves the page, THE Backend SHALL persist the updated block data to `pages.layout_json` (not to `page_sections`), serialized as a full block tree JSON string
4. FOR ALL 24 legacy section types in LEGACY_SECTION_TYPES, THE Migration_Logic SHALL merge the `data`, `config`, and `styling` objects in precedence order (`data` wins over `config` wins over `styling`) into a single flat `props` object; the resulting props keys SHALL match the field `key` values declared in BLOCK_SCHEMA for that component type
5. WHEN Migration_Logic encounters an `items` array in any source object (e.g., `data.panels`, `data.paragraphs`, `data.images`), THE Migration_Logic SHALL assign the array to the `props` key whose `kind` is `"items"` in that block type's BLOCK_SCHEMA field definitions
6. THE Migration_Logic SHALL copy both the `*En` and `*Ar` variants of every bilingual field (e.g., `titleEn`/`titleAr`, `subtitleEn`/`subtitleAr`) from the source objects into `props`, preserving empty strings rather than omitting missing variants
7. WHEN a legacy section's `componentType` is not found in BLOCK_SCHEMA, THE PropertyPanel SHALL render a raw JSON textarea pre-populated with the current `props` JSON string; WHEN the Content_Editor edits that textarea and the value is not valid JSON, THE PropertyPanel SHALL display an inline error and SHALL NOT call `onPropsChange`


### Requirement 2: Fix Multi-Page Navigation State Management

**User Story:** As a Content Editor, I want to switch between pages in the admin panel without losing my work, so that I can manage multiple pages efficiently.

#### Acceptance Criteria

1. WHEN the Content_Editor navigates from `/admin/pages/[id1]` to `/admin/pages/[id2]`, THE Page_Builder SHALL clear the previous page's block tree from React state before issuing the fetch request for the new page
2. WHEN the Page_Builder loads a new page, THE Page_Builder SHALL fetch page data whose `id` matches the requested page ID before rendering the canvas
3. WHEN navigation is initiated, THE Page_Builder SHALL display a loading indicator from the moment navigation begins until the fetched page data has been parsed and the canvas blocks for the new page are rendered
4. WHEN the API returns page data, THE Page_Builder SHALL parse `layout_json` or migrate `page_sections` before rendering the canvas
5. WHEN the Content_Editor clicks the browser back button, THE Page_Builder SHALL load page data whose `id` matches the previous page ID in the browser history
6. THE Page_Builder canvas SHALL NOT render any block that belongs to a page ID other than the currently requested page ID
7. WHEN an API error occurs during page load, THE Page_Builder SHALL display an error message with a retry button that re-issues the failed request, up to a maximum of 3 retry attempts

### Requirement 3: Database Migration for Page Sections Data Structure

**User Story:** As an Administrator, I want to migrate legacy page_sections data to the new structure, so that all pages load correctly in the page builder without data loss.

#### Acceptance Criteria

1. THE Migration_Script SHALL read all rows from page_sections table WHERE component_type is in LEGACY_SECTION_TYPES
2. FOR EACH legacy section, THE Migration_Script SHALL flatten `data`, `config`, and `styling` JSON objects into a single props object with `data` taking precedence over `config` over `styling`
3. THE Migration_Script SHALL map nested items arrays (e.g., `data.panels`, `data.items`) to the `items` key in the flattened props
4. THE Migration_Script SHALL preserve all existing field values without data loss
5. THE Migration_Script SHALL create a backup table `page_sections_backup` before modifying any data, copying all rows with original values
6. THE Migration_Script SHALL log all transformations with section id, component_type, before-state JSON, and after-state JSON
7. IF the migration fails for any section, THE Migration_Script SHALL roll back all changes using a database transaction and report the failing section's id and error message
8. THE Migration_Script SHALL update the `updated_at` timestamp for all migrated sections
9. AFTER migration, THE Migration_Script SHALL validate each migrated section by running it through the frontend `migrateLegacySections` parser and confirming no parse errors

### Requirement 4: Backend API Enhancement for Data Serialization

**User Story:** As a Backend Developer, I want the API to properly serialize page_sections data, so that the frontend receives data in the expected format.

#### Acceptance Criteria

1. WHEN the API endpoint `/api/admin/pages/{id}/sections` is called, THE Backend SHALL return page_sections rows with `data`, `config`, and `styling` deserialized as JSON objects (not raw strings)
2. THE Backend SHALL support a `?format=flat` query parameter on `/api/admin/pages/{id}/sections` that merges `data`, `config`, and `styling` into a single flat `props` object per section
3. WHEN the API endpoint `/api/admin/pages/{id}` is called, THE Backend SHALL include both `layoutJson` and `sections` array in the response body
4. THE Backend SHALL support CORS headers for admin panel requests from `localhost:3000` and the configured production domain
5. WHEN the Content_Editor saves a page with `layoutJson`, THE Backend SHALL accept the `layoutJson` field and persist it to `pages.layout_json`
6. THE Backend SHALL validate that `layoutJson` is valid JSON containing a `version` string and `blocks` array before persisting
7. IF validation fails, THE Backend SHALL return HTTP 400 with a `errors` array listing each invalid field path and the reason for rejection


### Requirement 5: Page Creation Wizard

**User Story:** As a Content Editor, I want to create a new page through a guided wizard, so that I can set up pages correctly without missing required fields.

#### Acceptance Criteria

1. WHEN the Content_Editor clicks "Create Page" in the admin panel, THE Page_Builder SHALL display a multi-step wizard modal with a step indicator showing the current step out of total steps
2. THE Wizard step 1 SHALL collect page title in English (required, 1–200 characters) and in Arabic (optional, 0–200 characters)
3. WHEN the Content_Editor enters or modifies the slug field in step 2, THE Wizard SHALL immediately validate it against the pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` and display an inline validation message; the slug field SHALL have a maximum length of 200 characters
4. THE Wizard step 3 SHALL offer template selection (Blank, Article Layout, Landing Page, About Page) with a preview thumbnail and description for each option
5. WHEN the Content_Editor completes step 3 and confirms, THE Backend SHALL create a new `pages` row with `workflow_status = 'DRAFT'`, `is_published = false`, and the provided title, slug, and template layout
6. WHEN the Backend successfully creates the page, THE Wizard SHALL redirect the browser to `/admin/pages/[new-id]`
7. THE Wizard SHALL not allow advancing past step 2 until the slug passes the format check AND a uniqueness check against the Backend API returns no conflict
8. IF the slug already exists in the database, THE Wizard SHALL display the message "This slug is already taken" and suggest an alternative by appending `-2` (or `-3`, `-4`, etc.) to the original slug, where the suggested alternative itself also passes the uniqueness check
9. IF the Backend returns an error during page creation (network failure or server error), THE Wizard SHALL display an error banner, retain all entered data, and allow the Content_Editor to resubmit without re-entering information

### Requirement 6: URL Slug Management

**User Story:** As a Content Editor, I want to set and change page URL slugs, so that pages have SEO-friendly URLs.

#### Acceptance Criteria

1. THE Page_Builder settings panel SHALL display a slug text field pre-populated with the current page slug
2. WHEN the Content_Editor types in the slug field, THE Page_Builder SHALL validate the input in real-time against `^[a-z0-9]+(?:-[a-z0-9]+)*$` and display an inline error message if invalid
3. WHEN the slug field contains a valid value, THE Page_Builder SHALL display a live preview of the full URL below the field in the format `{APP_URL}/{slug}`
4. WHEN the Content_Editor saves the page, THE Backend SHALL check slug uniqueness across all non-deleted pages in the same language
5. IF the slug conflicts with an existing page, THE Backend SHALL return HTTP 409 with a body containing `{"error": "slug_conflict", "conflictingPageId": "...", "conflictingPageTitle": "..."}`
6. THE Backend SHALL allow the same slug value for pages in different languages (e.g., slug `about` for an English page and slug `about` for a separate Arabic page with different `language` field)
7. WHEN a published page's slug is changed and saved, THE Backend SHALL insert a row in a `url_redirects` table mapping the old slug path to the new slug path with `redirect_type = 301`

### Requirement 7: Page Visibility and Permission Settings

**User Story:** As an Administrator, I want to control who can view each page, so that I can restrict sensitive content to authenticated users or specific roles.

#### Acceptance Criteria

1. THE Page_Builder settings panel SHALL display a "Visibility" dropdown with exactly four options: Public, Authenticated Users Only, Members Only, Role-Based
2. WHEN the Administrator selects "Role-Based", THE Page_Builder SHALL display a checkbox group listing all system roles (ADMIN, EDITOR, PUBLISHER, USER, MEMBER); at least one role must be checked before saving
3. WHEN the Administrator saves visibility settings, THE Backend SHALL persist the `visibility` value and `allowed_roles` JSON array to the `pages` table
4. WHEN a public user requests a page with `visibility = 'PUBLIC'`, THE Backend SHALL return the page content with HTTP 200
5. WHEN an unauthenticated user requests a page with `visibility != 'PUBLIC'`, THE Backend SHALL return HTTP 401 with a JSON body containing `{"redirectTo": "/login", "message": "Authentication required"}`
6. WHEN an authenticated user requests a role-restricted page and their role is not in `allowed_roles`, THE Backend SHALL return HTTP 403 with a JSON body containing `{"message": "Insufficient permissions"}`
7. WHEN a page is restricted to a specific role, only users holding that role (or ADMIN) SHALL be able to access it


### Requirement 8: Page Preview Mode

**User Story:** As a Content Editor, I want to preview pages before publishing, so that I can verify content and layout without making it live.

#### Acceptance Criteria

1. WHEN the Content_Editor clicks "Preview" in the page builder toolbar, THE Page_Builder SHALL open a new browser tab at a preview URL
2. THE Preview page SHALL render the page using the current unsaved block tree from the editor session, not the last saved version
3. THE Preview page SHALL display a fixed top banner reading "Preview Mode — Changes Not Published" with a close button that redirects to the editor
4. THE Backend SHALL serve preview content at `/api/preview/pages/{id}?token={preview-token}` and return the page layout JSON associated with that token
5. WHEN the Content_Editor clicks "Preview", THE Backend SHALL generate a preview token (minimum 32 random bytes, hex-encoded), store it in a `preview_tokens` table with a `expires_at` of 1 hour from creation, and return the token to the frontend
6. THE Preview page SHALL include `<meta name="robots" content="noindex, nofollow">` in the HTML head
7. WHEN a request arrives at the preview endpoint with an expired token or a token not found in `preview_tokens`, THE Backend SHALL return HTTP 403 with `{"error": "preview_token_expired_or_invalid"}`

### Requirement 9: Integrate Pages with Workflow Engine

**User Story:** As a Publisher, I want pages to go through the approval workflow, so that all content is reviewed before going live.

#### Acceptance Criteria

1. WHEN a Content_Editor creates a new page, THE Backend SHALL set `workflow_status = 'DRAFT'` on the new pages row
2. WHEN a Content_Editor clicks "Submit for Review" on a page in DRAFT state, THE Backend SHALL transition `workflow_status` to `'REVIEW'`
3. WHEN a page transitions between workflow states, THE Backend SHALL insert a `workflow_transitions` record containing `from_state`, `to_state`, `user_id`, `timestamp` (UTC), and `notes` (max 1000 characters, nullable)
4. WHEN a page enters REVIEW state, THE Backend SHALL send an email notification to all users with REVIEWER role; IF the email service is unavailable, THE Backend SHALL complete the state transition and queue the notification for retry without blocking the API response
5. WHEN a Reviewer approves the page, THE Backend SHALL transition `workflow_status` from `'REVIEW'` to `'APPROVED'`
6. WHEN a Reviewer rejects the page, THE Backend SHALL transition `workflow_status` from `'REVIEW'` back to `'DRAFT'` and require a non-empty rejection reason of 1–1000 characters stored in the `workflow_transitions.notes` field
7. WHEN a Publisher publishes the page, THE Backend SHALL set `is_published = true` and transition `workflow_status` to `'PUBLISHED'`
8. IF a publish request is received for a page whose `workflow_status` is not `'APPROVED'`, THEN THE Backend SHALL return HTTP 400 with `{"error": "workflow_status_not_approved"}` and leave the page state unchanged
9. IF a workflow transition is requested by a user whose role is not authorized for that transition (Content_Editor may submit, Reviewer may approve/reject, Publisher may publish), THEN THE Backend SHALL return HTTP 403 and leave the page state unchanged
10. IF a workflow transition is requested for a page that is not in the required source state, THEN THE Backend SHALL return HTTP 400 with `{"error": "invalid_state_transition", "currentState": "...", "requiredState": "..."}` and leave the page state unchanged

### Requirement 10: Workflow Status Display in Page List

**User Story:** As a Content Editor, I want to see workflow status for all pages in the list view, so that I can track which pages need attention.

#### Acceptance Criteria

1. WHEN the Content_Editor views `/admin/pages`, THE Frontend SHALL display a status badge for each page showing the `workflow_status` value (DRAFT, REVIEW, APPROVED, PUBLISHED)
2. THE Frontend SHALL render status badges with these exact colors: DRAFT = gray (`bg-gray-100 text-gray-600`), REVIEW = yellow (`bg-yellow-100 text-yellow-700`), APPROVED = green (`bg-green-100 text-green-700`), PUBLISHED = blue (`bg-blue-100 text-blue-700`); WHEN `workflow_status` is an unrecognized value, THE Frontend SHALL render a neutral gray badge with the raw status text
3. THE Frontend SHALL include a "Status" dropdown filter above the page list with options: All, Draft, Review, Approved, Published
4. WHEN the Content_Editor hovers over a status badge, THE Frontend SHALL show a tooltip containing the last transition's `to_state`, the user's display name, and the transition timestamp formatted as `DD MMM YYYY HH:mm`
5. THE Backend SHALL include `workflowStatus`, `lastTransitionBy`, and `lastTransitionAt` in the `/api/admin/pages` list response for each page
6. THE Backend SHALL return pages sorted by `updated_at` descending by default
7. THE Backend SHALL support the query parameter `?workflowStatus=REVIEW` to filter pages by workflow status, and `?sort=updated_at,desc` to control sort order


### Requirement 11: Email Notifications for Workflow Events

**User Story:** As a Reviewer, I want to receive email notifications when pages need review, so that I can respond promptly.

#### Acceptance Criteria

1. WHEN a page transitions to REVIEW state, THE Backend SHALL send email to all active users with REVIEWER or PUBLISHER role
2. THE email body SHALL include: page title (EN), author display name, transition timestamp (UTC, formatted as `DD MMM YYYY HH:mm UTC`), and a direct URL to `/admin/pages/{id}`
3. WHEN a page transitions to any workflow state, THE Backend SHALL send an email to the page's author (the user who created it) notifying them of the new state and who triggered the transition
4. WHEN a page is rejected, THE email to the author SHALL include the rejection reason text from `workflow_transitions.notes`
5. THE Backend SHALL use the existing Email_Service (`EmailService.java`) to send all workflow notification emails
6. THE Backend SHALL send workflow emails asynchronously using `@Async` so the workflow API endpoint returns before emails are dispatched
7. THE Backend SHALL insert a row in `email_logs` for each attempted notification with fields: `recipient_email`, `subject`, `status` (SENT / FAILED / PENDING), `sent_at`, `error_message` (nullable)

### Requirement 12: Audit Trail for Page Changes

**User Story:** As an Administrator, I want to see a complete history of page changes, so that I can track who made what changes and when.

#### Acceptance Criteria

1. WHEN any user modifies a page (create, update, delete, publish, unpublish), THE Backend SHALL insert a row in `page_audit_trail` with: `page_id`, `user_id`, `action` (one of CREATE / UPDATE / DELETE / PUBLISH / UNPUBLISH), `timestamp` (UTC), `changed_fields` (JSON object mapping field name → `{before, after}`)
2. THE `changed_fields` JSON SHALL capture the previous and new values for every field that changed; fields that did not change SHALL be omitted
3. WHEN the Administrator views `/admin/pages/{id}/history`, THE Frontend SHALL render a vertical timeline showing each audit entry with: action label, user avatar + display name, relative timestamp (e.g., "3 hours ago") with full datetime on hover
4. THE Frontend SHALL provide filter controls for the audit timeline: filter by user (dropdown of users who made changes) and by action type (checkboxes)
5. THE Backend SHALL expose `GET /api/admin/pages/{id}/audit-trail?page=0&size=20` returning paginated audit records sorted by `timestamp` descending
6. THE Backend SHALL retain audit trail records indefinitely with no automated deletion; the records are append-only
7. THE `page_audit_trail` table SHALL include workflow state transition entries as rows with `action = 'WORKFLOW_TRANSITION'` and `changed_fields` containing `{workflowStatus: {before: "...", after: "..."}}`

### Requirement 13: Page-to-Menu Linking Interface

**User Story:** As a Content Editor, I want to add pages to navigation menus, so that users can find and access the pages.

#### Acceptance Criteria

1. WHEN the Content_Editor opens the page settings panel, THE Frontend SHALL display a "Menu Placement" collapsible section
2. THE Menu Placement section SHALL list all available menus fetched from `/api/admin/menus` with a checkbox per menu
3. WHEN the Content_Editor checks a menu, THE Frontend SHALL reveal a "Parent item" dropdown populated with top-level items of that menu, plus a "(None — top level)" option
4. WHEN the Content_Editor saves menu placement, THE Backend SHALL create or update `menu_items` rows linking the page to each checked menu, setting `menu_items.page_id`, `menu_items.url` = `/{slug}`, `menu_items.label_en` = page title EN, `menu_items.label_ar` = page title AR
5. THE Backend SHALL set `menu_items.parent_id` to the selected parent item id, or NULL if "(None — top level)" is selected
6. WHEN the page is unpublished (`is_published = false`), THE Backend SHALL set `menu_items.is_visible = false` for all menu items linked to that page; WHEN republished, THE Backend SHALL restore `is_visible = true`
7. WHEN the Content_Editor unchecks a menu, THE Backend SHALL delete the corresponding `menu_items` row for that page + menu combination

### Requirement 14: Enhanced Menu Builder with Drag-and-Drop

**User Story:** As an Administrator, I want to organize menu items via drag-and-drop, so that I can structure navigation efficiently.

#### Acceptance Criteria

1. WHEN the Administrator views `/admin/menus`, THE Frontend SHALL display all menus with their items rendered as a tree using indentation to represent parent-child relationships
2. THE Frontend SHALL allow dragging menu items to reorder them within the same parent level; dropping a menu item between two siblings SHALL update its `sort_order` to be between those siblings' sort orders
3. WHEN the Administrator drags a menu item over a valid drop target at a deeper nesting level, THE Frontend SHALL allow nesting it, provided the resulting nesting depth does not exceed 3 levels; IF the drop would exceed 3 levels, THE Frontend SHALL reject the drop and show a tooltip "Maximum 3 levels of nesting"
4. WHEN the Administrator releases a dragged item, THE Frontend SHALL send a PATCH request to `/api/admin/menus/{menuId}/items` with the updated `sort_order` and `parent_id` for the moved item
5. WHEN the Backend receives the updated menu structure, THE Backend SHALL update `menu_items.sort_order` and `menu_items.parent_id` and return HTTP 200; IF the update fails, THE Backend SHALL return HTTP 500 and THE Frontend SHALL revert the drag-drop visually and display an error toast
6. WHEN the Administrator views `/admin/menus`, THE Frontend SHALL display an "Add Custom Link" button; WHEN clicked, THE Frontend SHALL show a form to collect: label EN (1–100 chars), label AR (0–100 chars), URL (valid URL, max 2048 chars), and target (`_self` or `_blank`)
7. WHEN adding a custom link, THE Frontend SHALL validate label EN (non-empty) and URL (matches URL pattern) before enabling the save button
8. IF a menu item drop would exceed 3 nesting levels, THE Frontend SHALL reject the drop with a tooltip and leave the tree state unchanged
9. WHEN the Backend returns an error for a menu structure update, THE Frontend SHALL revert the tree to its pre-drag state and display a toast notification with the error message


### Requirement 15: Media Library with Upload and Browse

**User Story:** As a Content Editor, I want to upload and manage images in a central library, so that I can reuse images across multiple pages.

#### Acceptance Criteria

1. WHEN the Content_Editor clicks "Browse" in an image field, THE Frontend SHALL open a media library modal
2. WHILE the media library modal is open, THE Media_Library SHALL display all uploaded images in a grid with thumbnails sized at 300×300px, showing at most 100 images per page with pagination controls
3. WHEN the Content_Editor initiates an upload via drag-and-drop or file picker, THE Media_Library SHALL accept files of type JPEG, PNG, GIF, or WebP with a maximum file size of 10 MB per file and a maximum of 20 files per upload batch
4. WHEN the Content_Editor uploads an image, THE Backend SHALL store the file in MinIO/S3 first and ONLY insert a `media_library` table row after successful storage; IF MinIO/S3 storage fails, THE Backend SHALL return HTTP 500 and SHALL NOT create any database record
5. WHEN an image is stored, THE Backend SHALL generate a 300×300 px thumbnail (cover crop) and store it as a separate object in MinIO/S3 with a `_thumb` suffix
6. IF an uploaded file is not of type JPEG, PNG, GIF, or WebP, OR its size exceeds 10 MB, THEN THE Backend SHALL reject it with HTTP 422 indicating the invalid file type or size; no file SHALL be stored
7. WHEN the Content_Editor enters a search term of 1 or more characters, THE Media_Library SHALL display only images whose filename or alt text contains the term (case-insensitive); IF no images match, THE Media_Library SHALL display "No media found"
8. WHILE the media library modal is open, THE Media_Library SHALL display for each image: filename (truncated at 40 chars), file size in KB, pixel dimensions, upload date, and uploader display name
9. WHEN the Content_Editor selects an image, THE Frontend SHALL close the modal and populate the image field with the full-resolution MinIO/S3 URL of the selected image

### Requirement 16: Media Library Folder Organization

**User Story:** As a Content Editor, I want to organize media into folders, so that I can find images quickly.

#### Acceptance Criteria

1. THE Media_Library SHALL display a folder tree in a left sidebar; the root node SHALL be labeled "All Media" and SHALL always be visible
2. WHEN the Content_Editor clicks "New Folder", THE Frontend SHALL display an inline input to enter a folder name (1–100 characters, required); WHEN the Content_Editor confirms, THE Backend SHALL insert a `media_folders` row and return the new folder id
3. WHEN the Content_Editor drags an image thumbnail onto a folder in the sidebar, THE Frontend SHALL send a PATCH request to update `media_library.folder_id` to the target folder's id
4. IF the Backend returns an error for a folder move, THE Frontend SHALL revert the image to its original folder in the UI and display an error toast
5. THE Frontend SHALL allow renaming a folder via right-click context menu → "Rename"; WHEN confirmed, THE Backend SHALL update `media_folders.name`
6. THE Frontend SHALL allow deleting a folder via right-click context menu → "Delete"; IF the folder contains images, THE Frontend SHALL show a confirmation warning listing the image count; WHEN the Administrator confirms, THE Backend SHALL set `media_library.folder_id = NULL` for all images in that folder and then delete the `media_folders` row
7. WHEN a folder is deleted, all images within it SHALL be moved to "All Media" (root) rather than being deleted

### Requirement 17: Media Library Bulk Upload

**User Story:** As a Content Editor, I want to upload multiple images at once, so that I can save time when adding many images.

#### Acceptance Criteria

1. WHEN the Content_Editor selects multiple files in the file picker or drops multiple files, THE Frontend SHALL upload them in parallel with a concurrency limit of 5 simultaneous uploads
2. THE Frontend SHALL display an upload progress indicator for each file showing filename and percentage complete (0–100%)
3. IF a single file upload fails, THE Frontend SHALL display an error message for that file and provide a "Retry" button; other files in the batch SHALL continue uploading independently
4. WHEN all uploads in the batch complete (success or failure), THE Frontend SHALL display a summary: "X uploaded, Y failed"
5. THE Backend SHALL validate file type and size per the rules in Requirement 15 criterion 6 before accepting each file; rejected files SHALL be counted in the failure summary
6. THE Backend SHALL generate a unique filename for each upload by prepending a UUID (v4) to the original filename, preventing collisions
7. WHEN an upload completes, THE Media_Library grid SHALL update to show the newly uploaded image without requiring a full page refresh

### Requirement 18: Image Metadata Editor

**User Story:** As a Content Editor, I want to add alt text and captions to images, so that pages are accessible and SEO-friendly.

#### Acceptance Criteria

1. WHEN the Content_Editor clicks an image thumbnail in the Media_Library, THE Frontend SHALL open an image details side panel without closing the library
2. THE image details panel SHALL display fields: alt text EN (text, max 300 chars), alt text AR (text, max 300 chars), caption EN (text, max 500 chars), caption AR (text, max 500 chars), tags (comma-separated string)
3. WHEN the Content_Editor saves metadata changes, THE Backend SHALL update the `media_library` row for that image
4. THE Media_Library grid SHALL display the alt text EN (truncated to 30 chars) below each thumbnail; IF alt text EN is empty, THE Frontend SHALL display the filename instead
5. THE Backend SHALL update a PostgreSQL full-text search index on `alt_text_en`, `alt_text_ar`, `caption_en`, `caption_ar`, and `tags` columns when metadata is saved
6. WHEN the Content_Editor types a search term in the media library search field, THE Backend SHALL query the full-text index and return matching images
7. THE Frontend SHALL display a yellow warning badge on images with empty `alt_text_en` to encourage editors to add alt text


### Requirement 19: SEO Metadata Editor Enhancement

**User Story:** As a Content Editor, I want an intuitive SEO editor, so that I can optimize pages for search engines without technical knowledge.

#### Acceptance Criteria

1. WHEN the Content_Editor opens the page settings panel, THE Frontend SHALL display an "SEO" tab with fields: meta_title (text), meta_description (textarea), og_title (text), og_description (textarea), og_image_url (image picker)
2. THE meta_title field SHALL display a live character counter; WHEN count ≤ 60, the counter SHALL be green; WHEN count is 0 (empty), the counter SHALL be yellow; WHEN count > 60, the counter SHALL be red
3. THE meta_description field SHALL display a live character counter with the same color rules as meta_title but with a 160-character limit
4. THE Frontend SHALL display a Google SERP preview card below the meta fields showing the page title, URL slug, and meta description as they would appear in search results
5. THE Frontend SHALL display an Open Graph preview card showing og_title, og_description, and og_image as they would appear when shared on social media
6. WHEN the meta_title field is cleared, THE Frontend SHALL immediately show the page title as a placeholder value indicating it will be used as fallback
7. WHEN og_image_url is set, THE Frontend SHALL validate it is a reachable image URL by issuing a HEAD request; IF the URL returns a non-image content type or 4xx/5xx, THE Frontend SHALL display an inline warning (non-blocking, the editor may still save)

### Requirement 20: Page Templates System

**User Story:** As an Administrator, I want to create reusable page templates, so that Content Editors can quickly create pages with consistent layouts.

#### Acceptance Criteria

1. WHEN the Administrator clicks "Save as Template" in the page builder, THE Frontend SHALL display a modal collecting: template name (1–100 chars, required), category (select: Layout, Landing, About, Contact, Blog), and optional description (0–500 chars)
2. WHEN the Administrator confirms, THE Backend SHALL insert a `page_templates` row containing the current page's `layout_json`, name, category, description, and the creator's `user_id`
3. WHEN the Content_Editor reaches step 3 of the page creation wizard, THE Wizard SHALL fetch and display available templates from `/api/admin/page-templates` grouped by category
4. WHEN the Content_Editor selects a template, THE Page_Builder SHALL initialize the new page's block tree from the template's `layout_json`; all block IDs SHALL be regenerated to prevent ID collisions with other pages
5. THE Frontend SHALL provide a template management page at `/admin/templates` listing all templates with name, category, usage count, and created date
6. THE Backend SHALL increment `page_templates.usage_count` each time a page is created from a template
7. THE Frontend SHALL display a screenshot thumbnail for each template in the selection screen; the thumbnail SHALL be captured automatically when the template is saved (or show a placeholder if not yet captured)

### Requirement 21: Page Duplication

**User Story:** As a Content Editor, I want to duplicate an existing page, so that I can create similar pages quickly.

#### Acceptance Criteria

1. WHEN the Content_Editor clicks "Duplicate" on a page in the page list, THE Frontend SHALL open a dialog prompting for a new page title (pre-filled with original title + " (Copy)") and slug
2. THE dialog SHALL validate the new slug using the same rules as Requirement 5 criterion 3 before enabling the "Duplicate" button
3. WHEN the Content_Editor confirms, THE Backend SHALL create a new `pages` row copying `layout_json`, `meta_title`, `meta_description`, `og_*` fields, `visibility`, and `allowed_roles` from the original
4. THE Backend SHALL set `workflow_status = 'DRAFT'` and `is_published = false` on the duplicated page, regardless of the original's status
5. THE Backend SHALL NOT copy `workflow_transitions`, `page_audit_trail`, or `preview_tokens` records to the duplicated page
6. WHEN the Backend successfully creates the duplicate, THE Frontend SHALL redirect to `/admin/pages/[new-id]`
7. THE Backend SHALL generate fresh UUIDs for all block IDs in the duplicated page's `layout_json` to ensure no ID collisions with the original page

### Requirement 22: Page Deletion with Safety Check

**User Story:** As an Administrator, I want to delete pages with safety checks, so that I don't accidentally delete important content.

#### Acceptance Criteria

1. WHEN the Administrator clicks "Delete" on a page, THE Frontend SHALL display a confirmation dialog listing the page title and any linked menus
2. THE Frontend SHALL call `/api/admin/menus/items?pageId={id}` to check for menu references and display the names of any menus that link to this page
3. THE Frontend SHALL display a warning if `is_published = true` on the page, showing the last published date
4. WHEN the page is published, THE Frontend SHALL require the Administrator to type the exact page title (case-sensitive) in a text field before enabling the "Delete" button
5. WHEN the Administrator confirms deletion, THE Backend SHALL set `pages.deleted_at = NOW()` (soft delete) and `is_published = false`
6. THE Backend SHALL also set `deleted_at = NOW()` on all `page_sections` rows with `page_id` matching the deleted page
7. THE Backend SHALL provide `POST /api/admin/pages/{id}/restore` to restore soft-deleted pages; the endpoint SHALL only succeed if `deleted_at` is within the last 30 days

### Requirement 23: Multi-Language Page Management

**User Story:** As a Content Editor, I want to manage English and Arabic versions of pages, so that the website serves bilingual audiences.

#### Acceptance Criteria

1. WHEN the Content_Editor creates a page, THE Frontend SHALL allow selecting the page language (EN or AR) in the creation wizard
2. THE page builder toolbar SHALL display a language badge (EN / AR) for the current page
3. WHEN the Content_Editor clicks "Add Translation" in the page settings, THE Frontend SHALL open the page creation wizard pre-filled with the current page's slug and title, with the language toggled to the other language
4. THE Backend SHALL store each language version as a separate `pages` row; pages in the same translation group SHALL be linked via `pages.translation_group_id` (UUID shared by all language versions)
5. THE Frontend SHALL display a "⚠ Other language version not published" warning badge in the page list IF one language version is published and the paired translation (same `translation_group_id`) is not published
6. WHEN a public user requests a page, THE Backend SHALL return the version matching the user's `Accept-Language` header or the language query parameter `?lang=ar`; IF no matching version exists, THE Backend SHALL return the default language version
7. THE public site header language toggle SHALL link to the matching-language version of the current page using the shared `translation_group_id`


### Requirement 24: Layout JSON Parser Validation

**User Story:** As a Backend Developer, I want a robust parser for layout_json, so that the system handles malformed data gracefully.

#### Acceptance Criteria

1. WHEN the Backend receives a `layoutJson` string, THE Parser SHALL attempt to parse it as JSON before persisting; IF JSON.parse fails, THE Backend SHALL return HTTP 400 with `{"error": "invalid_json"}`
2. THE Parser SHALL verify the top-level object contains `"version"` (string) and `"blocks"` (array); IF either is missing, THE Backend SHALL return HTTP 400 specifying which field is absent
3. THE Parser SHALL validate each element of `blocks` has `"id"` (string, non-empty), `"type"` (string, non-empty), and `"props"` (object); IF any element fails, THE Backend SHALL return HTTP 400 identifying the block index and missing field
4. IF parsing or validation fails, THE Backend SHALL return HTTP 400 with a JSON body containing an `errors` array where each element has `path` and `message` fields
5. THE Parser SHALL recursively validate `children` arrays on container blocks using the same per-block rules
6. THE Parser SHALL verify that all `id` values within the document are unique; IF duplicates exist, THE Backend SHALL return HTTP 400 listing the duplicate IDs
7. THE Parser SHALL accept blocks whose `type` is not in BLOCK_SCHEMA by treating them as opaque leaf blocks, but SHALL log a warning with the unknown type for observability

### Requirement 25: Layout JSON Debug Endpoint

**User Story:** As a Developer, I want to inspect formatted layout_json via API, so that I can debug page structure easily.

#### Acceptance Criteria

1. THE Backend SHALL expose `GET /api/admin/pages/{id}/layout-json` returning the page's `layout_json` pretty-printed with 2-space indentation
2. THE response SHALL set `Content-Type: application/json; charset=utf-8`
3. THE pretty-printed output SHALL be parseable by the Layout JSON Parser (Requirement 24) without errors
4. THE pretty-printed output SHALL preserve all field values, block order, and children structure from the stored `layout_json`
5. THE Frontend page builder SHALL include a "Debug: View JSON" button (visible only to ADMIN role) that opens a modal with a read-only code editor showing the formatted layout_json with syntax highlighting
6. THE pretty-printed output SHALL handle Arabic Unicode characters correctly (no escaped `\uXXXX` sequences for Arabic text; output raw UTF-8)
7. THE Backend SHALL return HTTP 404 if the page does not exist or has been soft-deleted

### Requirement 26: Layout JSON Round-Trip Integrity

**User Story:** As a QA Engineer, I want to verify that parsing and serializing layout_json is lossless, so that data integrity is guaranteed.

#### Acceptance Criteria

1. FOR ANY valid `layout_json` string S, parsing S into a `PageLayout` object and then serializing it back to JSON SHALL produce a string that, when parsed again, yields an object deeply equal to the first parse result
2. THE Frontend test suite SHALL include property-based tests using `fast-check` that generate random `PageLayout` objects with random block types, props values, and nesting depths up to 5 levels, and verify the round-trip property holds for 500 runs
3. THE tests SHALL verify that all scalar field values (strings, numbers, booleans, null) are preserved exactly after round-trip
4. THE tests SHALL verify that block arrays maintain their original order after round-trip
5. THE tests SHALL verify that nested `children` arrays at all levels are preserved after round-trip
6. THE tests SHALL verify that Arabic Unicode strings (e.g., `"عنوان القسم"`) are preserved without corruption after round-trip
7. IF a round-trip test fails for any generated input, THE test framework SHALL report the seed, the generated input, the intermediate parsed object, and the final re-parsed object for debugging

---

## CMS Feature Comparison: Current State vs Enterprise Standards

| Feature Area | WordPress | Drupal | Joomla | **This CMS (Before Stage 1)** | **After Stage 1** |
|---|---|---|---|---|---|
| Page Builder | Gutenberg / Elementor | Layout Builder | Page Builder | ✅ Drag-and-drop, 50+ blocks | ✅ + Templates, Presets |
| Content Workflow | Basic (Pending Review) | Full workflow + Rules | Basic | ⚠️ Exists but not on pages | ✅ DRAFT→REVIEW→APPROVED→PUBLISHED |
| Menu Builder | ✅ Full visual tree | ✅ Full | ✅ Full | ⚠️ Basic | ✅ Drag-and-drop, 3-level tree |
| Media Library | ✅ Full (WP Media) | ✅ Full | ✅ Full | ⚠️ File picker only | ✅ Upload, folders, search, metadata |
| Multi-language | ✅ Polylang/WPML plugin | ✅ Native (best-in-class) | ✅ Native | ✅ EN/AR blocks | ✅ Translation groups |
| SEO Manager | ✅ Yoast/RankMath | ✅ Metatag module | ✅ sh404SEF | ⚠️ Basic meta fields | ✅ SERP preview, OG preview |
| Page Templates | ✅ Full Templates | ✅ Content types | ✅ Templates | ❌ None | ✅ Save/reuse templates |
| Audit Trail | ✅ Revision history | ✅ Full audit | ✅ Basic | ❌ None | ✅ Full audit trail |
| URL Management | ✅ Permalinks + redirects | ✅ Pathauto + redirects | ✅ Full | ⚠️ Basic slugs | ✅ Slug edit + 301 redirects |
| Page Permissions | ✅ Role-based | ✅ Granular node access | ✅ ACL | ⚠️ Basic visibility | ✅ Role-based visibility |
| Preview Mode | ✅ | ✅ | ✅ | ❌ None | ✅ Token-based preview |
| PropertyPanel Data Binding | N/A | N/A | N/A | ❌ Broken for legacy blocks | ✅ Fixed for all 24 legacy types |

