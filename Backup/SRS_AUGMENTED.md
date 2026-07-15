# Software Requirements Specification (Augmented)
## Syrian Soil Science Society Website (SSSSY)

---

# PART 1: SYSTEM ARCHITECTURE

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Public Website   │  │  Admin Panel     │                 │
│  │  (Next.js SSR)    │  │  (Next.js CSR)   │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │    HTTPS / REST      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Spring Cloud Gateway / Nginx                │   │
│  │     JWT Validation, Rate Limiting, Request Logging   │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer (Spring Boot)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Auth     │ │ Content  │ │ Workflow │ │ Media        │  │
│  │ Service  │ │ Service  │ │ Engine   │ │ Service      │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │ User     │ │ Page     │ │ State    │ │ File Storage │  │
│  │ Service  │ │ Builder  │ │ Machine  │ │ Optimization │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │ Role &   │ │ Category │ │ Review   │ │ Thumbnail    │  │
│  │ Perm.    │ │ Service  │ │ Service  │ │ Generator    │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │ Notif.   │ │ Search   │ │ Audit    │ │ CDN          │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Integration  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │   Spring Data JPA   │                        │
│              │   (Hibernate ORM)   │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌────────────────────┐  ┌────────────────────┐             │
│  │    PostgreSQL      │  │  Object Storage    │             │
│  │  (Relational DB)   │  │  (MinIO / S3)      │             │
│  │                    │  │                    │             │
│  │  - Users           │  │  - Images          │             │
│  │  - Content         │  │  - Videos          │             │
│  │  - Workflows       │  │  - PDFs            │             │
│  │  - Audit Logs      │  │  - Documents       │             │
│  └────────────────────┘  └────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
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
| Testing | JUnit 5 + Testcontainers | Latest |

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
| Maps | Leaflet / Google Maps API |

---

# PART 2: DATABASE DESIGN (PostgreSQL)

## 2.1 Entity-Relationship Diagram (Textual)

### Core Entities & Relationships

```
users ──1:N──> content_versions
users ──1:N──> media_files
users ──1:N──> notifications
users ──1:N──> comments
users ──M:N──> roles (via user_roles)
users ──1:1──> member_profiles
users ──1:N──> workflow_actions

roles ──M:N──> permissions (via role_permissions)

pages ──1:N──> page_sections
pages ──1:N──> seo_metadata

page_sections ──1:1──> section_component_data

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
```

## 2.2 Complete Table Definitions

### Table: `users`
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    username        VARCHAR(100) UNIQUE,
    phone           VARCHAR(50),
    avatar_url      VARCHAR(500),
    bio             TEXT,
    position        VARCHAR(255),         -- academic/professional title
    institution     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    email_verified  BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### Table: `roles`
```sql
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,  -- VISITOR, MEMBER, REVIEWER, PUBLISHER, ADMIN
    description     VARCHAR(255),
    is_system       BOOLEAN DEFAULT FALSE,        -- system roles cannot be deleted
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: VISITOR, MEMBER, REVIEWER, PUBLISHER, ADMIN
```

### Table: `permissions`
```sql
CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,  -- e.g. content:create, content:publish, users:manage
    description     VARCHAR(255),
    resource        VARCHAR(50) NOT NULL,          -- content, users, media, settings, workflow
    action          VARCHAR(50) NOT NULL,          -- create, read, update, delete, publish, approve
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `user_roles`
```sql
CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

### Table: `role_permissions`
```sql
CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

### Table: `categories`
```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(250) NOT NULL UNIQUE,
    description     TEXT,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

### Table: `tags`
```sql
CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

### Table: `content_items`
```sql
CREATE TABLE content_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(550) NOT NULL UNIQUE,
    excerpt         TEXT,
    body            JSONB,                    -- rich content stored as JSON (draft.js / lexical JSON)
    content_type    VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
                    -- ARTICLE, NEWS, PUBLICATION, PAGE, EVENT, JOB, ANNOUNCEMENT
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
                    -- DRAFT, IN_REVIEW, CHANGES_REQUESTED, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED
    author_id       UUID NOT NULL REFERENCES users(id),
    category_id     UUID REFERENCES categories(id),
    featured_image  VARCHAR(500),
    is_featured     BOOLEAN DEFAULT FALSE,
    is_pinned       BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMP,
    scheduled_at    TIMESTAMP,
    archived_at     TIMESTAMP,
    view_count      BIGINT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_slug ON content_items(slug);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_type ON content_items(content_type);
CREATE INDEX idx_content_author ON content_items(author_id);
CREATE INDEX idx_content_category ON content_items(category_id);
CREATE INDEX idx_content_published ON content_items(published_at) WHERE status = 'PUBLISHED';
CREATE INDEX idx_content_featured ON content_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_content_search ON content_items USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));
```

### Table: `content_tags`
```sql
CREATE TABLE content_tags (
    content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);
```

### Table: `content_versions`
```sql
CREATE TABLE content_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    title           VARCHAR(500),
    body            JSONB,
    excerpt         TEXT,
    changed_by      UUID NOT NULL REFERENCES users(id),
    change_summary  VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (content_id, version_number)
);

CREATE INDEX idx_content_versions_content ON content_versions(content_id);
```

### Table: `pages`
```sql
CREATE TABLE pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(550) NOT NULL UNIQUE,
    layout_type     VARCHAR(50) DEFAULT 'FLEXIBLE',
                    -- FLEXIBLE (page builder), FIXED (predefined template)
    is_published    BOOLEAN DEFAULT FALSE,
    is_homepage     BOOLEAN DEFAULT FALSE,
    parent_id       UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    author_id       UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_parent ON pages(parent_id);
```

### Table: `page_sections`
```sql
CREATE TABLE page_sections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id         UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    component_type  VARCHAR(100) NOT NULL,
                    -- rich_text, heading, image, image_gallery, video, pdf_viewer,
                    -- carousel, hero_banner, slider, cards, feature_cards,
                    -- testimonials, accordion, faq, tabs, timeline, stats_counter,
                    -- team_members, partner_logos, icon_boxes, cta, buttons,
                    -- forms, maps, quote_block, tables, lists, html_block,
                    -- embed_block, download_section, related_articles, latest_news,
                    -- events_list, search_component, breadcrumb, newsletter,
                    -- social_sharing, image_text, two_column, three_column,
                    -- grid_layout, masonry_layout
    config          JSONB NOT NULL DEFAULT '{}',
                    -- component-specific configuration (column count, background, spacing, etc.)
    data            JSONB NOT NULL DEFAULT '{}',
                    -- component content data (text, image URLs, links, etc.)
    styling         JSONB NOT NULL DEFAULT '{}',
                    -- styling overrides (background color, padding, margin, etc.)
    sort_order      INTEGER DEFAULT 0,
    visibility      VARCHAR(20) DEFAULT 'ALWAYS',
                    -- ALWAYS, LOGGED_IN_ONLY, LOGGED_OUT_ONLY
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_sections_page ON page_sections(page_id);
CREATE INDEX idx_page_sections_order ON page_sections(page_id, sort_order);
```

### Table: `workflows`
```sql
CREATE TABLE workflows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    content_type    VARCHAR(50) NOT NULL,   -- ARTICLE, NEWS, PUBLICATION, PAGE
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `workflow_states`
```sql
CREATE TABLE workflow_states (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,  -- DRAFT, IN_REVIEW, APPROVED, PUBLISHED
    label           VARCHAR(100) NOT NULL,  -- "Draft", "In Review", "Approved", "Published"
    is_initial      BOOLEAN DEFAULT FALSE,  -- starting state
    is_final        BOOLEAN DEFAULT FALSE,  -- terminal state (published/archived)
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `workflow_transitions`
```sql
CREATE TABLE workflow_transitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    from_state_id   UUID NOT NULL REFERENCES workflow_states(id),
    to_state_id     UUID NOT NULL REFERENCES workflow_states(id),
    name            VARCHAR(100) NOT NULL,  -- "Submit for Review", "Approve", "Request Changes", "Publish"
    required_role   VARCHAR(50),            -- role required to perform this transition
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `workflow_actions` (audit log of all workflow transitions)
```sql
CREATE TABLE workflow_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    workflow_id     UUID NOT NULL REFERENCES workflows(id),
    from_state_id   UUID REFERENCES workflow_states(id),
    to_state_id     UUID NOT NULL REFERENCES workflow_states(id),
    transition_id   UUID REFERENCES workflow_transitions(id),
    actor_id        UUID NOT NULL REFERENCES users(id),
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_actions_content ON workflow_actions(content_id);
CREATE INDEX idx_workflow_actions_actor ON workflow_actions(actor_id);
```

### Table: `media_files`
```sql
CREATE TABLE media_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        VARCHAR(500) NOT NULL,
    original_name   VARCHAR(500) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_type       VARCHAR(100) NOT NULL,   -- image/jpeg, application/pdf, etc.
    file_size       BIGINT NOT NULL,         -- bytes
    mime_type       VARCHAR(100) NOT NULL,
    width           INTEGER,                  -- for images
    height          INTEGER,                  -- for images
    alt_text        VARCHAR(500),
    caption         TEXT,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    folder_id       UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    is_public       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_uploader ON media_files(uploaded_by);
CREATE INDEX idx_media_type ON media_files(mime_type);
CREATE INDEX idx_media_folder ON media_files(folder_id);
```

### Table: `media_folders`
```sql
CREATE TABLE media_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    parent_id       UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    path            VARCHAR(1000),
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `media_thumbnails`
```sql
CREATE TABLE media_thumbnails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id        UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    size_key        VARCHAR(50) NOT NULL,     -- thumbnail, small, medium, large
    width           INTEGER NOT NULL,
    height          INTEGER NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size       BIGINT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (media_id, size_key)
);
```

### Table: `member_profiles`
```sql
CREATE TABLE member_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) DEFAULT 'REGULAR',  -- REGULAR, STUDENT, HONORARY, LIFE
    membership_number VARCHAR(50) UNIQUE,
    specialization  VARCHAR(255),
    research_interests TEXT,
    education       TEXT,
    publications_count INTEGER DEFAULT 0,
    is_public       BOOLEAN DEFAULT TRUE,      -- visible in members directory
    joined_at       DATE,
    membership_expires_at DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `board_members`
```sql
CREATE TABLE board_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    position        VARCHAR(200) NOT NULL,     -- President, Vice President, Secretary, etc.
    term_start      DATE NOT NULL,
    term_end        DATE,
    bio             TEXT,
    photo_url       VARCHAR(500),
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_board_members_active ON board_members(is_active);
```

### Table: `events`
```sql
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(550) NOT NULL UNIQUE,
    description     TEXT,
    event_type      VARCHAR(50) NOT NULL,     -- CONFERENCE, WORKSHOP, SEMINAR, TRAINING
    start_date      TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NOT NULL,
    location        VARCHAR(500),
    is_online       BOOLEAN DEFAULT FALSE,
    online_url      VARCHAR(500),
    max_participants INTEGER,
    featured_image  VARCHAR(500),
    status          VARCHAR(30) DEFAULT 'DRAFT',  -- DRAFT, PUBLISHED, CANCELLED, COMPLETED
    organizer_id    UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
```

### Table: `event_registrations`
```sql
CREATE TABLE event_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    institution     VARCHAR(255),
    is_confirmed    BOOLEAN DEFAULT FALSE,
    registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, email)
);
```

### Table: `job_vacancies`
```sql
CREATE TABLE job_vacancies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(550) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    requirements    TEXT,
    location        VARCHAR(255),
    employment_type VARCHAR(50),             -- FULL_TIME, PART_TIME, CONTRACT, REMOTE
    salary_range    VARCHAR(100),
    application_deadline TIMESTAMP NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    published_at    TIMESTAMP,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_active ON job_vacancies(is_active);
CREATE INDEX idx_jobs_deadline ON job_vacancies(application_deadline);
```

### Table: `job_applications`
```sql
CREATE TABLE job_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id      UUID NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    cover_letter    TEXT,
    resume_url      VARCHAR(500),
    portfolio_url   VARCHAR(500),
    status          VARCHAR(30) DEFAULT 'RECEIVED',  -- RECEIVED, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED
    reviewed_by     UUID REFERENCES users(id),
    notes           TEXT,
    applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_vacancy ON job_applications(vacancy_id);
```

### Table: `contact_messages`
```sql
CREATE TABLE contact_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    subject         VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    read_by         UUID REFERENCES users(id),
    replied_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_read ON contact_messages(is_read);
```

### Table: `notifications`
```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,     -- WORKFLOW_UPDATE, APPROVAL_REQUEST, CONTENT_PUBLISHED, COMMENT, SYSTEM
    title           VARCHAR(500) NOT NULL,
    body            TEXT,
    reference_type  VARCHAR(50),              -- content, event, job, etc.
    reference_id    UUID,                     -- ID of the referenced entity
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### Table: `comments`
```sql
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT NOT NULL,
    is_approved     BOOLEAN DEFAULT FALSE,
    approved_by     UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### Table: `seo_metadata`
```sql
CREATE TABLE seo_metadata (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     VARCHAR(50) NOT NULL,     -- PAGE, CONTENT_ITEM, EVENT, JOB
    entity_id       UUID NOT NULL,
    meta_title      VARCHAR(200),
    meta_description VARCHAR(500),
    og_title        VARCHAR(200),
    og_description  VARCHAR(500),
    og_image_url    VARCHAR(500),
    canonical_url   VARCHAR(500),
    robots          VARCHAR(100) DEFAULT 'index, follow',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (entity_type, entity_id)
);
```

### Table: `audit_logs`
```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,     -- LOGIN, LOGOUT, CONTENT_CREATE, CONTENT_UPDATE, USER_DELETE, etc.
    entity_type     VARCHAR(50),
    entity_id       UUID,
    details         JSONB,                     -- old values, new values, IP, user-agent
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

### Table: `site_settings`
```sql
CREATE TABLE site_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key     VARCHAR(200) NOT NULL UNIQUE,
    setting_value   TEXT NOT NULL,
    setting_group   VARCHAR(100) DEFAULT 'GENERAL',
                    -- GENERAL, SEO, SOCIAL, EMAIL, SECURITY, LAYOUT
    setting_type    VARCHAR(50) DEFAULT 'STRING',
                    -- STRING, BOOLEAN, INTEGER, JSON, IMAGE
    is_encrypted    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `menus`
```sql
CREATE TABLE menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(250) NOT NULL UNIQUE,
    location        VARCHAR(100),              -- HEADER, FOOTER, SIDEBAR, MOBILE
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `menu_items`
```sql
CREATE TABLE menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id         UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    label           VARCHAR(200) NOT NULL,
    url             VARCHAR(500),
    target          VARCHAR(20) DEFAULT '_self',  -- _self, _blank
    icon            VARCHAR(100),
    page_id         UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
```

### Table: `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    subscribed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);
```

---

# PART 3: BACKEND API DESIGN

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

## 3.2 API Endpoints

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
GET    /api/v1/content                - List content (paginated, filterable by status/type/category)
POST   /api/v1/content                - Create content (draft)
GET    /api/v1/content/{id}           - Get content by ID
GET    /api/v1/content/slug:{slug}    - Get content by slug
PUT    /api/v1/content/{id}           - Update content
DELETE /api/v1/content/{id}           - Soft delete / archive content
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
POST   /api/v1/content/{id}/workflow/transition - Execute transition (approve/reject/request changes)
```

### Events
```
GET    /api/v1/events                 - List events (paginated, filterable by date/type)
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
GET    /api/v1/jobs                   - List vacancies (filterable by type, active)
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
GET    /api/v1/members/search         - Search members by name/institution/specialization
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

---

# PART 4: FRONTEND ARCHITECTURE

## 4.1 Next.js Project Structure

```
src/
├── app/                          # App Router pages
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
│   │   │   │   ├── page.tsx       # Content list
│   │   │   │   ├── new/page.tsx   # Create content
│   │   │   │   └── [id]/page.tsx  # Edit content
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx       # Page list
│   │   │   │   └── [id]/edit/page.tsx  # Page builder
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
│   │   │   └── audit-logs/
│   │   │       └── page.tsx
│   └── api/                       # Next.js API routes (if needed as BFF)
│       └── ...
├── components/
│   ├── ui/                        # Base UI components (shadcn)
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Breadcrumb.tsx
│   ├── public/                    # Public site components
│   │   ├── HeroSlider.tsx
│   │   ├── LatestNews.tsx
│   │   ├── FeaturedArticles.tsx
│   │   ├── Announcements.tsx
│   │   ├── UpcomingEvents.tsx
│   │   ├── PartnerLogos.tsx
│   │   ├── StatisticsCounter.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── VideoSection.tsx
│   │   ├── CallToAction.tsx
│   │   ├── BoardMemberCard.tsx
│   │   ├── MemberCard.tsx
│   │   ├── ContentCard.tsx
│   │   ├── EventCard.tsx
│   │   ├── JobCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ContactForm.tsx
│   │   └── NewsletterSubscribe.tsx
│   ├── page-builder/              # Dynamic page builder components
│   │   ├── PageRenderer.tsx       # Renders page sections dynamically
│   │   ├── SectionRenderer.tsx    # Renders individual section by type
│   │   ├── sections/
│   │   │   ├── RichTextSection.tsx
│   │   │   ├── HeadingSection.tsx
│   │   │   ├── ImageSection.tsx
│   │   │   ├── ImageGallerySection.tsx
│   │   │   ├── VideoSection.tsx
│   │   │   ├── PdfViewerSection.tsx
│   │   │   ├── HeroBannerSection.tsx
│   │   │   ├── SliderSection.tsx
│   │   │   ├── CardsSection.tsx
│   │   │   ├── FeatureCardsSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── AccordionSection.tsx
│   │   │   ├── FaqSection.tsx
│   │   │   ├── TabsSection.tsx
│   │   │   ├── TimelineSection.tsx
│   │   │   ├── StatsCounterSection.tsx
│   │   │   ├── TeamMembersSection.tsx
│   │   │   ├── PartnerLogosSection.tsx
│   │   │   ├── IconBoxesSection.tsx
│   │   │   ├── CallToActionSection.tsx
│   │   │   ├── ButtonsSection.tsx
│   │   │   ├── MapSection.tsx
│   │   │   ├── QuoteBlockSection.tsx
│   │   │   ├── TableSection.tsx
│   │   │   ├── HtmlBlockSection.tsx
│   │   │   ├── EmbedBlockSection.tsx
│   │   │   ├── DownloadSection.tsx
│   │   │   ├── RelatedArticlesSection.tsx
│   │   │   ├── LatestNewsSection.tsx
│   │   │   ├── EventsListSection.tsx
│   │   │   ├── NewsletterSection.tsx
│   │   │   ├── SocialSharingSection.tsx
│   │   │   ├── ImageTextSection.tsx
│   │   │   └── LayoutSection.tsx  # Column/grid/masonry wrapper
│   │   └── admin/                 # Admin page builder editor components
│   │       ├── PageBuilderEditor.tsx    # Main editor wrapper (drag & drop)
│   │       ├── ComponentPalette.tsx     # Available components sidebar
│   │       ├── SectionEditor.tsx        # Edit section properties
│   │       ├── StylingPanel.tsx         # Visual styling controls
│   │       └── PreviewToggle.tsx        # Live preview
│   ├── dashboard/                 # Admin dashboard components
│   │   ├── StatsCard.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── ContentStatusChart.tsx
│   │   ├── PendingReviewList.tsx
│   │   └── StorageUsage.tsx
│   ├── shared/                    # Shared components
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Toast.tsx
│   └── forms/                     # Form components
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ContentForm.tsx
│       ├── PageForm.tsx
│       ├── EventForm.tsx
│       ├── JobForm.tsx
│       └── SettingsForm.tsx
├── lib/
│   ├── api/                       # API client
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── auth.ts               # Auth API calls
│   │   ├── content.ts
│   │   ├── pages.ts
│   │   ├── media.ts
│   │   ├── users.ts
│   │   ├── categories.ts
│   │   ├── events.ts
│   │   ├── jobs.ts
│   │   ├── board.ts
│   │   ├── contact.ts
│   │   ├── search.ts
│   │   ├── notifications.ts
│   │   ├── comments.ts
│   │   ├── settings.ts
│   │   ├── menus.ts
│   │   ├── workflow.ts
│   │   ├── dashboard.ts
│   │   └── members.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useContent.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useToast.ts
│   ├── utils/
│   │   ├── cn.ts                  # clsx + tailwind-merge
│   │   ├── date.ts                # Date formatting
│   │   ├── slug.ts                # URL slug generation
│   │   ├── validation.ts          # Zod schemas
│   │   └── permissions.ts         # Permission checking helpers
│   ├── stores/                    # State management
│   │   ├── authStore.ts           # Zustand store for auth
│   │   └── uiStore.ts             # UI state (sidebar, theme)
│   └── constants.ts
├── styles/
│   ├── globals.css                # Tailwind base + custom tokens
│   └── theme.ts                   # Soil-inspired theme config
└── middleware.ts                  # Next.js middleware for auth & routing
```

## 4.2 Component Hierarchy (Key Pages)

### Public Home Page
```
PageLayout
├── Header (dynamic menu from API)
│   ├── Logo
│   ├── NavigationMenu
│   └── SearchBar
├── HeroSlider (CMS managed)
├── LatestNews (fetched from API)
├── FeaturedArticles (fetched from API)
├── Announcements (fetched from API)
├── UpcomingEvents (fetched from API)
├── StatisticsCounter (CMS managed)
├── PartnerLogos (CMS managed)
├── CallToAction (CMS managed)
├── NewsletterSubscribe
├── Footer (dynamic menu from API)
│   ├── FooterLinks
│   ├── SocialLinks
│   └── Copyright
└── ScrollToTop
```

### Dynamic CMS Page (via Page Builder)
```
PageLayout
├── Header
├── Breadcrumb
├── PageRenderer
│   ├── SectionRenderer[type="hero_banner"]
│   ├── SectionRenderer[type="rich_text"]
│   ├── SectionRenderer[type="image_text"]
│   ├── SectionRenderer[type="cards"]
│   ├── SectionRenderer[type="cta"]
│   └── SectionRenderer[type="two_column"]
│       ├── SectionRenderer[type="rich_text"]
│       └── SectionRenderer[type="image_gallery"]
└── Footer
```

### Admin Page Builder
```
DashboardLayout
├── Sidebar
├── PageBuilderEditor
│   ├── Toolbar (save, preview, publish, undo, redo)
│   ├── Canvas (drop zone)
│   │   └── SectionRenderer (draggable, editable)
│   │       └── SectionEditor (on click/hover)
│   │           ├── ContentTab
│   │           ├── StylingTab
│   │           │   ├── BackgroundPicker
│   │           │   ├── SpacingControls
│   │           │   ├── TypographyControls
│   │           │   └── ResponsiveVisibility
│   │           └── AdvancedTab (ID, CSS class, animation)
│   └── ComponentPalette (sidebar, drag source)
│       ├── Layout Components (columns, grid)
│       ├── Content Components (text, images, video)
│       ├── Media Components (gallery, slider)
│       └── Widget Components (news, events, forms)
└── Header
```

---

# PART 5: DETAILED MODULE SPECIFICATIONS

## 5.1 Authentication & Authorization Module

**JWT Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["MEMBER", "REVIEWER"],
  "permissions": ["content:create", "content:read", "workflow:approve"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Security Flow:**
1. User submits credentials → POST `/auth/login`
2. Server validates → returns `access_token` (15min) + `refresh_token` (7 days)
3. Frontend stores tokens in httpOnly cookie (preferred) or memory
4. Each API request includes `Authorization: Bearer <access_token>`
5. Spring Security filter validates JWT → sets SecurityContext
6. On 401 → frontend attempts refresh → on fail → redirect to login

**Permission Checking Strategy:**
- Backend: Method-level security with `@PreAuthorize` annotations
- Backend: Custom permission evaluator for resource-level checks
- Frontend: `usePermissions()` hook to conditionally render UI elements

## 5.2 Content Workflow Engine

**State Machine Definition:**
```
States:        DRAFT → IN_REVIEW → CHANGES_REQUESTED → APPROVED → PUBLISHED
                                                       ↘ SCHEDULED → PUBLISHED
Any state → ARCHIVED

Transitions:
- DRAFT → IN_REVIEW           : Author submits (role: MEMBER)
- IN_REVIEW → CHANGES_REQUESTED : Reviewer requests changes (role: REVIEWER)
- IN_REVIEW → APPROVED         : Reviewer approves (role: REVIEWER)
- CHANGES_REQUESTED → DRAFT    : Author revises (role: MEMBER)
- APPROVED → PUBLISHED         : Publisher publishes (role: PUBLISHER)
- APPROVED → SCHEDULED         : Publisher schedules (role: PUBLISHER)
- SCHEDULED → PUBLISHED        : Scheduled job / cron
- PUBLISHED → ARCHIVED         : Publisher archives (role: PUBLISHER)
- Any → ARCHIVED              : Admin archives (role: ADMIN)
```

**Implementation:**
- Define workflow as a configurable entity in DB (not hardcoded)
- Spring State Machine or custom state pattern
- Each transition triggers:
  1. Permission check (actor has required_role)
  2. State update on content_items.status
  3. Audit log entry
  4. Notification to relevant users
  5. (Optional) email notification

## 5.3 Dynamic Page Builder

**Data Model: A page is a collection of ordered sections. Each section has:**
- `component_type`: identifies which React component to render
- `config`: JSON object with component-specific settings (columns, autoplay speed, etc.)
- `data`: JSON object with the actual content (text, image URLs, links)
- `styling`: JSON object with CSS property overrides

**Frontend Rendering:**
```typescript
// PageRenderer.tsx - maps API data to components
const componentMap: Record<string, React.ComponentType<SectionProps>> = {
  rich_text: RichTextSection,
  hero_banner: HeroBannerSection,
  cards: CardsSection,
  // ... all 40+ component types
};

function PageRenderer({ sections }: { sections: Section[] }) {
  return sections.map((section) => {
    const Component = componentMap[section.component_type];
    if (!Component) return <UnknownSectionType />;
    return (
      <div style={section.styling} className={cn(section.config.className)}>
        <Component data={section.data} config={section.config} />
      </div>
    );
  });
}
```

**Admin Editor Approach:**
- Use `react-dnd` for drag-and-drop
- Component Palette (left sidebar) lists available components
- Canvas (center) renders sections with hover/edit controls
- Property Panel (right sidebar) for editing selected section
- Save stores the JSON structure → POST to `/pages/{id}/sections`

## 5.4 Search Module

**Implementation: PostgreSQL Full-Text Search (Phase 1) → Elasticsearch (Phase 2)**

```sql
-- Full-text search query combining multiple content types
SELECT id, title, excerpt, 'ARTICLE' as type, 
       ts_rank(to_tsvector('english', title || ' ' || excerpt), plainto_tsquery('english', 'soil conservation')) AS rank
FROM content_items
WHERE status = 'PUBLISHED'
  AND to_tsvector('english', title || ' ' || excerpt) @@ plainto_tsquery('english', 'soil conservation')

UNION ALL

SELECT id, title, description as excerpt, 'EVENT' as type,
       ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', 'soil conservation'))
FROM events
WHERE status = 'PUBLISHED'
  AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', 'soil conservation')

ORDER BY rank DESC
LIMIT 20 OFFSET 0;
```

## 5.5 Notification System

**Types:**
- In-app notifications (stored in `notifications` table, polled via React Query)
- Email notifications (via JavaMailSender / SendGrid / AWS SES)

**Trigger Points:**
1. Content submitted for review → notify all REVIEWERs
2. Content approved → notify author
3. Content rejected / changes requested → notify author with comments
4. Content published → notify author (and optionally all MEMBERs)
5. New contact message → notify ADMINs
6. Event upcoming → scheduled notification

---

# PART 6: PHASED IMPLEMENTATION PLAN

## Phase 1: Foundation & Core Infrastructure (Weeks 1-3)

### Backend
**Goal:** Sprint Boot project setup, database, authentication, user management

#### Tasks:
- [x] **1.1** Initialize Spring Boot project with dependencies (Spring Web, Security, Data JPA, Validation, Flyway)
- [x] **1.2** Configure PostgreSQL database, Flyway migrations for core tables:
  - `flyway/V1__init_schema.sql` - users, roles, permissions, user_roles, role_permissions
- [x] **1.3** Implement JWT authentication filter, Spring Security configuration
  - `com.ssssy.auth` package
  - JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
  - AuthController (register, login, refresh, logout)
- [x] **1.4** Implement User CRUD service and controller (admin)
- [x] **1.5** Implement Role & Permission management service
- [x] **1.6** Global exception handler, standardized API response format
- [x] **1.7** Set up audit logging (AOP-based @Auditable annotation)
- [x] **1.8** API documentation with SpringDoc OpenAPI

### Frontend
**Goal:** Next.js project setup, theme, layout, auth pages

#### Tasks:
- [x] **1.9** Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
- [x] **1.10** Create soil-inspired design theme:
  - Color palette (dark brown #3E2723, clay #6D4C41, sand #D7CCC8, olive #558B2F, forest #1B5E20, earth gray #616161)
  - Custom Tailwind config with these tokens
  - Typography system, spacing system
- [x] **1.11** Create reusable layout components: Header, Footer, Sidebar
- [x] **1.12** Build auth pages: Login, Register, Forgot Password
- [x] **1.13** Set up React Query with Axios client, JWT interceptor
- [x] **1.14** Implement auth store (Zustand) and protected route middleware

### Deliverables:
- ✅ Running Spring Boot app with auth endpoints
- ✅ Running Next.js app with login/register
- ✅ Database migrations applied
- ✅ JWT auth flow working end-to-end

---

## Phase 2: Content Management Core (Weeks 4-7)

### Backend
**Goal:** Content CRUD, categories, tags, media management

#### Tasks:
- [x] **2.1** Implement Category CRUD (tree structure)
- [x] **2.2** Implement Tag CRUD
- [x] **2.3** Implement Content CRUD
  - `ContentService` - create, update, delete, versioning
  - `ContentController` - full REST API
  - Auto-save draft endpoint
  - Version history endpoint (diff view)
- [x] **2.4** Implement Media management
  - File upload to MinIO/S3 (multipart)
  - Image optimization (thumbnail generation with Thumbnailator/Imgscalr)
  - File metadata CRUD
  - Folder management
- [x] **2.5** Implement Content search (PostgreSQL FTS basic)
- [x] **2.6** Implement Content preview (generate token-based preview URL)

### Frontend
**Goal:** Content editor, media library, content listing

#### Tasks:
- [x] **2.7** Build admin layout with sidebar navigation
- [x] **2.8** Build Content List page (DataTable with filters, pagination)
- [x] **2.9** Build Content Create/Edit form
  - Title, slug (auto-generate), excerpt
  - Rich text editor (TipTap React)
  - Category & tag selectors
  - Featured image picker (from media library)
  - SEO metadata fields (meta title, description, OG tags)
  - Save Draft / Submit for Review buttons
- [x] **2.10** Build Media Library page
  - Grid view with thumbnails
  - Upload drag-and-drop zone
  - Folder tree sidebar
  - File detail modal (edit alt, caption)
- [x] **2.11** Build Category & Tag management pages

### Deliverables:
- ✅ Admins can create/edit/delete content
- ✅ Media upload and management working
- ✅ Rich text editing with image embeds
- ✅ Content versioning

---

## Phase 3: Workflow & Publishing (Weeks 8-9)

### Backend
**Goal:** Workflow engine, content review, publishing

#### Tasks:
- [x] **3.1** Implement Workflow definition CRUD
- [x] **3.2** Implement Workflow state machine engine
  - State transitions with permission checks
  - Workflow action logging
- [x] **3.3** Implement Review endpoints
  - Submit for review
  - Approve / Reject / Request Changes
  - Reviewer comments on content
- [x] **3.4** Implement Scheduling (Spring @Scheduled)
  - Check for content due for publication
  - Auto-archive past-schedule content
- [x] **3.5** Implement Notification triggers for workflow events

### Frontend
**Goal:** Review interface, publishing controls, notifications

#### Tasks:
- [x] **3.6** Build Workflow Definition management page (admin)
- [x] **3.7** Add workflow status badges and action buttons to content list
- [x] **3.8** Build Review interface for Reviewers
  - Side-by-side content view
  - Approve/Reject buttons with comment form
  - Version comparison
- [x] **3.9** Build Notification dropdown in header
  - Unread count badge
  - Notification list with types
  - Click to navigate to relevant content
- [x] **3.10** Add Publishing controls (Publish Now / Schedule)

### Deliverables:
- ✅ Content goes through DRAFT → REVIEW → APPROVED → PUBLISHED flow
- ✅ Reviewers can approve/reject with comments
- ✅ Publishers can publish or schedule content
- ✅ Authors get notifications on status changes

---

## Phase 4: Page Builder & Dynamic CMS (Weeks 10-13)

### Backend
**Goal:** Dynamic page management with section-based layout

#### Tasks:
- [x] **4.1** Implement Page CRUD
- [x] **4.2** Implement Page Section CRUD
  - Create section with component_type, config JSON, data JSON, styling JSON
  - Reorder sections
  - Clone/duplicate section
- [x] **4.3** Implement Menu CRUD + Menu Items (nested tree)
- [x] **4.4** Implement Site Settings CRUD
- [x] **4.5** SEO metadata service (auto-generate sitemap.xml)

### Frontend
**Goal:** Drag-and-drop page builder, dynamic page rendering

#### Tasks:
- [x] **4.6** Build Page List (admin) - shows all pages with status
- [x] **4.7** Build **Page Builder Editor** (the major feature):
  - **Canvas**: renders sections, supports drag-to-reorder
  - **Component Palette**: 40+ component types grouped by category
    - Layout: 2-col, 3-col, grid, masonry
    - Content: rich text, heading, image, image+text, video, PDF
    - Media: gallery, carousel, slider
    - Widgets: news list, events, testimonials, team, partners
    - Interactive: accordion, tabs, FAQ, timeline
    - Marketing: CTA, buttons, newsletter, counters
    - Advanced: HTML, embed, download, maps, forms
  - **Property Panel**: edit content, styling, visibility per section
  - **Styling Controls**:
    - Background color/image
    - Padding/margin (with Tailwind presets + custom)
    - Width (full, contained, narrow)
    - Typography overrides (size, weight, color, alignment)
    - Responsive visibility (desktop/tablet/mobile toggles)
  - **Undo/Redo** for section operations
  - **Preview** toggle (mobile/tablet/desktop breakpoints)
- [x] **4.8** Build public **PageRenderer** - renders published pages dynamically
- [x] **4.9** Build public dynamic `[slug]` page route
- [x] **4.10** Build Menu Manager - drag-and-drop menu tree editor
- [x] **4.11** Build Settings page (site name, logo, social links, etc.)

### Deliverables:
- ✅ Full drag-and-drop page builder working
- ✅ Admins can create pages with arbitrary layouts
- ✅ 40+ component types available
- ✅ Pages render dynamically on public site
- ✅ Menu management via drag-and-drop

---

## Phase 5: Public Pages & Features (Weeks 14-17)

### Backend
**Goal:** Events, jobs, members, board, contact

#### Tasks:
- [x] **5.1** Implement Event CRUD + registration
- [x] **5.2** Implement Job Vacancy CRUD + application management
- [x] **5.3** Implement Board Members CRUD
- [x] **5.4** Implement Member Directory (public) + Member Profile management
- [x] **5.5** Implement Contact Message handling
- [x] **5.6** Implement Newsletter subscription
- [x] **5.7** Implement Comments (optional, configurable)
- [x] **5.8** Implement Dashboard statistics API

### Frontend
**Goal:** Complete public-facing pages

#### Tasks:
- [x] **5.9** Build Home Page with all sections (hero, news, events, stats, partners, CTA)
- [x] **5.10** Build About Us page
- [x] **5.11** Build President's Message page
- [x] **5.12** Build Board of Directors page
- [x] **5.13** Build Members Directory page (search, filter, paginate)
- [x] **5.14** Build Member Profile page (public)
- [x] **5.15** Build News & Announcements pages (list + detail)
- [x] **5.16** Build Publications pages
- [x] **5.17** Build Events pages (list + detail + registration form)
- [x] **5.18** Build Job Vacancies pages (list + detail + application form)
- [x] **5.19** Build Contact Us page (form + map + info)
- [x] **5.20** Build Search Results page with advanced filters
- [x] **5.21** Build Dashboard home page (admin)

### Deliverables:
- ✅ All public pages functional
- ✅ Events with registration
- ✅ Job applications working
- ✅ Member directory searchable
- ✅ Contact form operational

---

## Phase 6: Polish, Security & Performance (Weeks 18-19)

### Tasks:
- [x] **6.1** Image optimization pipeline (WebP conversion, responsive srcset)
- [x] **6.2** Implement CDN integration (CloudFront / Cloudflare)
- [x] **6.3** Lazy loading for images and below-fold content
- [x] **6.4** Implement API caching (Redis) for public endpoints
- [x] **6.5** SSR optimization (Next.js ISR for dynamic content)
- [x] **6.6** Security audit: XSS prevention, SQL injection, CSRF, rate limiting
- [x] **6.7** Two-factor authentication (optional, if required)
- [x] **6.8** Sitemap generation + robots.txt
- [x] **6.9** Performance testing (Lighthouse targets: 90+)
- [x] **6.10** Content security headers, HTTPS enforcement

### Deliverables:
- ✅ Lighthouse scores 90+
- ✅ CDN serving static assets
- ✅ API caching reducing DB load
- ✅ Security hardening completed

---

## Phase 7: Testing & Deployment (Weeks 20-21)

### Backend Testing:
- [x] **7.1** Unit tests for service layer (JUnit 5 + Mockito)
- [x] **7.2** Integration tests for repositories (Testcontainers)
- [x] **7.3** API contract tests (Spring MockMvc / REST Assured)
- [x] **7.4** Workflow state machine tests (all transition paths)

### Frontend Testing:
- [x] **7.5** Component unit tests (Testing Library + Vitest)
- [x] **7.6** Page rendering tests
- [x] **7.7** Page builder integration tests (drag & drop flows)

### Deployment:
- [x] **7.8** Dockerize backend (Dockerfile + docker-compose with PostgreSQL, Redis, MinIO)
- [x] **7.9** Dockerize frontend
- [x] **7.10** CI/CD pipeline (GitHub Actions)
  - Build → Test → Lint → Docker build → Deploy
- [x] **7.11** Deployment documentation
- [x] **7.12** Environment configuration (dev/staging/production)

### Deliverables:
- ✅ Test suite with 80%+ coverage
- ✅ Docker images for all services
- ✅ CI/CD pipeline configured
- ✅ Deployment documentation

---

## Phase 8: Training & Handover (Week 22)

- [x] **8.1** Admin user manual / documentation
- [x] **8.2** Video walkthrough of CMS features
- [x] **8.3** Source code documentation (README, API docs)
- [x] **8.4** Transfer to production environment
- [x] **8.5** Post-deployment support period

---

# PART 7: SPRING BOOT PACKAGE STRUCTURE

```
com.ssssy
├── SSSSYApplication.java
├── config/
│   ├── SecurityConfig.java            # Spring Security configuration
│   ├── JwtConfig.java                 # JWT properties
│   ├── CorsConfig.java               # CORS for Next.js
│   ├── WebConfig.java                # Web MVC configuration
│   ├── StorageConfig.java            # MinIO/S3 client config
│   ├── CacheConfig.java              # Redis cache config
│   ├── AsyncConfig.java              # Async task executor
│   └── OpenApiConfig.java            # Swagger/OpenAPI config
├── security/
│   ├── JwtTokenProvider.java         # JWT create/validate
│   ├── JwtAuthenticationFilter.java  # OncePerRequestFilter
│   ├── CustomUserDetailsService.java
│   ├── CustomAccessDeniedHandler.java
│   └── CustomAuthenticationEntryPoint.java
├── auth/
│   ├── api/AuthController.java
│   ├── dto/LoginRequest.java
│   ├── dto/RegisterRequest.java
│   ├── dto/AuthResponse.java
│   └── service/AuthService.java
├── user/
│   ├── api/UserController.java
│   ├── domain/User.java              # JPA entity
│   ├── domain/Role.java
│   ├── domain/Permission.java
│   ├── repository/
│   ├── service/UserService.java
│   ├── service/RoleService.java
│   └── dto/
├── content/
│   ├── api/ContentController.java
│   ├── domain/ContentItem.java
│   ├── domain/ContentVersion.java
│   ├── domain/Category.java
│   ├── domain/Tag.java
│   ├── repository/
│   ├── service/ContentService.java
│   ├── service/CategoryService.java
│   ├── service/TagService.java
│   └── dto/
├── page/
│   ├── api/PageController.java
│   ├── domain/Page.java
│   ├── domain/PageSection.java
│   ├── repository/
│   ├── service/PageService.java
│   └── dto/
├── workflow/
│   ├── api/WorkflowController.java
│   ├── domain/Workflow.java
│   ├── domain/WorkflowState.java
│   ├── domain/WorkflowTransition.java
│   ├── domain/WorkflowAction.java
│   ├── engine/
│   │   ├── WorkflowEngine.java       # State machine logic
│   │   └── WorkflowValidator.java
│   ├── repository/
│   ├── service/WorkflowService.java
│   └── dto/
├── media/
│   ├── api/MediaController.java
│   ├── domain/MediaFile.java
│   ├── domain/MediaFolder.java
│   ├── repository/
│   ├── service/MediaService.java
│   ├── service/ImageOptimizer.java
│   └── dto/
├── event/
│   ├── api/EventController.java
│   ├── domain/Event.java
│   ├── domain/EventRegistration.java
│   ├── repository/
│   ├── service/EventService.java
│   └── dto/
├── job/
│   ├── api/JobController.java
│   ├── domain/JobVacancy.java
│   ├── domain/JobApplication.java
│   ├── repository/
│   ├── service/JobService.java
│   └── dto/
├── board/
│   ├── api/BoardController.java
│   ├── domain/BoardMember.java
│   ├── repository/
│   └── service/BoardService.java
├── member/
│   ├── api/MemberController.java
│   ├── domain/MemberProfile.java
│   ├── repository/
│   ├── service/MemberService.java
│   └── dto/
├── notification/
│   ├── api/NotificationController.java
│   ├── domain/Notification.java
│   ├── repository/
│   ├── service/NotificationService.java
│   └── dto/
├── contact/
│   ├── api/ContactController.java
│   ├── domain/ContactMessage.java
│   ├── repository/
│   └── service/ContactService.java
├── comment/
│   ├── api/CommentController.java
│   ├── domain/Comment.java
│   ├── repository/
│   └── service/CommentService.java
├── menu/
│   ├── api/MenuController.java
│   ├── domain/Menu.java
│   ├── domain/MenuItem.java
│   ├── repository/
│   ├── service/MenuService.java
│   └── dto/
├── search/
│   ├── api/SearchController.java
│   └── service/SearchService.java
├── setting/
│   ├── api/SettingController.java
│   ├── domain/SiteSetting.java
│   ├── repository/
│   └── service/SettingService.java
├── dashboard/
│   ├── api/DashboardController.java
│   └── service/DashboardService.java
├── audit/
│   ├── annotation/Auditable.java
│   ├── aspect/AuditAspect.java
│   ├── domain/AuditLog.java
│   ├── repository/
│   └── service/AuditService.java
├── newsletter/
│   ├── api/NewsletterController.java
│   ├── domain/NewsletterSubscriber.java
│   ├── repository/
│   └── service/NewsletterService.java
├── seo/
│   ├── domain/SeoMetadata.java
│   ├── repository/
│   ├── service/SeoService.java
│   └── service/SitemapService.java
├── common/
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── BadRequestException.java
│   │   ├── UnauthorizedException.java
│   │   └── WorkflowException.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── PageResponse.java
│   │   └── PagedRequest.java
│   └── util/
│       ├── SlugUtil.java
│       └── DateUtil.java
└── migration/                       # Flyway SQL scripts
    ├── db/migration/
    │   ├── V1__init_schema.sql
    │   ├── V2__seed_roles_permissions.sql
    │   ├── V3__seed_default_workflow.sql
    │   ├── V4__create_indexes.sql
    │   └── V5__seed_settings.sql
```

---

# PART 8: FRONTEND PACKAGE STRUCTURE (DETAILED)

```
src/
├── app/
│   ├── layout.tsx                        # Root layout with providers
│   ├── (public)/
│   │   ├── layout.tsx                    # Public layout (Header + Footer)
│   │   ├── page.tsx                      # Home page
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
│   │   └── [slug]/page.tsx               # Dynamic CMS page
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── (dashboard)/
│       └── admin/
│           ├── layout.tsx                # Sidebar + topbar
│           ├── page.tsx                  # Dashboard home
│           ├── content/
│           │   ├── page.tsx
│           │   ├── new/page.tsx
│           │   └── [id]/page.tsx
│           ├── pages/
│           │   ├── page.tsx
│           │   ├── new/page.tsx
│           │   └── [id]/edit/page.tsx    # Page builder
│           ├── media/
│           │   └── page.tsx
│           ├── users/
│           │   └── page.tsx
│           ├── roles/
│           │   └── page.tsx
│           ├── categories/
│           │   └── page.tsx
│           ├── tags/
│           │   └── page.tsx
│           ├── events/
│           │   ├── page.tsx
│           │   └── [id]/page.tsx
│           ├── jobs/
│           │   ├── page.tsx
│           │   ├── [id]/page.tsx
│           │   └── applications/
│           │       ├── page.tsx
│           │       └── [id]/page.tsx
│           ├── board/
│           │   └── page.tsx
│           ├── members/
│           │   └── page.tsx
│           ├── messages/
│           │   └── page.tsx
│           ├── menus/
│           │   └── page.tsx
│           ├── workflow/
│           │   └── page.tsx
│           ├── notifications/
│           │   └── page.tsx
│           ├── settings/
│           │   └── page.tsx
│           └── audit-logs/
│               └── page.tsx
├── components/
│   ├── ui/                               # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── tooltip.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminTopbar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── ThemeProvider.tsx
│   ├── public/
│   │   ├── HeroSlider.tsx
│   │   ├── LatestNews.tsx
│   │   ├── FeaturedArticles.tsx
│   │   ├── AnnouncementBanner.tsx
│   │   ├── UpcomingEvents.tsx
│   │   ├── QuickLinks.tsx
│   │   ├── StatisticsCounter.tsx
│   │   ├── PartnerLogos.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── VideoSection.tsx
│   │   ├── CallToAction.tsx
│   │   ├── BoardMemberCard.tsx
│   │   ├── MemberCard.tsx
│   │   ├── ContentCard.tsx
│   │   ├── EventCard.tsx
│   │   ├── JobCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ContactForm.tsx
│   │   ├── NewsletterSubscribe.tsx
│   │   ├── SocialShare.tsx
│   │   └── CommentSection.tsx
│   ├── page-builder/
│   │   ├── public/
│   │   │   ├── PageRenderer.tsx
│   │   │   ├── SectionRenderer.tsx
│   │   │   └── sections/
│   │   │       ├── RichTextSection.tsx
│   │   │       ├── HeadingSection.tsx
│   │   │       ├── ImageSection.tsx
│   │   │       ├── ImageGallerySection.tsx
│   │   │       ├── VideoSection.tsx
│   │   │       ├── PdfViewerSection.tsx
│   │   │       ├── HeroBannerSection.tsx
│   │   │       ├── SliderSection.tsx
│   │   │       ├── CardsSection.tsx
│   │   │       ├── FeatureCardsSection.tsx
│   │   │       ├── TestimonialsSection.tsx
│   │   │       ├── AccordionSection.tsx
│   │   │       ├── FaqSection.tsx
│   │   │       ├── TabsSection.tsx
│   │   │       ├── TimelineSection.tsx
│   │   │       ├── StatsCounterSection.tsx
│   │   │       ├── TeamMembersSection.tsx
│   │   │       ├── PartnerLogosSection.tsx
│   │   │       ├── IconBoxesSection.tsx
│   │   │       ├── CallToActionSection.tsx
│   │   │       ├── ButtonsSection.tsx
│   │   │       ├── MapSection.tsx
│   │   │       ├── QuoteBlockSection.tsx
│   │   │       ├── TableSection.tsx
│   │   │       ├── HtmlBlockSection.tsx
│   │   │       ├── EmbedBlockSection.tsx
│   │   │       ├── DownloadSection.tsx
│   │   │       ├── RelatedArticlesSection.tsx
│   │   │       ├── LatestNewsSection.tsx
│   │   │       ├── EventsListSection.tsx
│   │   │       ├── NewsletterSection.tsx
│   │   │       ├── SocialSharingSection.tsx
│   │   │       ├── ImageTextSection.tsx
│   │   │       ├── TwoColumnSection.tsx
│   │   │       ├── ThreeColumnSection.tsx
│   │   │       ├── GridSection.tsx
│   │   │       └── MasonrySection.tsx
│   │   └── admin/
│   │       ├── PageBuilderEditor.tsx
│   │       ├── BuilderCanvas.tsx
│   │       ├── DraggableSection.tsx
│   │       ├── ComponentPalette.tsx
│   │       ├── SectionEditor.tsx
│   │       ├── StylingPanel.tsx
│   │       ├── ContentTab.tsx
│   │       ├── StylingTab.tsx
│   │       ├── AdvancedTab.tsx
│   │       ├── BackgroundPicker.tsx
│   │       ├── SpacingControls.tsx
│   │       ├── TypographyControls.tsx
│   │       ├── ResponsiveControls.tsx
│   │       ├── PreviewToggle.tsx
│   │       └── SectionTemplateSelector.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── ContentChart.tsx
│   │   ├── PendingReviewList.tsx
│   │   ├── UpcomingEventsWidget.tsx
│   │   ├── StorageUsage.tsx
│   │   └── VisitorAnalytics.tsx
│   ├── shared/
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SearchInput.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Toast.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ImagePicker.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── SlugInput.tsx
│   │   └── SEOFields.tsx
│   └── forms/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ProfileForm.tsx
│       ├── ContentForm.tsx
│       ├── PageForm.tsx
│       ├── EventForm.tsx
│       ├── JobForm.tsx
│       ├── BoardMemberForm.tsx
│       ├── CategoryForm.tsx
│       ├── SettingsForm.tsx
│       ├── WorkflowForm.tsx
│       └── RoleForm.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios instance
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
│   │   └── audit.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useContent.ts
│   │   ├── usePages.ts
│   │   ├── useMedia.ts
│   │   ├── useUsers.ts
│   │   ├── useRoles.ts
│   │   ├── useCategories.ts
│   │   ├── useTags.ts
│   │   ├── useEvents.ts
│   │   ├── useJobs.ts
│   │   ├── useBoard.ts
│   │   ├── useMembers.ts
│   │   ├── useContact.ts
│   │   ├── useSearch.ts
│   │   ├── useNotifications.ts
│   │   ├── useComments.ts
│   │   ├── useSettings.ts
│   │   ├── useMenus.ts
│   │   ├── useWorkflow.ts
│   │   ├── useDashboard.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useToast.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── date.ts
│   │   ├── slug.ts
│   │   ├── validation.ts
│   │   ├── permissions.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   └── types/
│       ├── auth.ts
│       ├── content.ts
│       ├── page.ts
│       ├── media.ts
│       ├── user.ts
│       ├── event.ts
│       ├── job.ts
│       ├── board.ts
│       ├── notification.ts
│       ├── menu.ts
│       ├── workflow.ts
│       └── api.ts
├── styles/
│   ├── globals.css
│   └── fonts.css
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── middleware.ts                    # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# PART 9: KEY IMPLEMENTATION NOTES

## 9.1 Critical Design Decisions

1. **Page Builder Data Model**: Store sections as ordered JSON in PostgreSQL. Each section's `config`, `data`, and `styling` are JSONB columns. This avoids needing a separate schema per component type while maintaining full queryability via PostgreSQL JSON operators.

2. **Rich Text Editor**: Use **TipTap** (based on ProseMirror) which stores content as JSON. This JSON is stored directly in the `body` column of `content_items`. It's renderable on both server (SSR) and client side.

3. **Workflow Engine**: Rather than a complex BPMN engine (Camunda), implement a lightweight state machine with configurable states/transitions stored in DB. This is sufficient for content approval workflows and avoids unnecessary complexity.

4. **Media Storage**: Use MinIO (local S3-compatible) for development, swap to AWS S3 / DigitalOcean Spaces / Wasabi for production. Abstract behind `StorageService` interface.

5. **Frontend State**: React Query for server state (caching, refetching), Zustand for client state (auth token, UI preferences). No Redux needed.

6. **SSR Strategy**: 
   - Public pages: SSR with Next.js (SEO critical)
   - Dynamic CMS pages: SSR on first request, then ISR (Incremental Static Regeneration) for subsequent
   - Admin panel: Client-side rendered (CSR) - no SEO needed, enables rich interactions

## 9.2 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| API Response (p95) | < 300ms |
| API Response (public cached) | < 50ms |

## 9.3 Security Checklist

- [x] All passwords hashed with BCrypt (min 10 rounds)
- [x] JWT tokens signed with RS256 (asymmetric key pair)
- [x] Access token: 15 min expiry, Refresh token: 7 days
- [x] Refresh token rotation (old token invalidated on refresh)
- [x] Rate limiting on auth endpoints (5 attempts/min)
- [x] Input validation on all endpoints (Jakarta Validation + custom validators)
- [x] SQL injection prevention via JPA parameterized queries
- [x] XSS prevention: output encoding in Next.js (auto), Content-Security-Policy header
- [x] CSRF protection for state-changing operations (SameSite cookies + CSRF token)
- [x] File upload validation (type, size, malware scanning)
- [x] Role-based access control (RBAC) enforced at API level
- [x] Audit logging for all sensitive operations
- [x] HTTPS enforcement (redirect HTTP → HTTPS)
- [x] Security headers: HSTS, X-Frame-Options, X-Content-Type-Options

## 9.4 Docker Compose (Development)

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

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - minio
      - redis
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/ssssy
      SPRING_DATASOURCE_USERNAME: ssssy
      SPRING_DATASOURCE_PASSWORD: ssssy_secret
      MINIO_URL: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      REDIS_HOST: redis

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
```

---

# PART 10: FUTURE ENHANCEMENT READINESS

The architecture is designed for the following extensions without major refactoring:

| Future Feature | Extension Point |
|---------------|----------------|
| Multi-language (AR/EN) | Add `language_code` to content_items, pages. Language switcher component. i18n library |
| Membership Payments | Add `payments` table, Stripe/PayPal integration, webhook handling |
| Scientific Journal | New `journal_issues`, `journal_articles` entities. Peer review workflow extension |
| E-learning Platform | New `courses`, `lessons`, `enrollments` entities. Video streaming integration |
| Online Voting | New `elections`, `candidates`, `votes` entities. Blockchain audit trail optional |
| Discussion Forums | New `forums`, `threads`, `posts` entities. Real-time via WebSocket |
| AI Search | Replace PostgreSQL FTS with Elasticsearch. Add vector embeddings for semantic search |
| ORCID/Google Scholar | OAuth integration in user profile. API sync scheduled jobs |

---

> **Document Version:** 1.0  
> **Last Updated:** June 2026  
> **Prepared for:** AI-Assisted Development  
> **Total Implementation Estimate:** 22 Weeks (5.5 Months) with a team of 2-3 developers
