# Email Phase 1 Enhancement Plan

## Overview

Complete redesign and enhancement of the email system for Phase 1 (internal platform, no external mail server).
Goals:
1. Add **Email** entry in the Admin Sidebar with unread badge + quick-access menu
2. Rewrite the **Admin Email Management page** (`/admin/email`) — smooth, theme-consistent, full account management with bulk actions
3. Fully redesign the **member email client** (`/email/*`) — beautiful, interactive, all features exposed
4. Wire missing interactions (reply/forward buttons actually navigate, keyboard shortcuts, mark-all-read, move-to-folder, empty-trash)
5. No backend changes — all fixes are pure frontend using the already-built APIs

## Design System Reference
- **Brand colors**: `soil-dark (#3E2723)`, `soil-clay (#6D4C41)`, `soil-sand (#D7CCC8)`, `earth-gray (#616161)`, `forest (#2E7D32)`
- **shadcn tokens**: `bg-card`, `bg-background`, `border-border`, `text-muted-foreground`, `bg-muted`
- **Pattern**: `bg-soil-dark text-white` sidebar (same as AdminSidebar), `soil-clay` for active/accent states
- **Animations**: Framer Motion used throughout admin, `animate-shimmer` for skeletons, `motion.div` page transitions

---

## Sub-Task 1 — Admin Sidebar: Add Email Entry with Unread Badge

### Intent
The admin has no way to access email from the sidebar. Add a dedicated "Email" nav item (linking to `/admin/email`) with a live unread count badge fetched from the API.

### Expected Outcomes
- "Email" entry appears in the admin sidebar nav list between Newsletter and CRM (communication group)
- Badge shows total unread count, fetched once on sidebar mount, zero hides the badge
- Clicking goes to `/admin/email`
- Entry follows exact same styling as all other nav items (icon, text, active border)

### Todo List
- [ ] Add `{ href: "/admin/email", en: "Email Accounts", ar: "حسابات البريد", icon: Mail }` to `navItems` array in `AdminSidebar.tsx` — place it after the Newsletter entry
- [ ] In `AdminSidebar`, fetch `GET /api/admin/email/stats` on mount (only when `!collapsed`) to get `totalUnread` or `activeAccounts`; show a small badge next to the label if unread > 0
- [ ] Use the existing `Badge` component pattern — same amber/red dot style used elsewhere

### Relevant Context
- `frontend/src/components/layout/AdminSidebar.tsx` — `navItems` array, sidebar render
- `frontend/src/app/admin/email/page.tsx` — existing stats query uses `/admin/email/stats`

### Status
[x] completed

---

## Sub-Task 2 — Admin Email Page: Full Redesign

### Intent
Current `/admin/email/page.tsx` is basic: 3 stat cards + a plain table. Replace with a rich management interface matching the admin panel's soil-dark theme with:
- Tabbed interface: **Overview** | **Accounts** | **Distribution Lists** | **Audit Log**
- Overview tab: animated stat cards (same pattern as dashboard), storage donut/bar, recent activity
- Accounts tab: searchable/sortable table with inline actions (toggle active, reset password, set quota, view inbox, delete), bulk-select toolbar, provision new account button
- All colors using `soil-clay`, `soil-dark`, `bg-muted`, `border-border` — NO raw gray hardcodes

### Expected Outcomes
- Page feels like a native part of the admin panel (same font, same card style, same motion)
- Admin can search accounts by name/email
- Admin can toggle an account active/inactive inline (optimistic UI)
- Admin can reset a password inline (shows generated temp password in a copy-to-clipboard toast)
- Admin can click "View Inbox" on an account row → navigates to `/admin/email/inbox` with that account's context
- Bulk select: select all / deselect all, bulk activate, bulk deactivate, bulk set quota
- Provision Account button opens a modal: enter userId or username → calls `POST /api/email/account/provision`

### Todo List
- [ ] Rewrite `frontend/src/app/admin/email/page.tsx` with tab state (`overview` | `accounts` | `lists`)
- [ ] Overview tab: 4 stat cards (Total, Active, Storage Used, Emails Sent) using the same `staggerContainer`/`listItem` animation variants from admin dashboard
- [ ] Overview tab: storage progress bar using `soil-clay` color, animated width
- [ ] Accounts tab: search input + table with columns: Avatar/Email, Display Name, Quota bar, Status badge, Last Sync, Actions
- [ ] Accounts tab: inline toggle active calls `PUT /api/admin/email/accounts/{id}` optimistically
- [ ] Accounts tab: "Reset Password" button → modal with generated password + copy button
- [ ] Accounts tab: bulk toolbar appears when ≥1 row selected
- [ ] Provision modal: simple form calling `POST /api/email/account/provision`
- [ ] All loading states use `animate-shimmer` skeleton rows
- [ ] Error states use `AlertCircle` pattern matching other admin pages

### Relevant Context
- `frontend/src/app/admin/page.tsx` — reference for stat card pattern, `staggerContainer`/`listItem`
- `frontend/src/app/admin/email/page.tsx` — current file to replace
- `frontend/src/lib/email.ts` — all API functions available

### Status
[x] completed

---

## Sub-Task 3 — Admin Email Inbox: Redesign to Match Theme

### Intent
`/admin/email/inbox/page.tsx` uses raw `bg-primary/10`, `text-primary` which looks disconnected. Replace with soil theme colors, add full folder sidebar (all 6 folders), add message preview pane, and wire the "Open full inbox" link to `/email/inbox`.

### Expected Outcomes
- Sidebar shows all 6 system folders with unread counts and `soil-clay` active indicator
- Message list rows: unread = `bg-soil-clay/5 font-semibold`, hover = `bg-muted/50`
- Click on a message → inline preview pane (same split-pane pattern as member inbox)
- Header action: "Open Full Email Client" button → `/email/inbox`
- "Compose" button → `/email/compose`

### Todo List
- [ ] Rewrite `frontend/src/app/admin/email/inbox/page.tsx` with full 6-folder sidebar
- [ ] Active folder indicator: left border `border-l-2 border-soil-clay` (matches AdminSidebar active item pattern)
- [ ] Unread badge: `bg-soil-clay text-white` pill (matches email layout sidebar)
- [ ] Message list: add sender avatar initial circle `bg-soil-dark text-soil-sand`
- [ ] Add inline preview pane (identical to member inbox preview, 2/5 + 3/5 split)
- [ ] Add "Open Full Email Client" link in page header actions

### Relevant Context
- `frontend/src/app/admin/email/inbox/page.tsx` — current file to replace
- `frontend/src/app/email/inbox/page.tsx` — preview pane pattern to copy
- `frontend/src/components/layout/AdminSidebar.tsx` — active item style `bg-white/15 border-r-2 border-forest-light` to mirror

### Status
[x] completed

---

## Sub-Task 4 — Member Email Layout: Enhanced Sidebar + Header

### Intent
The current email layout sidebar is functional but missing: starred and scheduled folder links, a "back to site" link, and the account email address display. The mobile header shows only "Email" text — no compose button. Enhance all of this.

### Expected Outcomes
- Sidebar: shows Starred and Scheduled as additional nav items below system folders (with icons)
- Sidebar: shows account email address below the storage bar (e.g. `ahmad.hassan@ssssyria.org`)
- Sidebar: "← Back to Site" link at the very bottom
- Mobile header: shows compose button (pencil icon) next to the menu hamburger
- Sidebar collapse: tooltip shows folder name on hover when collapsed

### Todo List
- [ ] In `frontend/src/app/email/layout.tsx` `SidebarContent`, add Starred (`/email/starred`) and Scheduled (`/email/scheduled`) links after system folders, separated by a thin divider
- [ ] Add account email display in the storage footer section
- [ ] Add "Back to Site" link pointing to `/` in footer
- [ ] Mobile header: add `<Link href="/email/compose">` compose icon button alongside the Sheet trigger
- [ ] Add `title` tooltip attributes to folder links for collapsed state accessibility

### Relevant Context
- `frontend/src/app/email/layout.tsx` — full file reviewed, `SidebarContent` and `EmailLayout` components

### Status
[x] completed

---

## Sub-Task 5 — Member Inbox: Wired Actions + Enhanced UX

### Intent
The inbox preview pane has no reply/forward/delete buttons wired. The message list has no "Mark All Read" or "Move to Folder". The read/unread visual states are weak. Enhance all of these.

### Expected Outcomes
- Preview pane: Reply button → `/email/compose?reply={id}`, Forward → `/email/compose?forward={id}`, Delete → removes and returns to list
- Preview pane: shows To/CC recipients, full date+time (not just time), flag button
- Message list: "Mark all read" button in toolbar when messages exist
- Message list: right-click context menu OR action icons that appear on hover: star, delete, move
- Unread messages: left border `border-l-2 border-soil-clay` + `bg-soil-clay/5`
- Selected messages toolbar: Move to Folder dropdown using existing folder list
- Empty state: nicer illustration with "Compose your first message" CTA button

### Todo List
- [ ] In preview pane, wire Reply/Forward buttons to `/email/compose?reply=` and `?forward=`
- [ ] In preview pane, add Delete button calling `deleteMessages([id])` then `setPreviewMessage(null)` + refresh
- [ ] In preview pane, add To:/CC: recipient line display (same as `message/[id]/page.tsx`)
- [ ] In message list toolbar, add "Mark All Read" button: iterates visible messages, calls `markAsRead` for each unread
- [ ] Change unread row style from `bg-blue-50/50` to `bg-soil-clay/5 border-l-2 border-soil-clay`
- [ ] On message row hover, show subtle action icons (star, delete) using `group-hover` Tailwind pattern
- [ ] Add Move to Folder: dropdown in bulk toolbar listing all user folders, calls `moveToFolder()`
- [ ] Empty state: replace plain text with centered icon + description + compose CTA button

### Relevant Context
- `frontend/src/app/email/inbox/page.tsx` — full file reviewed
- `frontend/src/lib/email.ts` — `markAsRead`, `moveToFolder`, `deleteMessages`, `toggleStar`

### Status
[x] completed

---

## Sub-Task 6 — Member Compose: Recipient Tags + Auto-complete + Priority

### Intent
The compose form uses plain comma-separated text fields for recipients. Replace with a tag-chip input (type address → press Enter → becomes a chip). Add a priority selector. Add a scheduled send option.

### Expected Outcomes
- To/CC/BCC fields: each address entered becomes a removable chip/tag
- As user types, show autocomplete dropdown from `GET /api/email/contacts/autocomplete?q=`
- Priority selector: Normal / High / Low (mapped to `NORMAL`/`HIGH`/`LOW` in API)
- Scheduled send toggle: date+time picker that sets `scheduledSendAt` field in API call
- Attachment count badge shows `(N files)` in the footer

### Todo List
- [ ] Create `RecipientTagInput` sub-component: controlled array of strings, renders chips + input, handles `Enter`/`Backspace`/`,` keys
- [ ] Wire autocomplete: `useEffect` on input value changes → calls `autocompleteContacts(q)` → renders dropdown list
- [ ] Replace `to`/`cc`/`bcc` string state with `toList`/`ccList`/`bccList` string-array state in compose
- [ ] Add Priority select (`<select>` or shadcn `Select`) with 3 options, pass to `sendEmail()` call
- [ ] Add "Schedule Send" toggle: when enabled shows date+time input; pass `scheduledSendAt` to API (use `saveDraft` + scheduled endpoint or `sendEmail` with schedule field)
- [ ] Update `attachments` footer to show count badge

### Relevant Context
- `frontend/src/app/email/compose/page.tsx` — full file reviewed
- `frontend/src/lib/email.ts` — `sendEmail` signature includes `priority`, `autocompleteContacts`

### Status
[x] completed

---

## Sub-Task 7 — Folder Pages: Unified FolderView Component

### Intent
Sent, Trash, Spam, Archive, Starred pages are 80% identical copy-paste. Extract a `FolderMessageList` shared component, then simplify each page to ~10 lines. This also allows us to add missing features (inline preview pane, hover actions, mark-all-read) once, not 6 times.

### Expected Outcomes
- New component `frontend/src/components/email/FolderMessageList.tsx` handles: fetch, pagination, search, loading/empty states, message row with hover actions, preview pane
- Each of the 6 folder pages (sent, trash, spam, archive, starred, folder/[id]) imports it and passes `folderType` or `folderId` prop
- All folder pages now show the inline preview pane (currently missing from all except inbox)
- Trash page gets "Empty Trash" button that deletes all messages in folder

### Todo List
- [ ] Create `frontend/src/components/email/FolderMessageList.tsx` accepting props: `folderType?`, `folderId?`, `title`, `emptyIcon`, `emptyMessage`, `showDeleteButton?`
- [ ] Move all the list/fetch/search/pagination/preview-pane logic into this component
- [ ] Rewrite `sent/page.tsx`, `trash/page.tsx`, `spam/page.tsx`, `archive/page.tsx`, `starred/page.tsx`, `folder/[id]/page.tsx` to use `<FolderMessageList>`
- [ ] Add "Empty Trash" button to trash page variant (calls `deleteMessages` for all loaded IDs)
- [ ] Ensure Starred page passes `starred=true` query param (already in `getStarredMessages`)

### Relevant Context
- `frontend/src/app/email/sent/page.tsx`, `trash/page.tsx`, `spam/page.tsx`, `archive/page.tsx`, `starred/page.tsx` — all reviewed, all ~87 lines each with identical structure
- `frontend/src/app/email/inbox/page.tsx` — preview pane pattern to extract into the component

### Status
[x] completed

---

## Sub-Task 8 — Search Page: Full-Featured Search

### Intent
The current search page is a stub (100 lines, no real search implementation visible). Build a proper search with filters.

### Expected Outcomes
- Full-text search input calling `GET /api/email/messages?search=q`
- Filter chips: All / Inbox / Sent / Starred / Has Attachments / Unread
- Results show in the same FolderMessageList component with preview pane
- URL query param `?q=` so search is shareable/bookmarkable
- "No results" state with suggestions

### Todo List
- [ ] Rewrite `frontend/src/app/email/search/page.tsx` using `useSearchParams` for `q`
- [ ] Add search input auto-focus on page load
- [ ] Add filter chips using `folder` and `starred`/`hasAttachments`/`unread` params passed to `getMessages`
- [ ] Render results using `<FolderMessageList>` component from Sub-Task 7
- [ ] Update `frontend/src/lib/email.ts` `getMessages` to support `search`, `starred`, `unread` query params

### Relevant Context
- `frontend/src/app/email/search/page.tsx` — current stub to replace
- `frontend/src/lib/email.ts` — `getMessages` function to extend

### Status
[x] completed

---

## Sub-Task 9 — Message Detail Page: Thread View + Full Actions

### Intent
The message detail page (`/email/message/[id]`) is complete but lacks: thread expansion, keyboard shortcuts (R for reply, F for forward, D for delete, E for archive), and a "Next/Previous" navigation button.

### Expected Outcomes
- If message has a `threadId`, load and display the full thread below the message (collapsed by default, "Show N more messages in thread" expander)
- Keyboard shortcuts: `R` → reply, `F` → forward, `D` → delete + go back, `E` → archive
- Prev/Next message navigation arrows in the toolbar (requires passing message list context or using URL params)
- Print button that opens print-friendly view

### Todo List
- [ ] In `message/[id]/page.tsx`, after message load, if `message.threadId`, fetch `getThread(threadId)` and render thread messages below, collapsed
- [ ] Add `useEffect` keyboard listener for R/F/D/E shortcuts
- [ ] Add prev/next navigation: accept optional `prev` and `next` message IDs via search params (compose URL from inbox list)
- [ ] Add print button that calls `window.print()`

### Relevant Context
- `frontend/src/app/email/message/[id]/page.tsx` — full file reviewed
- `frontend/src/app/email/thread/[id]/page.tsx` — existing thread page to merge/integrate
- `frontend/src/lib/email.ts` — `getThread(threadId)` available

### Status
[x] completed

---

## Sub-Task 10 — Settings Page: Auto-Reply + Forwarding + IMAP Credentials

### Intent
The settings page saves `displayName` and `signature` but the UI for auto-reply, forwarding, and aliases (all of which are in the `EmailAccount` type and API) is not rendered. Build them all out.

### Expected Outcomes
- Auto-Reply section: toggle switch, subject input, body textarea, date range pickers (start/end)
- Forwarding section: toggle + email address input + "keep copy" checkbox
- Aliases section: list of aliases, delete button per alias, "Add alias" button
- IMAP section (read-only info panel for Phase 2): server, port, username shown with a "Phase 2" badge
- All saved together via `updateAccount()` call
- Success/error toast notifications

### Todo List
- [ ] Extend `updateAccount` call in settings page to include `autoReplyEnabled`, `autoReplySubject`, `autoReplyBody`, `autoReplyStartsAt`, `autoReplyEndsAt`, `forwardTo`, `forwardKeepCopy`
- [ ] Add Auto-Reply section with `Switch` toggle (or checkbox), inputs shown/hidden based on toggle
- [ ] Add Forwarding section with enable toggle + email input + keep-copy checkbox
- [ ] Add Aliases section: fetch `GET /api/email/aliases`, render list, add `deleteAlias()` button per row, "Add Alias" form
- [ ] Add read-only Phase 2 IMAP info card (grayed out, "Coming in Phase 2" label)
- [ ] Add `lib/email.ts` function: `getAliases()` → `GET /api/email/aliases`, `createAlias()`, `deleteAlias()`

### Relevant Context
- `frontend/src/app/email/settings/page.tsx` — full file reviewed
- `frontend/src/types/email.ts` — `EmailAccount` has all auto-reply/forward fields
- `frontend/src/lib/email.ts` — missing `getAliases`, `createAlias`, `deleteAlias` functions

### Status
[x] completed

---

## Sub-Task 11 — Contacts Page: Full CRUD + Groups

### Intent
The contacts page exists but groups page has limited functionality. Enhance both with: favorite toggle, search/filter, group membership management (add/remove contacts from groups), import from member directory.

### Expected Outcomes
- Contacts list: search by name/email, filter by group, toggle favorite (star icon), sorted favorites first
- Add contact form: modal with name/email/phone/company fields
- Groups page: shows member count, click to see members, add/remove members from group
- "Import from Directory" button: calls member directory API and bulk-creates contacts

### Todo List
- [ ] In `contacts/page.tsx`: add search input filtering by name/email, add "Add Contact" modal, add star toggle calling `toggleFavorite` API
- [ ] Add `toggleFavorite(id)` to `lib/email.ts` → `PUT /api/email/contacts/{id}/favorite`
- [ ] In `contacts/groups/page.tsx`: show member count, click to expand member list, add "Add Member" button calling `addContactToGroup(groupId, contactId)`
- [ ] Add "Import from Directory" button: calls `GET /api/public/members` and creates contacts from result
- [ ] Sort contacts: favorites first, then alphabetical

### Relevant Context
- `frontend/src/app/email/contacts/page.tsx` — full file reviewed
- `frontend/src/app/email/contacts/groups/page.tsx` — full file reviewed
- `frontend/src/lib/email.ts` — `addContactToGroup`, `removeContactFromGroup` already exist

### Status
[x] completed

---

## Files Created/Modified Summary

| File | Action |
|---|---|
| `frontend/src/components/layout/AdminSidebar.tsx` | Add Email nav item + unread badge |
| `frontend/src/app/admin/email/page.tsx` | Full rewrite — tabbed management UI |
| `frontend/src/app/admin/email/inbox/page.tsx` | Full rewrite — theme-consistent split view |
| `frontend/src/app/email/layout.tsx` | Enhance sidebar: starred/scheduled, account address, back link |
| `frontend/src/app/email/inbox/page.tsx` | Wire actions, fix colors, mark-all-read, move-to-folder |
| `frontend/src/app/email/compose/page.tsx` | Recipient tag chips, autocomplete, priority, schedule |
| `frontend/src/components/email/FolderMessageList.tsx` | NEW — shared folder list + preview component |
| `frontend/src/app/email/sent/page.tsx` | Refactor to use FolderMessageList |
| `frontend/src/app/email/trash/page.tsx` | Refactor + Empty Trash button |
| `frontend/src/app/email/spam/page.tsx` | Refactor to use FolderMessageList |
| `frontend/src/app/email/archive/page.tsx` | Refactor to use FolderMessageList |
| `frontend/src/app/email/starred/page.tsx` | Refactor to use FolderMessageList |
| `frontend/src/app/email/folder/[id]/page.tsx` | Refactor to use FolderMessageList |
| `frontend/src/app/email/search/page.tsx` | Full rewrite — real search with filters |
| `frontend/src/app/email/message/[id]/page.tsx` | Thread expansion, keyboard shortcuts, nav |
| `frontend/src/app/email/settings/page.tsx` | Auto-reply, forwarding, aliases, IMAP info |
| `frontend/src/app/email/contacts/page.tsx` | Search, favorites, Add Contact modal |
| `frontend/src/app/email/contacts/groups/page.tsx` | Member management, import from directory |
| `frontend/src/lib/email.ts` | Add: `getAliases`, `createAlias`, `deleteAlias`, `toggleFavorite`, `searchMessages` |

