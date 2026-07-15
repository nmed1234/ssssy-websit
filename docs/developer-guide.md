# SSSSY Developer Guide

## 1. Architecture Deep Dive

### 1.1 Three-Tier Architecture

```
+-----------------------------------------------------------------------+
|                         PRESENTATION TIER                             |
|                         (Next.js 14 App Router)                       |
|                                                                       |
|  Browser  <-->  Nginx Reverse Proxy  <-->  Next.js Server             |
|     |                                                                 |
|     |  Route groups:                                                  |
|     |  (public)/   - Public pages (/, /news, /events, /jobs, ...)     |
|     |  auth/       - /auth/login, /auth/register, ...                 |
|     |  admin/      - /admin/users, /admin/content, /admin/email, ...  |
|     |  email/      - /email/inbox, /email/compose, /email/settings    |
|     |                                                                 |
+-----------------------------------------------------------------------+
          |  HTTP/HTTPS (Axios)
          v
+-----------------------------------------------------------------------+
|                         API TIER                                     |
|                         (Spring Boot 3.2)                             |
|                                                                       |
|  Filter Chain:                                                        |
|  RateLimitFilter (Bucket4j) -> JwtAuthenticationFilter               |
|  -> DispatcherServlet -> Controller (@PreAuthorize)                   |
|     -> Service (@Transactional, @Async) -> Repository (Spring Data)   |
|                                                                       |
|  WebSocket: STOMP over SockJS (/ws endpoint)                          |
|  - /topic/comments (broadcast)                                        |
|  - /queue/notifications (user-specific)                               |
|  - /app/comments/* (client->server)
|
+-----------------------------------------------------------------------+
          |
          v
+-----------------------------------------------------------------------+
|                         DATA TIER                                    |
|                                                                       |
|  PostgreSQL 16 - Primary database (Flyway migrations)                 |
|  Redis         - Caching layer (publicContent, events, categories)    |
|  MinIO/S3      - File storage (media uploads, email attachments)      |
|  Local FS      - Fallback storage (uploads/)                          |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 1.2 Request Lifecycle

```
Browser
  |
  v
Nginx (port 80/443 -> proxy_pass http://localhost:3000)
  |
  v
Next.js App Router
  |-- Static pages (/_next/static) served directly
  |-- /api/* routes proxied to Spring Boot (via rewrites in next.config.js)
  |-- Server Components render on server
  |
  v
Spring Boot (port 8080)
  |
  v
RateLimitFilter (Bucket4j token bucket, 100 burst / 30 refill per min)
  |-- IP-based rate limiting via X-Forwarded-For or RemoteAddr
  |-- Returns 429 Too Many Requests if exceeded
  |
  v
JwtAuthenticationFilter (extends OncePerRequestFilter)
  |-- Extracts Bearer token from Authorization header
  |-- Validates JWT (HMAC-SHA256 via jjwt library)
  |-- Loads UserDetails from CustomUserDetailsService
  |-- Sets SecurityContextHolder authentication
  |
  v
DispatcherServlet -> HandlerMapping -> Controller
  |-- @PreAuthorize checked by MethodSecurityInterceptor
  |-- Jakarta Validation (@Valid) on request body
  |
  v
@Service (@Transactional)
  |-- Business logic, permission checks, event publishing
  |-- @Async for email sending, notifications
  |
  v
@Repository (Spring Data JPA)
  |-- Hibernate ORM -> PostgreSQL
  |-- Redis cache hits on @Cacheable
  |
  v
PostgreSQL Database
```


## 2. Complete API Endpoint Reference

All responses wrapped in ApiResponse: { "success": bool, "message": string, "data": T, "timestamp": string }
Auth legend: None=public, Auth=any authenticated user, Roles=role-based access.

### 2.1 Authentication (AuthController — /api/auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login, returns JWT pair |
| POST | /api/auth/refresh | None | Rotate refresh token |
| POST | /api/auth/logout | Auth | Invalidate session |
| GET | /api/auth/me | Auth | Get current user profile |
| PUT | /api/auth/me | Auth | Update own profile |
| PUT | /api/auth/me/password | Auth | Change own password |
| POST | /api/auth/forgot-password | None | Send password reset email |
| POST | /api/auth/reset-password | None | Reset password with token |
| POST | /api/auth/verify-email | None | Verify email with token |

### 2.2 User Management (UserController — /api/users)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/users | ADMIN | List users (paginated) |
| GET | /api/users/search | ADMIN | Search users by query |
| POST | /api/users | ADMIN | Create user |
| GET | /api/users/{id} | ADMIN | Get user by ID |
| PUT | /api/users/{id} | ADMIN | Update user |
| DELETE | /api/users/{id} | SUPER_ADMIN | Delete user |
| PUT | /api/users/{id}/role | ADMIN | Change user role |
| GET | /api/users/{id}/activities | ADMIN | Get user activity log |

### 2.3 Role Management (RoleController — /api/roles)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/roles | ADMIN | List all roles |
| POST | /api/roles | SUPER_ADMIN | Create role |
| GET | /api/roles/{id} | ADMIN | Get role by ID |
| PUT | /api/roles/{id} | SUPER_ADMIN | Update role |
| DELETE | /api/roles/{id} | SUPER_ADMIN | Delete role |
| GET | /api/roles/{id}/permissions | ADMIN | List role permissions |
| PUT | /api/roles/{id}/permissions | SUPER_ADMIN | Assign permissions to role |
| GET | /api/roles/permissions | ADMIN | List all permissions |

### 2.4 Content Management (ContentController — /api/content)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/content | EDITOR+ | List content (paginated, filterable) |
| POST | /api/content | EDITOR+ | Create content |
| GET | /api/content/{id} | EDITOR+ | Get content by ID |
| PUT | /api/content/{id} | EDITOR+ | Update content |
| DELETE | /api/content/{id} | PUBLISHER+ | Delete content |
| GET | /api/content/slug/{slug} | None | Get content by slug |
| GET | /api/content/search | EDITOR+ | Full-text search |
| GET | /api/content/{id}/versions | EDITOR+ | List version history |
| GET | /api/content/{id}/versions/{version} | EDITOR+ | Get specific version |
| GET | /api/content/{id}/preview | EDITOR+ | Get preview rendering |
| GET | /api/content/{id}/workflow | EDITOR+ | Get workflow state |

### 2.5 Public Content (PublicController — /api/public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/content | None | List published content (filterable by contentType, categorySlug, tagSlug) |
| GET | /api/public/content/featured | None | Get featured content (limit param) |
| GET | /api/public/content/{slug} | None | Get published content by slug |
| GET | /api/public/content/types/{contentType} | None | Get published by type (ARTICLE, EVENT, PAGE) |
| GET | /api/public/search | None | Full-text search (q param) |
| GET | /api/public/search/suggestions | None | Search autocomplete suggestions |

### 2.6 Categories (CategoryController — /api/categories)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/categories | None | List all categories |
| GET | /api/categories/{id} | None | Get category by ID |
| POST | /api/categories | EDITOR+ | Create category |
| PUT | /api/categories/{id} | EDITOR+ | Update category |
| DELETE | /api/categories/{id} | ADMIN | Delete category |

### 2.7 Tags (TagController — /api/tags)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/tags | None | List all tags |
| GET | /api/tags/{id} | None | Get tag by ID |
| POST | /api/tags | EDITOR+ | Create tag |
| PUT | /api/tags/{id} | EDITOR+ | Update tag |
| DELETE | /api/tags/{id} | ADMIN | Delete tag |

### 2.8 Events (EventController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/events | None | List published events |
| GET | /api/public/events/upcoming | None | List upcoming events |
| GET | /api/public/events/calendar | None | Events by month (year, month params) |
| GET | /api/public/events/{slug} | None | Get event by slug |
| GET | /api/public/events/id/{id} | None | Get event by UUID |
| POST | /api/public/events/{id}/register | Auth | Register for event |
| GET | /api/admin/events | EDITOR+ | List all events |
| POST | /api/admin/events | EDITOR+ | Create event |
| PUT | /api/admin/events/{id} | EDITOR+ | Update event |
| DELETE | /api/admin/events/{id} | PUBLISHER+ | Delete event |
| GET | /api/admin/events/{id}/registrations | EDITOR+ | List event registrations |

### 2.9 Job Vacancies (JobVacancyController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/jobs | None | List published vacancies |
| GET | /api/public/jobs/{slug} | None | Get vacancy by slug |
| GET | /api/public/jobs/id/{id} | None | Get vacancy by UUID |
| GET | /api/admin/jobs | EDITOR+ | List all vacancies |
| POST | /api/admin/jobs | EDITOR+ | Create vacancy |
| PUT | /api/admin/jobs/{id} | EDITOR+ | Update vacancy |
| DELETE | /api/admin/jobs/{id} | PUBLISHER+ | Delete vacancy |

### 2.10 Job Applications (JobApplicationController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/public/jobs/{jobVacancyId}/apply | None | Submit application |
| GET | /api/admin/jobs/{jobVacancyId}/applications | EDITOR+ | List applications for vacancy |
| PUT | /api/admin/jobs/applications/{id}/status | EDITOR+ | Update application status |

### 2.11 Board Members (BoardMemberController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/board-members | None | List active board members |
| GET | /api/admin/board-members | EDITOR+ | List all board members |
| POST | /api/admin/board-members | EDITOR+ | Create board member |
| PUT | /api/admin/board-members/{id} | EDITOR+ | Update board member |
| DELETE | /api/admin/board-members/{id} | PUBLISHER+ | Delete board member |

### 2.12 Comments (CommentController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/content/{contentId}/comments | None | List approved comments for content |
| POST | /api/comments | Auth | Create comment |
| PUT | /api/comments/{id} | Auth | Update own comment |
| GET | /api/admin/comments | EDITOR+ | List all comments (paginated) |
| GET | /api/admin/comments/pending | EDITOR+ | List pending moderation |
| PUT | /api/admin/comments/{id}/approve | EDITOR+ | Approve comment |
| DELETE | /api/admin/comments/{id} | PUBLISHER+ | Delete comment |

### 2.13 Pages (PageController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/pages | None | List published pages |
| GET | /api/public/pages/{slug} | None | Get page by slug |
| GET | /api/public/pages/id/{id} | None | Get page by UUID |
| GET | /api/public/pages/homepage | None | Get homepage |
| GET | /api/public/pages/{slug}/sections | None | Get page sections |
| GET | /api/admin/pages | EDITOR+ | List all pages (paginated) |
| GET | /api/admin/pages/list | EDITOR+ | List all pages (flat) |
| POST | /api/admin/pages | EDITOR+ | Create page |
| PUT | /api/admin/pages/{id} | EDITOR+ | Update page |
| DELETE | /api/admin/pages/{id} | PUBLISHER+ | Delete page |
| POST | /api/admin/pages/{pageId}/sections | EDITOR+ | Add page section |
| PUT | /api/admin/pages/sections/{id} | EDITOR+ | Update section |
| DELETE | /api/admin/pages/sections/{id} | PUBLISHER+ | Delete section |
| PUT | /api/admin/pages/{pageId}/sections/reorder | EDITOR+ | Reorder sections |

### 2.14 Menus (MenuController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/menus | None | List active menus |
| GET | /api/admin/menus | EDITOR+ | List all menus |
| POST | /api/admin/menus | EDITOR+ | Create menu |
| PUT | /api/admin/menus/{id} | EDITOR+ | Update menu |
| DELETE | /api/admin/menus/{id} | PUBLISHER+ | Delete menu |
| GET | /api/admin/menus/{menuId}/items | EDITOR+ | List menu items |
| POST | /api/admin/menus/{menuId}/items | EDITOR+ | Create menu item |
| PUT | /api/admin/menus/items/{id} | EDITOR+ | Update menu item |
| DELETE | /api/admin/menus/items/{id} | PUBLISHER+ | Delete menu item |
| PUT | /api/admin/menus/{menuId}/items/reorder | EDITOR+ | Reorder menu items |

### 2.15 Newsletter (NewsletterController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/public/newsletter/subscribe | None | Subscribe email |
| POST | /api/public/newsletter/unsubscribe | None | Unsubscribe email |
| GET | /api/admin/newsletter/subscribers | EDITOR+ | List subscribers (paginated) |
| DELETE | /api/admin/newsletter/subscribers/{id} | PUBLISHER+ | Remove subscriber |
| POST | /api/admin/newsletter/send | PUBLISHER+ | Send newsletter campaign |

### 2.16 Media Files (MediaController — /api/media)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/media/files | None | List files (folderId filter) |
| GET | /api/media/files/{id} | None | Get file metadata |
| POST | /api/media/files/upload | EDITOR+ | Upload single file (multipart) |
| POST | /api/media/files/upload-multiple | EDITOR+ | Upload multiple files |
| PUT | /api/media/files/{id} | EDITOR+ | Update file metadata |
| DELETE | /api/media/files/{id} | ADMIN | Delete file |
| GET | /api/media/folders | None | List folders |
| POST | /api/media/folders | EDITOR+ | Create folder |
| DELETE | /api/media/folders/{id} | ADMIN | Delete folder |

### 2.17 Contact Submissions (ContactSubmissionController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/public/contact | None | Submit contact form |
| GET | /api/admin/contact | ADMIN | List submissions |
| GET | /api/admin/contact/{id} | ADMIN | Get submission detail |
| DELETE | /api/admin/contact/{id} | ADMIN | Delete submission |

### 2.18 Member Profiles (MemberProfileController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/members | None | List public member profiles |
| GET | /api/public/members/{id} | None | Get member profile |
| GET | /api/admin/members | ADMIN | List all members |
| POST | /api/admin/members | ADMIN | Create member |
| PUT | /api/admin/members/{id} | ADMIN | Update member |
| DELETE | /api/admin/members/{id} | ADMIN | Delete member |

### 2.19 Workflow (WorkflowController — /api/workflow)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/workflow/{contentId}/submit | MEMBER+ | Submit for review |
| POST | /api/workflow/{contentId}/assign | EDITOR+ | Assign reviewer |
| POST | /api/workflow/{contentId}/approve | REVIEWER+ | Approve content |
| POST | /api/workflow/{contentId}/reject | REVIEWER+ | Reject content |
| POST | /api/workflow/{contentId}/request-revision | REVIEWER+ | Request revision |
| POST | /api/workflow/{contentId}/publish | PUBLISHER+ | Publish content |
| POST | /api/workflow/{contentId}/schedule | PUBLISHER+ | Schedule publishing |
| POST | /api/workflow/{contentId}/unpublish | PUBLISHER+ | Unpublish content |
| POST | /api/workflow/{contentId}/back-to-draft | EDITOR+ | Move back to draft |
| POST | /api/workflow/{contentId}/transition | MEMBER+ | Custom state transition |
| GET | /api/workflow/{contentId}/logs | None | Get workflow audit log |
| GET | /api/workflow/{contentId}/actions | None | Get available actions |
| GET | /api/workflow/pending-reviews | REVIEWER+ | Get pending reviews for current user |
| GET | /api/workflow/submitted | EDITOR+ | Get all submitted items |
| GET | /api/workflow/approved | PUBLISHER+ | Get all approved items |
| GET | /api/workflow/definitions | ADMIN | List workflow definitions |
| GET | /api/workflow/definitions/{id} | ADMIN | Get workflow definition |
| GET | /api/workflow/definitions/by-content-type/{contentType} | ADMIN | Get workflow by content type |
| POST | /api/workflow/definitions | ADMIN | Create workflow definition |
| PUT | /api/workflow/definitions/{id} | ADMIN | Update workflow definition |
| DELETE | /api/workflow/definitions/{id} | ADMIN | Delete workflow definition |

### 2.20 SEO Metadata (SeoMetadataController — /api/seo)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/seo/{entityType}/{entityId} | EDITOR+ | Get SEO metadata |
| PUT | /api/seo/{entityType}/{entityId} | EDITOR+ | Upsert SEO metadata |
| DELETE | /api/seo/{id} | ADMIN | Delete SEO metadata |

### 2.21 CRM Contacts (CrmContactController — /api/crm)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/crm/contacts | ADMIN | List contacts |
| POST | /api/crm/contacts | ADMIN | Create contact |
| GET | /api/crm/contacts/{id} | ADMIN | Get contact |
| PUT | /api/crm/contacts/{id} | ADMIN | Update contact |
| DELETE | /api/crm/contacts/{id} | ADMIN | Delete contact |
| GET | /api/crm/contacts/{id}/activities | ADMIN | Get contact activities |

### 2.22 System Config (SystemConfigController — /api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/settings | EDITOR+ | List all settings |
| GET | /api/admin/settings/{key} | EDITOR+ | Get setting by key |
| GET | /api/admin/settings/admin | ADMIN | Get security settings |
| GET | /api/admin/settings/group/{group} | EDITOR+ | Get settings by group |
| PUT | /api/admin/settings | ADMIN | Update setting |
| DELETE | /api/admin/settings/{id} | ADMIN | Delete setting |

### 2.23 Audit Logs (AuditLogController — /api/audit-logs)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/audit-logs | ADMIN | List audit logs (paginated) |
| GET | /api/audit-logs/{id} | ADMIN | Get audit log detail |

### 2.24 Dashboard (DashboardController — /api/admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/dashboard/stats | ADMIN | Get dashboard statistics |
| GET | /api/admin/dashboard/recent-activity | ADMIN | Get recent activity feed |

### 2.25 Email — Admin (EmailAdminController — /api/admin/email)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/email/accounts | ADMIN | List email accounts |
| POST | /api/admin/email/accounts | ADMIN | Create account |
| GET | /api/admin/email/accounts/{id} | ADMIN | Get account |
| PUT | /api/admin/email/accounts/{id} | ADMIN | Update account |
| DELETE | /api/admin/email/accounts/{id} | ADMIN | Delete account |
| PUT | /api/admin/email/accounts/{id}/password | ADMIN | Reset password |
| PUT | /api/admin/email/accounts/{id}/quota | ADMIN | Set quota |
| PUT | /api/admin/email/accounts/{id}/toggle-active | ADMIN | Toggle active |
| POST | /api/admin/email/accounts/bulk | ADMIN | Bulk operation |
| GET | /api/admin/email/accounts/{id}/quota-logs | ADMIN | Get quota logs |
| GET | /api/admin/email/accounts/{id}/scheduled-sends | ADMIN | Get scheduled sends |
| DELETE | /api/admin/email/scheduled-sends/{id} | ADMIN | Cancel scheduled send |
| GET | /api/admin/email/stats | ADMIN | Get email stats |
| GET | /api/admin/email/storage-report | ADMIN | Get storage report |
| GET | /api/admin/email/logs | ADMIN | Get email logs |
| GET | /api/admin/email/aliases | ADMIN | List aliases |
| POST | /api/admin/email/aliases | ADMIN | Create alias |
| DELETE | /api/admin/email/aliases/{id} | ADMIN | Delete alias |
| GET | /api/admin/email/mail-queue | ADMIN | List mail queue |
| POST | /api/admin/email/flush-queue | ADMIN | Flush queue |
| GET | /api/admin/email/bounce-reports | ADMIN | List bounced messages |

### 2.26 Email — User (under /api/email)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/email/folders | Auth | List mailbox folders |
| POST | /api/email/folders | Auth | Create folder |
| PUT | /api/email/folders/{id} | Auth | Update folder |
| DELETE | /api/email/folders/{id} | Auth | Delete folder |
| GET | /api/email/messages | Auth | List messages (folderId filter) |
| GET | /api/email/messages/{id} | Auth | Get message detail |
| PUT | /api/email/messages/{id}/move | Auth | Move message to folder |
| DELETE | /api/email/messages/{id} | Auth | Delete message |
| PUT | /api/email/messages/{id}/read | Auth | Mark as read/unread |
| POST | /api/email/compose | Auth | Send new email |
| POST | /api/email/compose/draft | Auth | Save draft |
| PUT | /api/email/compose/draft/{id} | Auth | Update draft |
| POST | /api/email/compose/forward/{id} | Auth | Forward message |
| POST | /api/email/compose/reply/{id} | Auth | Reply to message |
| POST | /api/email/compose/reply-all/{id} | Auth | Reply-all |
| GET | /api/email/contacts | Auth | List email contacts |
| POST | /api/email/contacts | Auth | Create contact |
| PUT | /api/email/contacts/{id} | Auth | Update contact |
| DELETE | /api/email/contacts/{id} | Auth | Delete contact |
| GET | /api/email/contact-groups | Auth | List contact groups |
| POST | /api/email/contact-groups | Auth | Create group |
| PUT | /api/email/contact-groups/{id} | Auth | Update group |
| DELETE | /api/email/contact-groups/{id} | Auth | Delete group |
| GET | /api/email/account | Auth | Get my email account |
| PUT | /api/email/account/settings | Auth | Update account settings |
| POST | /api/email/account/check-imap | Auth | Test IMAP connection |
| GET | /api/email/rules | Auth | List email rules |
| POST | /api/email/rules | Auth | Create rule |
| PUT | /api/email/rules/{id} | Auth | Update rule |
| DELETE | /api/email/rules/{id} | Auth | Delete rule |
| GET | /api/email/directory | Auth | Search directory |
| GET | /api/email/aliases | Auth | List my aliases |
| POST | /api/email/aliases | Auth | Create alias |
| DELETE | /api/email/aliases/{id} | Auth | Delete alias |

### 2.27 Notifications (NotificationController — /api/notifications)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/notifications | Auth | List my notifications |
| PATCH | /api/notifications/{id}/read | Auth | Mark as read |
| POST | /api/notifications/read-all | Auth | Mark all as read |
| GET | /api/notifications/unread-count | Auth | Get unread count |

### 2.28 Admin Notifications (AdminNotificationController — /api/admin/notifications)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/admin/notifications | ADMIN | Send system notification |

### 2.29 Sitemap (SitemapController — /api/public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/sitemap.xml | None | Generate XML sitemap |

### 2.30 Component Templates (ComponentTemplateController — /api/component-templates)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/component-templates | EDITOR+ | List templates |
| POST | /api/component-templates | EDITOR+ | Create template |
| GET | /api/component-templates/{id} | EDITOR+ | Get template |
| PUT | /api/component-templates/{id} | EDITOR+ | Update template |
| DELETE | /api/component-templates/{id} | PUBLISHER+ | Delete template |

### 2.31 Distribution Lists (DistributionListController — /api/distribution-lists)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/distribution-lists | Auth | List distribution lists |
| POST | /api/distribution-lists | Auth | Create list |
| GET | /api/distribution-lists/{id} | Auth | Get list |
| PUT | /api/distribution-lists/{id} | Auth | Update list |
| DELETE | /api/distribution-lists/{id} | Auth | Delete list |

### 2.32 WebSocket STOMP Endpoints

| Direction | Path | Auth | Description |
|-----------|------|------|-------------|
| Client-Server | /app/comments/new | Auth | Submit comment via WebSocket |
| Client-Server | /app/typing | Auth | Send typing indicator |
| Server-Client | /topic/comments | None | Subscribe to comment broadcasts |
| Server-Client | /user/queue/notifications | Auth | Subscribe to user notifications |

### 2.33 Health Actuator

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /actuator/health | None | Spring Boot health check |
| GET | /actuator/info | None | Application info |

## 3. Database Schema Reference

PostgreSQL 16 with Flyway migrations (V1–V18). All PKs are UUID with default gen_random_uuid(). Timestamps use TIMESTAMP WITH TIME ZONE.

### 3.1 V1: Core User Tables

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt hash) |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'USER' |
| first_name_en | VARCHAR(100) | NOT NULL |
| last_name_en | VARCHAR(100) | NOT NULL |
| first_name_ar | VARCHAR(100) | |
| last_name_ar | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| is_active | BOOLEAN | DEFAULT true |
| is_email_verified | BOOLEAN | DEFAULT false |
| is_2fa_enabled | BOOLEAN | DEFAULT false |
| two_factor_secret | VARCHAR(255) | |
| profile_image_url | VARCHAR(500) | |
| bio_en | TEXT | |
| bio_ar | TEXT | |
| failed_attempts | INTEGER | DEFAULT 0 |
| account_locked_until | TIMESTAMP | |
| last_login_at | TIMESTAMP | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**roles**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| description | VARCHAR(255) | |
| hierarchy_level | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**permissions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| description | VARCHAR(255) | |
| created_at | TIMESTAMP | NOT NULL |

**role_permissions**
| Column | Type | Constraints |
|--------|------|-------------|
| role_id | UUID | PK, FK → roles(id) |
| permission_id | UUID | PK, FK → permissions(id) |

### 3.2 V2: Content & Categories

**categories**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name_en | VARCHAR(100) | NOT NULL |
| name_ar | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| description_en | TEXT | |
| description_ar | TEXT | |
| parent_id | UUID | FK → categories(id) |
| sort_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**tags**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name_en | VARCHAR(100) | NOT NULL |
| name_ar | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |

**content**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| content_type | VARCHAR(20) | NOT NULL (ARTICLE, EVENT, PAGE) |
| title_en | VARCHAR(500) | NOT NULL |
| title_ar | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| description_en | TEXT | |
| description_ar | TEXT | |
| body_en | TEXT | |
| body_ar | TEXT | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' |
| category_id | UUID | FK → categories(id) |
| author_id | UUID | FK → users(id) |
| featured_image_url | VARCHAR(500) | |
| is_featured | BOOLEAN | DEFAULT false |
| published_at | TIMESTAMP | |
| scheduled_at | TIMESTAMP | |
| view_count | INTEGER | DEFAULT 0 |
| meta_title | VARCHAR(255) | |
| meta_description | TEXT | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**content_tags**
| Column | Type | Constraints |
|--------|------|-------------|
| content_id | UUID | PK, FK → content(id) |
| tag_id | UUID | PK, FK → tags(id) |

### 3.3 V3: Workflow Engine

**workflow_definitions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| content_type | VARCHAR(20) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**workflow_states**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| workflow_id | UUID | FK → workflow_definitions(id) |
| name | VARCHAR(100) | NOT NULL |
| label_en | VARCHAR(100) | NOT NULL |
| label_ar | VARCHAR(100) | NOT NULL |
| sort_order | INTEGER | DEFAULT 0 |

**workflow_transitions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| workflow_id | UUID | FK → workflow_definitions(id) |
| from_state_id | UUID | FK → workflow_states(id) |
| to_state_id | UUID | FK → workflow_states(id) |
| name | VARCHAR(100) | NOT NULL |
| required_role | VARCHAR(20) | |

**content_workflow**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| content_id | UUID | FK → content(id), UNIQUE |
| current_state_id | UUID | FK → workflow_states(id) |
| workflow_id | UUID | FK → workflow_definitions(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**workflow_audit_log**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| content_id | UUID | FK → content(id) |
| from_state_id | UUID | FK → workflow_states(id) |
| to_state_id | UUID | FK → workflow_states(id) |
| action | VARCHAR(50) | NOT NULL |
| comment | TEXT | |
| performed_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |

### 3.4 V4: Media & Files

**media**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| filename | VARCHAR(500) | NOT NULL |
| original_filename | VARCHAR(500) | NOT NULL |
| mime_type | VARCHAR(100) | NOT NULL |
| file_size | BIGINT | NOT NULL |
| url | VARCHAR(1000) | NOT NULL |
| thumbnail_url | VARCHAR(1000) | |
| alt_text_en | VARCHAR(500) | |
| alt_text_ar | VARCHAR(500) | |
| uploaded_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.5 V5: Page Builder

**pages**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title_en | VARCHAR(500) | NOT NULL |
| title_ar | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| status | VARCHAR(20) | DEFAULT 'DRAFT' |
| layout | VARCHAR(50) | DEFAULT 'default' |
| meta_title | VARCHAR(255) | |
| meta_description | TEXT | |
| template_id | UUID | FK → page_templates(id) |
| author_id | UUID | FK → users(id) |
| published_at | TIMESTAMP | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**page_components**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| page_id | UUID | FK → pages(id) |
| component_type | VARCHAR(100) | NOT NULL |
| props | JSONB | NOT NULL, DEFAULT '{}' |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 |
| parent_id | UUID | FK → page_components(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**page_templates**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | |
| thumbnail_url | VARCHAR(500) | |
| components | JSONB | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**page_versions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| page_id | UUID | FK → pages(id) |
| version_number | INTEGER | NOT NULL |
| components_snapshot | JSONB | |
| created_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |

### 3.6 V6: Events

**events**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title_en | VARCHAR(500) | NOT NULL |
| title_ar | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| description_en | TEXT | |
| description_ar | TEXT | |
| start_date | TIMESTAMP | NOT NULL |
| end_date | TIMESTAMP | NOT NULL |
| location | VARCHAR(500) | |
| latitude | DOUBLE | |
| longitude | DOUBLE | |
| max_attendees | INTEGER | |
| registration_deadline | TIMESTAMP | |
| is_published | BOOLEAN | DEFAULT false |
| featured_image_url | VARCHAR(500) | |
| organizer_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**event_registrations**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| event_id | UUID | FK → events(id), NOT NULL |
| user_id | UUID | FK → users(id) |
| name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| notes | TEXT | |
| status | VARCHAR(20) | DEFAULT 'PENDING' |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| UNIQUE(event_id, user_id) | | (when user_id not null) |

### 3.7 V7: Jobs

**jobs**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title_en | VARCHAR(500) | NOT NULL |
| title_ar | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| description_en | TEXT | |
| description_ar | TEXT | |
| requirements_en | TEXT | |
| requirements_ar | TEXT | |
| location | VARCHAR(255) | |
| employment_type | VARCHAR(50) | FULL_TIME, PART_TIME, CONTRACT |
| salary_range | VARCHAR(100) | |
| application_deadline | TIMESTAMP | |
| is_published | BOOLEAN | DEFAULT false |
| contact_email | VARCHAR(255) | |
| contact_phone | VARCHAR(20) | |
| created_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**job_applications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| job_id | UUID | FK → jobs(id), NOT NULL |
| name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| cover_letter | TEXT | |
| resume_url | VARCHAR(500) | |
| status | VARCHAR(20) | DEFAULT 'PENDING' |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.8 V8: Board Members

**board_members**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name_en | VARCHAR(200) | NOT NULL |
| name_ar | VARCHAR(200) | NOT NULL |
| position_en | VARCHAR(200) | NOT NULL |
| position_ar | VARCHAR(200) | NOT NULL |
| bio_en | TEXT | |
| bio_ar | TEXT | |
| image_url | VARCHAR(500) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| sort_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| term_start | DATE | |
| term_end | DATE | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.9 V9: Members Directory

**members**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users(id), UNIQUE |
| membership_number | VARCHAR(50) | UNIQUE |
| membership_type | VARCHAR(50) | DEFAULT 'REGULAR' |
| name_en | VARCHAR(200) | NOT NULL |
| name_ar | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| address | TEXT | |
| specialization_en | VARCHAR(500) | |
| specialization_ar | VARCHAR(500) | |
| affiliation_en | VARCHAR(500) | |
| affiliation_ar | VARCHAR(500) | |
| bio_en | TEXT | |
| bio_ar | TEXT | |
| photo_url | VARCHAR(500) | |
| is_active | BOOLEAN | DEFAULT true |
| joined_date | DATE | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.10 V10: Contact Messages

**contact_messages**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| subject | VARCHAR(500) | NOT NULL |
| message | TEXT | NOT NULL |
| phone | VARCHAR(20) | |
| is_read | BOOLEAN | DEFAULT false |
| replied_at | TIMESTAMP | |
| replied_by_id | UUID | FK → users(id) |
| reply_message | TEXT | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.11 V11: Newsletter

**newsletter_subscribers**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(200) | |
| is_active | BOOLEAN | DEFAULT true |
| unsubscribe_token | VARCHAR(255) | UNIQUE, NOT NULL |
| subscribed_at | TIMESTAMP | NOT NULL |
| unsubscribed_at | TIMESTAMP | |

**newsletter_campaigns**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| subject | VARCHAR(500) | NOT NULL |
| body_text | TEXT | |
| body_html | TEXT | |
| from_address | VARCHAR(255) | |
| status | VARCHAR(20) | DEFAULT 'DRAFT' |
| sent_at | TIMESTAMP | |
| scheduled_at | TIMESTAMP | |
| created_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.12 V12: Comments

**comments**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| content_id | UUID | FK → content(id), NOT NULL |
| author_id | UUID | FK → users(id) |
| author_name | VARCHAR(200) | |
| author_email | VARCHAR(255) | |
| body | TEXT | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'PENDING' |
| parent_id | UUID | FK → comments(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.13 V13: Phase 5 Gaps (Notifications + Email + SEO)

**notifications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users(id), NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| body | TEXT | |
| is_read | BOOLEAN | DEFAULT false |
| reference_type | VARCHAR(50) | |
| reference_id | UUID | |
| created_at | TIMESTAMP | NOT NULL |

**notification_preferences**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users(id), UNIQUE |
| email_notifications | BOOLEAN | DEFAULT true |
| in_app_notifications | BOOLEAN | DEFAULT true |
| comment_notifications | BOOLEAN | DEFAULT true |
| content_notifications | BOOLEAN | DEFAULT true |
| event_notifications | BOOLEAN | DEFAULT true |
| newsletter_notifications | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**email_messages**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| from_address | VARCHAR(255) | NOT NULL |
| to_addresses | TEXT | NOT NULL |
| cc_addresses | TEXT | |
| bcc_addresses | TEXT | |
| subject | VARCHAR(500) | NOT NULL |
| body_text | TEXT | |
| body_html | TEXT | |
| status | VARCHAR(20) | DEFAULT 'DRAFT' |
| sent_at | TIMESTAMP | |
| created_by_id | UUID | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**email_templates**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| subject | VARCHAR(500) | NOT NULL |
| body_text | TEXT | |
| body_html | TEXT | |
| variables | TEXT | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**email_rules**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| condition_field | VARCHAR(50) | |
| condition_operator | VARCHAR(20) | |
| condition_value | VARCHAR(255) | |
| action_type | VARCHAR(50) | |
| action_value | VARCHAR(255) | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**seo_metadata**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | NOT NULL |
| meta_title | VARCHAR(255) | |
| meta_description | TEXT | |
| og_title | VARCHAR(255) | |
| og_description | TEXT | |
| og_image_url | VARCHAR(500) | |
| twitter_title | VARCHAR(255) | |
| twitter_description | TEXT | |
| twitter_image_url | VARCHAR(500) | |
| canonical_url | VARCHAR(500) | |
| no_index | BOOLEAN | DEFAULT false |
| no_follow | BOOLEAN | DEFAULT false |
| structured_data | JSONB | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| UNIQUE(entity_type, entity_id) | | |

### 3.14 V14: CRM & Real-time

**crm_contacts**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| organization | VARCHAR(255) | |
| position | VARCHAR(255) | |
| contact_type | VARCHAR(50) | DEFAULT 'GENERAL' |
| relationship_level | VARCHAR(20) | DEFAULT 'cold' |
| notes | TEXT | |
| assigned_to_id | UUID | FK → users(id) |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**crm_activities**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| contact_id | UUID | FK → crm_contacts(id) |
| type | VARCHAR(50) | NOT NULL |
| subject | VARCHAR(500) | NOT NULL |
| description | TEXT | |
| performed_by_id | UUID | FK → users(id) |
| activity_date | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.15 V15: Menus

**menus**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| location | VARCHAR(50) | NOT NULL (HEADER, FOOTER) |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**menu_items**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| menu_id | UUID | FK → menus(id) |
| parent_id | UUID | FK → menu_items(id) |
| label_en | VARCHAR(200) | NOT NULL |
| label_ar | VARCHAR(200) | NOT NULL |
| url | VARCHAR(500) | |
| page_id | UUID | FK → pages(id) |
| sort_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.16 V16: System Config

**system_config**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| config_key | VARCHAR(100) | UNIQUE, NOT NULL |
| config_value | TEXT | |
| description | VARCHAR(500) | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.17 V17: Email Scheduling & Quotas

**email_scheduled_sends**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email_message_id | UUID | FK → email_messages(id) |
| scheduled_at | TIMESTAMP | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'PENDING' |
| sent_at | TIMESTAMP | |
| error_message | TEXT | |
| created_at | TIMESTAMP | NOT NULL |

**email_quota**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users(id), UNIQUE |
| daily_sent | INTEGER | DEFAULT 0 |
| daily_limit | INTEGER | DEFAULT 500 |
| last_reset_at | TIMESTAMP | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 3.18 V18: Audit Logging

**audit_logs**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | |
| action | VARCHAR(50) | NOT NULL |
| changes | JSONB | |
| performed_by_id | UUID | FK → users(id) |
| ip_address | VARCHAR(50) | |
| user_agent | VARCHAR(500) | |
| created_at | TIMESTAMP | NOT NULL |

## 4. Security Model

### 4.1 Authentication Flow

1. User sends POST /api/auth/login with username/password
2. Server validates credentials, checks account lockout, verifies 2FA
3. Returns JWT access token (15 min expiry) + refresh token (7 day expiry)
4. Client stores tokens (httpOnly cookie or localStorage via Axios interceptor)
5. Every API request includes Authorization: Bearer <token> header
6. JwtAuthenticationFilter extracts and validates token on every request
7. Refreshing: POST /api/auth/refresh with refresh token returns new access token

### 4.2 JWT Token Structure

Header: { "alg": "HS256", "typ": "JWT" }
Payload claims:
- sub: user UUID
- username: String
- role: String (e.g., ADMIN)
- iat: issued at (epoch seconds)
- exp: expiration (epoch seconds)

Signing: HMAC-SHA256 with jwt.secret from application.yml

### 4.3 Filter Chain (order matters)

1. SecurityContextHolderFilter — clears context per request
2. RateLimitFilter (Bucket4j) — IP-based rate limiting
3. JwtAuthenticationFilter — JWT extraction and validation
4. ExceptionTranslationFilter — handles auth errors
5. FilterSecurityInterceptor — URL-based authorization

### 4.4 Role Hierarchy (from highest to lowest)

SUPER_ADMIN(100) > ADMIN(80) > PUBLISHER(60) > REVIEWER(40)
> EDITOR(30) > MEMBER(10) > VISITOR(0)

Role checks use RoleHierarchy so ADMIN inherits all permissions of lower roles.

### 4.5 Rate Limiting (Bucket4j)

- Bandwidth: 100 tokens burst, 30 tokens refill per minute
- Key: Client IP (X-Forwarded-For header or RemoteAddr)
- Bucket4j cached in Hazelcast (distributed) with key "rate-limit-bucket:{ip}"
- Returns 429 Too Many Requests with Retry-After header when exceeded

### 4.6 Password Security

- BCrypt with strength 10 (configurable via spring.security.bcrypt.strength)
- Password reset tokens expire after 24 hours
- Account lockout after 5 consecutive failed attempts (15 min lock)
- Minimum password length: 8 characters (validated by PasswordValidator)

### 4.7 2FA (TOTP)

- Google Authenticator compatible (time-based one-time passwords)
- QR code generated on enable, scanned by user
- 30-second window, 6-digit code
- Optional enforcement per role via system config

### 4.8 CSRF & CORS

- CSRF: Disabled for REST API (JWT tokens provide CSRF protection)
- CORS: Allowed origins configured via app.cors.allowed-origins
  (default: http://localhost:3000, http://localhost:3001)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: true (for cookie-based auth fallback)

### 4.9 Additional Security Measures

- Input sanitization: HtmlSanitizer strips dangerous HTML from all user input
- File upload validation: allowed types whitelist, max size limit, virus scanning
- SQL injection: prevented by JPA parameterized queries
- XSS: prevented by Content-Security-Policy headers and HTML sanitization
- Method-level: @PreAuthorize on all mutation endpoints
- Audit logging: AuditAspect logs all entity changes with before/after values

## 5. Frontend Architecture

### 5.1 Tech Stack

- Next.js 14.2+ (App Router, Server Components, RSC)
- TypeScript (strict mode)
- Tailwind CSS 3.x (utility-first, responsive prefixes)
- React Query (TanStack Query v5) for server state
- Zustand for client state (auth, UI preferences)
- Axios for HTTP client with interceptors
- react-i18next for bilingual support (ar/en)
- react-hot-toast for notifications

### 5.2 Route Groups

`
frontend/src/app/
  (public)/          — Public pages (no auth required)
    page.tsx          — Home page
    articles/         — Article listing + detail (by slug)
    events/           — Event listing + detail
    jobs/             — Job listing + detail
    board/            — Board members
    members/          — Members directory
    contact/          — Contact form
    news/             — News listing
    about/            — About page
    search/           — Full-text search
  auth/               — Auth pages
    login/            — Login form
    register/         — Registration form
    forgot-password/  — Password reset flow
    reset-password/   — Set new password
    verify-email/     — Email verification
    two-factor/       — 2FA challenge
  admin/              — Admin panel (role-gated)
    page.tsx          — Admin dashboard
    users/            — User management CRUD
    content/          — Content/articles CRUD
    events/           — Event management
    jobs/             — Job management
    board-members/    — Board member CRUD
    members/          — Members directory admin
    contact/          — Contact messages inbox
    comments/         — Comment moderation
    newsletter/       — Subscriber mgmt + campaigns
    pages/            — Static page editor
    page-builder/     — Drag-drop page builder
    media/            — File manager
    categories/       — Category CRUD
    tags/             — Tag CRUD
    menus/            — Menu builder
    seo/              — SEO metadata editor
    workflows/        — Workflow definitions
    crm/              — CRM contacts + activities
    email/            — Email interface (proxy to /email/*)
    system-config/    — Configuration editor
    audit-logs/       — Audit trail viewer
  email/              — Full email client layout
    inbox/            — Inbox listing
    detail/           — Email detail + reply
    compose/          — Compose new email
    drafts/           — Draft management
    templates/        — Template management
    settings/         — Email sync/config settings
`

### 5.3 Auth Middleware (middleware.ts)

- Reads token from cookie (next-auth.session-token or custom cookie)
- Validates token expiry client-side
- Redirects unauthenticated users from /admin/* to /auth/login
- Redirects authenticated users from /auth/* to /
- Role-based: /admin/* requires ADMIN or above
- Response headers: Security headers (CSP, X-Frame-Options, etc.)

### 5.4 State Management

**React Query (server state)**
- All API data fetched via useQuery/useMutation hooks in src/lib/hooks/
- Cache keys follow [entity, filters] pattern (e.g., ['articles', { page, status }])
- Stale time: 30s default, 5min for public lists, 0 for admin lists
- Mutations: invalidate relevant queries on success
- Optimistic updates for comments, notifications

**Zustand (client state)**
- auth store: user object, tokens, isAuthenticated, login/logout actions
- ui store: sidebar open, theme (light/dark), language (ar/en), font size
- notification store: unread count, notification list
- Composed with persist middleware (localStorage for UI prefs)

### 5.5 API Client (lib/api.ts)

- Base URL from NEXT_PUBLIC_API_URL env var
- Request interceptor: attaches Bearer token from auth store
- Response interceptor: handles 401 → refresh token retry, 403 → redirect, 429 → toast
- Unified error handling with ApiResponse envelope parsing

### 5.6 Component Architecture

`
src/components/
  ui/              — Atomic design primitives (Button, Input, Card, Modal, Table, Badge, etc.)
  layout/          — Layout components (Header, Footer, Sidebar, MobileNav, Breadcrumbs)
  forms/           — Form components (FormField, RichTextEditor, ImageUploader, DatePicker)
  content/         — Content display (ArticleCard, EventCard, JobCard, ContentGrid)
  media/           — Media display (ImageGallery, VideoPlayer, PDFViewer, Lightbox)
  seo/             — SEO components (MetaTags, JsonLd, OGImage)
  comments/        — Comment thread, comment form, moderation UI
  newsletter/      — Subscribe form, campaign builder
  page-builder/    — Drag-drop canvas, component palette, property editor
  email/           — Email viewer, composer, template editor
  crm/             — Contact card, activity timeline
  charts/          — Reusable chart components (Chart.js wrapper)
  common/          — Shared: Pagination, SearchBar, LanguageSwitcher, ThemeToggle, LoadingState, EmptyState, ErrorState
`

### 5.7 i18n / Localization

- react-i18next with ar (Arabic) and en (English) namespaces
- Translation files: public/locales/{ar,en}/common.json, admin.json, email.json
- Language detection: URL query (?lang=ar), cookie, browser Accept-Language
- RTL support: Arabic layout with dir="rtl", mirrored margins/paddings
- All bilingual data fields stored as *_ar / *_en in database
- moment.js with ar-sa locale for Arabic date formatting
- Number formatting: Arabic numerals for ar locale, Western for en

### 5.8 Theme

- Dark mode via Tailwind dark: class on <html>
- Theme toggle (light/dark/system) stored in Zustand ui store
- Persisted in localStorage under 'theme' key
- System preference detection via matchMedia('(prefers-color-scheme: dark)')

### 5.9 Component States

Every list/detail page implements three mandatory visual states:
- **Loading**: Skeleton placeholders (pulsing gray blocks matching layout)
- **Empty**: Centered illustration + message + optional CTA button
- **Error**: Warning banner with retry button + error details

### 5.10 Responsive Breakpoints

- sm: 640px — Mobile landscape
- md: 768px — Tablet
- lg: 1024px — Desktop
- xl: 1280px — Wide desktop
- 2xl: 1536px — Extra wide

Mobile nav: Hamburger menu (visible < lg) with slide-down overlay.

## 6. Configuration Reference

### 6.1 application.yml â€” Key Properties

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ssssy_db
    username: postgres
    password: ${DB_PASSWORD:postgres}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 20

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB

  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

app:
  jwt:
    secret: ${JWT_SECRET:default-secret-change-in-production}
    expiration-ms: 900000
    refresh-expiration-ms: 604800000

  cors:
    allowed-origins: http://localhost:3000,http://localhost:3001

  storage:
    type: local
    local:
      upload-dir: uploads/
    minio:
      endpoint: http://localhost:9000
      access-key: ${MINIO_ACCESS_KEY:minioadmin}
      secret-key: ${MINIO_SECRET_KEY:minioadmin}
      bucket: ssssy-media

  redis:
    enabled: true
    host: localhost
    port: 6379

  rate-limit:
    capacity: 100
    refill-tokens: 30
    refill-period-minutes: 1

  mail:
    host: ${MAIL_HOST:smtp.gmail.com}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
    from-address: noreply@ssssy.org
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

  imap:
    host: ${IMAP_HOST:imap.gmail.com}
    port: ${IMAP_PORT:993}
    username: ${IMAP_USERNAME:}
    password: ${IMAP_PASSWORD:}

logging:
  level:
    org.ssssy: DEBUG
    org.springframework.security: WARN
```

## 7. Error Handling

### 7.1 Global Exception Handler (GlobalExceptionHandler)

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| ResourceNotFoundException | 404 | Entity not found |
| BadRequestException | 400 | Validation/invalid input |
| UnauthorizedException | 401 | Missing/invalid credentials |
| ForbiddenException | 403 | Insufficient permissions |
| ConflictException | 409 | Duplicate resource |
| RateLimitException | 429 | Rate limit exceeded |
| FileStorageException | 500 | Upload/storage failure |
| EmailSendException | 502 | SMTP delivery failure |
| DataIntegrityViolationException | 409 | DB constraint violation |
| MethodArgumentNotValidException | 400 | Bean validation errors |
| AccessDeniedException | 403 | @PreAuthorize rejection |
| AuthenticationException | 401 | Bad credentials |
| Exception (catch-all) | 500 | Unexpected errors |

### 7.2 ApiResponse Envelope

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Error response:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "fieldErrors": [
      { "field": "email", "message": "must be a valid email" }
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 7.3 Validation

- Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, etc.)
- Custom validators: `@ValidPassword`, `@ValidSlug`, `@ValidContentType`
- HTML sanitization via Jsoup (HtmlSanitizer) on all text fields
- File type whitelist: images (jpg, png, gif, webp, svg), documents (pdf, doc, docx), archives (zip)

### 7.4 Audit Logging (AuditAspect)

- @Aspect on all@Service classes annotated with @AuditLog
- Captures: entity type, entity ID, action (CREATE, UPDATE, DELETE), before/after values as JSON
- Records: performed_by (from SecurityContext), IP address, user agent
- Async writes to audit_logs table via @Async
- Excludes: read-only operations, login attempts, health checks

## 8. Scheduled Tasks

### 8.1 ContentSchedulerService (60s cron)

- Queries content WHERE status = 'SCHEDULED' AND scheduled_at <= NOW()
- Sets status to 'PUBLISHED', sets published_at = NOW()
- Creates audit log entry for publish action
- Logs SCHEDULED_CONTENT_PUBLISHED event

### 8.2 EmailScheduledSendService (60s cron)

- Queries email_scheduled_sends WHERE status = 'PENDING' AND scheduled_at <= NOW()
- Sends email via JavaMailSender
- Updates status to 'SENT' or 'FAILED' with error message
- Updates email_messages.status accordingly

### 8.3 EmailSyncService (300s IMAP poll)

- Connects to IMAP inbox via Jakarta Mail
- Fetches unseen messages since last sync
- Parses MIME content (plain text, HTML, attachments)
- Applies email rules (auto-reply, forward, categorize)
- Stores parsed messages in email_messages table
- Downloads and stores attachments via storage service

### 8.4 ContentBackupService (daily at 02:00)

- Exports all published content to JSON backup file
- Stores backup in configured storage (local/MinIO/S3)
- Retention: last 30 backups, auto-deletes older

### 8.5 LogCleanupService (weekly at 03:00)

- Deletes audit_logs older than 90 days
- Deletes email_messages older than 365 days
- Compacts workflow_audit_log (keeps last 50 entries per content)

## 9. File Storage

### 9.1 Storage Abstraction

Interface: StorageService with implementation switching via app.storage.type:

| Type | Implementation | Use Case |
|------|---------------|----------|
| local | LocalStorageService | Development, single-server |
| minio | MinioStorageService | Production with MinIO |
| s3 | S3StorageService | AWS S3 or compatible |

### 9.2 Local Storage

- Root: `app.storage.local.upload-dir` (default: uploads/)
- Structure: `uploads/{entityType}/{yyyy/MM}/{uuid}.{ext}`
- Example: `uploads/articles/2025/01/550e8400-....pdf`
- URLs served via Spring ResourceHandler at /uploads/**
- Maximum file size: 50MB (configurable)

### 9.3 MinIO/S3 Storage

- Bucket: configured via app.storage.minio.bucket
- Path structure: `{entityType}/{yyyy/MM}/{uuid}.{ext}`
- Presigned URLs for temporary access (7 day expiry)
- Public bucket policies for media files
- Multipart upload for files > 100MB

### 9.4 Allowed File Types

| Category | Extensions | Max Size |
|----------|------------|----------|
| Images | jpg, jpeg, png, gif, webp, svg | 10MB |
| Documents | pdf, doc, docx, xls, xlsx, ppt, pptx | 50MB |
| Archives | zip, rar, tar.gz, 7z | 50MB |
| Video | mp4, webm, ogg | 200MB (separate endpoint) |
| Audio | mp3, wav, ogg | 50MB |

### 9.5 Media Entity

After upload, metadata stored in `media` table (see 3.4 V4). Thumbnails auto-generated for images (300px width, maintain aspect ratio).

## 10. Caching Strategy

### 10.1 Cache Configuration (CacheConfig)

| Cache Name | TTL | Purpose |
|------------|-----|---------|
| publicContent | 300s | Published articles, pages, events |
| categories | 600s | Active categories with content counts |
| tags | 600s | Active tags |
| events | 300s | Upcoming and published events |
| boardMembers | 600s | Active board members ordered |
| members | 600s | Public member directory |
| menuCache | 600s | Menu by location |
| systemConfig | 300s | Configuration values |
| rateLimitBuckets | 60s | Rate limit token buckets (Hazelcast) |

### 10.2 Cache Layers

1. **Redis** (primary cache server)
   - Distributed cache, shared across all backend instances
   - Used for: publicContent, categories, events, boardMembers, menuCache
   - Serialization: JSON with Jackson

2. **Hazelcast** (local + distributed)
   - Used for: rateLimitBuckets (near-cache for performance)
   - Embedded in Spring Boot process
   - TCP/IP discovery for multi-node deployments

3. **Spring Cache Abstraction**
   - @Cacheable on all public read services
   - @CachePut on create/update operations
   - @CacheEvict on delete operations
   - @Caching for complex multi-cache operations

### 10.3 Cache Invalidation Rules

| Action | Invalidated Caches |
|--------|-------------------|
| Article created/updated/deleted | publicContent, sitemap |
| Event created/updated/deleted | events, publicContent, sitemap |
| Page created/updated/deleted | publicContent (pages), menuCache, sitemap |
| Category created/updated/deleted | categories, publicContent |
| Tag created/updated/deleted | tags |
| Board member created/updated/deleted | boardMembers |
| Menu item added/updated/deleted | menuCache |
| System config updated | systemConfig |

### 10.4 Sitemap Generation

- Generated dynamically at /api/public/sitemap.xml
- Combines: static pages (/about, /contact, /news), published articles (by slug), published events (by slug)
- Cached with TTL 3600s (1 hour)
- Invalidated on content publish/unpublish

## 11. WebSocket & Real-time

### 11.1 WebSocket Configuration (WebSocketConfig)

- Endpoint: `/ws` with SockJS fallback
- STOMP protocol over WebSocket
- Allowed origins: same as CORS
- Heartbeat: 10s (client), 10s (server)

### 11.2 STOMP Destinations

| Destination | Direction | Purpose |
|-------------|-----------|---------|
| /topic/comments | Server -> Client | New comment broadcasts |
| /topic/notifications | Server -> Client | System-wide announcements |
| /queue/notifications | Server -> Client | User-specific notifications |
| /app/comments/new | Client -> Server | Submit new comment via WS |
| /user/queue/notifications | Server -> Client | Private user notification queue |

### 11.3 WebSocket Interceptor

- Extracts JWT from STOMP CONNECT frame header
- Validates token same as REST (reuses JwtTokenProvider)
- Sets Principal on WebSocket session for @SendToUser

### 11.4 Comment WebSocket Flow

1. Client sends to /app/comments/new with { contentId, body, parentId }
2. Server validates, saves to DB, sets status (AUTO_APPROVED or PENDING)
3. Server broadcasts to /topic/comments (approved) or sends to moderator queue
4. Connected clients receive real-time update
5. React Query subscription updates the comment list

### 11.5 Notification Delivery

- New comment on user's content -> /user/queue/notifications
- Content status change -> /user/queue/notifications (author)
- Event registration confirmation -> /user/queue/notifications
- System announcements -> /topic/notifications
- Persistent fallback: notifications table (polled every 30s as fallback)

### 11.6 Client-Side (Frontend)

- SockJS client connecting to `{API_URL}/ws`
- STOMP over SockJS via @stomp/stompjs library
- Subscription managed in React context (WebSocketProvider)
- Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Connection status displayed as green/red dot in admin header

## 12. i18n / Localization Architecture

### 12.1 Database-Level Bilingual Fields

All content entities store translations as parallel columns:
- title_en / title_ar
- description_en / description_ar
- body_en / body_ar
- name_en / name_ar
- bio_en / bio_ar
- label_en / label_ar

The API returns both language versions. The frontend selects the active language version.

### 12.2 Frontend i18n (react-i18next)

Translation files (JSON):
```
public/locales/
  en/
    common.json      â€” Buttons, labels, nav items, errors
    admin.json       â€” Admin panel labels, CRUD actions
    email.json       â€” Email client translations
    validation.json  â€” Form validation messages
  ar/
    common.json
    admin.json
    email.json
    validation.json
```

### 12.3 Language Detection

Priority order:
1. URL query parameter: ?lang=ar
2. Cookie: i18next=LANG
3. Browser Accept-Language header
4. Fallback: 'en'

### 12.4 RTL Support (Arabic)

- `<html dir="rtl">` when language is Arabic
- Tailwind CSS: rtl: variants for mirrored styles
- All margins/paddings: `ml-4 rtl:mr-4 rtl:ml-0`
- Icons: flipped horizontally in RTL mode
- Text alignment: `text-left rtl:text-right`
- Forms: label placement swapped for RTL

### 12.5 Moment.js Locale

- English: moment.locale('en')
- Arabic: moment.locale('ar-sa') with Arabic numerals
- Date format pattern selection based on language

### 12.6 API Language Header

- Frontend sends `Accept-Language: ar` or `en` header
- Backend uses LocaleContextHolder to resolve messages
- Validation error messages localized in messages.properties files

### 12.7 Number and Currency Formatting

- Arabic locale: Arabic-Indic digits (ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©)
- English locale: Western digits (0123456789)
- Currency: SYP / ظ„.ط³ based on locale

## 13. Testing Guide

### 13.1 Backend Testing (JUnit 5 + Mockito)

Dependencies in pom.xml:
- spring-boot-starter-test (JUnit 5, Mockito, AssertJ)
- spring-security-test (@WithMockUser, SecurityMockMvcRequestPostProcessors)
- com.h2database:h2 (in-memory DB for integration tests)

### 13.2 Unit Test Structure

```
src/test/java/org/ssssy/backend/
  service/
    ContentServiceTest.java
    AuthServiceTest.java
    EmailServiceTest.java
    WorkflowServiceTest.java
    ...
  controller/
    AuthControllerTest.java
    ContentControllerTest.java
    ...
  security/
    JwtTokenProviderTest.java
    RateLimitFilterTest.java
    ...
  repository/
    ContentRepositoryTest.java
    UserRepositoryTest.java
    ...
  config/
    WebSocketConfigTest.java
    CacheConfigTest.java
    ...
```

### 13.3 Testing Patterns

**Service Tests:**
```java
@ExtendWith(MockitoExtension.class)
class ContentServiceTest {
    @Mock private ContentRepository contentRepository;
    @Mock private CategoryRepository categoryRepository;
    @InjectMocks private ContentService contentService;

    @Test
    void createArticle_ShouldReturnArticle_WhenValidInput() {
        // given
        // when
        // then
    }
}
```

**Controller Tests:**
```java
@WebMvcTest(ContentController.class)
class ContentControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private ContentService contentService;

    @Test
    @WithMockUser(roles = "EDITOR")
    void getArticles_ShouldReturnPage_WhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/content/articles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
```

**Integration Tests:**
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ContentIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private TestEntityManager entityManager;

    @Test
    void fullWorkflow_CreateSubmitApprovePublish_ShouldSucceed() {
        // Full integration test
    }
}
```

### 13.4 Frontend Testing

**Jest + React Testing Library:**
```
frontend/src/
  __tests__/
    components/
      Button.test.tsx
      ArticleCard.test.tsx
      LoginForm.test.tsx
    pages/
      home.test.tsx
      articles.test.tsx
    hooks/
      useAuth.test.ts
      useContent.test.ts
    utils/
      api.test.ts
      validation.test.ts
```

**Testing Patterns:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
    it('renders with text and handles click', () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
```

### 13.5 Running Tests

```bash
# Backend â€” all tests
cd backend && mvn test

# Backend â€” specific test class
cd backend && mvn test -Dtest=ContentServiceTest

# Backend â€” skip tests
cd backend && mvn clean package -DskipTests

# Frontend â€” all tests
cd frontend && npm run test

# Frontend â€” watch mode
cd frontend && npm run test:watch

# Frontend â€” coverage
cd frontend && npm run test:coverage

# Frontend â€” lint
cd frontend && npm run lint

# Frontend â€” type check
cd frontend && npx tsc --noEmit
```

### 13.6 Test Data Factories

Backend test utilities in src/test/java/org/ssssy/backend/util/:
- TestDataFactory â€” creates sample User, Content, Event, etc. entities
- EntityUtils â€” helper methods for test entity setup
- JsonUtils â€” JSON serialization helpers for request bodies
- SecurityUtils â€” @WithMockUser custom annotations for role-specific testing
