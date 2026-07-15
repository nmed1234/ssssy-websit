# Software Requirements Specification (SRS)

## Syrian Soil Science Society (SSSSY) Website Platform

**Version:** 2.0 (Augmented)
**Prepared for:** AI Implementation Agents
**Domain:** ssssy.org.sy

---

# Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Functional Requirements](#5-functional-requirements)
6. [Public Website Pages](#6-public-website-pages)
7. [Advanced CMS / Page Builder](#7-advanced-cms--page-builder)
8. [Content Workflow](#8-content-workflow)
9. [Internal Email & Messaging System](#9-internal-email--messaging-system)
10. [Member Management](#10-member-management)
11. [Search Engine](#11-search-engine)
12. [Notification System](#12-notification-system)
13. [Media Management](#13-media-management)
14. [Administration Dashboard](#14-administration-dashboard)
15. [Database Design (ERD)](#15-database-design-erd)
16. [API Design](#16-api-design)
17. [Non-Functional Requirements](#17-non-functional-requirements)
18. [Security Requirements](#18-security-requirements)
19. [Implementation Phases](#19-implementation-phases)
20. [Project Directory Structure](#20-project-directory-structure)
21. [Future Enhancements](#21-future-enhancements)

---

# 1. Introduction

## 1.1 Purpose

This document defines the complete software requirements for the Syrian Soil Science Society (SSSSY) website platform. The system is a modern, enterprise-grade Content Management System (CMS) with full content workflow, internal email messaging, member management, and a WordPress-like drag-and-drop page builder.

## 1.2 Scope

The system encompasses:
- Public-facing website with soil-science-inspired design
- Full CMS with visual page builder (component-based)
- Content review and approval workflow
- Internal email and messaging system for members
- Member directory and profile management
- Job vacancies and event management
- Role-Based Access Control (RBAC)
- Notifications (in-system and email)

## 1.3 Design Inspiration

The design is inspired by the **Soil Science Society of America (SSSA)** in professionalism, usability, and content organization, with a unique visual identity reflecting soil science.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Brown | `#3E2723` | Headers, footers, primary text |
| Clay Brown | `#6D4C41` | Secondary headers, cards |
| Sand Beige | `#D7CCC8` | Backgrounds, sections |
| Olive Green | `#558B2F` | Accent buttons, links |
| Forest Green | `#2E7D32` | Success, CTAs |
| Earth Gray | `#616161` | Body text |
| Rich Brown | `#8D6E63` | Borders, dividers |
| Warm Taupe | `#BCAAA4` | Subtle backgrounds |
| Cream | `#FFF8E1` | Highlight backgrounds |
| Deep Soil | `#4E342E` | Hero overlays |

### Visual Style
- Soil texture background patterns (CSS-based or SVG)
- Agricultural and scientific imagery
- Smooth animations and transitions
- Responsive layout (mobile-first)
- Professional typography (Google Fonts: Inter, Merriweather)
- Clean, modern iconography (Lucide or Heroicons)

## 1.4 Domain

- **Primary:** `ssssy.org.sy`
- **Email:** `username@ssssy.org.sy` or `firstname.lastname@ssssy.org.sy`

---

# 2. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │            Next.js Frontend (SSR/SSG)              │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────┐    │  │
│  │  │ Public  │ │  Admin   │ │  Email Client    │    │  │
│  │  │ Website │ │  Panel   │ │  (Webmail)       │    │  │
│  │  └─────────┘ └──────────┘ └──────────────────┘    │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS / REST API / WebSocket
┌────────────────────▼─────────────────────────────────────┐
│                 API Gateway / Load Balancer               │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│              Backend (Spring Boot 3.x)                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Auth   │ │  CMS     │ │ Workflow │ │  Email API  │  │
│  │ Module  │ │  Module  │ │  Engine  │ │  (IMAP/     │  │
│  │ (JWT)   │ │          │ │          │ │   SMTP)     │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  User   │ │  Media   │ │  Search  │ │ Notification│  │
│  │ Module  │ │  Module  │ │  Module  │ │  Module     │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│  ┌───────────────────────────────────────────────────┐   │
│  │        Spring Security + JWT Filter Chain          │   │
│  └───────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────┐   │
│  │        Spring Data JPA / Hibernate                 │   │
│  └───────────────────────────────────────────────────┘   │
└──────┬──────────────────────────────────────────┬────────┘
       │                                          │
┌──────▼──────────┐          ┌────────────────────▼──────┐
│  PostgreSQL DB  │          │  File/Object Storage      │
│  (Main DB)      │          │  (MinIO / S3-compatible)  │
└─────────────────┘          └───────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              Mail Server Infrastructure                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Postfix  │  │ Dovecot  │  │ Optional:            │  │
│  │ (SMTP)   │  │ (IMAP/   │  │ Mailcow / iRedMail   │  │
│  │          │  │  POP3)   │  │ / Zimbra             │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Next.js 14+ | SSR/SSG for SEO, React ecosystem |
| Backend Framework | Spring Boot 3.x | Enterprise-grade, mature ecosystem |
| Database | PostgreSQL | Advanced features, JSONB for page builder |
| ORM | Spring Data JPA + Hibernate | Standard Java persistence |
| Auth | JWT (stateless) | Scalable, no session management |
| Mail Server | Postfix + Dovecot | Industry standard, open-source |
| Object Storage | MinIO (or S3) | Compatible with AWS S3 API |
| API Style | REST | Simple, universal compatibility |
| Real-time | WebSocket (STOMP) | Email notifications, live updates |

---

# 3. Technology Stack

## 3.1 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 LTS | Core language |
| Spring Boot | 3.2+ | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Database access |
| Spring Mail | 3.x | Email sending |
| Spring WebSocket | 3.x | Real-time notifications |
| Hibernate | 6.x | ORM |
| PostgreSQL | 16 | Primary database |
| Flyway | Latest | Database migrations |
| Lombok | Latest | Boilerplate reduction |
| MapStruct | Latest | DTO mapping |
| OpenAPI / Swagger | 3.x | API documentation |
| JWT (jjwt) | 0.12+ | Token auth |
| Apache Tika | Latest | File type detection |
| Thumbnailator | Latest | Image thumbnail generation |
| Elasticsearch | 8.x (optional) | Full-text search (can use PostgreSQL FTS) |
| Redis | Latest | Caching, session management |

## 3.2 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework with SSR/SSG |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Shadcn UI | Latest | Accessible component library |
| React Query | 5.x | Server state management |
| React Hook Form | Latest | Form management |
| Zod | Latest | Schema validation |
| TipTap / Quill | Latest | Rich text editor |
| React DnD | Latest | Drag-and-drop page builder |
| React Email Editor | Latest | Email composition |
| Axios | Latest | HTTP client |
| Zustand or Redux Toolkit | Latest | Client state |
| next-intl | Latest | Internationalization (future) |
| react-dropzone | Latest | File uploads |
| embla-carousel | Latest | Carousel/slider |

## 3.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker / Docker Compose | Containerization |
| Nginx | Reverse proxy |
| Postfix (SMTP) | Outgoing mail server |
| Dovecot (IMAP/POP3) | Incoming mail server |
| MinIO (or S3) | Object storage for files |
| Redis | Caching layer |
| Prometheus + Grafana | Monitoring (optional) |
| GitHub Actions | CI/CD |

---

# 4. User Roles & Permissions

## 4.1 Role Hierarchy

```
                    ┌─────────────┐
                    │  Super Admin│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Admin      │
                    └──────┬──────┘
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

## 4.2 Role Definitions

### 4.2.1 Visitor (Unauthenticated)
- Browse all public pages
- Search content
- View news, articles, events, publications
- Download public documents
- Contact the society via contact form
- View member directory (limited)
- Apply for job vacancies

### 4.2.2 Member (Authenticated)
All Visitor permissions, plus:
- Edit own profile
- Create draft articles
- Submit articles for review
- View own workflow status
- Receive and respond to review comments
- Upload files (within quota)
- Use internal email system
- Access member-only content
- Send messages to other members
- View member directory (full)
- Create and manage own content drafts
- Receive notifications

### 4.2.3 Editor / Content Manager
All Member permissions, plus:
- Create, edit, and manage any content
- Manage categories and tags
- Manage media library
- Schedule content
- Manage menus and navigation

### 4.2.4 Reviewer
All Member permissions, plus:
- View all submitted content pending review
- Approve content
- Reject content with comments
- Request modifications
- Add internal review notes
- View content version history

### 4.2.5 Publisher
All Reviewer permissions, plus:
- Publish approved content
- Schedule publication dates
- Unpublish / Archive content
- Feature / pin content
- Manage content visibility
- Restore previous versions

### 4.2.6 Administrator
Full system access, including:
- Manage users, roles, and permissions
- Manage all content and workflows
- Manage website layout and components
- Configure system settings
- View audit logs and reports
- Manage email configuration (SMTP/IMAP)
- Manage quotas and storage
- Configure mailing lists
- Manage all aspects of the email system
- View analytics and statistics

### 4.2.7 Super Admin
All Administrator permissions, plus:
- Manage other administrators
- Configure system-wide settings
- Access to all security logs
- Database management tools (limited UI)

## 4.3 Permission Matrix

| Feature | Visitor | Member | Editor | Reviewer | Publisher | Admin | Super Admin |
|---------|---------|--------|--------|----------|-----------|-------|-------------|
| Browse public content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact form | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View member directory (limited) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View member directory (full) | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create drafts | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit for review | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use internal email | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload files | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Review content | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Approve/Reject content | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Publish content | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Schedule publishing | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Manage categories/tags | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Manage media library | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Manage menus | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Page builder (layout) | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage roles | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| System settings | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| View audit logs | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage email server config | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage other admins | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

# 5. Functional Requirements

## 5.1 Authentication & Authorization

- FR-AUTH-01: JWT-based authentication with access and refresh tokens
- FR-AUTH-02: Login with email/username and password
- FR-AUTH-03: Password encryption using BCrypt
- FR-AUTH-04: Role-based access control (RBAC) on all API endpoints
- FR-AUTH-05: Session timeout after configurable inactivity period
- FR-AUTH-06: "Remember Me" functionality (optional, using refresh tokens)
- FR-AUTH-07: Password reset flow via email
- FR-AUTH-08: Account lockout after multiple failed attempts (configurable)
- FR-AUTH-09: Registration (admin-created for members; self-registration optional)

## 5.2 User Management

- FR-USER-01: CRUD operations for users (admin only)
- FR-USER-02: User profile with photo, bio, contact info, specialization
- FR-USER-03: Role assignment and management
- FR-USER-04: User status (active, inactive, suspended, pending)
- FR-USER-05: Bulk user import (CSV/Excel)
- FR-USER-06: User search and filtering
- FR-USER-07: Activity log per user
- FR-USER-08: Member directory with search and filters
- FR-USER-09: Export member list (PDF, Excel)

## 5.3 Content Management (CMS)

- FR-CMS-01: Create, read, update, delete content (articles, news, pages)
- FR-CMS-02: Content versioning with full history
- FR-CMS-03: Auto-save drafts
- FR-CMS-04: Content preview before publishing
- FR-CMS-05: Scheduled publishing
- FR-CMS-06: Categories and tags for content organization
- FR-CMS-07: Featured/priority content flagging
- FR-CMS-08: SEO metadata (meta title, description, OG tags)
- FR-CMS-09: Friendly URL slugs (customizable)
- FR-CMS-10: Content reordering within categories
- FR-CMS-11: Copy/clone existing content
- FR-CMS-12: Content expiry/unpublish scheduling
- FR-CMS-13: Related content suggestions (tag-based)

## 5.4 Dynamic Page Builder (Component-Based)

- FR-PB-01: Drag-and-drop page builder interface
- FR-PB-02: Reusable component blocks (see Section 7.1)
- FR-PB-03: Component property configuration (colors, sizing, spacing)
- FR-PB-04: Row/column layout system with responsive breakpoints
- FR-PB-05: Component ordering and nesting
- FR-PB-06: Save component templates for reuse
- FR-PB-07: Global component styles
- FR-PB-08: Component visibility rules (roles, dates, devices)
- FR-PB-09: Preview page in desktop/tablet/mobile views
- FR-PB-10: Export/import page layouts as JSON
- FR-PB-11: Undo/redo for page building
- FR-PB-12: Custom CSS injection per component/page

## 5.5 Workflow Management

- FR-WF-01: Multi-stage content approval workflow
- FR-WF-02: Workflow states: Draft → Submitted → In Review → Approved/Rejected → Published
- FR-WF-03: Configurable workflow stages (admin)
- FR-WF-04: Reviewer assignment (automatic or manual)
- FR-WF-05: Review comments and feedback per version
- FR-WF-06: Revision request with specific change notes
- FR-WF-07: Content resubmission after revision
- FR-WF-08: Email notifications on status changes
- FR-WF-09: Workflow dashboard for pending items
- FR-WF-10: Workflow history and audit trail
- FR-WF-11: Scheduled publish after approval
- FR-WF-12: Escalation for stuck items (configurable timeout)

---

# 6. Public Website Pages

## 6.1 Home Page (Landing Page)

Components:
- Hero slider/carousel (3-5 slides) with overlay text and CTA
- Featured announcements (scrollable)
- Latest news grid (3-6 items)
- Upcoming events section (horizontal scroll or grid)
- Quick links to key pages
- Society statistics counters (members, publications, events, years)
- Partner and sponsor logos carousel
- Photo gallery (masonry or grid)
- Video section (embedded YouTube/Vimeo)
- Call-to-Action blocks (membership, contact, newsletter)
- Footer with sitemap, contact info, social links

## 6.2 About Us

- Society overview / history
- Vision, Mission, Objectives
- Organizational structure chart (interactive)
- Timeline of major milestones
- Downloadable documents (bylaws, annual reports)
- Photo gallery of society activities

## 6.3 President's Message

- President photo (professional portrait)
- Welcome message (rich text)
- Vision statement
- Signature
- Social sharing buttons

## 6.4 Board of Directors

- Grid/list of board members
- Each member: photo, name, position, bio
- Sorting by position/rank
- Term information
- Contact (email link)

## 6.5 Members

- Member directory search page
- Search filters: name, specialization, institution, city, membership type
- Member profile page (public limited view, logged-in full view)
- Member registration/application form (if enabled)
- Member benefits section

## 6.6 News & Announcements

- List view with pagination
- Category filter
- Tag cloud
- Featured/sticky news
- Search within news
- Individual article page with sharing options
- Related articles
- Comments (optional, toggleable)

## 6.7 Publications

- Scientific articles listing
- Research papers
- Annual reports
- PDF downloads with preview
- Search by title, author, year, category
- DOI linking (future)

## 6.8 Events

- Calendar view (monthly/weekly)
- List view
- Event detail page (date, location, description, organizer)
- Event categories (conference, workshop, seminar, training)
- Registration/RSVP (future)

## 6.9 Job Vacancies

- Vacancy listings with deadline
- Job details (description, requirements, location, type)
- Apply online (file upload for CV)
- Application status tracking (for logged-in users)
- Email notifications for new vacancies (subscription)

## 6.10 Contact Us

- Contact form (name, email, subject, message)
- Society address, phone, email
- Google Maps integration
- Social media links (LinkedIn, Facebook, Twitter/X, YouTube)
- Working hours
- Department contacts

## 6.11 Additional Pages (CMS-managed)

- Privacy policy
- Terms of service
- FAQs
- Photo gallery page
- Video gallery page
- Site map
- Any page created via Page Builder

---

# 7. Advanced CMS / Page Builder

## 7.1 Available Component Blocks

### Layout Components
| Component | Description |
|-----------|-------------|
| Container | Wrapper with configurable width, padding |
| Row | Horizontal flex container |
| Column | Vertical section within a row (2, 3, 4 columns) |
| Grid | CSS grid with configurable columns |
| Masonry | Masonry layout for images/cards |
| Section | Full-width section with background |

### Content Components
| Component | Description |
|-----------|-------------|
| Rich Text | WYSIWYG editor content |
| Heading | H1-H6 with styling |
| Paragraph | Text block |
| Image | Single image with caption, alt text |
| Image Gallery | Grid or slider of images |
| Video | Embedded video (YouTube, Vimeo, MP4) |
| PDF Viewer | Inline PDF viewer or download link |
| Table | Configurable table with header |
| List | Ordered/unordered list |
| Quote Block | Styled blockquote |
| Code Block | Syntax-highlighted code |
| Divider | Horizontal rule |
| HTML Block | Raw HTML injection |
| Embed Block | iFrame embedding |

### Media Components
| Component | Description |
|-----------|-------------|
| Hero Banner | Full-width hero with background, overlay, text, CTA |
| Carousel / Slider | Image/card carousel with navigation |
| Video Hero | Video background hero |
| Parallax Section | Parallax scrolling background |

### Interactive Components
| Component | Description |
|-----------|-------------|
| Cards | Configurable card (image, title, description, link) |
| Feature Cards | Icon + title + description grid |
| Testimonials | Quote + author cards |
| Accordion | Expandable sections |
| Tabs | Tabbed content |
| Timeline | Vertical/horizontal timeline |
| FAQ | Accordion-style FAQ |
| Statistics Counter | Animated number counters |
| Team Members | Grid with photo, name, role |
| Partner Logos | Logo carousel/grid |
| Icon Boxes | Icon + text blocks |
| Call-to-Action | Banner with heading, text, button |
| Buttons | Configurable buttons (link, action) |
| Forms | Contact form, subscription form |
| Newsletter | Email subscription form |
| Social Sharing | Share buttons |
| Social Links | Social media icon links |
| Search Component | In-page search widget |
| Related Articles | Auto-populated related content |
| Latest News | Dynamic news feed |
| Events List | Dynamic events list |
| Member Directory | Dynamic member listing |
| Map | Google Map or OpenStreetMap |
| Breadcrumb | Navigation breadcrumbs |
| Download Section | File download list |
| Tags | Tag cloud or list |

### Customization Properties (per component)

| Property | Options |
|----------|---------|
| Width | Full, contained, wide |
| Background Color | Color picker + preset palette |
| Background Image | Upload or media library pick |
| Background Repeat | Repeat, no-repeat, cover, contain |
| Padding | Top, right, bottom, left (all breakpoints) |
| Margin | Top, bottom (all breakpoints) |
| Border | Width, color, radius, style |
| Shadow | None, sm, md, lg, xl |
| Typography | Font family, size, weight, line height, color |
| Alignment | Left, center, right, justify |
| Animation | Fade, slide, zoom, none (with delay/duration) |
| Visibility | Always, logged-in only, logged-out only, role-based |
| CSS Class | Custom CSS class names |
| CSS ID | Custom element ID |

## 7.2 Media Library

- Grid view (thumbnails) and list view
- File types: images (JPEG, PNG, GIF, WebP, SVG), videos (MP4, WebM), documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX), archives (ZIP)
- Folder organization
- Drag-and-drop upload
- Bulk upload
- Image auto-compression on upload
- Auto-thumbnail generation (multiple sizes)
- File metadata (name, size, dimensions, type, upload date)
- File search and filter
- File replacement (preserving URL)
- File deletion with usage checking
- Copy URL / embed code
- Alt text management
- File versioning (optional)
- Storage usage indicator

## 7.3 Menu Manager

- Multiple menu locations (header, footer, sidebar)
- Drag-and-drop menu item ordering
- Menu item types: Page, URL, Category, Custom
- Nested menu items (dropdown, mega menu)
- Menu item icons
- Conditional visibility (role-based, logged-in/out)
- Multi-language menu support (future)

---

# 8. Content Workflow

## 8.1 Workflow States

```
                    ┌──────────┐
                    │  Draft   │
                    └────┬─────┘
                         │ Author submits
                    ┌────▼─────┐
                    │ Submitted │
                    └────┬─────┘
                         │ Assigned to Reviewer
                    ┌────▼─────┐
                    │In Review │
                    └────┬─────┘
                    ┌────┴────┐
                    │         │
              ┌─────▼──┐  ┌──▼────────┐
              │Approved │  │ Rejected  │
              └────┬────┘  └────┬──────┘
                   │            │
              ┌────▼────┐      │ (back to Draft)
              │Published│      │
              └─────────┘      │
                                │
                          ┌─────▼──────┐
                          │ Revision   │
                          │ Requested  │
                          └─────┬──────┘
                                │ (back to Draft)
```

## 8.2 Workflow Process

1. **Author** creates content → saves as **Draft**
2. **Author** submits → status becomes **Submitted**
3. **System/Admin** assigns **Reviewer** → status becomes **In Review**
4. **Reviewer** reviews:
   - **Approve** → status becomes **Approved** → Notification sent to Publisher
   - **Reject** → status becomes **Rejected** → Notification sent to Author
   - **Request Revision** → status becomes **Revision Requested** → comments provided → Author revises → back to **Submitted**
5. **Publisher** reviews approved content:
   - **Publish Now** → status becomes **Published** → Content goes live
   - **Schedule** → Content becomes **Scheduled** → Published at specified date/time
   - **Send Back** → Returns to **Approved** (for further review)
6. **Publisher** can **Unpublish** published content → status becomes **Archived**

## 8.3 Workflow Notifications

| Event | Notified Parties | Channel |
|-------|-----------------|---------|
| Content submitted for review | Assigned Reviewer | Email + In-system |
| Content approved | Author + Publisher | Email + In-system |
| Content rejected | Author | Email + In-system |
| Revision requested | Author | Email + In-system |
| Content published | Author | Email + In-system |
| Review overdue | Reviewer + Admin | Email |
| Content scheduled | Author + Publisher | Email + In-system |

## 8.4 Workflow Configuration (Admin)

- Enable/disable workflow for specific content types
- Configure required review count (1-3)
- Auto-assignment rules for reviewers
- Escalation timeout (hours/days)
- Allow authors to choose reviewer
- Allow authors to bypass review (admin toggle)
- Custom workflow stages

---

# 9. Internal Email & Messaging System

## 9.1 Email Account Management

- FR-EMAIL-01: Each member assigned official email: `firstname.lastname@ssssy.org.sy` or `username@ssssy.org.sy`
- FR-EMAIL-02: Mailbox per user (Inbox, Sent, Drafts, Trash, Spam, Archive)
- FR-EMAIL-03: Quota management per user (configurable by admin)
- FR-EMAIL-04: Email account auto-provisioning on member account creation
- FR-EMAIL-05: Account disabling on member deactivation
- FR-EMAIL-06: Password management for email accounts
- FR-EMAIL-07: IMAP/SMTP access for external clients (Outlook, Thunderbird, Apple Mail)
- FR-EMAIL-08: Email aliases (optional)

## 9.2 Email Features

- FR-EMAIL-09: Compose, reply, reply-all, forward
- FR-EMAIL-10: Rich text editor for email composition (TipTap/Quill)
- FR-EMAIL-11: File attachments (PDF, Word, Excel, PowerPoint, ZIP, images, videos)
- FR-EMAIL-12: Drag-and-drop file attachment
- FR-EMAIL-13: Save as draft
- FR-EMAIL-14: Schedule email sending
- FR-EMAIL-15: Insert images inline
- FR-EMAIL-16: Conversation view (threaded emails, Gmail-style)
- FR-EMAIL-17: Email signatures (configurable per user)
- FR-EMAIL-18: Read receipts (optional)

## 9.3 Internal Messaging

- FR-EMAIL-19: Send to individual members, multiple members, departments, committees
- FR-EMAIL-20: Board member broadcasts
- FR-EMAIL-21: Distribution lists and groups
- FR-EMAIL-22: Instant delivery within the system
- FR-EMAIL-23: Read status tracking for internal messages
- FR-EMAIL-24: Message priority flags (normal, important, urgent)

## 9.4 External Email

- FR-EMAIL-25: Send to any external email address (Gmail, Outlook, Yahoo, etc.)
- FR-EMAIL-26: Receive from external senders in society mailbox
- FR-EMAIL-27: SPF, DKIM, DMARC compliance for deliverability
- FR-EMAIL-28: Outgoing mail queue management

## 9.5 Mailbox Management

- FR-EMAIL-29: Search across all folders (sender, recipient, subject, date, attachment, keywords)
- FR-EMAIL-30: Filter by date, read status, flags, folder, attachment presence
- FR-EMAIL-31: Sort by date, sender, subject, size
- FR-EMAIL-32: Custom folder creation
- FR-EMAIL-33: Mark as read/unread
- FR-EMAIL-34: Star and flag messages
- FR-EMAIL-35: Archive and restore
- FR-EMAIL-36: Empty trash / permanent delete
- FR-EMAIL-37: Move/copy between folders
- FR-EMAIL-38: Bulk select operations

## 9.6 Address Book

- FR-EMAIL-39: Personal contacts management (add, edit, delete, import)
- FR-EMAIL-40: Organization directory (all members)
- FR-EMAIL-41: Department directory
- FR-EMAIL-42: Auto-complete when composing (from address book + directory)
- FR-EMAIL-43: Contact groups (distribution lists)
- FR-EMAIL-44: Contact import/export (vCard, CSV)
- FR-EMAIL-45: Favorites / frequently contacted

## 9.7 Email Security

- FR-EMAIL-46: SSL/TLS for all connections
- FR-EMAIL-47: Anti-spam filtering (SpamAssassin or similar)
- FR-EMAIL-48: Virus scanning (ClamAV)
- FR-EMAIL-49: Attachment type validation
- FR-EMAIL-50: DKIM signing
- FR-EMAIL-51: SPF verification
- FR-EMAIL-52: DMARC policy
- FR-EMAIL-53: Message encryption (optional, PGP/SMIME)
- FR-EMAIL-54: Rate limiting for outgoing mail
- FR-EMAIL-55: Suspicious link detection

## 9.8 Email Administration

- FR-EMAIL-56: Create/disable email accounts
- FR-EMAIL-57: Reset email passwords
- FR-EMAIL-58: Configure per-user quotas
- FR-EMAIL-59: Manage distribution lists
- FR-EMAIL-60: View storage usage (per user, total)
- FR-EMAIL-61: Configure SMTP/IMAP server settings
- FR-EMAIL-62: Configure retention policies (auto-delete after X days)
- FR-EMAIL-63: Email forwarding rules
- FR-EMAIL-64: Catch-all address configuration
- FR-EMAIL-65: Bounce message handling
- FR-EMAIL-66: Audit log for admin actions on email

## 9.9 Email Integration

- FR-EMAIL-67: User management integration (create email with member)
- FR-EMAIL-68: Workflow notifications via email
- FR-EMAIL-69: Calendar integration (future)
- FR-EMAIL-70: Document management integration (attach from library)
- FR-EMAIL-71: Notification center integration

---

# 10. Member Management

## 10.1 Member Types

- Regular Member
- Student Member
- Honorary Member
- Life Member
- Board Member
- Founder Member

## 10.2 Member Profile Fields

| Field | Type | Public | Logged-in | Admin |
|-------|------|--------|-----------|-------|
| Full Name (Arabic) | Text | ✓ | ✓ | ✓ |
| Full Name (English) | Text | ✓ | ✓ | ✓ |
| Photo | Image | ✓ | ✓ | ✓ |
| Email | Email | ✗ | ✓ | ✓ |
| Phone | Tel | ✗ | ✓ | ✓ |
| Institution | Text | ✓ | ✓ | ✓ |
| Department | Text | ✓ | ✓ | ✓ |
| Position | Text | ✓ | ✓ | ✓ |
| Specialization | Text | ✓ | ✓ | ✓ |
| Research Interests | Textarea | ✗ | ✓ | ✓ |
| Biography | Rich Text | ✓ | ✓ | ✓ |
| Address | Text | ✗ | ✓ | ✓ |
| Country / City | Text | ✓ | ✓ | ✓ |
| ORCID ID | URL | ✗ | ✓ | ✓ |
| Google Scholar | URL | ✗ | ✓ | ✓ |
| LinkedIn | URL | ✗ | ✓ | ✓ |
| Membership Type | Select | ✓ | ✓ | ✓ |
| Join Date | Date | ✗ | ✓ | ✓ |
| Membership Status | Select | ✗ | ✓ | ✓ |
| Academic Degrees | JSON Array | ✓ | ✓ | ✓ |
| Publications | JSON Array | ✗ | ✓ | ✓ |

## 10.3 Member Features

- Member search with advanced filters
- Member directory (public: limited; logged-in: full)
- Member registration request (admin approval)
- Member import (CSV/Excel from admin)
- Member export (PDF, Excel)
- Membership renewal tracking (future)
- Member statistics dashboard

---

# 11. Search Engine

## 11.1 Searchable Content

- Articles and news
- Members
- Publications
- Events
- Documents (PDF content - optional with Elasticsearch)
- Pages (CMS pages)
- Job vacancies

## 11.2 Search Features

- Full-text search across all content
- Faceted search with filters (category, date range, author, tags, type)
- Autocomplete / suggestions
- Search result highlighting
- Paginated results
- Sorting (relevance, date, title)
- Saved searches (for logged-in users)
- Search within results
- Boolean operators (AND, OR, NOT)

## 11.3 Implementation Options

| Option | Pros | Cons |
|--------|------|------|
| PostgreSQL Full-Text Search (tsvector) | No extra infrastructure, good enough for most cases | Limited advanced features |
| Elasticsearch | Powerful, scalable, advanced features | Requires separate infrastructure |

**Recommendation:** Start with PostgreSQL FTS for MVP, plan Elasticsearch for Phase 3.

---

# 12. Notification System

## 12.1 Notification Types

- Workflow notifications (submitted, approved, rejected, published)
- Email notifications (new email received)
- System announcements
- Comment replies
- Content sharing
- Event reminders
- Account-related (password change, login from new device)
- Admin broadcasts

## 12.2 Notification Channels

| Channel | Implementation | Priority |
|---------|---------------|----------|
| In-system notification | WebSocket (STOMP over SockJS) + REST fallback | Primary |
| Email notification | Spring Mail + SMTP | Primary |
| Browser notification | Push API (optional) | Phase 2 |
| Mobile push | Firebase Cloud Messaging (future) | Phase 3 |

## 12.3 Notification Features

- Notification bell icon with unread count
- Notification list with pagination
- Mark as read / mark all as read
- Notification categories
- Per-user notification preferences (opt-in/out per type)
- Clickable notifications (navigate to relevant content)
- Notification grouping (same type, same content)
- Auto-cleanup of old notifications (configurable retention)

---

# 13. Media Management

## 13.1 Supported File Types

| Category | Formats |
|----------|---------|
| Images | JPEG, PNG, GIF, WebP, SVG, BMP, TIFF |
| Videos | MP4, WebM, MOV, AVI |
| Documents | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX |
| Archives | ZIP, RAR, 7z, TAR, GZ |
| Other | CSV, JSON, XML, TXT |

## 13.2 Image Processing

- Auto-compression on upload (lossless/lossy)
- Thumbnail generation: small (150x150), medium (300x300), large (1024x1024)
- WebP conversion option
- Lazy loading for all images
- Responsive image support (srcset)
- EXIF data stripping (privacy)
- Max file size configurable
- Image cropping (optional, via frontend)

## 13.3 File Organization

- Folder structure (configurable by admin)
- Tags for files
- File search (name, type, date, size)
- File usage tracking (which pages use which files)
- Duplicate detection
- Orphan file cleanup

---

# 14. Administration Dashboard

## 14.1 Dashboard Widgets

| Widget | Description | Role Access |
|--------|-------------|-------------|
| Total Members | Count with trend | Admin+ |
| Published Articles | Count this month/year | Editor+ |
| Draft Articles | Count pending author action | Editor+ |
| Pending Reviews | Count awaiting reviewer | Reviewer+ |
| Upcoming Events | Next 5 events | Editor+ |
| Recent Activities | Latest 10 system actions | Admin+ |
| Website Statistics | Page views, visitors (basic) | Admin+ |
| Storage Usage | Used vs total space | Admin+ |
| Email Usage | Quota usage per dept | Admin+ |
| New Registrations | Last 30 days | Admin+ |
| Content by Category | Pie/bar chart | Editor+ |
| Workflow Funnel | Draft → Submitted → Review → Published | Admin+ |
| Quick Actions | Create content, add user, etc. | Varies |

## 14.2 Admin Panel Features

- Left sidebar navigation with icons
- Responsive admin layout
- Dark mode toggle
- Keyboard shortcuts
- Bulk operations on tables
- Export to CSV/Excel/PDF
- Advanced filtering on all list pages
- Activity log / audit trail viewer
- System configuration page
- Cache management (clear cache)
- Backup/restore interface (basic)
- Support ticket / feedback link

---

# 15. Database Design (ERD)

## 15.1 Entity Relationship Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────────────┘

=== CORE ENTITIES ===

USERS
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE, NOT NULL)
├── password_hash (VARCHAR, NOT NULL)
├── first_name_ar (VARCHAR)
├── last_name_ar (VARCHAR)
├── first_name_en (VARCHAR)
├── last_name_en (VARCHAR)
├── username (VARCHAR, UNIQUE)
├── phone (VARCHAR)
├── photo_url (VARCHAR)
├── institution (VARCHAR)
├── department (VARCHAR)
├── position (VARCHAR)
├── specialization (VARCHAR)
├── biography (TEXT)
├── address (TEXT)
├── city (VARCHAR)
├── country (VARCHAR)
├── membership_type (ENUM: regular, student, honorary, life, board, founder)
├── membership_status (ENUM: active, inactive, suspended, pending)
├── join_date (TIMESTAMP)
├── orcid_id (VARCHAR)
├── google_scholar_url (VARCHAR)
├── linkedin_url (VARCHAR)
├── email_quota_mb (INTEGER, DEFAULT 500)
├── email_storage_used_mb (INTEGER, DEFAULT 0)
├── account_locked (BOOLEAN, DEFAULT FALSE)
├── failed_attempts (INTEGER, DEFAULT 0)
├── lockout_time (TIMESTAMP)
├── last_login (TIMESTAMP)
├── email_verified (BOOLEAN, DEFAULT FALSE)
├── two_factor_enabled (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP, nullable)

ROLES
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE, NOT NULL)  -- ROLE_VISITOR, ROLE_MEMBER, ROLE_EDITOR, ROLE_REVIEWER, ROLE_PUBLISHER, ROLE_ADMIN, ROLE_SUPER_ADMIN
├── description (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

USER_ROLES (Join Table)
├── user_id (UUID, FK → USERS)
├── role_id (UUID, FK → ROLES)
└── PRIMARY KEY (user_id, role_id)

PERMISSIONS
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE, NOT NULL)
├── description (VARCHAR)
├── resource (VARCHAR)  -- e.g., "content", "users", "workflow"
├── action (VARCHAR)    -- e.g., "create", "read", "update", "delete", "approve"
└── created_at (TIMESTAMP)

ROLE_PERMISSIONS (Join Table)
├── role_id (UUID, FK → ROLES)
├── permission_id (UUID, FK → PERMISSIONS)
└── PRIMARY KEY (role_id, permission_id)

=== CONTENT ENTITIES ===

CONTENT_CATEGORIES
├── id (UUID, PK)
├── name_ar (VARCHAR, NOT NULL)
├── name_en (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT)
├── parent_id (UUID, FK → CONTENT_CATEGORIES, nullable)
├── sort_order (INTEGER)
├── is_active (BOOLEAN, DEFAULT TRUE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

TAGS
├── id (UUID, PK)
├── name (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

CONTENT (Core content table for articles, news, publications, etc.)
├── id (UUID, PK)
├── content_type (ENUM: article, news, publication, event, job, page, custom)
├── title_ar (VARCHAR, NOT NULL)
├── title_en (VARCHAR)
├── slug (VARCHAR, NOT NULL)
├── excerpt (TEXT)
├── body (JSONB)  -- Rich content or page builder JSON
├── featured_image_url (VARCHAR)
├── status (ENUM: draft, submitted, in_review, approved, rejected, revision_requested, scheduled, published, archived)
├── author_id (UUID, FK → USERS, NOT NULL)
├── reviewer_id (UUID, FK → USERS, nullable)
├── publisher_id (UUID, FK → USERS, nullable)
├── category_id (UUID, FK → CONTENT_CATEGORIES, nullable)
├── is_featured (BOOLEAN, DEFAULT FALSE)
├── is_pinned (BOOLEAN, DEFAULT FALSE)
├── is_member_only (BOOLEAN, DEFAULT FALSE)
├── published_at (TIMESTAMP, nullable)
├── scheduled_at (TIMESTAMP, nullable)
├── archived_at (TIMESTAMP, nullable)
├── meta_title (VARCHAR)
├── meta_description (VARCHAR)
├── meta_keywords (VARCHAR)
├── og_image_url (VARCHAR)
├── og_title (VARCHAR)
├── og_description (VARCHAR)
├── view_count (INTEGER, DEFAULT 0)
├── version (INTEGER, DEFAULT 1)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── deleted_at (TIMESTAMP, nullable)
└── UNIQUE (slug, content_type)  -- slug unique per type

CONTENT_TAGS (Join Table)
├── content_id (UUID, FK → CONTENT)
├── tag_id (UUID, FK → TAGS)
└── PRIMARY KEY (content_id, tag_id)

CONTENT_VERSIONS
├── id (UUID, PK)
├── content_id (UUID, FK → CONTENT, NOT NULL)
├── version_number (INTEGER, NOT NULL)
├── title_ar (VARCHAR)
├── title_en (VARCHAR)
├── body (JSONB)
├── excerpt (TEXT)
├── featured_image_url (VARCHAR)
├── status (VARCHAR)
├── changed_by (UUID, FK → USERS)
├── change_summary (TEXT)
├── created_at (TIMESTAMP)
└── UNIQUE (content_id, version_number)

WORKFLOW_LOGS
├── id (UUID, PK)
├── content_id (UUID, FK → CONTENT, NOT NULL)
├── from_status (ENUM)
├── to_status (ENUM)
├── actor_id (UUID, FK → USERS, NOT NULL)
├── action (VARCHAR)  -- submit, approve, reject, request_revision, publish, etc.
├── comments (TEXT)
├── created_at (TIMESTAMP)

=== PAGE BUILDER ENTITIES ===

PAGES (for CMS-managed pages)
├── id (UUID, PK)
├── title_ar (VARCHAR, NOT NULL)
├── title_en (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── layout_json (JSONB, NOT NULL)  -- Stores the full page layout as component tree
├── meta_title (VARCHAR)
├── meta_description (VARCHAR)
├── is_published (BOOLEAN, DEFAULT FALSE)
├── is_homepage (BOOLEAN, DEFAULT FALSE)
├── parent_id (UUID, FK → PAGES, nullable)
├── sort_order (INTEGER)
├── template (VARCHAR)  -- full_width, sidebar_left, sidebar_right
├── css_custom (TEXT, nullable)
├── js_custom (TEXT, nullable)
├── created_by (UUID, FK → USERS)
├── updated_by (UUID, FK → USERS)
├── version (INTEGER, DEFAULT 1)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP, nullable)

COMPONENT_TEMPLATES (reusable component blueprints)
├── id (UUID, PK)
├── name (VARCHAR, NOT NULL)
├── type (VARCHAR)  -- hero, cards, slider, etc.
├── category (VARCHAR)  -- layout, content, media, interactive
├── thumbnail_url (VARCHAR)
├── config_json (JSONB)  -- default configuration
├── is_system (BOOLEAN, DEFAULT FALSE)
├── created_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== MENU ENTITIES ===

MENUS
├── id (UUID, PK)
├── name (VARCHAR, NOT NULL)
├── location (VARCHAR)  -- header_main, header_top, footer, sidebar
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

MENU_ITEMS
├── id (UUID, PK)
├── menu_id (UUID, FK → MENUS, NOT NULL)
├── parent_id (UUID, FK → MENU_ITEMS, nullable)
├── label_ar (VARCHAR, NOT NULL)
├── label_en (VARCHAR)
├── type (ENUM: page, url, category, custom)
├── value (VARCHAR)  -- page_id, URL, category_id
├── icon (VARCHAR, nullable)
├── target (VARCHAR, DEFAULT '_self')
├── sort_order (INTEGER)
├── is_active (BOOLEAN, DEFAULT TRUE)
├── visibility (VARCHAR, DEFAULT 'all')  -- all, logged_in, logged_out, role:XYZ
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== MEDIA ENTITIES ===

MEDIA
├── id (UUID, PK)
├── filename (VARCHAR, NOT NULL)
├── original_filename (VARCHAR, NOT NULL)
├── file_path (VARCHAR, NOT NULL)
├── thumbnail_path (VARCHAR)
├── file_type (VARCHAR)  -- image, video, document, archive, other
├── mime_type (VARCHAR)
├── file_size_bytes (BIGINT)
├── width (INTEGER, nullable)
├── height (INTEGER, nullable)
├── alt_text (VARCHAR)
├── caption (TEXT)
├── folder_id (UUID, FK → MEDIA_FOLDERS, nullable)
├── uploaded_by (UUID, FK → USERS)
├── is_temp (BOOLEAN, DEFAULT FALSE)
├── metadata (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

MEDIA_FOLDERS
├── id (UUID, PK)
├── name (VARCHAR, NOT NULL)
├── parent_id (UUID, FK → MEDIA_FOLDERS, nullable)
├── path (VARCHAR)
├── created_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== EMAIL ENTITIES ===

EMAIL_ACCOUNTS
├── id (UUID, PK)
├── user_id (UUID, FK → USERS, UNIQUE, NOT NULL)
├── email (VARCHAR, UNIQUE, NOT NULL)  -- username@ssssy.org.sy
├── password_hash (VARCHAR, NOT NULL)  -- hashed mail password
├── quota_mb (INTEGER, DEFAULT 500)
├── storage_used_mb (INTEGER, DEFAULT 0)
├── is_active (BOOLEAN, DEFAULT TRUE)
├── forward_to (VARCHAR, nullable)
├── auto_reply_subject (VARCHAR)
├── auto_reply_body (TEXT)
├── auto_reply_active (BOOLEAN, DEFAULT FALSE)
├── signature (TEXT)
├── last_sync_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

EMAIL_MESSAGES
├── id (UUID, PK)
├── account_id (UUID, FK → EMAIL_ACCOUNTS, NOT NULL)
├── folder (ENUM: inbox, sent, drafts, trash, spam, archive, custom)
├── custom_folder_id (UUID, nullable)
├── message_id (VARCHAR)  -- Message-ID header
├── in_reply_to (VARCHAR, nullable)  -- for threading
├── references (TEXT, nullable)  -- for threading
├── sender_email (VARCHAR, NOT NULL)
├── sender_name (VARCHAR)
├── recipient_email (VARCHAR, NOT NULL)
├── cc (TEXT, nullable)  -- JSON array
├── bcc (TEXT, nullable)  -- JSON array
├── subject (VARCHAR)
├── body_text (TEXT)
├── body_html (TEXT)
├── is_read (BOOLEAN, DEFAULT FALSE)
├── is_starred (BOOLEAN, DEFAULT FALSE)
├── is_flagged (BOOLEAN, DEFAULT FALSE)
├── is_draft (BOOLEAN, DEFAULT FALSE)
├── is_scheduled (BOOLEAN, DEFAULT FALSE)
├── scheduled_at (TIMESTAMP, nullable)
├── priority (ENUM: normal, important, urgent)
├── size_bytes (INTEGER)
├── sent_at (TIMESTAMP)
├── received_at (TIMESTAMP)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP, nullable)

EMAIL_ATTACHMENTS
├── id (UUID, PK)
├── message_id (UUID, FK → EMAIL_MESSAGES, NOT NULL)
├── filename (VARCHAR, NOT NULL)
├── file_path (VARCHAR, NOT NULL)
├── mime_type (VARCHAR)
├── size_bytes (INTEGER)
├── content_id (VARCHAR)  -- for inline images
├── created_at (TIMESTAMP)

EMAIL_FOLDERS (custom folders)
├── id (UUID, PK)
├── account_id (UUID, FK → EMAIL_ACCOUNTS, NOT NULL)
├── name (VARCHAR, NOT NULL)
├── parent_id (UUID, FK → EMAIL_FOLDERS, nullable)
├── sort_order (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

EMAIL_CONTACTS (personal address book)
├── id (UUID, PK)
├── user_id (UUID, FK → USERS, NOT NULL)
├── email (VARCHAR, NOT NULL)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── phone (VARCHAR)
├── company (VARCHAR)
├── notes (TEXT)
├── is_favorite (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

CONTACT_GROUPS
├── id (UUID, PK)
├── user_id (UUID, FK → USERS, NOT NULL)
├── name (VARCHAR, NOT NULL)
├── description (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

CONTACT_GROUP_MEMBERS (Join Table)
├── contact_id (UUID, FK → EMAIL_CONTACTS)
├── group_id (UUID, FK → CONTACT_GROUPS)
└── PRIMARY KEY (contact_id, group_id)

DISTRIBUTION_LISTS (system-level mailing lists)
├── id (UUID, PK)
├── name (VARCHAR, NOT NULL)
├── email (VARCHAR, UNIQUE)  -- listname@ssssy.org.sy
├── description (TEXT)
├── type (ENUM: all_members, board, department, committee, custom)
├── created_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

DISTRIBUTION_LIST_MEMBERS (Join Table)
├── list_id (UUID, FK → DISTRIBUTION_LISTS)
├── user_id (UUID, FK → USERS)
└── PRIMARY KEY (list_id, user_id)

=== EVENTS ENTITIES ===

EVENTS
├── id (UUID, PK)
├── title_ar (VARCHAR, NOT NULL)
├── title_en (VARCHAR)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT)
├── event_type (ENUM: conference, workshop, seminar, training, meeting, other)
├── start_date (TIMESTAMP, NOT NULL)
├── end_date (TIMESTAMP)
├── location (VARCHAR)
├── address (TEXT)
├── latitude (DECIMAL, nullable)
├── longitude (DECIMAL, nullable)
├── is_online (BOOLEAN, DEFAULT FALSE)
├── online_url (VARCHAR, nullable)
├── featured_image_url (VARCHAR)
├── organizer (VARCHAR)
├── contact_email (VARCHAR)
├── registration_deadline (TIMESTAMP, nullable)
├── max_participants (INTEGER, nullable)
├── is_published (BOOLEAN, DEFAULT FALSE)
├── created_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== JOB VACANCIES ENTITIES ===

JOB_VACANCIES
├── id (UUID, PK)
├── title_ar (VARCHAR, NOT NULL)
├── title_en (VARCHAR)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT, NOT NULL)
├── requirements (TEXT)
├── responsibilities (TEXT)
├── location (VARCHAR)
├── job_type (ENUM: full_time, part_time, contract, temporary, remote)
├── department (VARCHAR)
├── salary_range (VARCHAR)
├── application_deadline (TIMESTAMP, NOT NULL)
├── is_published (BOOLEAN, DEFAULT FALSE)
├── contact_email (VARCHAR)
├── created_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

JOB_APPLICATIONS
├── id (UUID, PK)
├── vacancy_id (UUID, FK → JOB_VACANCIES, NOT NULL)
├── applicant_name (VARCHAR, NOT NULL)
├── applicant_email (VARCHAR, NOT NULL)
├── applicant_phone (VARCHAR)
├── cover_letter (TEXT)
├── cv_file_url (VARCHAR, NOT NULL)
├── additional_files (JSONB)
├── status (ENUM: pending, reviewed, shortlisted, interviewed, accepted, rejected)
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== NOTIFICATIONS ENTITIES ===

NOTIFICATIONS
├── id (UUID, PK)
├── user_id (UUID, FK → USERS, NOT NULL)
├── type (VARCHAR, NOT NULL)  -- workflow, email, system, comment, etc.
├── title (VARCHAR, NOT NULL)
├── body (TEXT)
├── link (VARCHAR, nullable)  -- URL to navigate to
├── reference_id (VARCHAR, nullable)  -- ID of related entity
├── reference_type (VARCHAR, nullable)  -- content, email, event, etc.
├── is_read (BOOLEAN, DEFAULT FALSE)
├── is_archived (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP)

NOTIFICATION_PREFERENCES
├── id (UUID, PK)
├── user_id (UUID, FK → USERS, UNIQUE, NOT NULL)
├── workflow_email (BOOLEAN, DEFAULT TRUE)
├── workflow_inapp (BOOLEAN, DEFAULT TRUE)
├── email_new (BOOLEAN, DEFAULT TRUE)
├── email_inapp (BOOLEAN, DEFAULT TRUE)
├── system_announcement_email (BOOLEAN, DEFAULT TRUE)
├── system_announcement_inapp (BOOLEAN, DEFAULT TRUE)
├── comment_email (BOOLEAN, DEFAULT FALSE)
├── comment_inapp (BOOLEAN, DEFAULT TRUE)
├── event_reminder_email (BOOLEAN, DEFAULT TRUE)
├── event_reminder_inapp (BOOLEAN, DEFAULT TRUE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

=== AUDIT & LOGGING ENTITIES ===

AUDIT_LOGS
├── id (UUID, PK)
├── actor_id (UUID, FK → USERS, nullable)  -- null for system actions
├── action (VARCHAR, NOT NULL)
├── resource (VARCHAR, NOT NULL)
├── resource_id (VARCHAR, nullable)
├── details (JSONB)
├── ip_address (VARCHAR)
├── user_agent (VARCHAR)
├── created_at (TIMESTAMP)
└── INDEX (actor_id, resource, action, created_at)

=== SYSTEM CONFIGURATION ENTITY ===

SYSTEM_CONFIG
├── id (UUID, PK)
├── config_key (VARCHAR, UNIQUE, NOT NULL)
├── config_value (TEXT, NOT NULL)
├── config_type (VARCHAR)  -- string, number, boolean, json
├── description (VARCHAR)
├── updated_by (UUID, FK → USERS)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 15.2 Key Database Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID primary keys | Avoid sequential ID exposure, distributed-friendly |
| JSONB for page layouts | Flexible component storage without complex EAV |
| JSONB for content body | Rich content with embedded media references |
| Soft delete (deleted_at) | Data recovery, audit trail |
| Separate content_versions table | Full version history without bloating main table |
| Content type discriminator | Single table for all content types (simplifies search) |
| Email messages as DB records | Fast search, workflow integration, avoids IMAP-only reliance |
| Folders for media | Organized file management |
| Job applications separate | High-volume writes, distinct lifecycle |

## 15.3 Indexing Strategy

```sql
-- Core indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(membership_status);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type_status ON content(content_type, status);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_slug ON content(content_type, slug);
CREATE INDEX idx_content_published_at ON content(published_at);
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_media_folder ON media(folder_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_email_account_user ON email_accounts(user_id);
CREATE INDEX idx_email_messages_account_folder ON email_messages(account_id, folder);
CREATE INDEX idx_email_messages_subject ON email_messages(subject);
CREATE INDEX idx_email_messages_sender ON email_messages(sender_email);
CREATE INDEX idx_email_messages_received ON email_messages(received_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_workflow_logs_content ON workflow_logs(content_id);
CREATE INDEX idx_job_vacancies_deadline ON job_vacancies(application_deadline);

-- Full-text search indexes (PostgreSQL FTS)
CREATE INDEX idx_content_fts_ar ON content USING GIN(to_tsvector('arabic', coalesce(title_ar, '') || ' ' || coalesce(body, '')));
CREATE INDEX idx_content_fts_en ON content USING GIN(to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(body, '')));
```

---

# 16. API Design

## 16.1 API Conventions

- **Base URL:** `/api/v1`
- **Format:** RESTful JSON
- **Auth:** Bearer JWT token in `Authorization` header
- **Pagination:** `?page=0&size=20&sort=createdAt,desc`
- **Response Envelope:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "errors": null,
  "timestamp": "2026-06-26T12:00:00Z"
}
```
- **Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "email": "Email already registered",
    "username": "Username must be at least 3 characters"
  },
  "timestamp": "2026-06-26T12:00:00Z"
}
```

## 16.2 Core API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/register` | Self-registration (if enabled) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset password with token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List users (admin) |
| GET | `/api/v1/users/{id}` | Get user profile |
| PUT | `/api/v1/users/{id}` | Update user (admin/self) |
| DELETE | `/api/v1/users/{id}` | Delete user (admin) |
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update own profile |
| GET | `/api/v1/users/directory` | Member directory (public) |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content` | List content (filterable) |
| POST | `/api/v1/content` | Create content |
| GET | `/api/v1/content/{id}` | Get content by ID |
| PUT | `/api/v1/content/{id}` | Update content |
| DELETE | `/api/v1/content/{id}` | Delete content (soft) |
| GET | `/api/v1/content/{id}/versions` | List versions |
| GET | `/api/v1/content/{id}/versions/{version}` | Get specific version |

### Workflow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/content/{id}/submit` | Submit for review |
| POST | `/api/v1/content/{id}/approve` | Approve content |
| POST | `/api/v1/content/{id}/reject` | Reject content |
| POST | `/api/v1/content/{id}/request-revision` | Request revision |
| POST | `/api/v1/content/{id}/publish` | Publish content |
| POST | `/api/v1/content/{id}/schedule` | Schedule publishing |
| POST | `/api/v1/content/{id}/unpublish` | Unpublish content |
| GET | `/api/v1/workflow/pending` | Get pending items for reviewer |

### Pages (CMS)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pages` | List pages |
| POST | `/api/v1/pages` | Create page |
| GET | `/api/v1/pages/{id}` | Get page by ID |
| PUT | `/api/v1/pages/{id}` | Update page |
| DELETE | `/api/v1/pages/{id}` | Delete page |
| GET | `/api/v1/pages/{id}/preview` | Preview page (render layout) |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/media` | List media files |
| POST | `/api/v1/media/upload` | Upload file(s) |
| GET | `/api/v1/media/{id}` | Get file details |
| DELETE | `/api/v1/media/{id}` | Delete file |
| PUT | `/api/v1/media/{id}/replace` | Replace file |
| GET | `/api/v1/media/folders` | List folders |
| POST | `/api/v1/media/folders` | Create folder |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/email/messages` | List messages (with folder filter) |
| POST | `/api/v1/email/compose` | Send email |
| POST | `/api/v1/email/drafts` | Save draft |
| PUT | `/api/v1/email/drafts/{id}` | Update draft |
| DELETE | `/api/v1/email/messages/{id}` | Delete/trash message |
| PUT | `/api/v1/email/messages/{id}/read` | Mark as read/unread |
| PUT | `/api/v1/email/messages/{id}/star` | Toggle star |
| PUT | `/api/v1/email/messages/{id}/move` | Move to folder |
| GET | `/api/v1/email/messages/{id}` | Get single message |
| GET | `/api/v1/email/attachments/{id}` | Download attachment |
| GET | `/api/v1/email/folders` | List custom folders |
| POST | `/api/v1/email/folders` | Create custom folder |
| GET | `/api/v1/email/contacts` | List contacts |
| POST | `/api/v1/email/contacts` | Add contact |
| GET | `/api/v1/email/address-book` | Auto-complete suggestions |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events` | List events |
| POST | `/api/v1/events` | Create event |
| GET | `/api/v1/events/{id}` | Get event details |
| PUT | `/api/v1/events/{id}` | Update event |
| DELETE | `/api/v1/events/{id}` | Delete event |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List vacancies |
| POST | `/api/v1/jobs` | Create vacancy |
| GET | `/api/v1/jobs/{id}` | Get vacancy details |
| PUT | `/api/v1/jobs/{id}` | Update vacancy |
| DELETE | `/api/v1/jobs/{id}` | Delete vacancy |
| POST | `/api/v1/jobs/{id}/apply` | Apply for vacancy |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List user notifications |
| PUT | `/api/v1/notifications/{id}/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all as read |
| GET | `/api/v1/notifications/unread-count` | Get unread count |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Full-text search across all content |
| GET | `/api/v1/search/suggestions` | Autocomplete suggestions |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/v1/admin/dashboard/recent-activity` | Recent activities |

### Configuration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/config` | Get system config |
| PUT | `/api/v1/admin/config` | Update system config |

---

# 17. Non-Functional Requirements

## 17.1 Performance

| Requirement | Target |
|-------------|--------|
| Page load time (public) | < 2 seconds (TTFB < 500ms) |
| Page load time (admin) | < 3 seconds |
| API response time (p95) | < 500ms |
| Concurrent users (public) | Support 1000+ |
| Concurrent users (admin) | Support 100+ |
| Image optimization | Auto-compress to < 200KB |
| Database query time (p95) | < 200ms |
| Search response time | < 1 second |
| Email sending throughput | 100+ emails/minute |

## 17.2 Scalability

- Horizontal scaling for stateless API layer
- Database read replicas for heavy read loads
- CDN for static assets and media files
- Caching layer (Redis) for frequently accessed data
- Lazy loading for images and components
- Infinite scroll or pagination for lists

## 17.3 Availability

- Target uptime: 99.9% (excluding planned maintenance)
- Graceful degradation on component failure
- Database backup: daily automated backups
- Disaster recovery plan (RTO < 4 hours, RPO < 24 hours)

## 17.4 Security

- OWASP Top 10 protection
- HTTPS enforced (HSTS headers)
- JWT with short expiry (15 min access, 7 day refresh)
- Password hashing: BCrypt (strength 10+)
- Rate limiting on auth endpoints
- Input validation (server-side + client-side)
- XSS prevention (Content Security Policy headers)
- SQL injection prevention (parameterized queries via JPA)
- CSRF protection for state-changing operations
- File upload validation (type, size, content scanning)
- Audit logging for all admin actions
- GDPR/privacy compliance features (data export, deletion)

## 17.5 Reliability

- Graceful error handling with user-friendly messages
- Retry mechanism for critical operations
- Transaction management for multi-step operations
- Idempotency keys for critical operations (payments, submissions)
- Regular health check endpoints

## 17.6 Usability

- Fully responsive (mobile, tablet, desktop)
- RTL support for Arabic language
- Accessibility compliance (WCAG 2.1 AA target)
- Clear error messages
- Loading states for all async operations
- Empty states for lists with no data
- Keyboard navigation for admin panel
- Consistent UI patterns across the application

## 17.7 Maintainability

- Modular code structure (separation of concerns)
- Comprehensive API documentation (Swagger/OpenAPI)
- Database migration scripts (Flyway)
- Code style consistency (ESLint, Prettier, Checkstyle)
- Automated tests (unit, integration, e2e)
- Logging (structured, with correlation IDs)
- Environment-based configuration
- Docker containerization for consistent deployment

---

# 18. Security Requirements

## 18.1 Authentication

- SEC-01: All API endpoints (except public ones) require JWT authentication
- SEC-02: Passwords stored as BCrypt hash with salt
- SEC-03: JWT access tokens expire in 15 minutes
- SEC-04: JWT refresh tokens expire in 7 days (configurable)
- SEC-05: Maximum 5 failed login attempts before lockout (15 min)
- SEC-06: Password change requires current password confirmation
- SEC-07: Session management with token revocation support

## 18.2 Authorization

- SEC-08: RBAC enforced at controller level using Spring Security annotations
- SEC-09: Method-level security for critical operations
- SEC-10: Resource ownership checks (users can only edit own content)
- SEC-11: API rate limiting per user/IP (100 req/min for auth, 1000 req/min for general)
- SEC-12: CORS policy restricting to known origins

## 18.3 Data Protection

- SEC-13: HTTPS enforced for all communications
- SEC-14: Sensitive data encrypted at rest (PII, email content)
- SEC-15: File storage encryption (server-side)
- SEC-16: Database connection encryption (SSL/TLS)
- SEC-17: API keys and secrets in environment variables, not code

## 18.4 Input Validation

- SEC-18: All user input validated server-side
- SEC-19: HTML sanitization for rich text content (prevent XSS)
- SEC-20: File upload whitelist (extensions + MIME types)
- SEC-21: Maximum file size: 10MB for images, 25MB for documents, 50MB for videos
- SEC-22: SQL injection prevention via parameterized queries

## 18.5 Audit & Logging

- SEC-23: All authentication attempts logged
- SEC-24: All admin CRUD operations logged
- SEC-25: Workflow actions logged with before/after state
- SEC-26: Email sending logged (sender, recipient, subject, timestamp)
- SEC-27: Log retention: 90 days (configurable)
- SEC-28: Logs stored in append-only format (or separate system)

## 18.6 Email Security

- SEC-29: SPF record configured for domain
- SEC-30: DKIM signing for all outgoing email
- SEC-31: DMARC policy (quarantine or reject)
- SEC-32: Attachment scanning for malware (ClamAV)
- SEC-33: Suspicious link detection in emails
- SEC-34: Rate limiting for outgoing mail (per user, per domain)

---

# 19. Implementation Phases

## Phase 1: Foundation (Weeks 1-4)
**Goal:** Working skeleton with auth, user management, and basic CMS

### Backend Tasks
- [ ] Initialize Spring Boot project with all dependencies
- [ ] Set up PostgreSQL database and Flyway migrations
- [ ] Implement JWT authentication (login, register, refresh, logout)
- [ ] Implement RBAC (roles, permissions, user-role mapping)
- [ ] Create User entity, repository, service, controller (CRUD)
- [ ] Implement basic Content entity and CRUD (articles, pages)
- [ ] Set up file upload (media controller, local file storage)
- [ ] Create system configuration table and API
- [ ] Set up Swagger/OpenAPI documentation
- [ ] Docker Compose for local development (app + postgres + redis)

### Frontend Tasks
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS, Shadcn UI, project structure
- [ ] Implement login/register pages and JWT token management
- [ ] Create admin layout with sidebar navigation
- [ ] Implement user management pages (list, create, edit, profile)
- [ ] Create basic content management pages (list, create, edit)
- [ ] Set up API client layer (Axios + React Query)
- [ ] Implement soil-themed design system (colors, typography, components)
- [ ] Create public layout with header/footer
- [ ] Build Home page with hero, news, events sections

### Deliverables
- Authentication system (login/logout/register)
- User management (CRUD)
- Basic article creation and listing
- Public home page
- Admin panel skeleton
- Docker development environment

---

## Phase 2: CMS & Page Builder (Weeks 5-8)
**Goal:** Complete CMS with drag-and-drop page builder

### Backend Tasks
- [ ] Implement Page entity with JSONB layout storage
- [ ] Create Component template entity
- [ ] Build page builder API (save/load/update layout)
- [ ] Implement page rendering engine (server-side render JSON layout)
- [ ] Create Menu management (entities, API)
- [ ] Implement Category and Tag management
- [ ] Enhance content with SEO metadata fields
- [ ] Implement content versioning
- [ ] Add copy/clone content functionality

### Frontend Tasks
- [ ] Build drag-and-drop page builder interface
  - [ ] Component palette/sidebar
  - [ ] Canvas with drop zone
  - [ ] Component property editor (right panel)
  - [ ] Save/publish/preview controls
- [ ] Implement all component block renderers (hero, cards, slider, etc.)
- [ ] Build responsive preview (desktop/tablet/mobile toggles)
- [ ] Create menu manager with drag-and-drop ordering
- [ ] Implement media library UI (grid, upload, folders)
- [ ] Build category and tag management pages
- [ ] Create SEO metadata editor component
- [ ] Implement content version history viewer

### Deliverables
- Drag-and-drop page builder
- 20+ reusable component blocks
- Menu management
- Media library
- Content versioning
- SEO management

---

## Phase 3: Workflow & Roles (Weeks 9-11)
**Goal:** Complete content workflow with all roles

### Backend Tasks
- [ ] Implement advanced status machine (Draft → Submitted → In Review → Approved/Rejected → Published)
- [ ] Create WorkflowLog entity and logging
- [ ] Implement reviewer assignment (auto/manual)
- [ ] Build workflow action endpoints (submit, approve, reject, request revision)
- [ ] Implement scheduled publishing
- [ ] Add version creation on each workflow transition
- [ ] Implement content permissions (member-only content)
- [ ] Create dashboard statistics APIs

### Frontend Tasks
- [ ] Build content submission workflow in editor
- [ ] Create reviewer dashboard (pending reviews list)
- [ ] Build review interface (content diff, comments, approve/reject buttons)
- [ ] Create publisher dashboard (approved items, scheduling)
- [ ] Implement workflow status badges and indicators
- [ ] Build workflow history timeline
- [ ] Create notification bell with real-time updates (WebSocket)
- [ ] Implement admin dashboard with widgets
- [ ] Build activity log viewer

### Deliverables
- Full content workflow
- Reviewer and publisher interfaces
- Scheduled publishing
- Dashboard with statistics
- In-system notifications

---

## Phase 4: Public Website & Pages (Weeks 12-14)
**Goal:** Complete public-facing website with all required pages

### Backend Tasks
- [ ] Implement Events entity and API
- [ ] Implement Job Vacancies entity and API
- [ ] Implement Job Applications handling
- [ ] Create Contact form submission handling
- [ ] Create dynamic page rendering from DB (page builder output)
- [ ] Implement sitemap generation
- [ ] Add page caching (Redis)

### Frontend Tasks
- [ ] Build President's Message page
- [ ] Build About Us page
- [ ] Build Board of Directors page (grid with photos)
- [ ] Build Members Directory page (search, filters, profiles)
- [ ] Build News & Announcements page
- [ ] Build Publications page
- [ ] Build Events page (calendar + list views)
- [ ] Build Job Vacancies page
- [ ] Build Contact Us page (form + map)
- [ ] Build dynamic CMS pages (rendered from page builder data)
- [ ] Implement public search with filtering
- [ ] Build 404 and error pages

### Deliverables
- All public pages complete
- Dynamic CMS page rendering
- Event management
- Job board
- Contact form
- Public search

---

## Phase 5: Internal Email System (Weeks 15-19)
**Goal:** Full internal email and messaging system

### Infrastructure
- [ ] Set up Postfix (SMTP) server configuration
- [ ] Set up Dovecot (IMAP/POP3) server configuration
- [ ] Configure SPF, DKIM, DMARC for domain
- [ ] Set up anti-spam (SpamAssassin)
- [ ] Set up virus scanning (ClamAV)
- [ ] Configure SSL/TLS certificates for mail server
- [ ] Set up mail server monitoring

### Backend Tasks
- [ ] Implement EmailAccount entity and management API
- [ ] Build mail sending service (Spring Mail + SMTP)
- [ ] Implement IMAP synchronization (receive emails)
- [ ] Create email message entity and storage (DB + file)
- [ ] Implement email folders (system + custom)
- [ ] Build address book API (contacts, groups, auto-complete)
- [ ] Implement attachment handling for emails
- [ ] Create email search API
- [ ] Implement draft and scheduled sending
- [ ] Build quota management
- [ ] Implement email forward and auto-reply
- [ ] Build distribution list management

### Frontend Tasks
- [ ] Build email interface (Gmail-like layout)
  - [ ] Left sidebar: folders, compose button
  - [ ] Middle: message list with columns (sender, subject, date, attachments)
  - [ ] Right: message preview/reading pane
- [ ] Implement Compose Email
  - [ ] Rich text editor
  - [ ] To/Cc/Bcc with auto-complete
  - [ ] File attachments (drag-and-drop)
  - [ ] Draft save indicator
  - [ ] Schedule send picker
  - [ ] Signature selector
- [ ] Build folder management UI
- [ ] Build address book UI (contacts, groups, import/export)
- [ ] Implement email search with filters
- [ ] Build conversation/thread view
- [ ] Implement drag-and-drop for email-to-folder
- [ ] Build quota indicator in UI
- [ ] Create email settings page (signature, auto-reply, forward)

### Deliverables
- Complete webmail interface
- SMTP/IMAP integration
- Address book with auto-complete
- Drafts and scheduled sending
- Email search
- Quota management
- Anti-spam and virus protection

---

## Phase 6: Polish & Testing (Weeks 20-22)
**Goal:** Production-ready system with comprehensive testing

### Tasks
- [ ] Integration tests for all API endpoints
- [ ] Unit tests for services and utilities
- [ ] E2E tests for critical flows (auth, content workflow, email)
- [ ] Performance testing and optimization
- [ ] Security audit and penetration testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (WCAG)
- [ ] Load testing (k6 or JMeter)
- [ ] Error boundary implementation
- [ ] Loading state optimization
- [ ] Image optimization audit
- [ ] API documentation finalization

### Deliverables
- Comprehensive test suite
- Performance optimized
- Security hardened
- Cross-browser compatible
- Accessibility compliant

---

## Phase 7: Deployment & Documentation (Weeks 23-24)
**Goal:** Production deployment and knowledge transfer

### Tasks
- [ ] Production server setup (VPS or cloud)
- [ ] CI/CD pipeline configuration (GitHub Actions)
- [ ] Docker image optimization and registry
- [ ] Database migration plan
- [ ] SSL certificate setup (Let's Encrypt)
- [ ] CDN configuration (Cloudflare or similar)
- [ ] Backup strategy implementation
- [ ] Monitoring setup (uptime, performance, errors)
- [ ] Log aggregation (ELK or similar)
- [ ] Admin user manual / documentation
- [ ] Developer documentation (README, setup guide)
- [ ] Environment configuration guide
- [ ] Knowledge transfer session

### Deliverables
- Production deployment
- CI/CD pipeline
- Monitoring and alerting
- User and developer documentation
- Backup and recovery plan

---

# 20. Project Directory Structure

## 20.1 Backend (Spring Boot)

```
ssssy-backend/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── main/
│   │   ├── java/com/ssssy/
│   │   │   ├── SSSSYApplication.java
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   ├── MailConfig.java
│   │   │   │   ├── StorageConfig.java
│   │   │   │   ├── CacheConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── BadRequestException.java
│   │   │   │   │   ├── UnauthorizedException.java
│   │   │   │   │   └── WorkflowException.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ApiResponse.java
│   │   │   │   │   ├── PageResponse.java
│   │   │   │   │   └── PagedRequest.java
│   │   │   │   ├── audit/
│   │   │   │   │   ├── Auditable.java
│   │   │   │   │   └── AuditListener.java
│   │   │   │   └── util/
│   │   │   │       ├── SlugUtils.java
│   │   │   │       ├── FileUtils.java
│   │   │   │       └── DateUtils.java
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── controller/AuthController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── JwtService.java
│   │   │   │   │   └── RefreshTokenService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── LoginResponse.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   └── RefreshTokenRequest.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   │   └── CustomUserDetails.java
│   │   │   │   └── model/
│   │   │   │       ├── RefreshToken.java
│   │   │   │       └── PasswordResetToken.java
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── controller/UserController.java
│   │   │   │   ├── service/UserService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── UserRequest.java
│   │   │   │   │   ├── UserResponse.java
│   │   │   │   │   └── MemberDirectoryResponse.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Role.java
│   │   │   │   │   └── Permission.java
│   │   │   │   └── repository/
│   │   │   │       ├── UserRepository.java
│   │   │   │       ├── RoleRepository.java
│   │   │   │       └── PermissionRepository.java
│   │   │   │
│   │   │   ├── content/
│   │   │   │   ├── controller/ContentController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── ContentService.java
│   │   │   │   │   ├── ContentVersionService.java
│   │   │   │   │   └── CategoryService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ContentRequest.java
│   │   │   │   │   ├── ContentResponse.java
│   │   │   │   │   ├── ContentVersionResponse.java
│   │   │   │   │   └── CategoryRequest.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Content.java
│   │   │   │   │   ├── ContentVersion.java
│   │   │   │   │   ├── ContentCategory.java
│   │   │   │   │   └── Tag.java
│   │   │   │   └── repository/
│   │   │   │       ├── ContentRepository.java
│   │   │   │       ├── ContentVersionRepository.java
│   │   │   │       ├── CategoryRepository.java
│   │   │   │       └── TagRepository.java
│   │   │   │
│   │   │   ├── pagebuilder/
│   │   │   │   ├── controller/PageController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── PageService.java
│   │   │   │   │   ├── ComponentTemplateService.java
│   │   │   │   │   └── LayoutRendererService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── PageRequest.java
│   │   │   │   │   ├── PageResponse.java
│   │   │   │   │   └── ComponentTemplateRequest.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Page.java
│   │   │   │   │   └── ComponentTemplate.java
│   │   │   │   └── repository/
│   │   │   │       ├── PageRepository.java
│   │   │   │       └── ComponentTemplateRepository.java
│   │   │   │
│   │   │   ├── workflow/
│   │   │   │   ├── controller/WorkflowController.java
│   │   │   │   ├── service/WorkflowService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── WorkflowActionRequest.java
│   │   │   │   │   └── WorkflowLogResponse.java
│   │   │   │   └── model/WorkflowLog.java
│   │   │   │
│   │   │   ├── media/
│   │   │   │   ├── controller/MediaController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── MediaService.java
│   │   │   │   │   ├── FileStorageService.java
│   │   │   │   │   └── ImageOptimizationService.java
│   │   │   │   ├── dto/MediaResponse.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Media.java
│   │   │   │   │   └── MediaFolder.java
│   │   │   │   └── repository/
│   │   │   │       ├── MediaRepository.java
│   │   │   │       └── MediaFolderRepository.java
│   │   │   │
│   │   │   ├── email/
│   │   │   │   ├── controller/
│   │   │   │   │   ├── EmailController.java
│   │   │   │   │   ├── EmailContactController.java
│   │   │   │   │   └── EmailAdminController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── EmailService.java
│   │   │   │   │   ├── EmailSendingService.java
│   │   │   │   │   ├── ImapSyncService.java
│   │   │   │   │   ├── EmailSearchService.java
│   │   │   │   │   ├── QuotaService.java
│   │   │   │   │   ├── ContactGroupService.java
│   │   │   │   │   └── DistributionListService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ComposeEmailRequest.java
│   │   │   │   │   ├── EmailMessageResponse.java
│   │   │   │   │   ├── EmailAttachmentResponse.java
│   │   │   │   │   ├── EmailFolderRequest.java
│   │   │   │   │   └── ContactRequest.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── EmailAccount.java
│   │   │   │   │   ├── EmailMessage.java
│   │   │   │   │   ├── EmailAttachment.java
│   │   │   │   │   ├── EmailFolder.java
│   │   │   │   │   ├── EmailContact.java
│   │   │   │   │   ├── ContactGroup.java
│   │   │   │   │   └── DistributionList.java
│   │   │   │   └── repository/
│   │   │   │       ├── EmailAccountRepository.java
│   │   │   │       ├── EmailMessageRepository.java
│   │   │   │       ├── EmailAttachmentRepository.java
│   │   │   │       ├── EmailFolderRepository.java
│   │   │   │       ├── EmailContactRepository.java
│   │   │   │       ├── ContactGroupRepository.java
│   │   │   │       └── DistributionListRepository.java
│   │   │   │
│   │   │   ├── event/
│   │   │   │   ├── controller/EventController.java
│   │   │   │   ├── service/EventService.java
│   │   │   │   ├── dto/EventRequest.java
│   │   │   │   ├── model/Event.java
│   │   │   │   └── repository/EventRepository.java
│   │   │   │
│   │   │   ├── job/
│   │   │   │   ├── controller/JobController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── JobVacancyService.java
│   │   │   │   │   └── JobApplicationService.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── JobVacancyRequest.java
│   │   │   │   │   └── JobApplicationRequest.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── JobVacancy.java
│   │   │   │   │   └── JobApplication.java
│   │   │   │   └── repository/
│   │   │   │       ├── JobVacancyRepository.java
│   │   │   │       └── JobApplicationRepository.java
│   │   │   │
│   │   │   ├── notification/
│   │   │   │   ├── controller/NotificationController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── NotificationService.java
│   │   │   │   │   ├── WebSocketNotificationHandler.java
│   │   │   │   │   └── EmailNotificationService.java
│   │   │   │   ├── dto/NotificationResponse.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Notification.java
│   │   │   │   │   └── NotificationPreference.java
│   │   │   │   └── repository/
│   │   │   │       ├── NotificationRepository.java
│   │   │   │       └── NotificationPreferenceRepository.java
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── controller/SearchController.java
│   │   │   │   └── service/
│   │   │   │       ├── SearchService.java
│   │   │   │       └── SearchIndexingService.java
│   │   │   │
│   │   │   ├── menu/
│   │   │   │   ├── controller/MenuController.java
│   │   │   │   ├── service/MenuService.java
│   │   │   │   ├── dto/MenuRequest.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── Menu.java
│   │   │   │   │   └── MenuItem.java
│   │   │   │   └── repository/
│   │   │   │       ├── MenuRepository.java
│   │   │   │       └── MenuItemRepository.java
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── controller/
│   │   │   │   │   ├── DashboardController.java
│   │   │   │   │   └── SystemConfigController.java
│   │   │   │   └── service/
│   │   │   │       ├── DashboardService.java
│   │   │   │       └── SystemConfigService.java
│   │   │   │
│   │   │   └── audit/
│   │   │       ├── model/AuditLog.java
│   │   │       ├── repository/AuditLogRepository.java
│   │   │       └── service/AuditLogService.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── db/migration/
│   │       │   ├── V1__init_schema.sql
│   │       │   ├── V2__seed_roles_permissions.sql
│   │       │   ├── V3__create_content_tables.sql
│   │       │   ├── V4__create_page_builder_tables.sql
│   │       │   ├── V5__create_email_tables.sql
│   │       │   └── V6__create_event_job_tables.sql
│   │       └── mail-templates/
│   │           ├── welcome.html
│   │           ├── password-reset.html
│   │           ├── workflow-notification.html
│   │           └── email-notification.html
│   │
│   └── test/
│       └── java/com/ssssy/
│           ├── auth/
│           │   └── AuthControllerTest.java
│           ├── user/
│           │   └── UserServiceTest.java
│           ├── content/
│           │   └── ContentServiceTest.java
│           ├── workflow/
│           │   └── WorkflowServiceTest.java
│           ├── email/
│           │   └── EmailServiceTest.java
│           └── common/
│               └── BaseIntegrationTest.java
```

## 20.2 Frontend (Next.js)

```
ssssy-frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── Dockerfile
├── .env.example
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   │
│   │   ├── (public)/               # Public routes
│   │   │   ├── layout.tsx          # Public layout (header, footer)
│   │   │   ├── about/page.tsx
│   │   │   ├── president-message/page.tsx
│   │   │   ├── board/page.tsx
│   │   │   ├── members/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── publications/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── apply/[id]/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   └── page/[slug]/page.tsx   # Dynamic CMS pages
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   └── admin/
│   │       ├── layout.tsx             # Admin layout (sidebar, topbar)
│   │       ├── page.tsx               # Admin dashboard
│   │       ├── users/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── content/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── pages/                  # Page builder
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── media/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── workflow/
│   │       │   └── page.tsx
│   │       ├── menus/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── events/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── jobs/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── email/
│   │       │   ├── page.tsx            # Webmail inbox
│   │       │   ├── compose/page.tsx
│   │       │   ├── settings/page.tsx
│   │       │   ├── contacts/page.tsx
│   │       │   └── admin/page.tsx      # Email admin
│   │       ├── settings/page.tsx
│   │       └── logs/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # Shadcn UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   └── ... (auto-generated)
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminTopbar.tsx
│   │   │   └── Breadcrumb.tsx
│   │   │
│   │   ├── public/                     # Public page components
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── NewsGrid.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── StatCounter.tsx
│   │   │   └── PartnerCarousel.tsx
│   │   │
│   │   ├── page-builder/               # Page builder components
│   │   │   ├── PageBuilder.tsx          # Main builder container
│   │   │   ├── ComponentPalette.tsx
│   │   │   ├── Canvas.tsx
│   │   │   ├── PropertyEditor.tsx
│   │   │   ├── components/             # Individual block renderers
│   │   │   │   ├── HeroBanner.tsx
│   │   │   │   ├── RichTextBlock.tsx
│   │   │   │   ├── ImageBlock.tsx
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   ├── VideoBlock.tsx
│   │   │   │   ├── CardBlock.tsx
│   │   │   │   ├── FeatureCards.tsx
│   │   │   │   ├── SliderBlock.tsx
│   │   │   │   ├── AccordionBlock.tsx
│   │   │   │   ├── TabsBlock.tsx
│   │   │   │   ├── TimelineBlock.tsx
│   │   │   │   ├── CounterBlock.tsx
│   │   │   │   ├── TeamBlock.tsx
│   │   │   │   ├── TestimonialBlock.tsx
│   │   │   │   ├── CTABlock.tsx
│   │   │   │   ├── FormBlock.tsx
│   │   │   │   ├── MapBlock.tsx
│   │   │   │   ├── QuoteBlock.tsx
│   │   │   │   ├── TableBlock.tsx
│   │   │   │   ├── FAQBlock.tsx
│   │   │   │   ├── DownloadBlock.tsx
│   │   │   │   ├── NewsletterBlock.tsx
│   │   │   │   ├── GridLayout.tsx
│   │   │   │   ├── TwoColumnLayout.tsx
│   │   │   │   ├── ThreeColumnLayout.tsx
│   │   │   │   └── MasonryLayout.tsx
│   │   │   └── renderer/
│   │   │       └── ComponentRenderer.tsx  # Dynamic renderer from JSON
│   │   │
│   │   ├── email/                      # Email components
│   │   │   ├── EmailLayout.tsx
│   │   │   ├── EmailList.tsx
│   │   │   ├── EmailMessage.tsx
│   │   │   ├── EmailComposer.tsx
│   │   │   ├── EmailFolder.tsx
│   │   │   ├── AddressBook.tsx
│   │   │   ├── AttachmentDropzone.tsx
│   │   │   └── EmailSearch.tsx
│   │   │
│   │   └── shared/                     # Shared components
│   │       ├── DataTable.tsx
│   │       ├── SearchInput.tsx
│   │       ├── Pagination.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── FileUpload.tsx
│   │       ├── RichTextEditor.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── NotificationBell.tsx
│   │       └── UserAvatar.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useNotifications.ts
│   │   ├── useFileUpload.ts
│   │   └── useWebSocket.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── content.ts
│   │   │   ├── pages.ts
│   │   │   ├── media.ts
│   │   │   ├── email.ts
│   │   │   ├── events.ts
│   │   │   ├── jobs.ts
│   │   │   ├── notifications.ts
│   │   │   ├── search.ts
│   │   │   └── admin.ts
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   ├── validations.ts             # Zod schemas
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       ├── content.ts
│   │       ├── page.ts
│   │       ├── media.ts
│   │       ├── email.ts
│   │       ├── event.ts
│   │       ├── job.ts
│   │       ├── notification.ts
│   │       └── api.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── WebSocketProvider.tsx
│   │
│   └── middleware.ts                   # Next.js middleware for auth
│
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── content-workflow.spec.ts
│   │   └── email.spec.ts
│   └── unit/
│       ├── components/
│       └── hooks/
│
└── cypress.config.ts

---

# 21. Future Enhancements

The architecture is designed to be extensible for:

### Short-term (Phase 8+)
- **Membership Registration & Renewal** with online payments
- **Scientific Journal Management** (submission, review, publication)
- **Conference Management** (call for papers, registration, schedule)
- **Multi-language Support** (Arabic + English, using next-intl)
- **Newsletter Management** (subscribers, campaigns, analytics)

### Medium-term
- **Digital Library** with searchable scientific repository
- **Research Repository** with DOI minting
- **E-learning Platform** (courses, certificates)
- **Online Voting** for society elections
- **Discussion Forums** with topic categories

### Long-term
- **AI-powered content search and recommendations**
- **Integration with ORCID, Google Scholar, Crossref**
- **Mobile application** (React Native)
- **Single Sign-On (SSO)** with SAML/OAuth
- **Microsoft 365 / Google Workspace integration**
- **Advanced analytics** (Matomo or custom)
- **Payment gateway integration** for membership fees
- **Two-Factor Authentication (2FA)** with TOTP

---

# Implementation Sequence Summary

```
Phase 1 (Weeks 1-4)     ████████░░░░░░░░░░░░░░░░  Foundation (Auth, Users, Basic CMS)
Phase 2 (Weeks 5-8)     ████████░░░░░░░░░░░░░░░░  CMS & Page Builder
Phase 3 (Weeks 9-11)    ██████░░░░░░░░░░░░░░░░░░  Workflow & Roles
Phase 4 (Weeks 12-14)   ██████░░░░░░░░░░░░░░░░░░  Public Pages
Phase 5 (Weeks 15-19)   ██████████░░░░░░░░░░░░░░  Email System
Phase 6 (Weeks 20-22)   ██████░░░░░░░░░░░░░░░░░░  Polish & Testing
Phase 7 (Weeks 23-24)   ████░░░░░░░░░░░░░░░░░░░░  Deployment & Docs
```

**Total estimated duration: 24 weeks (6 months)** with a team of 2-3 developers.

---

*End of SRS Document — Version 2.0*
