# Software Requirements Specification V4
## Syrian Soil Science Society (SSSSY) Website Platform

**Merged from:** V1 (SRS_AUGMENTED.md) + V2 (SRS_AUGMENTED_V2.md) + V3 (SRS_COMPLETE.md)
**Prepared for:** AI-Assisted Implementation
**Domain:** ssssy.org.sy

---

# 1. INTRODUCTION

## 1.1 Purpose

This document defines the complete software requirements for the Syrian Soil Science Society (SSSSY) website platform — a modern, enterprise-grade CMS with content workflow, internal email/messaging, member management, and a WordPress-like drag-and-drop page builder.

## 1.2 Scope

- Public-facing website with soil-science-inspired design
- Full CMS with drag-and-drop page builder (50+ component types)
- Configurable content review/approval workflow
- Internal email and messaging system (Postfix + Dovecot + Mailcow)
- Member directory, profiles, and management
- Job vacancies and event management
- 7-role RBAC (Visitor, Member, Editor, Reviewer, Publisher, Admin, Super Admin)
- Multi-channel notifications (in-system, email, WebSocket)
- Bilingual support (Arabic + English) — Phase 2

## 1.3 Design Theme

**Color Palette:** Dark Brown `#3E2723`, Clay Brown `#6D4C41`, Sand Beige `#D7CCC8`, Olive Green `#558B2F`, Forest Green `#2E7D32`, Earth Gray `#616161`, Rich Brown `#8D6E63`, Warm Taupe `#BCAAA4`, Cream `#FFF8E1`, Deep Soil `#4E342E`

**Typography:** Inter (headings), Merriweather (body)
**Style:** Soil texture patterns (SVG/CSS), agricultural imagery, smooth animations, responsive mobile-first, Lucide/Heroicons

## 1.4 Domain

- Primary: `ssssy.org.sy`
- Email: `firstname.lastname@ssssy.org.sy` (fallback: `username@ssssy.org.sy`)

---

# 2. SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Public Website   │  │  Admin Panel     │  │  Webmail Client      │   │
│  │  (Next.js SSR)    │  │  (Next.js CSR)   │  │  (Next.js CSR)       │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘   │
└───────────┼──────────────────────┼──────────────────────┼────────────────┘
            │                      │                      │
            │    HTTPS / REST      │   WebSocket (STOMP)  │  IMAP/SMTP
            ▼                      ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                                    │
│           Spring Cloud Gateway / Nginx (JWT, Rate Limit, Logging)        │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│                       Backend Layer (Spring Boot 3.2+)                    │
│                                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ Auth     │ │ Content  │ │ Workflow │ │ Media        │ │ Email     │  │
│  │ Service  │ │ Service  │ │ Engine   │ │ Service      │ │ Service   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤ ├───────────┤  │
│  │ User     │ │ Page     │ │ State    │ │ File Storage │ │ IMAP      │  │
│  │ Service  │ │ Builder  │ │ Machine  │ │ Optimization │ │ Listener  │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤ ├───────────┤  │
│  │ Role &   │ │ Category │ │ Review   │ │ CDN          │ │ SMTP Send│  │
│  │ Perm.    │ │ Service  │ │ Service  │ │ Integration  │ │ Service   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤ ├───────────┤  │
│  │ Notif.   │ │ Search   │ │ Audit    │ │ Thumbnail    │ │ Contact  │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Generator    │ │ Groups   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤ ├───────────┤  │
│  │ Comment  │ │ Board    │ │ Event    │ │ Job          │ │ Dist.    │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service      │ │ Lists    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ └───────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │              Spring Security + JWT + RBAC Filter Chain            │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │              Spring Data JPA / Hibernate + Flyway Migrations      │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└──────┬──────────────────────────────────────────────────────────┬────────┘
       │                                                          │
┌──────▼──────────────┐          ┌───────────────────────────────▼──────┐
│  PostgreSQL 16 DB    │          │  Object Storage (MinIO / S3)         │
│  (Main DB + Dovecot  │          │  (Images, Videos, PDFs, Email Att.) │
│   Auth DB)           │          └──────────────────────────────────────┘
└──────┬──────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────────────┐
│                    Mail Server Infrastructure                           │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Postfix  │  │  Dovecot  │  │  Rspamd  │  │  ClamAV  │  │  Redis │ │
│  │  (SMTP)   │  │  (IMAP/   │  │ (Anti-   │  │ (Virus   │  │(Cache) │ │
│  │           │  │   POP3)   │  │  Spam)   │  │  Scan)   │  │        │ │
│  └───────────┘  └───────────┘  └──────────┘  └──────────┘  └────────┘ │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Mailcow (orchestrated Docker stack)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 3. TECHNOLOGY STACK

## 3.1 Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Java JDK | 21 LTS |
| Framework | Spring Boot | 3.2+ |
| Security | Spring Security + JWT (jjwt 0.12+) | Latest |
| ORM | Hibernate / Spring Data JPA | 6.x |
| Database | PostgreSQL | 16 |
| Migration | Flyway | Latest |
| API Docs | SpringDoc OpenAPI / Swagger | Latest |
| Validation | Jakarta Validation | Latest |
| Caching | Redis (Spring Cache) | Latest |
| File Storage | MinIO (S3-compatible) | Latest |
| Search | PostgreSQL Full-Text Search (Phase 1) → Elasticsearch (Phase 2) | Latest |
| Async | Spring Async / WebSocket (STOMP over SockJS) | Latest |
| Mail Protocol | Spring Integration Mail (IMAP/SMTP) | Latest |
| Mail Client | Jakarta Mail (JavaMail) | Latest |
| File Detection | Apache Tika | Latest |
| Image Processing | Thumbnailator / Imgscalr | Latest |
| Maps | MapStruct | Latest |
| Code Gen | Lombok | Latest |
| Testing | JUnit 5 + Testcontainers + Mockito | Latest |

## 3.2 Mail Server

| Component | Technology | Purpose |
|-----------|-----------|---------|
| SMTP | Postfix | Outgoing mail delivery |
| IMAP/POP3 | Dovecot | Mailbox access |
| Anti-Spam | Rspamd | Spam filtering, DKIM/SPF/DMARC |
| Anti-Virus | ClamAV | Attachment virus scanning |
| Orchestration | Mailcow | Dockerized mail server stack |

## 3.3 Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5+ |
| Styling | Tailwind CSS 3+ |
| UI Library | shadcn/ui (Radix primitives) |
| State Mgmt | React Query (TanStack Query 5) + Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Page Builder | react-dnd |
| Rich Text | TipTap (ProseMirror-based) |
| Email Editor | TipTap extended with email plugins |
| Carousel | embla-carousel |
| File Upload | react-dropzone |
| Maps | Leaflet / Google Maps API |
| i18n (future) | next-intl |
| E2E Testing | Cypress / Playwright |

## 3.4 Infrastructure

| Component | Technology |
|-----------|-----------|
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana (optional) |
| Logging | ELK Stack (optional) |

---

# 4. USER ROLES & PERMISSIONS

## 4.1 Role Hierarchy (7 Roles)

```
                    ┌──────────────┐
                    │ Super Admin  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Admin       │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌─────▼──────┐
       │  Publisher  │ │Review│ │  Editor    │
       └──────┬──────┘ │  er  │ │  (Content  │
              │        └──────┘ │   Manager) │
              │                 └───────┬─────┘
       ┌──────▼──────┐                 │
       │   Member    │                 │
       └──────┬──────┘                 │
              │                        │
       ┌──────▼──────┐                 │
       │   Visitor   │◄────────────────┘
       └─────────────┘
```

## 4.2 Complete Permission Matrix

| Feature | Visitor | Member | Editor | Reviewer | Publisher | Admin | Super Admin |
|---------|---------|--------|--------|----------|-----------|-------|-------------|
| Browse public content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact form | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View member directory (limited) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View member directory (full) | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apply for jobs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register for events | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create content drafts | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit for review | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use internal email | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload files (within quota) | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage own email account | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage email contacts | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create email rules/filters | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit any content | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage categories/tags | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage media library | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage menus | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage newsletter | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve/Reject content | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Review comments | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Publish content | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Schedule publishing | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Unpublish / Archive | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Page builder (layout editor) | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage roles/permissions | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| System settings | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| View audit logs | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Email admin (accounts, quotas) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage distribution lists | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage other admins | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Access all security logs | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

# 5. DATABASE DESIGN

## 5.1 Entity Relationship Overview

```
=== CORE TABLES (V1) ===
users, roles, permissions, user_roles, role_permissions

=== CONTENT TABLES (V1 + V3) ===
categories (bilingual), tags, content_items, content_tags, content_versions
pages, page_sections (V1 approach - per-section rows), component_templates

=== WORKFLOW TABLES (V1 - configurable) ===
workflows, workflow_states, workflow_transitions, workflow_actions

=== MEDIA TABLES (V1 + V3) ===
media_files, media_folders, media_thumbnails

=== FEATURE TABLES (V1) ===
events, event_registrations, job_vacancies, job_applications
board_members, member_profiles, contact_messages, comments
seo_metadata, newsletter_subscribers

=== EMAIL TABLES (V2 - most detailed) ===
email_accounts, email_folders, email_messages, email_recipients
email_attachments, email_message_flags, email_contacts, contact_groups
contact_group_members, distribution_lists, distribution_list_members
email_aliases, email_rules, email_scheduled_sends, email_quota_logs

=== SYSTEM TABLES (V3) ===
notification_preferences, notifications, audit_logs, system_config
menus, menu_items (bilingual)
```

## 5.2 Key Design Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| UUID primary keys | Avoid sequential ID exposure, distributed-friendly | V3 |
| page_sections as separate rows | More flexible than single JSONB; individual CRUD per section | V1 |
| Email metadata in PostgreSQL | Fast search, workflow integration, avoids IMAP-only reliance | V2 |
| Bilingual fields (ar/en) | Native Arabic + English support without translation table | V3 |
| Soft delete (deleted_at) | Data recovery, audit trail | V3 |
| Configurable workflow tables | Admin-defined states/transitions without code changes | V1 |
| Separate member_profiles | Cleaner separation; optional profile data | V1 |
| Separate email_recipients | Proper TO/CC/BCC tracking and search | V2 |
| media_thumbnails table | Track multiple thumbnail sizes per file | V1 |
| notification_preferences | Per-user opt-in/out per notification type | V3 |

## 5.3 Core Table Definitions (SQL)

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    phone VARCHAR(50),
    photo_url VARCHAR(500),
    institution VARCHAR(255),
    department VARCHAR(255),
    position VARCHAR(255),
    specialization VARCHAR(255),
    biography TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    account_locked BOOLEAN DEFAULT FALSE,
    failed_attempts INTEGER DEFAULT 0,
    lockout_time TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

### roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    -- VISITOR, MEMBER, EDITOR, REVIEWER, PUBLISHER, ADMIN, SUPER_ADMIN
    description VARCHAR(255),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### content_items
```sql
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    excerpt TEXT,
    body JSONB,
    content_type VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
    -- ARTICLE, NEWS, PUBLICATION, PAGE, EVENT, JOB, ANNOUNCEMENT
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, SUBMITTED, IN_REVIEW, CHANGES_REQUESTED, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED
    author_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    publisher_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    featured_image VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_member_only BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    archived_at TIMESTAMP,
    view_count BIGINT DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(255),
    og_image_url VARCHAR(500),
    og_title VARCHAR(200),
    og_description VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_content_slug ON content_items(slug);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_type ON content_items(content_type);
CREATE INDEX idx_content_author ON content_items(author_id);
CREATE INDEX idx_content_category ON content_items(category_id);
CREATE INDEX idx_content_fts ON content_items USING GIN(
    to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(excerpt,''))
);
```

### pages
```sql
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    layout_type VARCHAR(50) DEFAULT 'FLEXIBLE', -- FLEXIBLE, FIXED
    is_published BOOLEAN DEFAULT FALSE,
    is_homepage BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    author_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### page_sections
```sql
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    component_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    data JSONB NOT NULL DEFAULT '{}',
    styling JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    visibility VARCHAR(20) DEFAULT 'ALWAYS',
    -- ALWAYS, LOGGED_IN_ONLY, LOGGED_OUT_ONLY, ROLE_BASED
    visibility_roles TEXT[], -- array of role IDs if role-based
    is_animated BOOLEAN DEFAULT FALSE,
    animation_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_page_sections_page ON page_sections(page_id);
```

### workflows (configurable state machine)
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    is_initial BOOLEAN DEFAULT FALSE,
    is_final BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    from_state_id UUID NOT NULL REFERENCES workflow_states(id),
    to_state_id UUID NOT NULL REFERENCES workflow_states(id),
    name VARCHAR(100) NOT NULL,
    required_role VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE workflow_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    from_state_id UUID REFERENCES workflow_states(id),
    to_state_id UUID NOT NULL REFERENCES workflow_states(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### member_profiles
```sql
CREATE TABLE member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) DEFAULT 'REGULAR',
    -- REGULAR, STUDENT, HONORARY, LIFE, BOARD, FOUNDER
    membership_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(255),
    research_interests TEXT,
    education TEXT,
    publications_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    joined_at DATE,
    membership_expires_at DATE,
    orcid_id VARCHAR(50),
    google_scholar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### board_members
```sql
CREATE TABLE board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    position VARCHAR(200) NOT NULL,
    term_start DATE NOT NULL,
    term_end DATE,
    bio TEXT,
    photo_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    -- CONFERENCE, WORKSHOP, SEMINAR, TRAINING, MEETING
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(500),
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_online BOOLEAN DEFAULT FALSE,
    online_url VARCHAR(500),
    featured_image VARCHAR(500),
    max_participants INTEGER,
    registration_deadline TIMESTAMP,
    status VARCHAR(30) DEFAULT 'DRAFT',
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    institution VARCHAR(255),
    is_confirmed BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, email)
);
```

### contact_messages
```sql
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_by UUID REFERENCES users(id),
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### comments
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### seo_metadata
```sql
CREATE TABLE seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- PAGE, CONTENT_ITEM, EVENT, JOB
    entity_id UUID NOT NULL,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    og_title VARCHAR(200),
    og_description VARCHAR(500),
    og_image_url VARCHAR(500),
    canonical_url VARCHAR(500),
    robots VARCHAR(100) DEFAULT 'index, follow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, entity_id)
);
```

### newsletter_subscribers
```sql
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);
```

## 5.4 Email Tables (from V2)

### email_accounts
```sql
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_address VARCHAR(320) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    quota_bytes BIGINT DEFAULT 1073741824,  -- 1 GB
    used_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_subject VARCHAR(500),
    auto_reply_body TEXT,
    auto_reply_starts_at TIMESTAMP,
    auto_reply_ends_at TIMESTAMP,
    forward_to VARCHAR(320),
    forward_keep_copy BOOLEAN DEFAULT TRUE,
    signature TEXT,
    imap_subscribed BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_folders
```sql
CREATE TABLE email_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES email_folders(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    folder_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    -- INBOX, SENT, DRAFTS, TRASH, SPAM, ARCHIVE, CUSTOM
    system_folder BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    imap_folder_name VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (account_id, name)
);
```

### email_messages
```sql
CREATE TABLE email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES email_folders(id),
    message_id VARCHAR(500),
    in_reply_to VARCHAR(500),
    references_header TEXT,
    thread_id UUID,
    sender_address VARCHAR(320) NOT NULL,
    sender_name VARCHAR(200),
    reply_to_address VARCHAR(320),
    reply_to_name VARCHAR(200),
    subject VARCHAR(998),
    body_text TEXT,
    body_html TEXT,
    preview_text VARCHAR(500),
    size_bytes INTEGER DEFAULT 0,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_count INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_send_at TIMESTAMP,
    actually_sent_at TIMESTAMP,
    imap_uid BIGINT,
    delivery_status VARCHAR(30) DEFAULT 'PENDING',
    bounce_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_messages_account_folder ON email_messages(account_id, folder_id);
CREATE INDEX idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX idx_email_messages_fts ON email_messages USING GIN(
    to_tsvector('english', coalesce(subject,'') || ' ' || coalesce(body_text,''))
);
```

### email_recipients
```sql
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) NOT NULL, -- TO, CC, BCC
    address VARCHAR(320) NOT NULL,
    name VARCHAR(200),
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_attachments
```sql
CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    content_id VARCHAR(500), -- CID for inline images
    is_inline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_contacts
```sql
CREATE TABLE email_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    company VARCHAR(200),
    position VARCHAR(200),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_id, email)
);
```

### contact_groups + contact_group_members
```sql
CREATE TABLE contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_id, name)
);

CREATE TABLE contact_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, contact_id)
);
```

### distribution_lists + distribution_list_members
```sql
CREATE TABLE distribution_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email_address VARCHAR(320) NOT NULL UNIQUE,
    description TEXT,
    list_type VARCHAR(50) NOT NULL DEFAULT 'DEPARTMENT',
    -- DEPARTMENT, COMMITTEE, BOARD, GROUP, ALL_MEMBERS
    is_public BOOLEAN DEFAULT TRUE,
    allow_external BOOLEAN DEFAULT FALSE,
    moderator_id UUID REFERENCES users(id),
    requires_moderation BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE distribution_list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES distribution_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_moderator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (list_id, user_id)
);
```

### email_rules (auto-filtering)
```sql
CREATE TABLE email_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    stop_processing BOOLEAN DEFAULT FALSE,
    match_all BOOLEAN DEFAULT TRUE, -- AND vs OR
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_scheduled_sends
```sql
CREATE TABLE email_scheduled_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    -- PENDING, PROCESSING, SENT, FAILED, CANCELLED
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

### email_quota_logs
```sql
CREATE TABLE email_quota_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    used_bytes_before BIGINT NOT NULL,
    used_bytes_after BIGINT NOT NULL,
    change_bytes BIGINT NOT NULL,
    operation VARCHAR(50) NOT NULL,
    -- SEND, RECEIVE, DELETE, EXPUNGE
    message_id UUID REFERENCES email_messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_aliases
```sql
CREATE TABLE email_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    alias_address VARCHAR(320) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_message_flags
```sql
CREATE TABLE email_message_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    flag_type VARCHAR(30) NOT NULL,
    is_set BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id, account_id, flag_type)
);
```

## 5.5 System & Notification Tables

### notifications + notification_preferences
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    -- WORKFLOW_UPDATE, APPROVAL_REQUEST, CONTENT_PUBLISHED,
    -- NEW_EMAIL, EMAIL_REPLY, COMMENT, SYSTEM, EVENT_REMINDER
    title VARCHAR(500) NOT NULL,
    body TEXT,
    link VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    workflow_inapp BOOLEAN DEFAULT TRUE,
    workflow_email BOOLEAN DEFAULT TRUE,
    email_new_inapp BOOLEAN DEFAULT TRUE,
    email_new_email BOOLEAN DEFAULT TRUE,
    email_reply_inapp BOOLEAN DEFAULT TRUE,
    system_inapp BOOLEAN DEFAULT TRUE,
    system_email BOOLEAN DEFAULT TRUE,
    comment_inapp BOOLEAN DEFAULT TRUE,
    comment_email BOOLEAN DEFAULT FALSE,
    event_reminder_inapp BOOLEAN DEFAULT TRUE,
    event_reminder_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

### system_config
```sql
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(200) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_group VARCHAR(100) DEFAULT 'GENERAL',
    -- GENERAL, SEO, SOCIAL, EMAIL, SECURITY, LAYOUT, MAIL_SERVER
    config_type VARCHAR(50) DEFAULT 'STRING',
    -- STRING, BOOLEAN, INTEGER, JSON, IMAGE
    is_encrypted BOOLEAN DEFAULT FALSE,
    description VARCHAR(500),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### menus + menu_items (bilingual)
```sql
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100), -- HEADER, FOOTER, SIDEBAR, MOBILE
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    label_ar VARCHAR(200) NOT NULL,
    label_en VARCHAR(200),
    url VARCHAR(500),
    target VARCHAR(20) DEFAULT '_self',
    icon VARCHAR(100),
    page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    visibility VARCHAR(20) DEFAULT 'ALL',
    -- ALL, LOGGED_IN, LOGGED_OUT, ROLE_BASED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5.6 Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_content_status_type ON content_items(content_type, status);
CREATE INDEX idx_content_published_at ON content_items(published_at) WHERE status = 'PUBLISHED';
CREATE INDEX idx_content_featured ON content_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_jobs_deadline ON job_vacancies(application_deadline);
CREATE INDEX idx_jobs_active ON job_vacancies(is_active);
CREATE INDEX idx_board_members_active ON board_members(is_active);
CREATE INDEX idx_messages_read ON contact_messages(is_read);
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_media_type ON media_files(mime_type);
CREATE INDEX idx_page_sections_order ON page_sections(page_id, sort_order);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_email_messages_unread ON email_messages(account_id, folder_id) WHERE is_read = FALSE;
CREATE INDEX idx_email_messages_drafts ON email_messages(account_id) WHERE is_draft = TRUE;
CREATE INDEX idx_email_messages_sender ON email_messages(sender_address);
CREATE INDEX idx_email_recipients_address ON email_recipients(address);
CREATE INDEX idx_email_contacts_owner ON email_contacts(owner_id);
CREATE INDEX idx_scheduled_sends_status ON email_scheduled_sends(status, scheduled_at);
```

---

# 6. PAGE BUILDER COMPONENT CATALOG (50+ Types)

## 6.1 Layout Components
Container, Row, Column (2/3/4-col), Grid, Masonry, Section, Divider, Spacer

## 6.2 Content Components
Rich Text (WYSIWYG), Heading (H1-H6), Paragraph, Image (single), Image + Text, Image Gallery, Video (embed), PDF Viewer, Table, List (OL/UL), Quote Block, Code Block, HTML Block, Embed Block (iframe)

## 6.3 Media Components
Hero Banner (full-width), Carousel / Slider, Video Hero (bg video), Parallax Section

## 6.4 Interactive Components
Cards, Feature Cards (icon+text), Testimonials, Accordion, Tabs, Timeline, FAQ, Statistics Counter (animated), Team Members, Partner Logos (carousel/grid), Icon Boxes, Call-to-Action, Buttons, Forms (contact/subscription), Newsletter Signup, Social Sharing, Social Links, Search Widget, Related Articles (dynamic), Latest News Feed, Events List (dynamic), Member Directory (dynamic), Map (Leaflet/GMap), Breadcrumb, Download Section, Tags Cloud/List

## 6.5 Per-Component Customization

| Property | Options |
|----------|---------|
| Width | Full, Contained, Wide, Narrow |
| Background | Color picker, Image (upload/library), Gradient, Repeat |
| Spacing | Padding T/R/B/L + Margin T/B (per breakpoint) |
| Border | Width, Color, Radius (sm/md/lg/full), Style |
| Shadow | None, sm, md, lg, xl, 2xl |
| Typography | Font, Size, Weight, Line Height, Color, Align |
| Animation | Fade, Slide, Zoom, Bounce (with delay+duration) |
| Visibility | Always, Logged-in, Logged-out, Role-based (multi-select) |
| Advanced | Custom CSS Class, Custom CSS ID, Custom CSS |

---

# 7. CONTENT WORKFLOW

## 7.1 Default State Machine

```
DRAFT → SUBMITTED → IN_REVIEW ──→ APPROVED ──→ PUBLISHED
                              ↘                ↘ SCHEDULED ──→ PUBLISHED
                               → CHANGES_REQUESTED → DRAFT (loop)
Any state → ARCHIVED
```

## 7.2 Transitions and Required Roles

| From | To | Action | Required Role |
|------|----|--------|---------------|
| DRAFT | SUBMITTED | Submit for Review | MEMBER |
| SUBMITTED | IN_REVIEW | Assign Reviewer | ADMIN/EDITOR |
| IN_REVIEW | APPROVED | Approve | REVIEWER |
| IN_REVIEW | CHANGES_REQUESTED | Request Changes | REVIEWER |
| IN_REVIEW | REJECTED | Reject | REVIEWER |
| CHANGES_REQUESTED | SUBMITTED | Resubmit | MEMBER |
| APPROVED | PUBLISHED | Publish Now | PUBLISHER |
| APPROVED | SCHEDULED | Schedule | PUBLISHER |
| SCHEDULED | PUBLISHED | Cron Job | System |
| PUBLISHED | ARCHIVED | Archive | PUBLISHER |
| Any | ARCHIVED | Force Archive | ADMIN |

## 7.3 Workflow Notifications

| Event | Notified | Channel |
|-------|----------|---------|
| Submitted for review | Reviewer(s) | Email + In-app |
| Approved | Author + Publisher | Email + In-app |
| Rejected | Author (with comments) | Email + In-app |
| Revision requested | Author | Email + In-app |
| Published | Author | Email + In-app |
| Scheduled | Author + Publisher | In-app |
| Review overdue (>48h) | Reviewer + Admin | Email |

## 7.4 Configuration (Admin)
- Enable/disable workflow per content type
- Required review count (1-3)
- Auto-assignment rules for reviewers
- Escalation timeout
- Allow author bypass (admin toggle)
- Custom states and transitions

---

# 8. INTERNAL EMAIL & MESSAGING SYSTEM

## 8.1 Email Account Provisioning
- Auto-provisioned on member creation: `firstname.lastname@ssssy.org.sy`
- Fallback: `username@ssssy.org.sy`
- Quota: 1 GB default (configurable per user)
- System folders: Inbox, Sent, Drafts, Trash, Spam, Archive
- Dovecot Auth SQL for account management
- Aliases supported per user

## 8.2 Email Features

| Feature | Description |
|---------|-------------|
| Compose | Rich text (TipTap), To/CC/BCC with autocomplete |
| Reply/Reply All/Forward | Preserve threading |
| Attachments | Drag-drop, PDF/Word/Excel/ZIP/Images/Video |
| Drafts | Auto-save, manual save |
| Scheduling | Pick future date/time for sending |
| Signatures | Per-user configurable rich text signature |
| Threading | Grouped by In-Reply-To/References headers |
| Search | Subject, body, sender, recipient, date range, attachments |
| Filters | Custom rules (move, mark read, forward, delete, star) |
| Folders | System (6) + unlimited custom |
| Conversation View | Gmail-style threading |

## 8.3 Internal Messaging
- Send to individuals, multiple members, departments, committees, board
- Distribution lists (system-managed mailing lists)
- Instant delivery (same-domain: direct DB insert)
- Read status tracking for internal messages
- Priority flags (Normal, Important, Urgent)

## 8.4 External Email
- SMTP delivery via Postfix to any external address
- IMAP IDLE listener for real-time incoming mail detection
- MIME parsing (multipart, HTML + plain text)
- SPF, DKIM, DMARC compliance
- Bounce handling

## 8.5 Email Security

| Measure | Implementation |
|---------|---------------|
| Transport | TLS 1.2+ for SMTP/IMAP |
| Authentication | SMTP AUTH (LOGIN, PLAIN, CRAM-MD5) |
| Spam Filtering | Rspamd (Bayesian, greylisting, URI blacklists) |
| Virus Scanning | ClamAV on all attachments |
| DKIM | Sign all outgoing mail |
| SPF | Published DNS record |
| DMARC | p=quarantine (p=reject after validation) |
| Rate Limiting | Per-user and per-domain SMTP limits |
| Attachment Validation | Type whitelist, max 25MB |

## 8.6 Email Flow: Sending

```
User clicks Send
  → Frontend: POST /api/v1/email/messages
  → Backend:
    1. Save message to email_messages (status: PENDING)
    2. Resolve recipients (internal vs external)
    3. Save to email_recipients
    4. Upload attachments to MinIO
    5. Internal recipients: INSERT directly into recipient's Inbox folder
    6. External recipients: SMTP via Postfix (JavaMailSender)
    7. Update status to SENT, move to Sent folder
    8. Create notifications for internal recipients
    9. Log quota usage
  → If scheduled: save to email_scheduled_sends instead
```

## 8.7 Email Flow: Receiving

```
Postfix receives email
  → Rspamd filters (spam, virus, DKIM/SPF check)
  → Dovecot delivers to mailbox
  → Spring Boot IMAP IDLE Listener picks up new message
  → Parses MIME (headers, body parts, attachments)
  → Applies user rules/filters (move folder, mark read, forward)
  → Saves to email_messages + email_recipients + email_attachments
  → Creates in-app notification
  → Updates folder counts (unread, total)
```

---

# 9. API ENDPOINTS

## 9.1 Conventions

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <jwt>`
- Pagination: `?page=0&size=20&sort=createdAt,desc`
- Response Envelope:
```json
{ "success": true, "data": {}, "message": "...", "errors": null,
  "meta": { "page": 0, "size": 20, "totalElements": 100, "totalPages": 5 } }
```

## 9.2 Core Endpoints

### Authentication
```
POST   /auth/login                        POST   /auth/register
POST   /auth/refresh                      POST   /auth/logout
POST   /auth/forgot-password              POST   /auth/reset-password
POST   /auth/verify-email                 GET    /auth/me
PUT    /auth/me                           PUT    /auth/me/password
```

### Users (Admin)
```
GET    /users                             GET    /users/{id}
POST   /users                             PUT    /users/{id}
DELETE /users/{id}                        PUT    /users/{id}/roles
GET    /users/{id}/activities
```

### Roles & Permissions
```
GET    /roles                             POST   /roles
PUT    /roles/{id}                        DELETE /roles/{id}
GET    /roles/{id}/permissions            PUT    /roles/{id}/permissions
GET    /permissions
```

### Content
```
GET    /content                           POST   /content
GET    /content/{id}                      PUT    /content/{id}
DELETE /content/{id}                      GET    /content/{id}/versions
GET    /content/{id}/versions/{v}         GET    /content/slug:{slug}
POST   /content/{id}/submit               GET    /content/{id}/workflow
POST   /content/{id}/preview
```

### Pages
```
GET    /pages                             POST   /pages
GET    /pages/{id}                        PUT    /pages/{id}
DELETE /pages/{id}
GET    /pages/{id}/sections               POST   /pages/{id}/sections
PUT    /pages/sections/{id}               DELETE /pages/sections/{id}
PUT    /pages/{id}/sections/reorder
```

### Workflow (Admin)
```
GET    /workflows                         POST   /workflows
GET    /workflows/{id}                    PUT    /workflows/{id}
POST   /content/{id}/workflow/transition
```

### Media
```
GET    /media                             POST   /media/upload
POST   /media/upload-multiple             GET    /media/{id}
DELETE /media/{id}                        PUT    /media/{id}
GET    /media/folders                     POST   /media/folders
DELETE /media/folders/{id}
```

### Events
```
GET    /events                            POST   /events
GET    /events/{id}                       PUT    /events/{id}
DELETE /events/{id}                       POST   /events/{id}/register
GET    /events/{id}/registrations         GET    /events/upcoming
```

### Jobs
```
GET    /jobs                              POST   /jobs
GET    /jobs/{id}                         PUT    /jobs/{id}
DELETE /jobs/{id}                         POST   /jobs/{id}/apply
GET    /jobs/{id}/applications            PUT    /applications/{id}/status
```

### Board Members
```
GET    /board-members                     POST   /board-members
PUT    /board-members/{id}                DELETE /board-members/{id}
```

### Members Directory
```
GET    /members                           GET    /members/{id}
GET    /members/search
```

### Contact
```
POST   /contact                           GET    /contact/messages
GET    /contact/messages/{id}             PUT    /contact/messages/{id}/read
POST   /contact/messages/{id}/reply
```

### Comments
```
GET    /content/{id}/comments             POST   /content/{id}/comments
PUT    /comments/{id}                     DELETE /comments/{id}
PUT    /comments/{id}/approve
```

### Menus
```
GET    /menus                             POST   /menus
PUT    /menus/{id}                        DELETE /menus/{id}
GET    /menus/{id}/items                  POST   /menus/{id}/items
PUT    /menus/items/{id}                  DELETE /menus/items/{id}
PUT    /menus/{id}/items/reorder
```

### Settings (Admin)
```
GET    /settings                          GET    /settings/admin
PUT    /settings/{key}                    GET    /settings/group:{group}
```

### Search
```
GET    /search?q=keyword&type=all&category=&dateFrom=&dateTo=&tags=
GET    /search/suggestions?q=
```

### Notifications
```
GET    /notifications                     GET    /notifications/unread-count
PUT    /notifications/{id}/read           PUT    /notifications/read-all
```

### Dashboard (Admin)
```
GET    /admin/dashboard/stats             GET    /admin/dashboard/recent-activity
GET    /admin/dashboard/content-by-status
```

### Audit Logs (Admin)
```
GET    /audit-logs                        GET    /audit-logs/{id}
```

### Newsletter
```
POST   /newsletter/subscribe              POST   /newsletter/unsubscribe
```

## 9.3 Email Endpoints (V2 detailed)

### Email Account
```
GET    /email/account                     PUT    /email/account
PUT    /email/account/password            GET    /email/account/quota
GET    /email/account/aliases
```

### Email Admin
```
GET    /admin/email/accounts              POST   /admin/email/accounts
PUT    /admin/email/accounts/{id}         DELETE /admin/email/accounts/{id}
PUT    /admin/email/accounts/{id}/password
PUT    /admin/email/accounts/{id}/quota   POST   /admin/email/accounts/bulk
GET    /admin/email/aliases               POST   /admin/email/aliases
DELETE /admin/email/aliases/{id}
GET    /admin/email/stats                 GET    /admin/email/storage-report
GET    /admin/email/mail-queue            POST   /admin/email/flush-queue
GET    /admin/email/logs                  GET    /admin/email/bounce-reports
```

### Email Folders
```
GET    /email/folders                     POST   /email/folders
PUT    /email/folders/{id}                DELETE /email/folders/{id}
PUT    /email/folders/reorder             GET    /email/folders/{id}/counts
```

### Email Messages
```
GET    /email/messages                    POST   /email/messages
GET    /email/messages/{id}               POST   /email/messages/{id}/reply
POST   /email/messages/{id}/reply-all     POST   /email/messages/{id}/forward
POST   /email/messages/draft              PUT    /email/messages/draft/{id}
DELETE /email/messages/{id}/draft         POST   /email/messages/{id}/send
DELETE /email/messages/{id}               POST   /email/messages/batch-action
```

### Email Message Manipulation
```
PUT    /email/messages/{id}/read          PUT    /email/messages/{id}/star
PUT    /email/messages/{id}/flag          PUT    /email/messages/{id}/move
POST   /email/messages/{id}/archive       POST   /email/messages/{id}/spam
POST   /email/messages/{id}/untrash
```

### Email Threads
```
GET    /email/threads                     GET    /email/threads/{id}
```

### Email Attachments
```
GET    /email/messages/{id}/attachments
GET    /email/messages/{id}/attachments/{attId}
GET    /email/messages/{id}/attachments/{attId}/preview
```

### Email Contacts
```
GET    /email/contacts                    POST   /email/contacts
PUT    /email/contacts/{id}               DELETE /email/contacts/{id}
GET    /email/contacts/autocomplete       POST   /email/contacts/import
GET    /email/contacts/export
```

### Contact Groups
```
GET    /email/contact-groups              POST   /email/contact-groups
PUT    /email/contact-groups/{id}         DELETE /email/contact-groups/{id}
POST   /email/contact-groups/{id}/members
DELETE /email/contact-groups/{id}/members/{contactId}
```

### Organization Directory
```
GET    /email/directory                   GET    /email/directory/departments
GET    /email/directory/committees        GET    /email/directory/autocomplete
```

### Distribution Lists (Admin)
```
GET    /email/distribution-lists          POST   /email/distribution-lists
PUT    /email/distribution-lists/{id}     DELETE /email/distribution-lists/{id}
GET    /email/distribution-lists/{id}/members
POST   /email/distribution-lists/{id}/members
DELETE /email/distribution-lists/{id}/members/{userId}
```

### Email Rules / Filters
```
GET    /email/rules                       POST   /email/rules
PUT    /email/rules/{id}                  DELETE /email/rules/{id}
PUT    /email/rules/reorder               PUT    /email/rules/{id}/toggle
```

### Email Scheduled Sends
```
GET    /email/scheduled                   POST   /email/scheduled
DELETE /email/scheduled/{id}
```

---

# 10. NON-FUNCTIONAL REQUIREMENTS

## 10.1 Performance

| Metric | Target |
|--------|--------|
| Public page load | <2s (TTFB <500ms) |
| Admin page load | <3s |
| API response (p95) | <300ms |
| Public cached API | <50ms |
| Concurrent public users | 1000+ |
| Concurrent admin users | 100+ |
| Image optimization | Auto <200KB, WebP |
| DB query (p95) | <200ms |
| Search response | <1s |
| Email sending throughput | 100+/min |
| Email inbox load (500 msgs) | <1s |
| Email search (10k messages) | <2s |
| Lighthouse score | ≥90 |

## 10.2 Scalability
- Horizontal scaling for stateless API
- DB read replicas for read-heavy loads
- CDN for static assets and media files
- Redis caching for frequent queries
- Image lazy loading
- Infinite scroll / pagination

## 10.3 Availability
- Target 99.9% uptime
- Graceful degradation
- Daily automated DB backups
- RTO <4hr, RPO <24hr

## 10.4 Security (34 requirements, SEC-01 to SEC-34)
- SEC-01: JWT auth for all non-public endpoints
- SEC-02: BCrypt password hashing (strength 10+)
- SEC-03: JWT access token: 15 min expiry
- SEC-04: JWT refresh token: 7 day expiry
- SEC-05: Account lockout after 5 failed attempts (15 min)
- SEC-06: Password change requires current password
- SEC-07: Token revocation support
- SEC-08: RBAC enforced at controller level (@PreAuthorize)
- SEC-09: Method-level security for critical ops
- SEC-10: Resource ownership checks
- SEC-11: Rate limiting (100 req/min auth, 1000 general)
- SEC-12: CORS restricted to known origins
- SEC-13: HTTPS enforced (HSTS)
- SEC-14: PII/email encrypted at rest
- SEC-15: File storage server-side encryption
- SEC-16: DB connection SSL/TLS
- SEC-17: Secrets in env vars, not code
- SEC-18: Server-side input validation
- SEC-19: HTML sanitization (XSS prevention)
- SEC-20: File upload whitelist (ext + MIME)
- SEC-21: Max file sizes (10MB images, 25MB docs, 50MB video)
- SEC-22: SQL injection prevention (parameterized queries)
- SEC-23: All auth attempts logged
- SEC-24: All admin CRUD operations logged
- SEC-25: Workflow actions logged with before/after
- SEC-26: Email sends logged (sender, recipient, subject, timestamp)
- SEC-27: Log retention 90 days (configurable)
- SEC-28: Append-only log storage
- SEC-29: SPF record configured
- SEC-30: DKIM signing on all outgoing mail
- SEC-31: DMARC policy (quarantine/reject)
- SEC-32: ClamAV attachment scanning
- SEC-33: Suspicious link detection
- SEC-34: SMTP rate limiting per user/domain

## 10.5 Usability
- Fully responsive (mobile, tablet, desktop)
- RTL support for Arabic
- WCAG 2.1 AA accessibility
- Keyboard navigation (admin panel)
- Consistent loading/empty/error states
- Dark mode (admin panel)

## 10.6 Maintainability
- Modular code with separation of concerns
- Swagger/OpenAPI docs
- Flyway DB migrations
- ESLint + Prettier + Checkstyle
- Automated tests (unit, integration, e2e)
- Structured logging with correlation IDs
- Environment-based config (dev/staging/prod)
- Docker containerization

---

# 11. IMPLEMENTATION PHASES

## Phase 1: Foundation (Weeks 1-3)
**Auth, Users, Roles, Basic CMS, Infrastructure**

Backend: Spring Boot init, PostgreSQL + Flyway, JWT auth, User/Role/Permission CRUD, audit logging, Swagger, global exception handler
Frontend: Next.js init, Tailwind + shadcn/ui, soil theme design system, auth pages, admin layout, React Query + Axios client, auth middleware
DB: V1__users_roles.sql
**Deliverable:** Running auth flow, user management, admin skeleton

## Phase 2: Content Management (Weeks 4-6)
**Content CRUD, Categories, Tags, Media Library, Versioning**

Backend: Content CRUD + versioning, Category/Tag CRUD, Media (MinIO upload, thumbnails, folders), Content search (PG FTS)
Frontend: Content list + editor (TipTap), Media library grid + upload, Category + Tag management, SEO fields
DB: V2__content_tables.sql, V3__media_tables.sql
**Deliverable:** Content CRUD working, media upload, rich text editing, version history

## Phase 3: Workflow & Publishing (Weeks 7-8)
**Configurable workflow, Review, Scheduling, Notifications**

Backend: Workflow definition CRUD, state machine engine, review actions, scheduled publishing, notification triggers
Frontend: Review interface (approve/reject/comments), workflow badges, notification dropdown, scheduling controls
DB: V4__workflow_tables.sql, V5__notifications.sql
**Deliverable:** Draft→Review→Approved→Published flow, reviewer dashboards, notifications

## Phase 4: Page Builder & CMS (Weeks 9-12)
**Drag-and-drop page builder, menus, settings**

Backend: Page CRUD, Page Section CRUD (JSONB), Menu CRUD, Site Settings, SEO metadata, sitemap generation
Frontend: Page Builder Editor (react-dnd: canvas, palette, property editor, styling panel, responsive preview, 50+ components), public PageRenderer, Menu Manager, Settings page, dynamic [slug] route
DB: V6__page_builder.sql, V7__menus.sql
**Deliverable:** Full drag-and-drop page builder, 50+ component types, dynamic pages

## Phase 5: Public Pages & Features (Weeks 13-16)
**All public pages, events, jobs, board, members, contact**

Backend: Events + registrations, Job vacancies + applications, Board members, Member directory, Contact messages, Newsletter, Comments
Frontend: Home page, About Us, President's Message, Board of Directors, Members Directory + profiles, News/Publications, Events + registration, Jobs + application, Contact Us, Search page, Dashboard admin
DB: V8__events_jobs.sql, V9__board_members.sql, V10__member_profiles.sql, V11__comments.sql
**Deliverable:** All public pages functional, event/job management, member directory, contact form

## Phase 6: Email System (Weeks 17-22)
**Full internal email + messaging**

Infrastructure: Deploy Mailcow (Postfix, Dovecot, Rspamd, ClamAV), configure DKIM/SPF/DMARC DNS, TLS certs
Backend: EmailAccount/Folder/Message/Recipient/Attachment CRUD, IMAP IDLE listener, MIME parser, SMTP sender, Email rules engine, Contacts + Groups, Distribution lists, Quota management, Scheduled sends
Frontend: Three-pane webmail layout (sidebar, list, detail), compose with TipTap editor, recipient autocomplete, attachments, address book, directory browser, email rules editor, email admin pages
DB: V12__email_tables.sql
**Deliverable:** Complete webmail, SMTP/IMAP working, contacts, rules, distribution lists

## Phase 7: Polish & Security (Weeks 23-24)
**Testing, performance, security hardening**

Integration tests, unit tests, E2E tests (Cypress), email tests (GreenMail), Lighthouse optimization, image optimization (WebP), CDN integration, Redis caching, SSR+ISR tuning, security audit, OWASP checks, performance load testing (k6/JMeter)
**Deliverable:** 80%+ coverage, Lighthouse 90+, security-hardened

## Phase 8: Deployment & Docs (Weeks 25-26)
**Production deployment, CI/CD, documentation**

Full Docker Compose (app + postgres + minio + redis + mailcow), GitHub Actions CI/CD, prod environment config, DNS config (domain, MX, SPF, DKIM, DMARC, MTA-STS), backup strategy, monitoring (uptime + perf), admin user manual, developer README, video walkthroughs, knowledge transfer
**Deliverable:** Production deployment, CI/CD pipeline, documentation complete

**Total: 26 weeks (6.5 months)** with 2-3 developers

---

# 12. DOCKER COMPOSE (Full Stack)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_MULTIPLE_DBS: ssssy,mailcow
      POSTGRES_USER: ssssy
      POSTGRES_PASSWORD: ssssy_secret
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes: [minio_data:/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  mailcow:
    image: mailcow/mailcow:latest
    ports:
      - "25:25" "465:465" "587:587"
      - "143:143" "993:993"
      - "110:110" "995:995"
      - "8443:8443"
    environment:
      MAILCOW_HOSTNAME: mail.ssssy.org.sy
      MAILCOW_DOMAIN: ssssy.org.sy
    volumes: [mailcow_data:/var/lib/mailcow]
    depends_on: [postgres]

  backend:
    build: ./backend
    ports: ["8080:8080"]
    depends_on: [postgres, minio, redis, mailcow]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/ssssy
      SPRING_DATASOURCE_USERNAME: ssssy
      SPRING_DATASOURCE_PASSWORD: ssssy_secret
      MINIO_URL: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      REDIS_HOST: redis
      SPRING_MAIL_HOST: mailcow
      SPRING_MAIL_PORT: 587
      SPRING_MAIL_USERNAME: relay@ssssy.org.sy
      SPRING_MAIL_PASSWORD: relay_password
      SSSSY_EMAIL_IMAP_HOST: mailcow
      SSSSY_EMAIL_IMAP_PORT: 993
      SSSSY_EMAIL_DOMAIN: ssssy.org.sy
      SSSSY_EMAIL_DEFAULT_QUOTA: "1073741824"

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1

volumes:
  postgres_data:   minio_data:   mailcow_data:
```

---

# 13. FRONTEND EMAIL ARCHITECTURE

## 13.1 Email Route Structure
```
/email                          → redirect to /email/inbox
/email/inbox                    → Inbox folder
/email/sent                     → Sent folder
/email/drafts                   → Drafts folder
/email/trash                    → Trash folder
/email/spam                     → Spam folder
/email/archive                  → Archive folder
/email/starred                  → Starred messages (filter)
/email/folder/[id]              → Custom folder
/email/compose                  → New message
/email/message/[id]             → Message detail
/email/thread/[id]              → Conversation thread
/email/search                   → Search results
/email/contacts                 → Personal contacts
/email/contacts/groups          → Contact groups
/email/settings                 → Email settings (signature, auto-reply, forward, rules)
/email/scheduled                → Scheduled sends
```

## 13.2 Email Component Architecture

```
EmailLayout (three-pane)
├── EmailSidebar (left, 280px)
│   ├── ComposeButton
│   ├── EmailFolderTree (Inbox[n], Starred, Sent, Drafts[n], Archive, Spam, Trash, custom folders...)
│   ├── EmailQuotaBar (used/total %)
│   └── SettingsButton
├── EmailList (center)
│   ├── SearchBar
│   ├── FilterBar (unread, flagged, attachments, date)
│   ├── BulkActionBar (select-all, delete, mark-read, move, spam)
│   ├── EmailListItem[] (checkbox, star, sender, subject+preview, attachment, date, unread-dot)
│   └── InfiniteScroll
└── EmailDetail (right, full-width on mobile)
    ├── Header (subject, actions: reply/rr/forward/archive/delete/spam/print)
    ├── SenderInfo (avatar, name, email, date)
    ├── AttachmentList
    ├── HTML Body / Plain Text
    ├── ThreadView (grouped messages)
    └── QuickReplyBox

EmailCompose (full-page or modal)
├── RecipientInput (To/CC/BCC toggle + autocomplete)
├── SubjectInput
├── RichTextEditor (TipTap extended)
├── AttachmentUpload (drag-drop zone)
├── ScheduledSendPicker
├── SignatureBlock
└── Toolbar (Send, Schedule, SaveDraft, Discard, Template, Priority)
```

## 13.3 Email-Specific Hooks (Frontend)

```
useEmail()              - Account info, quota
useEmailFolders()       - Folder tree, unread counts, CRUD
useEmailMessages()      - Message list, infinite scroll, filters
useEmailMessage(id)     - Single message with body
useEmailCompose()       - Draft management, send, schedule
useEmailContacts()      - Contact list, CRUD, autocomplete
useEmailRules()         - Rule list, CRUD, reorder
useEmailThread(id)      - Thread messages
useEmailSearch()        - Search with debounce + filters
useEmailScheduled()     - Scheduled send list, cancel
```

---

# 14. FUTURE ENHANCEMENTS

| Feature | Extension Point | Priority |
|---------|----------------|----------|
| Multi-language (AR/EN full) | i18n library, language_code on entities | Short |
| Membership payments | payments table, Stripe/PayPal webhooks | Short |
| Scientific Journal | journal_issues, journal_articles, peer review workflow | Medium |
| Conference Management | Call for papers, submission, review, schedule | Medium |
| E-learning Platform | courses, lessons, enrollments, certificates | Medium |
| Online Voting | elections, candidates, votes, blockchain audit | Medium |
| Discussion Forums | forums, threads, posts, WebSocket real-time | Medium |
| AI Search / Recommendations | Elasticsearch + vector embeddings | Long |
| ORCID / Google Scholar | OAuth integration in profile | Long |
| Microsoft 365 / Exchange | Graph API, EWS integration | Long |
| SSO (SAML/OIDC) | Keycloak integration, Spring Security SAML | Long |
| Mobile App | React Native / Flutter | Long |
| Calendar (iCal/CalDAV) | calendar module, event sync | Long |
| Document Management | Extended media with co-editing, versioning | Long |

---

# 15. PROJECT STRUCTURE (Backend)

```
com.ssssy
├── SSSSYApplication.java
├── config/     (Security, Jwt, Cors, Web, Storage, Cache, Async, Mail, WebSocket, OpenApi)
├── auth/       (api/, dto/, service/, security/ - JwtProvider, JwtFilter, UserDetailsService)
├── user/       (api/, domain/User/Role/Permission, repository/, service/, dto/)
├── content/    (api/, domain/Content/ContentVersion/Category/Tag, repository/, service/, dto/)
├── page/       (api/, domain/Page/PageSection/ComponentTemplate, repository/, service/, dto/)
├── workflow/   (api/, domain/Workflow/WorkflowState/WorkflowTransition/WorkflowAction, engine/, service/)
├── media/      (api/, domain/MediaFile/MediaFolder/MediaThumbnail, service/MediaService/ImageOptimizer)
├── event/      (api/, domain/Event/EventRegistration, service/)
├── job/        (api/, domain/JobVacancy/JobApplication, service/)
├── board/      (api/, domain/BoardMember, service/)
├── member/     (api/, domain/MemberProfile, service/)
├── email/      (api/ 12 controllers, domain/ 15 entities, repository/, service/ 9 services,
│                integration/ MailServerProvisioner/ImapIdleListener/MimeMessageParser,
│                scheduler/ ScheduledEmailSender/EmailQuotaSyncTask)
├── notification/ (api/, domain/Notification/NotificationPreference, service/, WebSocket handler)
├── comment/    (api/, domain/Comment, service/)
├── contact/    (api/, domain/ContactMessage, service/)
├── menu/       (api/, domain/Menu/MenuItem, service/)
├── search/     (api/, service/SearchService)
├── setting/    (api/, domain/SystemConfig, service/)
├── dashboard/  (api/, service/)
├── audit/      (api/, domain/AuditLog, service/, aspect/AuditAspect)
├── newsletter/ (api/, domain/NewsletterSubscriber, service/)
├── seo/        (domain/SeoMetadata, service/SeoService/SitemapService)
├── common/     (exception/, dto/ApiResponse/PageResponse/PagedRequest, util/SlugUtil/DateUtil)
└── resources/
    ├── application.yml, application-dev.yml, application-prod.yml
    └── db/migration/
        V1__users_roles.sql, V2__content_tables.sql, V3__media_tables.sql,
        V4__workflow_tables.sql, V5__notifications.sql, V6__page_builder.sql,
        V7__menus.sql, V8__events_jobs.sql, V9__board_members.sql,
        V10__member_profiles.sql, V11__comments.sql, V12__email_tables.sql,
        V13__seed_data.sql
```

---

# 16. KEY DESIGN DECISIONS SUMMARY

| Decision | Choice | Source |
|----------|--------|--------|
| Page sections | Separate `page_sections` rows (not single JSONB) | V1 |
| Email integration | Real mail server (Mailcow) + Spring Boot IMAP/SMTP client | V2 |
| Workflow | Configurable DB-driven state machine (not hardcoded) | V1 |
| Media storage | MinIO (local) / S3 (prod) - abstracted behind service | V1+V3 |
| Roles | 7 roles with full permission matrix | V3 |
| Bilingual | Arabic+English fields on all content entities | V3 |
| Search | PostgreSQL FTS first, Elasticsearch later | V3 |
| Notifications | In-app (WebSocket) + Email (SMTP) | V3+V2 |
| Frontend state | React Query (server) + Zustand (client) | V3 |
| CSS framework | Tailwind + shadcn/ui | V1+V2+V3 |
| Rich text | TipTap (ProseMirror) for both content and email | V3 |
| Email threading | By References/In-Reply-To headers, stored thread_id | V2 |
| Auth | Stateless JWT (RS256, 15min access, 7d refresh) | V3 |
| Validation | Jakarta Validation (BE) + Zod (FE) | V3 |
| DB migrations | Flyway with numbered versions | V1+V3 |

---

> **Document Version:** 4.0 (Merged)
> **Sources:** V1 (22-week plan), V2 (email + Mailcow), V3 (7 roles + FR/SEC numbering + bilingual)
> **Total Estimate:** 26 weeks (6.5 months) — 2-3 developers
