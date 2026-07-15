# Software Requirements Specification V2 (Augmented)
## Syrian Soil Science Society Website (SSSSY)

---

# PART 1: SYSTEM ARCHITECTURE

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Public Website   │  │  Admin Panel     │  │  Webmail Client  │  │
│  │  (Next.js SSR)    │  │  (Next.js CSR)   │  │  (Next.js CSR)   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼──────────────────────┼──────────────────────┼────────────┘
            │                      │                      │
            │    HTTPS / REST      │    IMAP/SMTP         │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Spring Cloud Gateway / Nginx                     │   │
│  │        JWT Validation, Rate Limiting, Request Logging        │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend Layer (Spring Boot 3.2+)                  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐           │
│  │ Auth     │ │ Content  │ │ Workflow │ │ Media        │           │
│  │ Service  │ │ Service  │ │ Engine   │ │ Service      │           │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤           │
│  │ User     │ │ Page     │ │ State    │ │ File Storage │           │
│  │ Service  │ │ Builder  │ │ Machine  │ │ Optimization │           │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤           │
│  │ Role &   │ │ Category │ │ Review   │ │ Thumbnail    │           │
│  │ Perm.    │ │ Service  │ │ Service  │ │ Generator    │           │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤           │
│  │ Notif.   │ │ Search   │ │ Audit    │ │ CDN          │           │
│  │ Service  │ │ Service  │ │ Service  │ │ Integration  │           │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤           │
│  │ Email    │ │ Calendar │ │ Contact  │ │ Mailing List │           │
│  │ Service  │ │ Service  │ │ Service  │ │ Service      │           │
│  └────┬─────┘ └──────────┘ └──────────┘ └──────────────┘           │
│       │                                                              │
│  ┌────┴─────────────────────────────────────────────────────────┐   │
│  │             Spring Integration (IMAP/SMTP)                    │   │
│  │   JavaMailSessionFactory, EmailReceiver, EmailSender          │   │
│  └────┬─────────────────────────────────────────────────────────┘   │
│       │                                                              │
│       └──────────────────┐                                           │
│                          │                                           │
│              ┌───────────┴──────────┐                                │
│              │   Spring Data JPA    │                                │
│              │   (Hibernate ORM)   │                                │
│              └───────────┬──────────┘                                │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Data Layer                                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐ │
│  │    PostgreSQL      │  │  Object Storage    │  │  Mail Server   │ │
│  │  (Relational DB)   │  │  (MinIO / S3)      │  │  (Mailcow /    │ │
│  │                    │  │                    │  │   Dovecot +    │ │
│  │  - Users           │  │  - Images          │  │   Postfix)     │ │
│  │  - Content         │  │  - Videos          │  │                │ │
│  │  - Workflows       │  │  - PDFs            │  │  - IMAP (read) │ │
│  │  - Email metadata  │  │  - Documents       │  │  - SMTP (send) │ │
│  │  - Audit Logs      │  │  - Email Attachments│  │  - Mailboxes   │ │
│  └────────────────────┘  └────────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack (Detailed)

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Java JDK | 21 LTS |
| Framework | Spring Boot | 3.2+ |
| Security | Spring Security + JWT | Latest |
| ORM | Hibernate / Spring Data JPA | 6.x |
| Database | PostgreSQL | 16 |
| Migration | Flyway | Latest |
| API Docs | SpringDoc OpenAPI / Swagger | Latest |
| Validation | Jakarta Validation | Latest |
| Caching | Redis (Spring Cache) | Latest |
| File Storage | MinIO (S3-compatible) | Latest |
| Search | PostgreSQL Full-Text Search / Elasticsearch | Latest |
| Async | Spring Async / Kafka (for notifications) | Latest |
| Mail Protocol | Spring Integration Mail (IMAP/SMTP) | Latest |
| Mail Client | JavaMail (Jakarta Mail) | Latest |
| Testing | JUnit 5 + Testcontainers | Latest |

### Mail Server
| Component | Technology | Purpose |
|-----------|-----------|---------|
| SMTP Server | Postfix | Outgoing mail delivery |
| IMAP/POP3 Server | Dovecot | Mailbox access, message storage |
| Anti-Spam | Rspamd | Spam filtering, DKIM/SPF/DMARC |
| Anti-Virus | ClamAV | Attachment virus scanning |
| Web Admin | Mailcow UI | Mail server administration panel |
| Mail Queue | RabbitMQ (optional) | Async email processing |

**Orchestrated Solution:** Use **Mailcow** (dockerized) which bundles Postfix + Dovecot + Rspamd + ClamAV + SOGo into a single deployment. This eliminates the need to configure each component individually.

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5+ |
| Styling | Tailwind CSS 3+ |
| UI Components | shadcn/ui (Radix primitives) |
| State Mgmt | React Query (TanStack Query) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios / Fetch API |
| Page Builder | react-dnd / GrapesJS (custom integration) |
| Rich Text | TipTap / Plate (Lexical) |
| Email Editor | TipTap extended with email-specific plugins |
| Maps | Leaflet / Google Maps API |

---

# PART 2: DATABASE DESIGN (PostgreSQL)

## 2.1 Entity-Relationship Diagram (Textual)

### Core Entities & Relationships (from V1 + Email additions)

```
users ──1:N──> content_versions
users ──1:N──> media_files
users ──1:N──> notifications
users ──1:N──> comments
users ──M:N──> roles (via user_roles)
users ──1:1──> member_profiles
users ──1:N──> workflow_actions
users ──1:1──> email_accounts        ← NEW
users ──1:N──> email_messages        ← NEW (sender)
users ──M:N──> email_messages        ← NEW (recipients via email_recipients)
users ──1:N──> email_contacts        ← NEW (personal contacts)
users ──1:N──> contact_groups        ← NEW
users ──1:N──> email_aliases         ← NEW

roles ──M:N──> permissions (via role_permissions)

pages ──1:N──> page_sections
pages ──1:N──> seo_metadata

content_items ──N:1──> categories
content_items ──M:N──> tags (via content_tags)
content_items ──1:N──> content_versions
content_items ──1:1──> workflows (current state)

workflows ──1:N──> workflow_states
workflows ──1:N──> workflow_transitions
workflow_states ──1:N──> workflow_actions

media_files ──1:N──> media_thumbnails

events ──1:N──> event_registrations

job_vacancies ──1:N──> job_applications

board_members ──N:1──> users

email_accounts ──1:N──> email_messages         ← NEW
email_accounts ──1:N──> email_folders          ← NEW
email_accounts ──1:N──> email_rules            ← NEW
email_accounts ──1:N──> email_quota_logs       ← NEW

email_messages ──1:N──> email_recipients       ← NEW
email_messages ──1:N──> email_attachments      ← NEW
email_messages ──N:1──> email_folders          ← NEW
email_messages ──1:N──> email_message_flags    ← NEW

email_contacts ──M:N──> contact_groups         ← NEW (via contact_group_members)
```

## 2.2 New & Modified Tables for Email System

### Table: `email_accounts`
```sql
CREATE TABLE email_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_address       VARCHAR(320) NOT NULL UNIQUE,  -- username@ssssy.org.sy
    username            VARCHAR(100) NOT NULL UNIQUE,   -- mailbox username
    password_hash       VARCHAR(255) NOT NULL,          -- hashed mailbox password
    display_name        VARCHAR(200),
    quota_bytes         BIGINT DEFAULT 1073741824,      -- 1 GB default quota
    used_bytes          BIGINT DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    auto_reply_enabled  BOOLEAN DEFAULT FALSE,
    auto_reply_subject  VARCHAR(500),
    auto_reply_body     TEXT,
    forward_to          VARCHAR(320),                   -- email forwarding address
    forward_keep_copy   BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX idx_email_accounts_email ON email_accounts(email_address);
CREATE INDEX idx_email_accounts_active ON email_accounts(is_active);
```

### Table: `email_folders`
```sql
CREATE TABLE email_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES email_folders(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    folder_type     VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
                    -- INBOX, SENT, DRAFTS, TRASH, SPAM, ARCHIVE, CUSTOM
    system_folder   BOOLEAN DEFAULT FALSE,   -- system folders cannot be deleted/renamed
    sort_order      INTEGER DEFAULT 0,
    unread_count    INTEGER DEFAULT 0,
    total_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (account_id, name, parent_id)
);

CREATE INDEX idx_email_folders_account ON email_folders(account_id);
CREATE INDEX idx_email_folders_parent ON email_folders(parent_id);
```

### Table: `email_messages`
```sql
CREATE TABLE email_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    folder_id           UUID NOT NULL REFERENCES email_folders(id),

    -- Message identifiers
    message_id          VARCHAR(500),                    -- RFC 2822 Message-ID
    in_reply_to         VARCHAR(500),                    -- parent message for threading
    references_header   TEXT,                            -- message references for threading
    thread_id           UUID,                            -- generated thread grouping ID

    -- Envelope fields
    sender_address      VARCHAR(320) NOT NULL,
    sender_name         VARCHAR(200),
    reply_to_address    VARCHAR(320),
    reply_to_name       VARCHAR(200),

    -- Content
    subject             VARCHAR(998),
    body_text           TEXT,                            -- plain text body
    body_html           TEXT,                            -- HTML body (MIME-rendered)
    preview_text        VARCHAR(500),                    -- auto-generated preview

    -- Metadata
    size_bytes          INTEGER DEFAULT 0,
    has_attachments     BOOLEAN DEFAULT FALSE,
    attachment_count    INTEGER DEFAULT 0,
    priority            VARCHAR(20) DEFAULT 'NORMAL',    -- LOW, NORMAL, HIGH
    is_read             BOOLEAN DEFAULT FALSE,
    is_flagged          BOOLEAN DEFAULT FALSE,
    is_starred          BOOLEAN DEFAULT FALSE,
    is_draft            BOOLEAN DEFAULT FALSE,
    is_scheduled        BOOLEAN DEFAULT FALSE,

    -- Scheduling
    scheduled_send_at   TIMESTAMP,
    actually_sent_at    TIMESTAMP,

    -- IMAP UID for sync
    imap_uid            BIGINT,
    imap_folder         VARCHAR(500),

    -- Status tracking for external emails
    delivery_status     VARCHAR(30) DEFAULT 'PENDING',
                        -- PENDING, DELIVERED, BOUNCED, SPAM, FAILED
    bounce_message      TEXT,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_messages_account ON email_messages(account_id);
CREATE INDEX idx_email_messages_folder ON email_messages(folder_id);
CREATE INDEX idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX idx_email_messages_subject ON email_messages(subject);
CREATE INDEX idx_email_messages_created ON email_messages(created_at DESC);
CREATE INDEX idx_email_messages_sender ON email_messages(sender_address);
CREATE INDEX idx_email_messages_unread ON email_messages(account_id, folder_id) WHERE is_read = FALSE;
CREATE INDEX idx_email_messages_drafts ON email_messages(account_id) WHERE is_draft = TRUE;
CREATE INDEX idx_email_messages_search ON email_messages USING GIN(
    to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(body_text, '') || ' ' || coalesce(body_html, ''))
);
```

### Table: `email_recipients`
```sql
CREATE TABLE email_recipients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    recipient_type  VARCHAR(20) NOT NULL,   -- TO, CC, BCC
    address         VARCHAR(320) NOT NULL,
    name            VARCHAR(200),
    is_internal     BOOLEAN DEFAULT FALSE,  -- true if recipient is within ssssy.org.sy domain
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_recipients_message ON email_recipients(message_id);
CREATE INDEX idx_email_recipients_address ON email_recipients(address);
```

### Table: `email_attachments`
```sql
CREATE TABLE email_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    filename        VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(200) NOT NULL,
    size_bytes      INTEGER NOT NULL,
    storage_path    VARCHAR(1000) NOT NULL,   -- path in MinIO/S3
    content_id      VARCHAR(500),             -- CID for inline images
    is_inline       BOOLEAN DEFAULT FALSE,    -- inline vs regular attachment
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_attachments_message ON email_attachments(message_id);
```

### Table: `email_message_flags`
```sql
CREATE TABLE email_message_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    flag_type       VARCHAR(30) NOT NULL,
                    -- SEEN, ANSWERED, FLAGGED, DRAFT, DELETED, JUNK, IMPORTANT
    is_set          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (message_id, account_id, flag_type)
);

CREATE INDEX idx_email_flags_message ON email_message_flags(message_id);
```

### Table: `email_contacts` (Personal Address Book)
```sql
CREATE TABLE email_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email           VARCHAR(320) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    display_name    VARCHAR(200),
    company         VARCHAR(200),
    position        VARCHAR(200),
    phone           VARCHAR(50),
    mobile          VARCHAR(50),
    notes           TEXT,
    is_favorite     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (owner_id, email)
);

CREATE INDEX idx_email_contacts_owner ON email_contacts(owner_id);
CREATE INDEX idx_email_contacts_email ON email_contacts(email);
CREATE INDEX idx_email_contacts_name_search ON email_contacts USING GIN(
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(display_name, ''))
);
```

### Table: `contact_groups`
```sql
CREATE TABLE contact_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    color           VARCHAR(20),             -- hex color for UI display
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (owner_id, name)
);

CREATE INDEX idx_contact_groups_owner ON contact_groups(owner_id);
```

### Table: `contact_group_members`
```sql
CREATE TABLE contact_group_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (group_id, contact_id)
);

CREATE INDEX idx_contact_group_members_group ON contact_group_members(group_id);
```

### Table: `distribution_lists` (Organization-wide)
```sql
CREATE TABLE distribution_lists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    email_address   VARCHAR(320) NOT NULL UNIQUE,   -- committee@ssssy.org.sy
    description     TEXT,
    list_type       VARCHAR(50) NOT NULL DEFAULT 'DEPARTMENT',
                    -- DEPARTMENT, COMMITTEE, BOARD, GROUP, ALL_MEMBERS
    is_public       BOOLEAN DEFAULT TRUE,           -- visible to all members
    allow_external  BOOLEAN DEFAULT FALSE,          -- allow non-members to send
    moderator_id    UUID REFERENCES users(id),      -- must approve messages if moderated
    requires_moderation BOOLEAN DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_distribution_lists_email ON distribution_lists(email_address);
```

### Table: `distribution_list_members`
```sql
CREATE TABLE distribution_list_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id         UUID NOT NULL REFERENCES distribution_lists(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_moderator    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (list_id, user_id)
);

CREATE INDEX idx_dist_list_members_list ON distribution_list_members(list_id);
```

### Table: `email_aliases`
```sql
CREATE TABLE email_aliases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    alias_address   VARCHAR(320) NOT NULL UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_aliases_account ON email_aliases(account_id);
```

### Table: `email_rules` (Auto-filtering Rules)
```sql
CREATE TABLE email_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    order_index     INTEGER DEFAULT 0,
    is_enabled      BOOLEAN DEFAULT TRUE,
    stop_processing BOOLEAN DEFAULT FALSE,   -- stop after this rule matches

    -- Match conditions (stored as JSON for flexibility)
    match_all       BOOLEAN DEFAULT TRUE,     -- AND vs OR for conditions
    conditions      JSONB NOT NULL DEFAULT '[]',
        -- [
        --   { "field": "from", "operator": "contains", "value": "example.com" },
        --   { "field": "subject", "operator": "contains", "value": "newsletter" }
        -- ]
    -- Actions (also JSON)
    actions         JSONB NOT NULL DEFAULT '[]',
        -- [
        --   { "action": "move_to_folder", "folder_id": "uuid" },
        --   { "action": "mark_as_read", "value": true },
        --   { "action": "forward_to", "value": "someone@example.com" },
        --   { "action": "delete" },
        --   { "action": "star" }
        -- ]

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_rules_account ON email_rules(account_id);
```

### Table: `email_quota_logs`
```sql
CREATE TABLE email_quota_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    used_bytes_before BIGINT NOT NULL,
    used_bytes_after  BIGINT NOT NULL,
    change_bytes    BIGINT NOT NULL,
    operation       VARCHAR(50) NOT NULL,     -- SEND, RECEIVE, DELETE, EXPUNGE
    message_id      UUID REFERENCES email_messages(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quota_logs_account ON email_quota_logs(account_id);
CREATE INDEX idx_quota_logs_created ON email_quota_logs(created_at);
```

### Table: `email_scheduled_sends`
```sql
CREATE TABLE email_scheduled_sends (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMP NOT NULL,
    status          VARCHAR(30) DEFAULT 'PENDING',
                    -- PENDING, PROCESSING, SENT, FAILED, CANCELLED
    error_message   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at    TIMESTAMP
);

CREATE INDEX idx_scheduled_sends_status ON email_scheduled_sends(status, scheduled_at);
```

### Modified Table: `notifications` (add NEW_EMAIL type)
```sql
-- Add to notification.type enum: NEW_EMAIL, EMAIL_REPLY, EMAIL_MENTION
```

### Modified Table: `site_settings` (add EMAIL group)
```sql
-- Add settings group EMAIL with keys:
-- mail.smtp.host, mail.smtp.port, mail.smtp.username, mail.smtp.password
-- mail.imap.host, mail.imap.port
-- mail.domain, mail.default_quota, mail.max_attachment_size
-- mail.dkim.selector, mail.dkim.private_key
-- mail.spf.record, mail.dmarc.policy
```

---

# PART 3: BACKEND API DESIGN (Updated with Email Module)

## 3.1 API Architecture

**Base URL:** `/api/v1`

**Authentication:** JWT Bearer Token in `Authorization` header

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed",
  "errors": null,
  "meta": {
    "page": 1,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

## 3.2 Complete API Endpoints (V1 + Email additions)

### Authentication Module
```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - Login, returns JWT
POST   /api/v1/auth/refresh           - Refresh JWT token
POST   /api/v1/auth/logout            - Invalidate token
POST   /api/v1/auth/forgot-password   - Send reset email
POST   /api/v1/auth/reset-password    - Reset password with token
POST   /api/v1/auth/verify-email      - Verify email address
GET    /api/v1/auth/me                - Get current user profile
PUT    /api/v1/auth/me                - Update own profile
PUT    /api/v1/auth/me/password       - Change own password
```

### User Management (Admin)
```
GET    /api/v1/users                  - List users (paginated, filterable)
GET    /api/v1/users/{id}             - Get user details
POST   /api/v1/users                  - Create user
PUT    /api/v1/users/{id}             - Update user
DELETE /api/v1/users/{id}             - Deactivate/delete user
PUT    /api/v1/users/{id}/roles       - Update user roles
GET    /api/v1/users/{id}/activities  - Get user activity log
```

### Role & Permission Management
```
GET    /api/v1/roles                  - List all roles
POST   /api/v1/roles                  - Create role
PUT    /api/v1/roles/{id}             - Update role
DELETE /api/v1/roles/{id}             - Delete role
GET    /api/v1/roles/{id}/permissions - Get role permissions
PUT    /api/v1/roles/{id}/permissions - Update role permissions
GET    /api/v1/permissions            - List all permissions
```

### Content Management
```
GET    /api/v1/content                - List content (paginated, filterable)
POST   /api/v1/content                - Create content (draft)
GET    /api/v1/content/{id}           - Get content by ID
GET    /api/v1/content/slug:{slug}    - Get content by slug
PUT    /api/v1/content/{id}           - Update content
DELETE /api/v1/content/{id}           - Soft delete / archive
GET    /api/v1/content/{id}/versions  - Get version history
GET    /api/v1/content/{id}/versions/{version} - Get specific version
PUT    /api/v1/content/{id}/submit    - Submit for review
GET    /api/v1/content/{id}/workflow  - Get workflow status & history
POST   /api/v1/content/{id}/preview   - Generate preview URL
```

### Page Management
```
GET    /api/v1/pages                  - List all pages
POST   /api/v1/pages                  - Create new page
GET    /api/v1/pages/{id}             - Get page with sections
PUT    /api/v1/pages/{id}             - Update page metadata
DELETE /api/v1/pages/{id}             - Delete page
GET    /api/v1/pages/{id}/sections    - Get page sections (ordered)
POST   /api/v1/pages/{id}/sections    - Add section to page
PUT    /api/v1/pages/sections/{id}    - Update section
DELETE /api/v1/pages/sections/{id}    - Remove section
PUT    /api/v1/pages/{id}/sections/reorder - Reorder sections
```

### Category Management
```
GET    /api/v1/categories             - List categories (tree)
POST   /api/v1/categories             - Create category
GET    /api/v1/categories/{id}        - Get category with content count
PUT    /api/v1/categories/{id}        - Update category
DELETE /api/v1/categories/{id}        - Delete category
```

### Tag Management
```
GET    /api/v1/tags                   - List tags
POST   /api/v1/tags                   - Create tag
DELETE /api/v1/tags/{id}              - Delete tag
```

### Media Management
```
GET    /api/v1/media                  - List files (paginated, folder-filtered)
POST   /api/v1/media/upload           - Upload single file (multipart)
POST   /api/v1/media/upload-multiple  - Upload multiple files
GET    /api/v1/media/{id}             - Get file metadata
DELETE /api/v1/media/{id}             - Delete file
PUT    /api/v1/media/{id}             - Update file metadata (alt, caption)
GET    /api/v1/media/folders          - List folders
POST   /api/v1/media/folders          - Create folder
DELETE /api/v1/media/folders/{id}     - Delete folder
```

### Workflow Management
```
GET    /api/v1/workflows              - List workflow definitions
POST   /api/v1/workflows              - Create workflow
GET    /api/v1/workflows/{id}         - Get workflow with states & transitions
PUT    /api/v1/workflows/{id}         - Update workflow
GET    /api/v1/content/{id}/workflow/actions - Get workflow action history
POST   /api/v1/content/{id}/workflow/transition - Execute transition
```

### Events
```
GET    /api/v1/events                 - List events (paginated, filterable)
POST   /api/v1/events                 - Create event
GET    /api/v1/events/{id}            - Get event details
PUT    /api/v1/events/{id}            - Update event
DELETE /api/v1/events/{id}            - Delete event
POST   /api/v1/events/{id}/register   - Register for event
GET    /api/v1/events/{id}/registrations - List registrations (admin)
GET    /api/v1/events/upcoming        - Get upcoming events
```

### Job Vacancies
```
GET    /api/v1/jobs                   - List vacancies
POST   /api/v1/jobs                   - Create vacancy
GET    /api/v1/jobs/{id}              - Get vacancy details
PUT    /api/v1/jobs/{id}              - Update vacancy
DELETE /api/v1/jobs/{id}              - Delete vacancy
POST   /api/v1/jobs/{id}/apply        - Apply for job
GET    /api/v1/jobs/{id}/applications - List applications (admin)
GET    /api/v1/jobs/{id}/applications/{appId} - Get application detail
PUT    /api/v1/applications/{id}/status - Update application status
```

### Board Members
```
GET    /api/v1/board-members          - List board members
POST   /api/v1/board-members          - Add board member
PUT    /api/v1/board-members/{id}     - Update board member
DELETE /api/v1/board-members/{id}     - Remove board member
```

### Members Directory
```
GET    /api/v1/members                - List public members (paginated, searchable)
GET    /api/v1/members/{id}           - Get member public profile
GET    /api/v1/members/search         - Search members by criteria
```

### Contact
```
POST   /api/v1/contact                - Submit contact form
GET    /api/v1/contact/messages       - List messages (admin)
GET    /api/v1/contact/messages/{id}  - Get message detail
PUT    /api/v1/contact/messages/{id}/read - Mark as read
POST   /api/v1/contact/messages/{id}/reply - Reply to message
```

### Search
```
GET    /api/v1/search?q=keyword&type=all&category=...&dateFrom=...&dateTo=...
       - Full-text search across content types
```

### Notifications
```
GET    /api/v1/notifications          - List user notifications (paginated)
GET    /api/v1/notifications/unread-count - Get unread count
PUT    /api/v1/notifications/{id}/read - Mark as read
PUT    /api/v1/notifications/read-all - Mark all as read
```

### Comments
```
GET    /api/v1/content/{id}/comments  - List comments for content
POST   /api/v1/content/{id}/comments  - Add comment
PUT    /api/v1/comments/{id}          - Update comment
DELETE /api/v1/comments/{id}          - Delete comment
PUT    /api/v1/comments/{id}/approve  - Approve comment (admin)
```

### Site Settings
```
GET    /api/v1/settings               - Get all public settings
GET    /api/v1/settings/admin         - Get all settings (admin)
PUT    /api/v1/settings/{key}         - Update setting
GET    /api/v1/settings/group:{group} - Get settings by group
```

### Menu Management
```
GET    /api/v1/menus                  - List menus
POST   /api/v1/menus                  - Create menu
PUT    /api/v1/menus/{id}             - Update menu
DELETE /api/v1/menus/{id}             - Delete menu
GET    /api/v1/menus/{id}/items       - Get menu items (tree)
POST   /api/v1/menus/{id}/items       - Add menu item
PUT    /api/v1/menus/items/{id}       - Update menu item
DELETE /api/v1/menus/items/{id}       - Delete menu item
PUT    /api/v1/menus/{id}/items/reorder - Reorder items
```

### Dashboard / Statistics
```
GET    /api/v1/dashboard/stats        - Get dashboard statistics
GET    /api/v1/dashboard/recent-activity - Get recent activity
GET    /api/v1/dashboard/content-by-status - Content distribution by status
```

### Audit Logs
```
GET    /api/v1/audit-logs             - List audit logs (paginated, filterable)
GET    /api/v1/audit-logs/{id}        - Get audit log detail
```

### ===== EMAIL MODULE (NEW) =====

### Email Account Management (User)
```
GET    /api/v1/email/account                  - Get own email account details
PUT    /api/v1/email/account                  - Update display name, auto-reply, forwarding
PUT    /api/v1/email/account/password         - Change mailbox password
GET    /api/v1/email/account/quota            - Get quota usage
GET    /api/v1/email/account/aliases          - List own aliases
```

### Email Account Management (Admin)
```
GET    /api/v1/admin/email/accounts           - List all email accounts
POST   /api/v1/admin/email/accounts           - Create email account for user
PUT    /api/v1/admin/email/accounts/{id}      - Update account (quota, status)
DELETE /api/v1/admin/email/accounts/{id}      - Disable/delete account
PUT    /api/v1/admin/email/accounts/{id}/password - Reset password
PUT    /api/v1/admin/email/accounts/{id}/quota - Update quota
POST   /api/v1/admin/email/accounts/bulk     - Bulk create accounts
```

### Email Folders
```
GET    /api/v1/email/folders                 - List folders (tree)
POST   /api/v1/email/folders                 - Create custom folder
PUT    /api/v1/email/folders/{id}            - Rename folder
DELETE /api/v1/email/folders/{id}            - Delete folder (with messages)
PUT    /api/v1/email/folders/reorder         - Reorder folders
GET    /api/v1/email/folders/{id}/counts     - Get folder message counts
```

### Email Messages (Core)
```
GET    /api/v1/email/messages                - List messages (paginated, folder-filtered)
       ?folderId=...&page=0&size=20&sort=date,desc
       &search=keyword&unread=true&flagged=true&hasAttachments=true&dateFrom=...&dateTo=...
GET    /api/v1/email/messages/{id}           - Get full message (with body, attachments, recipients)
POST   /api/v1/email/messages                - Send new message (compose)
POST   /api/v1/email/messages/{id}/reply    - Reply to message
POST   /api/v1/email/messages/{id}/reply-all - Reply all
POST   /api/v1/email/messages/{id}/forward  - Forward message
POST   /api/v1/email/messages/draft         - Save draft
PUT    /api/v1/email/messages/draft/{id}    - Update draft
DELETE /api/v1/email/messages/{id}/draft    - Discard draft
POST   /api/v1/email/messages/{id}/send     - Send draft / scheduled email
DELETE /api/v1/email/messages/{id}          - Move to trash
POST   /api/v1/email/messages/batch-action  - Batch operations (delete, move, mark read, mark unread, star, flag)
```

### Email Message Manipulation
```
PUT    /api/v1/email/messages/{id}/read     - Mark as read/unread
PUT    /api/v1/email/messages/{id}/star     - Toggle star
PUT    /api/v1/email/messages/{id}/flag     - Toggle flag
PUT    /api/v1/email/messages/{id}/move     - Move to folder
POST   /api/v1/email/messages/{id}/archive  - Archive message
POST   /api/v1/email/messages/{id}/spam     - Mark as spam
POST   /api/v1/email/messages/{id}/untrash  - Restore from trash
```

### Email Threads
```
GET    /api/v1/email/threads                - List threads (grouped by thread_id)
GET    /api/v1/email/threads/{id}           - Get thread with all messages
```

### Email Attachments
```
GET    /api/v1/email/messages/{id}/attachments         - List attachments
GET    /api/v1/email/messages/{id}/attachments/{attId} - Download attachment
GET    /api/v1/email/messages/{id}/attachments/{attId}/preview - Preview (image/PDF)
```

### Email Contacts (Personal Address Book)
```
GET    /api/v1/email/contacts              - List contacts (searchable)
POST   /api/v1/email/contacts              - Create contact
PUT    /api/v1/email/contacts/{id}         - Update contact
DELETE /api/v1/email/contacts/{id}         - Delete contact
GET    /api/v1/email/contacts/autocomplete - Autocomplete (query param: q=)
POST   /api/v1/email/contacts/import       - Import contacts (vCard/CSV)
GET    /api/v1/email/contacts/export       - Export contacts (vCard/CSV)
```

### Contact Groups
```
GET    /api/v1/email/contact-groups         - List groups
POST   /api/v1/email/contact-groups         - Create group
PUT    /api/v1/email/contact-groups/{id}    - Update group
DELETE /api/v1/email/contact-groups/{id}    - Delete group
POST   /api/v1/email/contact-groups/{id}/members - Add member
DELETE /api/v1/email/contact-groups/{id}/members/{contactId} - Remove member
```

### Organization Directory
```
GET    /api/v1/email/directory              - List all members (searchable)
GET    /api/v1/email/directory/departments  - List departments
GET    /api/v1/email/directory/committees   - List committees
GET    /api/v1/email/directory/autocomplete - Autocomplete across org directory
```

### Distribution Lists (Admin)
```
GET    /api/v1/email/distribution-lists     - List all distribution lists
POST   /api/v1/email/distribution-lists     - Create list
PUT    /api/v1/email/distribution-lists/{id} - Update list
DELETE /api/v1/email/distribution-lists/{id} - Delete list
GET    /api/v1/email/distribution-lists/{id}/members - List members
POST   /api/v1/email/distribution-lists/{id}/members - Add member
DELETE /api/v1/email/distribution-lists/{id}/members/{userId} - Remove member
```

### Email Rules / Filters
```
GET    /api/v1/email/rules                 - List rules for current user
POST   /api/v1/email/rules                 - Create rule
PUT    /api/v1/email/rules/{id}            - Update rule
DELETE /api/v1/email/rules/{id}            - Delete rule
PUT    /api/v1/email/rules/reorder         - Reorder rules
PUT    /api/v1/email/rules/{id}/toggle     - Enable/disable rule
```

### Email Scheduled Sends
```
GET    /api/v1/email/scheduled             - List scheduled sends
POST   /api/v1/email/scheduled             - Schedule an email
DELETE /api/v1/email/scheduled/{id}        - Cancel scheduled send
```

### Email Aliases (Admin)
```
GET    /api/v1/admin/email/aliases         - List all aliases
POST   /api/v1/admin/email/aliases         - Create alias
DELETE /api/v1/admin/email/aliases/{id}    - Delete alias
```

### Email Admin / Server Management
```
GET    /api/v1/admin/email/stats           - Email server statistics
GET    /api/v1/admin/email/storage-report  - Storage usage by user
GET    /api/v1/admin/email/mail-queue      - View mail queue
POST   /api/v1/admin/email/flush-queue     - Flush mail queue
GET    /api/v1/admin/email/logs            - Email server logs
GET    /api/v1/admin/email/bounce-reports  - View bounces
GET    /api/v1/admin/email/spam-reports    - View spam reports
```

---

# PART 4: FRONTEND ARCHITECTURE (Updated with Webmail)

## 4.1 Next.js Project Structure

```
src/
├── app/
│   ├── (public)/                 # Public-facing layout
│   │   ├── page.tsx              # Home page
│   │   ├── about/page.tsx
│   │   ├── president-message/page.tsx
│   │   ├── board/page.tsx
│   │   ├── members/page.tsx
│   │   ├── members/[id]/page.tsx
│   │   ├── news/page.tsx
│   │   ├── news/[slug]/page.tsx
│   │   ├── publications/page.tsx
│   │   ├── publications/[slug]/page.tsx
│   │   ├── events/page.tsx
│   │   ├── events/[id]/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── jobs/[id]/page.tsx
│   │   ├── jobs/[id]/apply/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── search/page.tsx
│   │   └── [slug]/page.tsx        # Dynamic pages from CMS
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/               # Admin dashboard layout
│   │   ├── admin/
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── content/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── media/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── roles/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── applications/page.tsx
│   │   │   ├── board/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── menus/
│   │   │   │   └── page.tsx
│   │   │   ├── workflow/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx
│   │   │   └── email/              ← NEW: Email admin
│   │   │       ├── accounts/page.tsx
│   │   │       ├── aliases/page.tsx
│   │   │       ├── distribution-lists/page.tsx
│   │   │       ├── mail-queue/page.tsx
│   │   │       ├── bounce-reports/page.tsx
│   │   │       └── settings/page.tsx
│   └── (email)/                    ← NEW: Email webmail (authenticated)
│       └── email/
│           ├── layout.tsx          # Email layout (sidebar + message pane)
│           ├── page.tsx            # Redirect to inbox
│           ├── inbox/page.tsx
│           ├── sent/page.tsx
│           ├── drafts/page.tsx
│           ├── trash/page.tsx
│           ├── spam/page.tsx
│           ├── archive/page.tsx
│           ├── starred/page.tsx
│           ├── folder/[id]/page.tsx
│           ├── compose/page.tsx
│           ├── message/[id]/page.tsx
│           ├── thread/[id]/page.tsx
│           ├── search/page.tsx
│           ├── contacts/page.tsx
│           ├── contacts/groups/page.tsx
│           ├── settings/page.tsx    # Email-specific settings
│           └── scheduled/page.tsx
├── components/
│   ├── ui/                        # Base UI components (shadcn)
│   ├── layout/
│   ├── public/
│   ├── page-builder/
│   ├── dashboard/
│   ├── email/                      ← NEW: Email-specific components
│   │   ├── EmailLayout.tsx                # Three-pane layout (sidebar, list, detail)
│   │   ├── EmailSidebar.tsx               # Folder tree + compose button
│   │   ├── EmailList.tsx                  # Message list with selection
│   │   ├── EmailListItem.tsx              # Single message row
│   │   ├── EmailDetail.tsx                # Message reading pane
│   │   ├── EmailCompose.tsx               # Compose/reply/forward editor
│   │   ├── EmailComposeToolbar.tsx        # Formatting toolbar
│   │   ├── EmailRecipientInput.tsx        # Smart recipient input with autocomplete
│   │   ├── EmailAttachmentList.tsx         # Attachment display
│   │   ├── EmailAttachmentUpload.tsx      # Drag-and-drop attachment upload
│   │   ├── EmailThreadView.tsx            # Conversation threading
│   │   ├── EmailSearchBar.tsx             # Search within mailbox
│   │   ├── EmailFilterBar.tsx             # Filter controls
│   │   ├── EmailFolderTree.tsx            # Collapsible folder tree
│   │   ├── EmailQuotaBar.tsx              # Quota usage indicator
│   │   ├── EmailAutoReplySettings.tsx     # Auto-reply configuration
│   │   ├── EmailForwardingSettings.tsx    # Forwarding configuration
│   │   ├── EmailRuleEditor.tsx            # Rule/filter editor
│   │   ├── EmailSignatureEditor.tsx       # Signature editor
│   │   ├── EmailContactList.tsx           # Contact list
│   │   ├── EmailContactForm.tsx           # Add/edit contact
│   │   ├── EmailContactGroupList.tsx      # Group list
│   │   ├── EmailDirectoryBrowser.tsx      # Organization directory
│   │   ├── EmailScheduledList.tsx         # Scheduled sends
│   │   ├── EmailBulkActionBar.tsx         # Batch action toolbar
│   │   ├── EmailPreviewPane.tsx           # Preview toggle (split/horizontal/vertical)
│   │   ├── EmailRichTextEditor.tsx        # Extended TipTap for email
│   │   ├── EmailTemplatePicker.tsx        # Email templates
│   │   └── EmailConversationView.tsx      # Gmail-like conversation view
│   ├── shared/
│   └── forms/
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── pages.ts
│   │   ├── media.ts
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   ├── categories.ts
│   │   ├── tags.ts
│   │   ├── events.ts
│   │   ├── jobs.ts
│   │   ├── board.ts
│   │   ├── members.ts
│   │   ├── contact.ts
│   │   ├── search.ts
│   │   ├── notifications.ts
│   │   ├── comments.ts
│   │   ├── settings.ts
│   │   ├── menus.ts
│   │   ├── workflow.ts
│   │   ├── dashboard.ts
│   │   ├── newsletter.ts
│   │   ├── audit.ts
│   │   └── email.ts                ← NEW: Email API client
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useContent.ts
│   │   ├── ...
│   │   ├── useEmail.ts             ← NEW
│   │   ├── useEmailFolders.ts      ← NEW
│   │   ├── useEmailMessages.ts     ← NEW
│   │   ├── useEmailContacts.ts     ← NEW
│   │   ├── useEmailCompose.ts      ← NEW
│   │   └── useEmailRules.ts        ← NEW
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── emailStore.ts           ← NEW: Selected folder, message, compose state
│   ├── utils/
│   │   ├── ...
│   │   ├── emailUtils.ts           ← NEW: Email parsing, MIME helpers
│   │   └── htmlToText.ts           ← NEW: HTML→plain text conversion
│   └── types/
│       ├── ...
│       └── email.ts                ← NEW: Email type definitions
└── middleware.ts
```

## 4.2 Email Frontend Component Hierarchy

### Email Layout (Three-Pane)
```
EmailLayout
├── EmailSidebar (left, ~280px)
│   ├── ComposeButton
│   ├── EmailFolderTree
│   │   ├── FolderItem (Inbox) [unread count]
│   │   ├── FolderItem (Starred)
│   │   ├── FolderItem (Snoozed)
│   │   ├── FolderItem (Sent)
│   │   ├── FolderItem (Drafts) [draft count]
│   │   ├── Divider
│   │   ├── FolderItem (Custom Folder 1)
│   │   ├── FolderItem (Custom Folder 2)
│   │   └── CreateFolderButton
│   ├── QuotaBar (usage %)
│   └── EmailSettingsButton
├── EmailList (center)
│   ├── EmailSearchBar
│   ├── EmailFilterBar (unread, flagged, attachments, date)
│   ├── EmailBulkActionBar (select all, delete, mark read, move)
│   ├── EmailListItem[]
│   │   ├── Checkbox
│   │   ├── StarIcon
│   │   ├── SenderAvatar
│   │   ├── SenderName
│   │   ├── Subject + PreviewText
│   │   ├── AttachmentIndicator
│   │   ├── DateLabel
│   │   └── UnreadDot
│   └── Pagination / InfiniteScroll
└── EmailDetail (right, or full width on mobile)
    ├── EmailDetailHeader
    │   ├── Subject
    │   ├── ActionButtons (reply, replyAll, forward, archive, delete, spam, print)
    │   └── SenderInfo (avatar, name, email, date)
    ├── EmailDetailBody
    │   ├── EmailAttachmentList
    │   └── HTML Renderer / Plain Text
    ├── EmailThreadView (if threaded)
    └── QuickReplyBox
```

### Compose View
```
EmailCompose (full page or modal)
├── RecipientInput (To, CC, BCC toggle)
│   ├── EmailAutocomplete dropdown
│   ├── ContactChip[]
│   └── GroupChip[]
├── SubjectInput
├── EmailRichTextEditor (TipTap extended)
│   ├── Toolbar
│   │   ├── Bold, Italic, Underline, Strike
│   │   ├── FontSize, FontColor, BackgroundColor
│   │   ├── Lists (OL, UL)
│   │   ├── Indent, Outdent
│   │   ├── Link
│   │   ├── Image (insert inline)
│   │   ├── HorizontalRule
│   │   └── HTML Source Toggle
│   └── Content Area
├── EmailAttachmentUpload (drag & drop zone)
├── ScheduledSendPicker (date/time)
├── SignatureBlock
└── Toolbar
    ├── SendButton
    ├── ScheduleButton
    ├── SaveDraftButton
    ├── DiscardButton
    ├── TemplatePicker
    └── PrioritySelector
```

---

# PART 5: DETAILED MODULE SPECIFICATIONS

## 5.1 Email System Architecture

### Mail Server Integration Strategy

**Option A — Managed Solution (Recommended): Mailcow**

Deploy **Mailcow** as a Docker stack alongside the application. Mailcow bundles:
- **Postfix** — SMTP server for outgoing mail
- **Dovecot** — IMAP/POP3 server for mailbox access
- **Rspamd** — Spam filtering, DKIM signing, SPF/DMARC verification
- **ClamAV** — Virus scanning
- **SOGo** — Webmail (optional, fallback)
- **Admin UI** — Mail server management interface

**Integration Points:**
1. **Provisioning:** Spring Boot creates/destroys mail accounts via Dovecot's Auth SQL or Mailcow API
2. **Sending:** Spring Boot uses JavaMail (SMTP) via Postfix to send emails
3. **Receiving:** Spring Boot polls IMAP (idle/notify) or uses a listener for new mail
4. **Synchronization:** Email metadata (folders, messages, flags) cached in PostgreSQL for fast querying

**Option B — Individual Components:**
- Postfix SMTP + Dovecot IMAP + Rspamd + ClamAV, each configured separately
- More control but higher maintenance overhead

### Email Flow Diagrams

**Sending an Email (Internal):**
```
User clicks Send
  → Frontend calls POST /api/v1/email/messages
  → Backend:
    1. Save message to email_messages (status: PENDING)
    2. Resolve recipients (internal vs external)
    3. Save recipients to email_recipients
    4. Upload attachments to MinIO
    5. Call JavaMailSender via SMTP (Postfix)
    6. On success: update status to SENT, save to Sent folder
    7. For internal recipients: deliver to recipient's Inbox folder
    8. Create notifications for internal recipients
    9. Log quota usage
  → If scheduled: save to email_scheduled_sends instead
     Scheduled job picks it up at the right time
```

**Receiving an Email (via IMAP idle/poll):**
```
Postfix receives email
  → Rspamd filters (spam, virus, DKIM)
  → Dovecot delivers to mailbox
  → Spring Boot IMAP IdleListener picks up new message
  → Parses MIME structure:
    - Headers (From, To, Subject, Date, Message-ID, References)
    - Body parts (text/plain, text/html)
    - Attachments
  → Applies user rules/filters (move to folder, mark read, forward)
  → Saves to email_messages + email_recipients + email_attachments
  → Creates in-app notification
  → Updates folder counts
```

### Email Account Provisioning Flow

```
User is created / Member role assigned:
  → Spring Boot generates email address: firstname.lastname@ssssy.org.sy
  → If duplicate, fallback: username@ssssy.org.sy
  → Create account in Dovecot (via SQL or API)
  → Create system folders: Inbox, Sent, Drafts, Trash, Spam, Archive
  → Create email_accounts record in PostgreSQL
  → Notify user of new email account
```

## 5.2 Authentication & Authorization Module (Updated)

**JWT Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["MEMBER", "REVIEWER"],
  "permissions": ["content:create", "content:read", "workflow:approve", "email:send"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

**New Permissions for Email:**
```
email:access          - Access the email system
email:send            - Send emails
email:receive         - Receive emails (always true for members with accounts)
email:manage-account  - Update auto-reply, forwarding, signature
email:manage-filters  - Create/edit email rules
email:manage-contacts - Manage personal contacts
email:admin           - Administer email system (admin only)
email:manage-lists    - Manage distribution lists
email:view-logs       - View email server logs
```

## 5.3 Content Workflow Engine

*(Unchanged from V1 — see SRS V1 Part 5.2)*

## 5.4 Dynamic Page Builder

*(Unchanged from V1 — see SRS V1 Part 5.3)*

## 5.5 Search Module (Updated for Email)

Search across content types + emails:

```sql
-- Email search combines subject, body, sender, recipient
SELECT m.id, m.subject, SUBSTRING(m.body_text, 1, 200) as excerpt,
       'EMAIL' as type, m.created_at,
       ts_rank(
         to_tsvector('english',
           coalesce(m.subject, '') || ' ' ||
           coalesce(m.body_text, '') || ' ' ||
           coalesce(sender.display_name, '') || ' ' ||
           string_agg(coalesce(r.address, ''), ' ')
         ),
         plainto_tsquery('english', 'soil research')
       ) AS rank
FROM email_messages m
JOIN email_recipients r ON r.message_id = m.id
WHERE m.account_id = :currentUserId
  AND m.is_draft = FALSE
GROUP BY m.id, m.subject, m.body_text, m.created_at, sender.display_name
ORDER BY rank DESC
LIMIT 20;
```

## 5.6 Notification System (Updated for Email)

**New Trigger Points:**
1. New email received → notify recipient
2. Reply received to sent message → notify original sender
3. User mentioned (@username) in email → notify mentioned user
4. Scheduled email sent → notify sender
5. Email bounced → notify sender
6. Quota threshold reached (80%, 90%, 100%) → notify user

## 5.7 Email Security Specifications

### Authentication
- SMTP AUTH (LOGIN, PLAIN, CRAM-MD5) for outgoing mail
- IMAP with SSL/TLS for mailbox access  
- Dovecot Master Password for admin access

### Anti-Spam (Rspamd)
- Bayesian filtering (auto-learning from user spam/not-spam reports)
- Greylisting for unknown senders
- Rate limiting per sender IP
- Header analysis (SPF, DKIM, DMARC)
- URI blacklists (SURBL, DBL)

### Anti-Virus (ClamAV)
- Scan all attachments on receipt
- Block/quarantine messages with infected attachments
- Scan on download (or pre-scan during IMAP delivery)

### Email Authentication Standards
- **DKIM:** Sign all outgoing mail with domain key
- **SPF:** Publish SPF record for ssssy.org.sy
- **DMARC:** Publish DMARC policy (p=quarantine initially, p=reject after validation)
- **MTA-STS:** Publish MTA-STS policy for secure transport

### Encryption
- TLS 1.2+ for all SMTP/IMAP connections
- Opportunistic TLS for incoming SMTP
- Message-level encryption via S/MIME or PGP (optional, Phase 2)

---

# PART 6: PHASED IMPLEMENTATION PLAN (Rearranged)

## Phase 1: Foundation & Core Infrastructure (Weeks 1-3)

### Backend
**Goal:** Spring Boot project setup, database, authentication, user management

#### Tasks:
- [x] **1.1** Initialize Spring Boot project with dependencies
- [x] **1.2** Configure PostgreSQL, Flyway migrations for core tables
- [x] **1.3** Implement JWT authentication, Spring Security
- [x] **1.4** Implement User CRUD (admin)
- [x] **1.5** Implement Role & Permission management
- [x] **1.6** Global exception handler, standardized API response
- [x] **1.7** Audit logging (AOP-based @Auditable)
- [x] **1.8** API documentation with Swagger

### Frontend
- [x] **1.9** Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
- [x] **1.10** Soil-inspired design theme (colors, typography, spacing)
- [x] **1.11** Layout components: Header, Footer, Sidebar
- [x] **1.12** Auth pages: Login, Register, Forgot Password
- [x] **1.13** React Query + Axios client with JWT interceptor
- [x] **1.14** Auth store (Zustand) + protected route middleware

### Deliverables:
- ✅ Spring Boot app with auth
- ✅ Next.js app with login/register
- ✅ Database migration applied
- ✅ JWT auth working end-to-end

---

## Phase 2: Content Management Core (Weeks 4-7)

### Backend
**Goal:** Content CRUD, categories, tags, media management

#### Tasks:
- [x] **2.1** Category CRUD (tree)
- [x] **2.2** Tag CRUD
- [x] **2.3** Content CRUD + versioning
- [x] **2.4** Media management (MinIO/S3, thumbnails, folders)
- [x] **2.5** Content search (PostgreSQL FTS basic)
- [x] **2.6** Content preview (token-based)

### Frontend
- [x] **2.7** Admin layout with sidebar navigation
- [x] **2.8** Content List + DataTable
- [x] **2.9** Content Create/Edit form (TipTap, categories, tags, SEO)
- [x] **2.10** Media Library (grid, upload, folders)
- [x] **2.11** Category & Tag management pages

### Deliverables:
- ✅ Content CRUD working
- ✅ Media upload and management
- ✅ Rich text editing with image embeds
- ✅ Content versioning

---

## Phase 3: Workflow & Publishing (Weeks 8-9)

### Backend
**Goal:** Workflow engine, content review, publishing

#### Tasks:
- [x] **3.1** Workflow definition CRUD
- [x] **3.2** Workflow state machine engine
- [x] **3.3** Review endpoints (submit, approve, reject, request changes)
- [x] **3.4** Scheduled publishing (Spring @Scheduled)
- [x] **3.5** Notification triggers for workflow

### Frontend
- [x] **3.6** Workflow management page
- [x] **3.7** Status badges + action buttons
- [x] **3.8** Review interface (side-by-side, approve/reject)
- [x] **3.9** Notification dropdown (unread badge, list)
- [x] **3.10** Publishing controls (Publish Now / Schedule)

### Deliverables:
- ✅ Content workflow DRAFT→REVIEW→APPROVED→PUBLISHED
- ✅ Reviewers can approve/reject with comments
- ✅ Publishers can publish or schedule
- ✅ Authors notified on status changes

---

## Phase 4: Page Builder & Dynamic CMS (Weeks 10-13)

### Backend
**Goal:** Dynamic page management with section-based layout

#### Tasks:
- [x] **4.1** Page CRUD
- [x] **4.2** Page Section CRUD (JSONB config/data/styling)
- [x] **4.3** Menu CRUD + Menu Items (nested tree)
- [x] **4.4** Site Settings CRUD
- [x] **4.5** SEO metadata + sitemap.xml generation

### Frontend
- [x] **4.6** Page List (admin)
- [x] **4.7** **Page Builder Editor** (drag-and-drop):
  - Canvas, Component Palette (40+ types), Property Panel
  - Styling controls (background, spacing, typography, responsive)
  - Undo/Redo, Preview (mobile/tablet/desktop)
- [x] **4.8** Public PageRenderer
- [x] **4.9** Dynamic [slug] page route
- [x] **4.10** Menu Manager (drag-and-drop tree)
- [x] **4.11** Settings page

### Deliverables:
- ✅ Drag-and-drop page builder
- ✅ 40+ component types
- ✅ Dynamic page rendering
- ✅ Menu management

---

## Phase 5: Public Pages & Features (Weeks 14-17)

### Backend
**Goal:** Events, jobs, members, board, contact

#### Tasks:
- [x] **5.1** Event CRUD + registration
- [x] **5.2** Job Vacancy CRUD + application management
- [x] **5.3** Board Members CRUD
- [x] **5.4** Member Directory + Profile management
- [x] **5.5** Contact Message handling
- [x] **5.6** Newsletter subscription
- [x] **5.7** Comments (optional)
- [x] **5.8** Dashboard statistics API

### Frontend
- [x] **5.9** Home Page (hero, news, events, stats, partners, CTA)
- [x] **5.10** About Us page
- [x] **5.11** President's Message page
- [x] **5.12** Board of Directors page
- [x] **5.13** Members Directory (search, filter, paginate)
- [x] **5.14** Member Profile (public)
- [x] **5.15** News & Announcements pages
- [x] **5.16** Publications pages
- [x] **5.17** Events pages (+ registration form)
- [x] **5.18** Job Vacancies pages (+ application form)
- [x] **5.19** Contact Us page
- [x] **5.20** Search Results page
- [x] **5.21** Dashboard home (admin)

### Deliverables:
- ✅ All public pages functional
- ✅ Events with registration
- ✅ Job applications working
- ✅ Member directory searchable

---

## Phase 6: Internal Email & Messaging System (Weeks 18-22)

### Infrastructure — Mail Server Deployment
- [x] **6.1** Deploy Mailcow Docker stack (Postfix + Dovecot + Rspamd + ClamAV)
- [x] **6.2** Configure domain (ssssy.org.sy), DKIM, SPF, DMARC DNS records
- [x] **6.3** Configure Dovecot Auth SQL for account provisioning
- [x] **6.4** Configure Rspamd for spam/virus filtering
- [x] **6.5** Configure TLS certificates (Let's Encrypt)
- [x] **6.6** Test SMTP/IMAP connectivity from Spring Boot

### Backend — Email Service Layer
- [x] **6.7** Implement EmailAccountService
  - Create account (Dovecot SQL + email_accounts)
  - Disable/delete account
  - Password reset
  - Quota tracking
- [x] **6.8** Implement EmailFolderService
  - System folder creation on account setup
  - Custom folder CRUD
  - Folder counts (unread, total)
  - IMAP folder sync
- [x] **6.9** Implement EmailReceiveService
  - IMAP IDLE listener for real-time new mail detection
  - MIME message parser (Jakarta Mail)
  - Save parsed message to email_messages + recipients + attachments
  - Apply user rules/filters
  - Update folder counts
- [x] **6.10** Implement EmailSendService
  - Compose MIME message (multipart for attachments)
  - SMTP delivery via Postfix
  - Internal delivery (direct DB insert for same-domain recipients)
  - Scheduled send via email_scheduled_sends + cron job
- [x] **6.11** Implement EmailContactService
  - Personal contacts CRUD
  - Contact groups CRUD
  - Organization directory (from users + member_profiles)
  - Import/export (vCard, CSV)
- [x] **6.12** Implement EmailRuleService
  - Rule CRUD with JSON conditions/actions
  - Rule executor on incoming mail
  - Supported actions: move to folder, mark read, forward, delete, star
- [x] **6.13** Implement DistributionListService (admin)
  - List CRUD
  - Member management (bulk add from roles/departments)
  - Moderation queue

### Backend — Email API Controllers
- [x] **6.14** Implement EmailAccountController
- [x] **6.15** Implement EmailFolderController
- [x] **6.16** Implement EmailMessageController
- [x] **6.17** Implement EmailComposeController
- [x] **6.18** Implement EmailContactController + ContactGroupController
- [x] **6.19** Implement EmailRuleController
- [x] **6.20** Implement DistributionListController (admin)
- [x] **6.21** Implement EmailAdminController (stats, logs, queue)
- [x] **6.22** Implement EmailSearchController

### Frontend — Email Webmail Interface
- [x] **6.23** Build EmailLayout (three-pane: sidebar, list, detail)
- [x] **6.24** Build EmailSidebar + FolderTree
  - Folder list with unread counts (live-updating via polling)
  - Compose button
  - Quota indicator
  - Drag-and-drop folder reorder
- [x] **6.25** Build EmailList component
  - Infinite scroll pagination
  - Sort by date, sender, subject
  - Filter by unread, flagged, attachments
  - Batch selection (shift+click range)
  - Bulk actions toolbar (delete, mark read, move, spam)
  - Keyboard shortcuts (j/k navigate, Enter open, # delete, s star)
- [x] **6.26** Build EmailDetail component
  - Header with sender info, date, actions
  - HTML email rendering (sanitized, with fallback plain text)
  - Attachment preview/download
  - Quick reply box (inline)
  - Thread view (conversation grouping by References/In-Reply-To headers)
- [x] **6.27** Build EmailCompose component
  - Smart recipient input (autocomplete from contacts + directory)
  - To/CC/BCC toggle
  - Rich text editor (TipTap extended for email)
  - Attachment drag-and-drop upload
  - Save Draft / Send / Schedule buttons
  - Template picker
- [x] **6.28** Build Contacts pages
  - Contact list with search
  - Add/edit contact form
  - Contact group management
  - Organization directory browser
- [x] **6.29** Build Email Settings page
  - Auto-reply configuration
  - Forwarding setup
  - Signature editor
  - Email rules/filters editor (visual condition builder)
- [x] **6.30** Build Email Admin pages
  - Account management (create, disable, reset password, set quota)
  - Alias management
  - Distribution lists
  - Mail queue view
  - Storage usage report
  - Bounce/spam reports
- [x] **6.31** Build Email search with advanced filters
- [x] **6.32** Implement email notification integration
  - New mail notification in global notification dropdown
  - Real-time unread badge on email sidebar icon

### Deliverables:
- ✅ Email server operational (Postfix + Dovecot + Rspamd + ClamAV)
- ✅ DKIM/SPF/DMARC configured
- ✅ Members have email accounts provisioned automatically
- ✅ Full webmail interface (inbox, send, contacts, search)
- ✅ Email rules/filters working
- ✅ Distribution lists working
- ✅ Email admin management pages

---

## Phase 7: Polish, Security & Performance (Weeks 23-24)

### Tasks:
- [x] **7.1** Image optimization pipeline (WebP, responsive srcset)
- [x] **7.2** CDN integration (CloudFront / Cloudflare)
- [x] **7.3** Lazy loading, API caching (Redis)
- [x] **7.4** SSR optimization with ISR
- [x] **7.5** Security audit (XSS, SQL injection, CSRF, rate limiting)
- [x] **7.6** Two-factor authentication (optional)
- [x] **7.7** Sitemap + robots.txt
- [x] **7.8** Performance testing (Lighthouse 90+)
- [x] **7.9** Email security audit (SPF, DKIM, DMARC verification, TLS)
- [x] **7.10** Load testing with email traffic simulation

### Deliverables:
- ✅ Lighthouse 90+
- ✅ CDN + caching
- ✅ Security hardening
- ✅ Email security verified

---

## Phase 8: Testing & Deployment (Weeks 25-26)

### Backend Testing:
- [x] **8.1** Unit tests for service layer (JUnit 5 + Mockito)
- [x] **8.2** Integration tests for repositories (Testcontainers)
- [x] **8.3** API contract tests (Spring MockMvc)
- [x] **8.4** Workflow state machine tests
- [x] **8.5** Email module tests (IMAP/SMTP with GreenMail test server)

### Frontend Testing:
- [x] **8.6** Component unit tests (Testing Library + Vitest)
- [x] **8.7** Email webmail tests (compose, send, receive flow)
- [x] **8.8** E2E tests for critical flows (Cypress/Playwright)

### Deployment:
- [x] **8.9** Dockerize backend + frontend
- [x] **8.10** Docker Compose for full stack (including Mailcow)
- [x] **8.11** CI/CD pipeline (GitHub Actions)
- [x] **8.12** Environment configuration (dev/staging/production)
- [x] **8.13** DNS configuration (domain, MX, SPF, DKIM, DMARC)
- [x] **8.14** Deployment documentation

### Deliverables:
- ✅ Test suite 80%+ coverage
- ✅ Full Docker Compose stack
- ✅ CI/CD pipeline
- ✅ Production deployment with email configured

---

## Phase 9: Training & Handover (Week 27)

- [x] **9.1** Admin user manual (website CMS + email administration)
- [x] **9.2** Member user guide (webmail usage, filters, contacts)
- [x] **9.3** Video walkthroughs
- [x] **9.4** Source code documentation
- [x] **9.5** Transfer to production
- [x] **9.6** Post-deployment support (2 weeks)

---

# PART 7: SPRING BOOT PACKAGE STRUCTURE (Updated)

```
com.ssssy
├── SSSSYApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   ├── CorsConfig.java
│   ├── WebConfig.java
│   ├── StorageConfig.java
│   ├── CacheConfig.java
│   ├── AsyncConfig.java
│   ├── OpenApiConfig.java
│   └── MailConfig.java                    ← NEW: JavaMailSender + IMAP config
├── security/
├── auth/
├── user/
├── content/
├── page/
├── workflow/
├── media/
├── event/
├── job/
├── board/
├── member/
├── email/                                  ← NEW: Full email module
│   ├── api/
│   │   ├── EmailAccountController.java
│   │   ├── EmailFolderController.java
│   │   ├── EmailMessageController.java
│   │   ├── EmailComposeController.java
│   │   ├── EmailContactController.java
│   │   ├── EmailContactGroupController.java
│   │   ├── EmailRuleController.java
│   │   ├── EmailSearchController.java
│   │   ├── DistributionListController.java
│   │   └── EmailAdminController.java
│   ├── domain/
│   │   ├── EmailAccount.java
│   │   ├── EmailFolder.java
│   │   ├── EmailMessage.java
│   │   ├── EmailRecipient.java
│   │   ├── EmailAttachment.java
│   │   ├── EmailMessageFlag.java
│   │   ├── EmailContact.java
│   │   ├── ContactGroup.java
│   │   ├── ContactGroupMember.java
│   │   ├── DistributionList.java
│   │   ├── DistributionListMember.java
│   │   ├── EmailAlias.java
│   │   ├── EmailRule.java
│   │   ├── EmailScheduledSend.java
│   │   └── EmailQuotaLog.java
│   ├── repository/
│   ├── service/
│   │   ├── EmailAccountService.java
│   │   ├── EmailFolderService.java
│   │   ├── EmailMessageService.java
│   │   ├── EmailReceiveService.java       ← NEW: IMAP polling/idle
│   │   ├── EmailSendService.java          ← NEW: SMTP delivery
│   │   ├── EmailComposeService.java
│   │   ├── EmailContactService.java
│   │   ├── EmailRuleService.java
│   │   ├── EmailSearchService.java
│   │   ├── EmailQuotaService.java
│   │   ├── DistributionListService.java
│   │   └── EmailAdminService.java
│   ├── integration/                        ← NEW: Mail server integration
│   │   ├── MailServerProvisioner.java      ← Dovecot Auth SQL
│   │   ├── ImapIdleListener.java           ← Real-time new mail detection
│   │   ├── MimeMessageParser.java          ← MIME → entity converter
│   │   └── MailcowApiClient.java           ← Optional: Mailcow admin API
│   ├── scheduler/                          ← NEW: Scheduled email tasks
│   │   ├── ScheduledEmailSender.java       ← Process email_scheduled_sends
│   │   └── EmailQuotaSyncTask.java         ← Sync quota from Dovecot
│   └── dto/
├── notification/
├── contact/
├── comment/
├── menu/
├── search/
├── setting/
├── dashboard/
├── audit/
├── newsletter/
├── seo/
├── common/
└── migration/
    └── db/migration/
        ├── V1__init_schema.sql
        ├── V2__seed_roles_permissions.sql
        ├── V3__seed_default_workflow.sql
        ├── V4__create_indexes.sql
        ├── V5__seed_settings.sql
        ├── V6__create_email_tables.sql         ← NEW
        ├── V7__seed_email_settings.sql          ← NEW
        └── V8__seed_email_permissions.sql       ← NEW
```

---

# PART 8: FRONTEND PACKAGE STRUCTURE (Detailed, with Email additions)

```
src/
├── app/
│   ├── layout.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── ...
│   │   └── [slug]/page.tsx
│   ├── (auth)/
│   ├── (dashboard)/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── content/
│   │       ├── pages/
│   │       ├── media/
│   │       ├── users/
│   │       ├── roles/
│   │       ├── categories/
│   │       ├── tags/
│   │       ├── events/
│   │       ├── jobs/
│   │       ├── board/
│   │       ├── messages/
│   │       ├── menus/
│   │       ├── workflow/
│   │       ├── settings/
│   │       ├── notifications/
│   │       ├── audit-logs/
│   │       └── email/                          ← NEW
│   │           ├── accounts/page.tsx
│   │           ├── aliases/page.tsx
│   │           ├── distribution-lists/page.tsx
│   │           ├── mail-queue/page.tsx
│   │           ├── bounce-reports/page.tsx
│   │           └── settings/page.tsx
│   └── (email)/                                 ← NEW: Email webmail
│       └── email/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── inbox/page.tsx
│           ├── sent/page.tsx
│           ├── drafts/page.tsx
│           ├── trash/page.tsx
│           ├── spam/page.tsx
│           ├── archive/page.tsx
│           ├── starred/page.tsx
│           ├── folder/[id]/page.tsx
│           ├── compose/page.tsx
│           ├── message/[id]/page.tsx
│           ├── thread/[id]/page.tsx
│           ├── search/page.tsx
│           ├── contacts/page.tsx
│           ├── contacts/groups/page.tsx
│           ├── scheduled/page.tsx
│           └── settings/page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── public/
│   ├── page-builder/
│   ├── dashboard/
│   ├── email/                                     ← NEW: 30+ email components
│   │   ├── EmailLayout.tsx
│   │   ├── EmailSidebar.tsx
│   │   ├── EmailList.tsx
│   │   ├── EmailListItem.tsx
│   │   ├── EmailDetail.tsx
│   │   ├── EmailCompose.tsx
│   │   ├── EmailComposeToolbar.tsx
│   │   ├── EmailRecipientInput.tsx
│   │   ├── EmailAttachmentList.tsx
│   │   ├── EmailAttachmentUpload.tsx
│   │   ├── EmailThreadView.tsx
│   │   ├── EmailSearchBar.tsx
│   │   ├── EmailFilterBar.tsx
│   │   ├── EmailFolderTree.tsx
│   │   ├── EmailQuotaBar.tsx
│   │   ├── EmailAutoReplySettings.tsx
│   │   ├── EmailForwardingSettings.tsx
│   │   ├── EmailRuleEditor.tsx
│   │   ├── EmailSignatureEditor.tsx
│   │   ├── EmailContactList.tsx
│   │   ├── EmailContactForm.tsx
│   │   ├── EmailContactGroupList.tsx
│   │   ├── EmailDirectoryBrowser.tsx
│   │   ├── EmailScheduledList.tsx
│   │   ├── EmailBulkActionBar.tsx
│   │   ├── EmailPreviewPane.tsx
│   │   ├── EmailRichTextEditor.tsx
│   │   ├── EmailTemplatePicker.tsx
│   │   └── EmailConversationView.tsx
│   ├── shared/
│   └── forms/
├── lib/
│   ├── api/
│   │   ├── ...
│   │   └── email.ts                           ← NEW
│   ├── hooks/
│   │   ├── ...
│   │   ├── useEmail.ts                        ← NEW
│   │   ├── useEmailFolders.ts                 ← NEW
│   │   ├── useEmailMessages.ts                ← NEW
│   │   ├── useEmailContacts.ts                ← NEW
│   │   ├── useEmailCompose.ts                 ← NEW
│   │   └── useEmailRules.ts                   ← NEW
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── emailStore.ts                      ← NEW
│   ├── utils/
│   │   ├── ...
│   │   └── emailUtils.ts                      ← NEW
│   └── types/
│       ├── ...
│       └── email.ts                           ← NEW
├── styles/
├── public/
└── middleware.ts
```

---

# PART 9: KEY IMPLEMENTATION NOTES

## 9.1 Critical Design Decisions

1. **Page Builder Data Model**: Store sections as ordered JSON in PostgreSQL. Each section's `config`, `data`, and `styling` are JSONB columns. *(Unchanged from V1)*

2. **Rich Text Editor**: Use **TipTap** for both content editing and email composition. The email editor extends TipTap with features like table insertion, emoticon picker, and HTML source editing.

3. **Workflow Engine**: Lightweight configurable state machine in DB. *(Unchanged from V1)*

4. **Media Storage**: MinIO for both CMS media and email attachments. Email attachments stored with `email/` prefix in the bucket.

5. **Email Integration Approach**: Use a real mail server (Mailcow/Dovecot+Postfix) rather than building SMTP/IMAP from scratch. Spring Boot acts as a client: sending via JavaMail SMTP, receiving via IMAP IDLE. Email metadata is cached in PostgreSQL for fast querying without hitting IMAP for every list operation.

6. **IMAP vs Push**: Use IMAP IDLE extension for real-time email notifications rather than polling. Falls back to periodic polling if IDLE is unavailable.

7. **Threading**: Use the `References` and `In-Reply-To` headers to group messages into conversations. Store `thread_id` on each message for efficient querying.

8. **Search**: PostgreSQL full-text search across email bodies. The email search is scoped to the current user's account for security.

## 9.2 Email Performance Targets

| Metric | Target |
|--------|--------|
| Inbox load (500 messages) | < 1s |
| Email search (10k messages) | < 2s |
| Send email (internal) | < 500ms |
| Send email (external) | < 3s |
| New email notification (IMAP IDLE) | < 5s |
| Attachment upload (10MB) | < 3s |
| Quota usage calculation | < 100ms |

## 9.3 Security Checklist (Updated with Email)

- [x] All passwords hashed with BCrypt (min 10 rounds)
- [x] JWT tokens signed with RS256
- [x] Access token: 15 min, Refresh: 7 days
- [x] Rate limiting on auth endpoints
- [x] Input validation on all endpoints
- [x] SQL injection prevention via JPA
- [x] XSS prevention: CSP header + output encoding
- [x] CSRF protection
- [x] File upload validation (type, size, virus scan)
- [x] RBAC enforced at API level
- [x] Audit logging for sensitive operations
- [x] HTTPS enforcement
- [x] **Email passwords stored hashed (Dovecot SHA512-CRYPT)
- [x] **SMTP AUTH required for outgoing mail
- [x] **IMAP with SSL/TLS only
- [x] **Attachment scanning via ClamAV
- [x] **DKIM signing of all outgoing mail
- [x] **SPF + DMARC enforcement
- [x] **Rspamd spam filtering
- [x] **Rate limiting on SMTP (max connections/hour)
- [x] **Quota enforcement per account

## 9.4 Docker Compose (Development — Full Stack)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ssssy
      POSTGRES_USER: ssssy
      POSTGRES_PASSWORD: ssssy_secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailcow:                                # NEW: Integrated mail server
    image: mailcow/mailcow:latest
    ports:
      - "25:25"       # SMTP
      - "465:465"     # SMTPS
      - "587:587"     # Submission
      - "143:143"     # IMAP
      - "993:993"     # IMAPS
      - "110:110"     # POP3
      - "995:995"     # POP3S
      - "8443:8443"   # Mailcow admin UI
    environment:
      MAILCOW_HOSTNAME: mail.ssssy.org.sy
      MAILCOW_DOMAIN: ssssy.org.sy
      DBNAME: mailcow
      DBUSER: mailcow
      DBPASS: mailcow_secret
    volumes:
      - mailcow_data:/var/lib/mailcow
    depends_on:
      - postgres

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - minio
      - redis
      - mailcow
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/ssssy
      SPRING_DATASOURCE_USERNAME: ssssy
      SPRING_DATASOURCE_PASSWORD: ssssy_secret
      MINIO_URL: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      REDIS_HOST: redis
      # Email configuration
      SPRING_MAIL_HOST: mailcow
      SPRING_MAIL_PORT: 587
      SPRING_MAIL_USERNAME: relay@ssssy.org.sy
      SPRING_MAIL_PASSWORD: relay_password
      SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH: "true"
      SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE: "true"
      SSSSY_EMAIL_IMAP_HOST: mailcow
      SSSSY_EMAIL_IMAP_PORT: 993
      SSSSY_EMAIL_DOMAIN: ssssy.org.sy
      SSSSY_EMAIL_DEFAULT_QUOTA: "1073741824"
      DOVECOT_AUTH_JDBC_URL: jdbc:postgresql://postgres:5432/ssssy
      DOVECOT_AUTH_JDBC_USER: ssssy
      DOVECOT_AUTH_JDBC_PASSWORD: ssssy_secret

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1

volumes:
  postgres_data:
  minio_data:
  mailcow_data:
```

---

# PART 10: FUTURE ENHANCEMENT READINESS

| Future Feature | Extension Point |
|---------------|----------------|
| Multi-language (AR/EN) | Add `language_code` to content_items, pages. i18n library |
| Membership Payments | Add `payments` table, Stripe/PayPal integration |
| Scientific Journal | New `journal_issues`, `journal_articles` entities. Peer review workflow |
| E-learning Platform | New `courses`, `lessons`, `enrollments` entities |
| Online Voting | New `elections`, `candidates`, `votes` entities |
| Discussion Forums | New `forums`, `threads`, `posts` entities. WebSocket real-time |
| AI Search | Replace PostgreSQL FTS with Elasticsearch + vector embeddings |
| ORCID/Google Scholar | OAuth integration in user profile |
| **Microsoft Exchange** | **New `exchange_integration` service. EWS API** |
| **Microsoft 365** | **Graph API integration. OAuth2 + IMAP/SMTP bridge** |
| **Google Workspace** | **Gmail API integration. OAuth2 delegation** |
| **LDAP / Active Directory** | **New `ldap_integration` service. Spring LDAP** |
| **Single Sign-On (SSO)** | **SAML2/OIDC provider (Keycloak). Spring Security SAML** |
| **Mobile Push Notifications** | **Firebase Cloud Messaging integration for email alerts** |
| **Calendar Integration** | **iCal/CalDAV support. New `calendar` module** |
| **Tasks Module** | **New `tasks` entities. Integration with email (create task from email)** |
| **Document Management** | **Extended media module with document editing, versioning, collaboration** |

---

> **Document Version:** 2.0  
> **Last Updated:** June 2026  
> **Prepared for:** AI-Assisted Development  
> **Total Implementation Estimate:** 27 Weeks (6.75 Months) with a team of 2-3 developers  
> **Key Addition in V2:** Internal Email & Messaging System (Phases 6) with full Postfix/Dovecot/Mailcow integration
