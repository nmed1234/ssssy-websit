# User Guide — Syrian Soil Science Society (SSSSY) Website

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
   - 2.1 Registration
   - 2.2 Email Verification
   - 2.3 Login
   - 2.4 Two-Factor Authentication (2FA)
   - 2.5 Password Reset
   - 2.6 Logout
3. [Public Website Tour](#3-public-website-tour)
   - 3.1 Home Page
   - 3.2 About Page
   - 3.3 President's Message
   - 3.4 Board of Directors
   - 3.5 News
   - 3.6 Publications
   - 3.7 Events
   - 3.8 Jobs
   - 3.9 Member Directory
   - 3.10 Contact
   - 3.11 Newsletter
   - 3.12 Search
   - 3.13 Language Toggle
4. [Content Creation & Management](#4-content-creation--management)
   - 4.1 Creating New Content
   - 4.2 Rich Text Editor (TipTap)
   - 4.3 Categories and Tags
   - 4.4 SEO Metadata
   - 4.5 Content Statuses & Workflow
   - 4.6 Version History & Rollback
   - 4.7 Scheduling Content
   - 4.8 Previewing Content
   - 4.9 Bulk Operations
5. [Page Builder](#5-page-builder)
   - 5.1 Creating a New Page
   - 5.2 Component Palette
   - 5.3 Property Editor
   - 5.4 Responsive Preview
   - 5.5 Reusable Templates
   - 5.6 Publishing & Version Management
6. [Admin Panel](#6-admin-panel)
   - 6.1 Dashboard
   - 6.2 Content Management
   - 6.3 Media Library
   - 6.4 Categories
   - 6.5 Tags
   - 6.6 Menus
   - 6.7 Users
   - 6.8 Roles & Permissions
   - 6.9 Events Management
   - 6.10 Job Vacancies
   - 6.11 Board Members
   - 6.12 Member Profiles
   - 6.13 Comments
   - 6.14 Newsletter
   - 6.15 Contact Submissions
   - 6.16 CRM
   - 6.17 Workflow Definitions
   - 6.18 Email Administration
   - 6.19 System Settings
   - 6.20 Audit Logs
   - 6.21 Theme Toggle
7. [Webmail Client](#7-webmail-client)
   - 7.1 Layout Overview
   - 7.2 Composing an Email
   - 7.3 Reading Email
   - 7.4 Folders
   - 7.5 Email Rules
   - 7.6 Contacts & Groups
   - 7.7 Email Signatures
   - 7.8 Auto-Reply
   - 7.9 Quota Management
   - 7.10 Message Threads
   - 7.11 Scheduled Sends
   - 7.12 Email Search
8. [Notifications](#8-notifications)
   - 8.1 Notification Bell
   - 8.2 Notification Types
   - 8.3 Managing Notifications
9. [Profile & Account Management](#9-profile--account-management)
   - 9.1 Editing Your Profile
   - 9.2 Security & Password
   - 9.3 Notification Preferences
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [FAQ](#11-faq)
12. [Best Practices](#12-best-practices)

---

## 1. Overview

The Syrian Soil Science Society (SSSSY) website is a comprehensive digital platform that serves the society's members, researchers, and the public. The platform is built as a bilingual (English and Arabic) system with full right-to-left (RTL) support for Arabic.

### 1.1 System Features

| Feature | Description |
|---------|-------------|
| **Public Website** | Home, About, President's Message, Board of Directors, News, Publications, Events, Jobs, Member Directory, Contact, Newsletter, Search |
| **Content Management** | Create, edit, version, and publish articles, news, and publications with a rich text editor |
| **Page Builder** | Drag-and-drop builder with 50+ components for creating custom pages |
| **Workflow Engine** | Configurable multi-step approval workflows (Draft → Review → Approved → Published) |
| **Admin Panel** | Dashboard, media library, categories, tags, menus, user management, roles, settings, audit logs |
| **Webmail** | Internal email system with folders, rules, contacts, groups, signatures, auto-reply, and scheduled sends |
| **CRM** | Contact management, activity tracking, and relationship management |
| **Notifications** | Real-time notifications for workflow updates, comments, and system announcements |
| **SEO** | Meta tags, Open Graph, Twitter Cards, sitemap generation, structured data |
| **Multi-language** | Full English/Arabic support with automatic LTR/RTL switching |

### 1.2 User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Visitor** (not logged in) | Browse public content, search, use contact form, view events, apply for jobs, register for events, subscribe to newsletter |
| **Member** | All Visitor capabilities + internal email, create content drafts, edit own profile, upload files to media library |
| **Editor** | All Member capabilities + edit any content, manage categories/tags, manage media library, manage menus, manage newsletter, use page builder |
| **Reviewer** | All Editor capabilities + approve/reject content submissions, review and moderate comments |
| **Publisher** | All Reviewer capabilities + publish content, schedule publishing, archive content |
| **Admin** | All Publisher capabilities + manage users, manage roles, system settings, view audit logs, email administration |
| **Super Admin** | All Admin capabilities + manage other admins, access all security logs, system-wide configuration |

### 1.3 Language & Direction

The interface supports two languages:
- **English** — left-to-right (LTR) layout
- **Arabic** — right-to-left (RTL) layout

Click the globe icon in the top navigation bar to switch between languages. The selection is remembered for future visits.

### 1.4 Dark Mode

The admin panel supports a dark mode toggle. Click the sun/moon icon in the admin header to switch between light and dark themes.

---

## 2. Getting Started

### 2.1 Registration

To create a new account on the SSSSY website:

1. Click the **Login / Sign Up** link in the top navigation bar.
2. On the login page, click the **Register** link below the login form.
3. The registration form contains the following required fields:
   - **Username** — Choose a unique username (alphanumeric, 3–50 characters)
   - **Email** — Provide a valid email address (used for verification and notifications)
   - **Password** — Create a strong password (minimum 8 characters, must contain uppercase, lowercase, and a number)
   - **Confirm Password** — Re-enter your password
   - **First Name (English)** — Your given name in Latin characters
   - **Last Name (English)** — Your family name in Latin characters
   - **First Name (Arabic)** — Your given name in Arabic script *(optional but recommended)*
   - **Last Name (Arabic)** — Your family name in Arabic script *(optional but recommended)*
4. Optionally fill in additional fields:
   - **Institution** — Your university, research center, or organization
   - **Department** — Your department or division
   - **Position** — Your job title or academic position
   - **Specialization** — Your field of expertise (e.g., Soil Chemistry, Soil Physics)
   - **Biography** — A short professional biography
   - **Research Interests** — Keywords describing your research focus
   - **Education** — Your academic qualifications
   - **ORCID ID** — Your ORCID identifier (format: 0000-0001-2345-6789)
   - **Google Scholar URL** — Link to your Google Scholar profile
   - **LinkedIn URL** — Link to your LinkedIn profile
5. Click **Create Account** to submit the registration.
6. A success message appears confirming that a verification email has been sent.
7. Check your email inbox and click the verification link to activate your account.

### 2.2 Email Verification

After registration, you must verify your email address:

1. Open the verification email sent to your registered email address.
2. Click the **Verify Email** button or link in the email.
3. You will be redirected to a **Verify Email** page that confirms your email has been verified.
4. If the link has expired, you can request a new verification email:
   - Go to the **Login** page
   - Attempt to log in
   - A message will appear prompting you to verify your email first
   - Click **Resend Verification Email** to receive a new link

### 2.3 Login

1. Click **Login** in the top navigation bar.
2. Enter your **Username** or **Email** address.
3. Enter your **Password**.
4. Optionally check **Remember Me** to stay logged in for 30 days.
5. Click **Sign In**.
6. If your credentials are valid, you are redirected to the home page.
7. If you are an **Admin**, **Editor**, **Reviewer**, or **Publisher**, an **Admin Panel** link will appear in the navigation bar after login.

### 2.4 Two-Factor Authentication (2FA)

If the administrator has enabled 2FA for your account:

1. Complete the standard login with your username and password.
2. A **Two-Factor Authentication** page appears asking for a verification code.
3. Open your authenticator app (e.g., Google Authenticator, Authy, Microsoft Authenticator).
4. Enter the 6-digit code displayed in the app.
5. Codes refresh every 30 seconds. If the code expires, wait for a new one.
6. Click **Verify** to complete the login process.
7. If you lose access to your authenticator app, contact an administrator to disable 2FA on your account.

### 2.5 Password Reset

If you forget your password:

1. On the **Login** page, click **Forgot Password?**.
2. Enter the email address associated with your account.
3. Click **Send Reset Link**.
4. Check your email inbox for a password reset email (may take up to 5 minutes).
5. Click the **Reset Password** link in the email.
6. On the **Reset Password** page, enter your **New Password** and **Confirm New Password**.
7. Click **Reset Password**.
8. A confirmation message appears and you are redirected to the login page.
9. Log in with your new password.

### 2.6 Logout

1. Click your avatar or username in the top navigation bar.
2. Select **Logout** from the dropdown menu.
3. You are redirected to the home page and your session is terminated.
4. Repeat login is required to access protected features.

---

## 3. Public Website Tour

### 3.1 Home Page

The home page (`/`) is the landing page for all visitors. It contains:

- **Hero Banner** — A featured image or carousel showcasing the society's main activities and announcements.
- **Latest News** — A grid of the 3 most recent news articles with title, excerpt, date, and a "Read More" link.
- **Upcoming Events** — A list of upcoming events with dates and a "View All Events" link.
- **Featured Publications** — Recent research publications and papers.
- **Quick Links** — Buttons or cards linking to key sections (About, Board, Events, Contact).
- **Newsletter Signup** — An inline subscription form for the newsletter.
- **Footer** — Society contact information, quick links, social media links, and copyright notice.

Each section of the home page is responsive: on mobile devices, grid items stack vertically.

### 3.2 About Page

The About page (`/about`) provides information about the Syrian Soil Science Society:

- **Society Overview** — Mission, vision, and history of the society.
- **Objectives** — The society's main goals and activities.
- **Organizational Structure** — Description of how the society is organized.
- **Contact Information** — Address, phone, email, and social media links.

### 3.3 President's Message

The President's Message page (`/president-message`) displays:

- **President's Photo** — Official photograph of the society president.
- **Message Title** — The title of the president's message.
- **Message Content** — The full text of the president's address, typically covering the society's achievements and future direction.
- **Signature** — President's name, title, and date.

### 3.4 Board of Directors

The Board of Directors page (`/board`) displays profiles of the society's board members:

- **Member Cards** — Each card shows:
  - **Photo** — The board member's photograph
  - **Name** — Full name in English and Arabic
  - **Position** — Board position (e.g., President, Vice President, Secretary, Treasurer, Member)
  - **Bio** — Short biography
  - **Term Dates** — Start and end dates of the term
- **Filtering** — Use the dropdown to filter by position (e.g., show only "President" or "Treasurer").
- **Active Only Toggle** — Option to show only currently serving board members.
- **Empty State** — If no board members match the filter, a message "No board members found" is displayed.
- **Error State** — If the data cannot be loaded, an error banner with a retry button appears.

To manage board members (admin users only), see Section 6.11.

### 3.5 News

The News page (`/news`) lists all published news articles:

- **Article Cards** — Each card shows:
  - **Featured Image** — Thumbnail image (if set)
  - **Title** — Linked to the full article
  - **Excerpt** — A short summary (first 150 characters)
  - **Date** — Publication date
  - **Category** — The article's category (e.g., "Research", "Announcement")
  - **Tags** — Clickable tags for filtering
- **Filtering Options**:
  - **Category Dropdown** — Filter by a specific category
  - **Search Box** — Search by keyword in title and content
  - **Date Range** — Filter by date range
- **Pagination** — Navigate through pages of results. The page size is configurable.
- **Article Detail Page** (`/news/[slug]`):
  - **Header** — Title, author name, publication date, category
  - **Featured Image** — Full-width image at the top
  - **Content** — Full article text with embedded media (images, videos, tables)
  - **Tags** — Clickable tags at the bottom
  - **Share Buttons** — Social sharing links (Facebook, Twitter, LinkedIn, Email)
  - **Comments Section** — If comments are enabled, registered users can leave comments (see Section 6.13)
  - **Related Articles** — A sidebar or section showing related articles based on shared categories or tags
  - **SEO Metadata** — The article includes meta title, description, Open Graph tags, and Twitter Cards
- **Loading State** — A skeleton animation is shown while articles are loading.
- **Empty State** — "No news articles found" message when no articles match the filters.
- **Error State** — Error banner with retry button.

### 3.6 Publications

The Publications page (`/publications`) displays research papers and publications:

- **Publication Cards** — Each card shows:
  - **Title** — Publication title (linked to detail page)
  - **Authors** — List of authors
  - **Abstract** — A short preview or full abstract
  - **Publication Date** — When it was published
  - **Category** — Research area or publication type
  - **Tags** — Keywords
  - **Download Link** — If a PDF file is attached
- **Filtering & Search** — Same as News (category, keyword, date range).
- **Detail Page** (`/publications/[slug]`):
  - **Full Citation** — Proper academic citation format
  - **Abstract** — Complete abstract
  - **Full Text** — The publication content or a summary
  - **DOI/ISBN** — If available
  - **Download** — PDF download button
  - **Related Publications** — Based on shared tags and categories

### 3.7 Events

The Events page (`/events`) lists society events such as conferences, workshops, and seminars:

- **Event Cards** — Each card shows:
  - **Title** — Event name (linked to detail page)
  - **Date & Time** — Start and end date/time
  - **Location** — Venue name and address (or "Online" for virtual events)
  - **Event Type** — Conference, Workshop, Seminar, Webinar, Meeting, Social
  - **Image** — Event poster or featured image
  - **Registration Status** — Open, Closed, or Full
- **Filter Options**:
  - **Upcoming / Past** — Toggle between upcoming and past events
  - **Event Type** — Dropdown to filter by type
  - **Date Range** — Custom date range filter
  - **Search** — Keyword search
- **Event Detail Page** (`/events/[slug]`):
  - **Header** — Event title, date, time, location
  - **Description** — Full event description and agenda
  - **Organizer** — Contact person or organization
  - **Registration Status** — Shows whether registration is open
  - **Register Button** — If registration is open, a prominent **Register** button
  - **Share Buttons** — Social sharing
- **Registration Process**:
  1. Click **Register** on the event detail page.
  2. A registration form appears with fields:
     - **Name** — Your full name
     - **Email** — Your email address
     - **Phone** — Contact number (optional)
     - **Notes** — Any special requirements or questions (optional)
  3. Click **Submit Registration**.
  4. A confirmation message appears. You may also receive a confirmation email.
  5. Your registered events can be viewed in **My Events** on your profile.
- **Loading State** — Skeleton cards while loading.
- **Empty State** — "No events found" when no events match filters.
- **Error State** — Error banner with retry button.

### 3.8 Jobs

The Jobs page (`/jobs`) lists career opportunities:

- **Job Cards** — Each card shows:
  - **Title** — Job title (linked to detail page)
  - **Department** — Department or division
  - **Location** — City and country
  - **Type** — Full-time, Part-time, Contract, Temporary, Remote
  - **Application Deadline** — Last date to apply
  - **Status** — Active or Filled
- **Filter Options**:
  - **Job Type** — Filter by employment type
  - **Department** — Filter by department
  - **Location** — Filter by location
  - **Search** — Keyword search
  - **Status** — Show only active or all jobs
- **Job Detail Page** (`/jobs/[slug]`):
  - **Header** — Job title, department, location
  - **Description** — Full job description and responsibilities
  - **Requirements** — Qualifications, skills, experience needed
  - **Benefits** — Salary range, benefits, perks
  - **Application Instructions** — How to apply
  - **Contact** — Contact person or HR email
  - **Apply Button** — Click to open the application form
- **Application Process**:
  1. Click **Apply** on the job detail page.
  2. Fill in the application form:
     - **Full Name** — Your name
     - **Email** — Your email address
     - **Phone** — Contact number
     - **Cover Letter** — A text area for your cover letter or personal statement
     - **Resume/CV** — File upload (PDF, DOC, DOCX supported, max 10MB)
     - **Additional Documents** — Optional file attachments
  3. Click **Submit Application**.
  4. A confirmation message appears. Your application status can be tracked in your profile.
- **Loading State** — Skeleton cards while loading.
- **Empty State** — "No job vacancies found" when no jobs match filters.
- **Error State** — Error banner with retry button.

### 3.9 Member Directory

The Member Directory page (`/members`) displays public member profiles:

- **Member Cards** — Each card shows:
  - **Avatar** — Profile photo or a placeholder
  - **Name** — Full name in English and Arabic
  - **Institution** — University, research center, or organization
  - **Specialization** — Field of expertise
  - **Position** — Job title
- **Search & Filters**:
  - **Search Box** — Search by name, institution, or specialization
  - **Specialization Filter** — Filter by area of expertise
  - **Institution Filter** — Filter by institution
- **Member Profile Page** (`/members/[username]`):
  - **Profile Header** — Photo, name, position, institution
  - **Biography** — Professional biography
  - **Research Interests** — Keywords or topics
  - **Education** — Academic qualifications
  - **Publications** — Links to their publications on the site
  - **Contact** — Contact form (if enabled by the member)
  - **External Links** — ORCID, Google Scholar, LinkedIn, personal website
- **Loading State** — Skeleton cards.
- **Empty State** — "No members found."
- **Error State** — Error banner with retry button.

### 3.10 Contact

The Contact page (`/contact`) provides a way for visitors to get in touch:

- **Contact Information** — Society address, phone, email, and social media links.
- **Contact Form** — Fields:
  - **Name** — Your full name (required)
  - **Email** — Your email address (required)
  - **Phone** — Your phone number (optional)
  - **Subject Category** — Dropdown to select the purpose:
    - General Inquiry
    - Membership
    - Event Registration
    - Publication Submission
    - Website Issue
    - Partnership
    - Other
  - **Subject** — A brief subject line (required)
  - **Message** — Your message (required, minimum 10 characters)
- **Submit Process**:
  1. Fill in all required fields.
  2. Click **Send Message**.
  3. A success message confirms your message has been sent.
  4. You will typically receive a response within 2–3 business days.
- **Error State** — If submission fails, an error message appears with a retry option.
- **Loading State** — The submit button shows a spinner and is disabled while sending.

### 3.11 Newsletter

The Newsletter subscription is available in the footer on every page and as a dedicated section:

- **Subscribe**:
  1. Enter your **Email** address in the subscription field.
  2. Optionally enter your **Name**.
  3. Click **Subscribe**.
  4. A success message confirms your subscription.
- **Unsubscribe**:
  1. Click the **Unsubscribe** link at the bottom of any newsletter email.
  2. You are taken to a confirmation page.
  3. Click **Confirm Unsubscribe** to remove your email from the list.
- **Validation** — The system validates email format and checks for existing subscriptions to prevent duplicates.

### 3.12 Search

The search feature is accessible from the search icon in the top navigation:

1. Click the **Search icon** (magnifying glass) in the header.
2. Start typing your query — suggestions appear in a dropdown as you type.
3. Press **Enter** or click **View All Results** to go to the full search results page.
4. On the search results page (`/search?q=query`), you can:
   - View results sorted by relevance
   - Filter by **Content Type** (News, Publications, Events, Pages)
   - Filter by **Category**
   - Filter by **Date Range**
   - Each result shows the title, excerpt, type icon, and publication date
5. If no results are found, a "No results found for your query" message is displayed with suggestions.

### 3.13 Language Toggle

1. Click the **globe icon** in the top navigation bar.
2. Select either **English** or **Arabic** from the dropdown.
3. The page reloads immediately in the selected language.
4. All interface text, labels, and content titles switch to the selected language.
5. The text direction automatically adjusts:
   - English: left-to-right (LTR)
   - Arabic: right-to-left (RTL)
6. The language preference is stored in your browser and remembered on future visits.
7. When logged in, the language preference is synced with your account settings.

---

## 4. Content Creation & Management

The content management system allows authorized users (Member, Editor, Reviewer, Publisher, Admin) to create, edit, and publish content.

### 4.1 Creating New Content

1. **Navigate** to **Admin Panel** → **Content** → **New Content** (or use the keyboard shortcut `Ctrl+N`).
2. **Select Content Type** — Choose from:
   - **Article** — News, announcements, general articles
   - **Publication** — Research papers, reports, academic publications
   - **Event** — Conferences, workshops, seminars (alternatively create through Events section)
3. **Fill in the Form**:
   - **Title (Arabic)** — The title in Arabic (required)
   - **Title (English)** — The title in English (required)
   - **Slug** — URL-friendly identifier (auto-generated from English title; can be edited manually)
   - **Description / Excerpt** — A short summary for listing pages and SEO
   - **Content** — The main body (use the Rich Text Editor — see Section 4.2)
   - **Featured Image** — Click to select or upload an image from the media library
   - **Category** — Select from existing categories (or create a new one in Categories)
   - **Tags** — Type to search and select existing tags, or type to create new tags
   - **Author** — The author name to display (defaults to your name)
4. **SEO Section** (optional but recommended):
   - **Meta Title** — Custom title for search engine results (defaults to the content title)
   - **Meta Description** — A brief description for search engine snippets (recommended: 150–160 characters)
5. **Publishing Options**:
   - **Status** — Choose initial status:
     - **Draft** — Save as draft (only you and editors can see it)
     - **Submit for Review** — Submit directly to the workflow
   - **Scheduled Date** — If you want to schedule publication, set a future date and time, then set status to "Scheduled"
   - **Language** — Set primary language or bilingual
6. Click **Save Draft** (`Ctrl+S`) to save without submitting, or **Submit for Review** to start the workflow.

### 4.2 Rich Text Editor (TipTap)

The content editor uses the TipTap rich text editor, which provides a toolbar with the following formatting options:

- **Text Formatting**: Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Strikethrough
- **Headings**: H1, H2, H3, H4
- **Lists**: Bullet list, Ordered list
- **Alignment**: Left, Center, Right, Justify
- **Links**: Select text and click the link icon to add a hyperlink
- **Images**: Click the image icon to insert from the media library (or paste an image URL)
- **Videos**: Embed YouTube or other video URLs
- **Tables**: Insert and customize tables (add/remove rows and columns)
- **Blockquotes**: Format a block of text as a quotation
- **Code Block**: Insert a code block with syntax highlighting
- **Horizontal Rule**: Insert a divider
- **Text Color & Highlight**: Change text color or add background highlight
- **Undo/Redo**: Standard undo/redo functionality
- **Clear Formatting**: Remove all formatting from selected text

**Pro Tips**:
- Use the **slash command** (`/`) to quickly insert elements by typing `/` followed by the element name.
- Drag and drop images directly into the editor to upload and insert them.
- Use the **Fullscreen** toggle to expand the editor to full screen for a better writing experience.

### 4.3 Categories and Tags

**Categories**:
- Hierarchical grouping of content (e.g., Research → Soil Chemistry → Soil pH)
- Each content item can belong to one category
- Categories are bilingual (Arabic/English name and slug)
- Categories have a description and can be assigned a color for visual identification

**Tags**:
- Non-hierarchical keywords (e.g., "soil-science", "conference-2024")
- Each content item can have multiple tags
- Tags are bilingual (Arabic/English name)
- Clicking a tag on a public page shows all content with that tag

**Managing Categories and Tags**:
1. Go to **Admin Panel** → **Categories** or **Tags**.
2. Click **Add New** to create a new category or tag.
3. Fill in the name and slug in both languages.
4. For categories, optionally set a parent category to create hierarchy.
5. Click **Save**.

### 4.4 SEO Metadata

Each content item has dedicated SEO fields to improve search engine visibility:

- **Meta Title** — Appears in search engine result snippets. Should include key search terms. Recommended length: 50–60 characters.
- **Meta Description** — A compelling summary that appears below the title in search results. Recommended length: 150–160 characters.
- **Open Graph Tags** — Automatically generated from title, description, and featured image for better social media sharing (Facebook, LinkedIn).
- **Twitter Cards** — Automatically generated for Twitter sharing with a summary card and large image.
- **Structured Data** — schema.org JSON-LD is automatically added to all content pages for rich search results.

To edit SEO metadata after publishing:
1. Open the content item in the editor.
2. Scroll to the **SEO Metadata** section.
3. Edit the meta title and description.
4. Click **Save**.

### 4.5 Content Statuses & Workflow

The content workflow is a multi-step approval process:

```
                   ┌─────────────┐
                   │    DRAFT    │
                   └──────┬──────┘
                          │ Submit for Review
                          ▼
                   ┌──────────────┐
        ┌─────────│ SUBMITTED    │
        │         └──────┬───────┘
        │                │ Assign Reviewer
        │                ▼
        │         ┌──────────────┐
        │         │  IN REVIEW   │
        │         └──────┬───────┘
        │                │
        │     ┌──────────┼──────────┐
        │     │          │          │
        │     ▼          ▼          ▼
        │ ┌────────┐┌────────┐┌────────┐
        │ │APPROVED││REQUEST ││REJECTED│
        │ │        ││CHANGES ││        │
        │ └───┬────┘└───┬────┘└────────┘
        │     │         │
        │     │         └─────────── Return to Draft
        │     ▼
        │ ┌──────────┐
        │ │ PUBLISHED│◄────────────── Scheduled (auto-publish)
        │ └────┬─────┘
        │      │
        │      ▼
        │ ┌──────────┐
        │ │ ARCHIVED │
        │ └──────────┘
        │
        └── Edit anytime to return to draft
```

**Content Status Definitions**:

| Status | Meaning | Who Can See It |
|--------|---------|----------------|
| **Draft** | Work in progress, not ready for review | Author, Editors, Admins |
| **Submitted** | Submitted for review, awaiting reviewer assignment | Author, Editors, Reviewers, Admins |
| **In Review** | A reviewer is currently evaluating the content | Author, Assigned Reviewer, Editors, Admins |
| **Changes Requested** | Reviewer requested modifications | Author (to revise), Editors, Admins |
| **Approved** | Approved by reviewer, ready to publish | Publishers, Admins |
| **Scheduled** | Approved and set to auto-publish on a future date | Publishers, Admins (becomes Published on schedule) |
| **Published** | Live on the public website | All visitors |
| **Archived** | Removed from public view, kept for reference | Authors, Editors, Admins |

**Workflow Actions**:

| Current Status | Available Actions |
|----------------|-------------------|
| Draft | Edit, Save, Submit for Review, Delete |
| Submitted | Assign Reviewer (Reviewer/Admin), Return to Draft |
| In Review | Approve, Request Changes, Reject, Return to Draft |
| Changes Requested | Edit and Resubmit, Return to Draft |
| Approved | Publish Now, Schedule, Return to Draft |
| Scheduled | Publish Now (cancel schedule), Unschedule, Return to Draft |
| Published | Unpublish, Archive, Edit (creates new version) |
| Archived | Republish, Delete |

**Step-by-Step Workflow Example**:

1. **Author** creates content and sets status to **Draft**.
2. Author clicks **Submit for Review** when ready.
3. **Reviewer** sees the submission in their dashboard, clicks to review.
4. Reviewer changes status to **In Review**.
5. Reviewer evaluates the content and either:
   - Clicks **Approve** → status becomes **Approved**.
   - Clicks **Request Changes** → status becomes **Changes Requested** with comments.
   - Clicks **Reject** → content is rejected (with reason).
6. If **Approved**, a **Publisher** clicks **Publish** → status becomes **Published**.
7. Publisher can also set a **Scheduled Date** → status becomes **Scheduled** until the date arrives.
8. At any time, an Editor or Admin can **Archive** published content.

### 4.6 Version History & Rollback

Every time content is saved, a new version is created:

1. Open the content item in the editor.
2. Click **Version History** in the toolbar.
3. A list of all versions appears, showing:
   - Version number
   - Date and time of save
   - User who made the save
   - Summary of changes (if provided)
4. Click on any version to **Preview** what the content looked like at that point.
5. Click **Rollback to This Version** to revert the content to that version.
6. A confirmation dialog appears. Click **Confirm Rollback** to proceed.
7. The rollback creates a new version with the reverted content (no data is lost).

### 4.7 Scheduling Content

To schedule content for automatic publication:

1. Create or edit content.
2. Set the status to **Approved** (if not already).
3. Find the **Schedule Publication** section.
4. Click the date/time picker and select the desired publication date and time.
5. Click **Schedule**.
6. The status changes to **Scheduled**.
7. The system will automatically publish the content at the specified time.
8. To cancel scheduling, click **Unschedule** — the status returns to **Approved**.

### 4.8 Previewing Content

Before publishing, you can preview how content will look on the public site:

1. Open the content item in the editor.
2. Click the **Preview** button (`Ctrl+P`).
3. A new tab opens showing the content as it will appear on the public site.
4. The preview uses the same layout and styling as the live site.
5. Preview is available for all statuses, including Draft.
6. Close the preview tab to return to the editor.

### 4.9 Bulk Operations

On the content list page, you can perform bulk operations:

1. Select multiple content items by checking the checkboxes.
2. Use the **Bulk Actions** dropdown to:
   - **Delete** — Delete all selected items (requires confirmation)
   - **Change Status** — Change status of all selected items
   - **Change Category** — Re-categorize all selected items
   - **Add Tags** — Add tags to all selected items
   - **Export** — Export selected items as CSV or JSON
3. Click **Apply** to execute the selected action.
4. A confirmation dialog appears for destructive actions (e.g., Delete).

---

## 5. Page Builder

The Page Builder is a drag-and-drop tool for creating custom pages without writing code. It provides 50+ pre-built components across four categories.

### 5.1 Creating a New Page

1. Go to **Admin Panel** → **Pages** → **New Page**.
2. Fill in the page details:
   - **Title (Arabic)** — The page title in Arabic
   - **Title (English)** — The page title in English
   - **Slug** — URL path (e.g., "about-us", "research"). Auto-generated from English title.
   - **Layout Type**:
     - **Flexible (Page Builder)** — Full page builder control
     - **Full Width** — Content spans the full width
     - **Sidebar Left** — Content with a left sidebar
     - **Sidebar Right** — Content with a right sidebar
3. Click **Create & Edit** to create the page and open the page builder.
4. If using a layout other than Flexible, you can still add sections via the Simple Content Editor.

**Opening the Page Builder**:
1. From the page list, click any page to edit it.
2. Click **Edit with Page Builder** button.
3. The page builder interface opens with three main areas:
   - **Left Panel**: Component palette with categorized components
   - **Center**: Canvas showing the page being built
   - **Right Panel**: Property editor for the selected component

### 5.2 Component Palette

The component palette is organized into four categories:

**Layout Components** — Structure and layout of the page:

| Component | Description |
|-----------|-------------|
| **Container** | A wrapper with max-width and padding (centers content) |
| **Row** | A horizontal row (used with Column) |
| **Column (2-col)** | Two-column split (50/50, 60/40, 70/30, or 33/67) |
| **Column (3-col)** | Three equal columns |
| **Column (4-col)** | Four equal columns |
| **Grid** | Configurable multi-column grid |
| **Section** | A themed section with optional background color/image |
| **Divider** | A horizontal line separator |
| **Spacer** | Empty space with configurable height |

**Content Components** — Text, media, and data display:

| Component | Description |
|-----------|-------------|
| **Rich Text** | Full rich text editor for any content |
| **Heading (H1–H6)** | Section headings with configurable level |
| **Paragraph** | Simple text paragraph |
| **Image** | Single image with caption, lightbox option |
| **Image + Text** | Side-by-side image and text |
| **Video** | Embedded video (YouTube, Vimeo, or uploaded) |
| **PDF Viewer** | Inline PDF document viewer |
| **Table** | Configurable data table |
| **List** | Bullet or numbered list |
| **Quote** | Styled blockquote with attribution |
| **Code Block** | Code with syntax highlighting |
| **HTML Block** | Custom HTML code |
| **Embed** | Embed external content (Google Maps, etc.) |

**Media Components** — Rich media displays:

| Component | Description |
|-----------|-------------|
| **Hero Banner** | Full-width banner with text overlay and CTA button |
| **Carousel/Slider** | Image slideshow with navigation arrows/dots |
| **Video Hero** | Full-width background video with overlay text |
| **Parallax Section** | Background image with parallax scrolling effect |

**Interactive Components** — Dynamic and engaging elements:

| Component | Description |
|-----------|-------------|
| **Cards** | Configurable card grid (icon, image, or text cards) |
| **Feature Cards** | Highlighted features with icons |
| **Testimonials** | Customer/member testimonial carousel |
| **Accordion** | Expandable/collapsible content sections |
| **Tabs** | Tabbed content interface |
| **Timeline** | Vertical timeline for history or milestones |
| **FAQ** | Frequently asked questions (list format) |
| **Statistics Counter** | Animated number counters |
| **Team Members** | Team member profile grid |
| **Partner Logos** | Logo grid for partners/sponsors |
| **Icon Boxes** | Grid of boxes with icons |
| **CTA** | Call-to-action button or banner |
| **Buttons** | One or more action buttons |
| **Forms** | Custom forms (Contact, Feedback, etc.) |
| **Newsletter Signup** | Inline newsletter subscription form |
| **Social Sharing** | Social media share buttons |
| **Social Links** | Social media profile links (icons) |
| **Search Widget** | Inline search box |
| **Related Articles** | Dynamic list of related content |
| **Latest News** | Dynamic latest news feed |
| **Events List** | Dynamic upcoming events list |
| **Member Directory** | Dynamic member directory widget |
| **Map** | Google Maps or OpenStreetMap embed |
| **Breadcrumb** | Navigation breadcrumb trail |
| **Download Section** | List of downloadable files |
| **Tags Cloud** | Clickable tag cloud |

### 5.3 Using the Page Builder

**Adding a Component**:
1. Browse the component palette in the left panel.
2. Click on a category header (Layout, Content, Media, Interactive) to expand it.
3. Drag a component from the palette and drop it onto the canvas.
4. Alternatively, click the **+ Add** button on an empty section to insert components.
5. The component appears on the canvas in the position where you dropped it.

**Selecting a Component**:
- Click on any component on the canvas to select it.
- A blue border appears around the selected component.
- The property editor (right panel) updates to show the component's settings.

**Editing Component Properties**:
When a component is selected, the right panel shows its properties. Properties vary by component type but commonly include:

- **Content Properties**: Title, text, images, links, etc.
- **Style Properties**: Background color, text color, padding, margin, border, shadow, rounded corners
- **Layout Properties**: Width, height, alignment, column span
- **Visibility Properties**: Show/hide on desktop, tablet, or mobile
- **Animation Properties**: Entrance animation (fade, slide, zoom), delay, duration

**Moving Components**:
- Drag a component to a new position on the canvas.
- A visual indicator shows where the component will be placed.
- Drop the component to move it.

**Editing Component Content Inline**:
- Double-click on text elements to edit them directly on the canvas.
- Right-click on a component to access a context menu with options: Edit, Duplicate, Move Up, Move Down, Delete.

**Deleting a Component**:
1. Select the component.
2. Click the **Delete** (trash) icon in the component's toolbar.
3. Confirm deletion.

**Saving Progress**:
- The page builder auto-saves your work every 30 seconds.
- You can also click **Save** in the top toolbar at any time.
- Click **Publish** to make the page live.

### 5.4 Responsive Preview

The page builder includes a responsive preview mode:

1. Click the **Preview** button in the top toolbar.
2. Choose a device mode:
   - **Desktop** — Full 1280px+ width
   - **Tablet** — 768px width (iPad portrait)
   - **Mobile** — 375px width (iPhone)
3. The canvas resizes to show how the page will look on each device.
4. You can continue editing in preview mode — changes are reflected in real time.
5. Use the **Hide components on mobile** property to optimize for mobile view.
6. Click **Exit Preview** to return to full editing mode.

### 5.5 Reusable Templates

You can save component configurations as templates for reuse:

**Saving a Template**:
1. Select a component or a section on the canvas.
2. Click **Save as Template**.
3. Give the template a name and description.
4. The template is saved in the **Templates** tab of the component palette.

**Using a Template**:
1. Open the **Templates** tab in the left panel.
2. Drag a saved template onto the canvas.
3. All properties and content from the template are applied.

**Managing Templates**:
- Go to **Admin Panel** → **Page Templates** to view, edit, or delete saved templates.
- Templates can be organized by category.

### 5.6 Publishing & Version Management

**Publishing a Page**:
1. Click **Publish** in the top toolbar.
2. Optionally set a future publish date in the dialog.
3. Click **Confirm** to publish.
4. The page becomes live on the public website.

**Version History**:
1. Click **Versions** in the top toolbar.
2. A list of all saved versions appears with timestamps.
3. Click on a version to **Preview** it.
4. Click **Restore** to roll back to a previous version.

**Unpublishing**:
1. Open the page in the page builder.
2. Click **Status** → **Unpublish**.
3. The page is no longer visible on the public site but remains in the admin panel.

---

## 6. Admin Panel

The Admin Panel is accessible at `/admin` or by clicking **Admin Panel** in the navigation bar (requires appropriate permissions).

### 6.1 Dashboard

The dashboard (`/admin`) provides an overview of the site:

- **Content Statistics Cards**:
  - **Total Content** — Count of all content items
  - **Published** — Count of published content
  - **Drafts** — Count of content in draft status
  - **Pending Review** — Count of content awaiting review
- **User Statistics Cards**:
  - **Total Users** — Count of registered users
  - **New This Month** — Count of new registrations this month
- **Recent Activity** — A list of the latest actions on the site (content created, published, user registrations) with timestamps
- **Quick Actions** — Shortcut buttons:
  - **New Content** — Go to content creation
  - **Manage Media** — Go to media library
  - **View Events** — Go to events management
  - **Manage Users** — Go to user management (admin only)
- **Workflow Summary** — Number of items at each workflow stage (Draft, In Review, Approved, Scheduled)

### 6.2 Content Management

The Content Management section (`/admin/content`) allows you to manage all content types.

**Content List**:
- Displays a table with columns: Title, Type, Status, Category, Author, Date, Actions
- **Filter by**: Status, Type, Category, Date range
- **Search**: Keyword search across titles and content
- **Sort**: Click column headers to sort
- **Pagination**: Navigate through pages
- **Actions per row**: Edit, Preview, Delete

**Editing Content**:
1. Click on any content item in the list.
2. The content editor opens (see Section 4.1–4.8 for detailed editing instructions).
3. Make your changes and click **Save** or **Submit for Review**.

**Deleting Content**:
1. Click the **Delete** action (trash icon) on the content item.
2. A confirmation dialog appears: "Are you sure you want to delete this content item? This action cannot be undone."
3. Click **Confirm Delete** to permanently remove the content.
4. Alternatively, select multiple items and use **Bulk Actions** → **Delete**.

### 6.3 Media Library

The Media Library (`/admin/media`) manages all uploaded files:

**Uploading Files**:
1. Click the **Upload** button or drag and drop files onto the upload area.
2. Supported formats:
   - **Images**: JPEG, PNG, WebP, GIF, SVG (max 10MB each)
   - **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 25MB each)
   - **Archives**: ZIP, RAR (max 50MB each)
   - **Videos**: MP4, WebM, MOV (max 50MB each)
3. Files are uploaded one at a time during the process.
4. After upload, you can edit file metadata:
   - **Title** — Display name
   - **Alt Text** — Alternative text for accessibility (important for images)
   - **Caption** — Optional caption displayed with the image
   - **Description** — Optional description

**Organizing Files**:
- **Folders**: Click **New Folder** to create folders and sub-folders
- **Move**: Select files and choose **Move to Folder** from the actions menu
- **Rename**: Click on a file's name to edit it inline
- **Delete**: Select files and click **Delete** (requires confirmation)

**Using Media in Content**:
- In the rich text editor, click the **Insert Image** button and select **From Media Library**.
- In the page builder, image picker fields have a **Browse Library** button.
- Click on an image to select it, then click **Insert**.
- The image URL is automatically inserted into the content.

**File Details**:
Click any file to view:
- **Preview** — Thumbnail or preview of the file
- **URL** — Direct link to the file (can be copied)
- **Dimensions** — For images: width x height in pixels
- **File Size** — In KB or MB
- **File Type** — MIME type
- **Upload Date** — When the file was uploaded
- **Uploaded By** — Which user uploaded it

### 6.4 Categories

The Categories section (`/admin/categories`) manages content categories:

1. **List View**: Table with name (both languages), slug, description, parent category, content count, actions.
2. **Creating a Category**:
   - Click **Add New**.
   - Fill in:
     - **Name (Arabic)** — Category name in Arabic
     - **Name (English)** — Category name in English
     - **Slug** — URL-friendly version (auto-generated)
     - **Description** — Brief description (optional)
     - **Parent Category** — Select a parent to create hierarchy (optional)
     - **Color** — A hex color code for visual identification
   - Click **Save**.
3. **Editing**: Click a category name to edit it.
4. **Deleting**: Click Delete. Categories with content cannot be deleted unless content is reassigned first.
5. **Reordering**: Drag and drop to reorder categories (for display order).

### 6.5 Tags

The Tags section (`/admin/tags`) manages content tags:

1. **List View**: Table with name (both languages), slug, content count, actions.
2. **Creating a Tag**:
   - Click **Add New**.
   - Fill in:
     - **Name (Arabic)** — Tag name in Arabic
     - **Name (English)** — Tag name in English
     - **Slug** — Auto-generated
   - Click **Save**.
3. **Editing**: Click a tag name to edit it.
4. **Deleting**: Click Delete. Deleting a tag removes it from all associated content.

### 6.6 Menus

The Menus section (`/admin/menus`) manages navigation menus:

1. **Available Menus**: The system supports three menu locations:
   - **Header Menu** — Main navigation bar (top of every page)
   - **Footer Menu** — Quick links in the footer
   - **Mobile Menu** — Hamburger menu on mobile devices
2. **Adding Menu Items**:
   - Select which menu to edit from the dropdown.
   - Click **Add Menu Item**.
   - Fill in:
     - **Label (Arabic)** — Display text in Arabic
     - **Label (English)** — Display text in English
     - **Link Type**:
       - **Page** — Select from existing pages
       - **Content** — Select from existing content
       - **Category** — Link to a category listing
       - **Custom URL** — Enter any URL (internal or external)
       - **Home** — Link to home page
     - **Target** — Same tab or New tab
     - **Visibility**:
       - **All Users** — Visible to everyone
       - **Logged In Only** — Visible only to authenticated users
       - **Logged Out Only** — Visible only to visitors
   - Click **Add**.
3. **Reordering**: Drag and drop menu items to reorder them.
4. **Nested Items**: Drag an item to the right (indent) to make it a sub-menu item.
5. **Editing**: Click the edit icon on any menu item.
6. **Deleting**: Click the delete icon and confirm.

### 6.7 Users

The Users section (`/admin/users`) manages user accounts (Admin only):

1. **List View**: Table with username, email, role, status (active/inactive), email verified, registration date, last login, actions.
2. **Filtering**: Filter by role, status, verification status.
3. **Search**: Search by username, email, or name.
4. **Creating a User**:
   - Click **Add New**.
   - Fill in:
     - **Username** — Unique username
     - **Email** — Email address
     - **Password** — Initial password (user should change on first login)
     - **Role** — Select from Member, Editor, Reviewer, Publisher, Admin
     - **First/Last Name** (English and Arabic)
     - **Institution, Department, Position** — Optional work info
   - Click **Save**.
5. **Editing a User**:
   - Click a user's username or Edit button.
   - Modify any fields.
   - For password changes, click **Change Password** and enter a new password.
   - **Enable/Disable 2FA** — Toggle two-factor authentication for the user.
   - **Verify Email** — Mark the user's email as verified (if needed).
   - Click **Save Changes**.
6. **Activating/Deactivating**:
   - Click **Activate** or **Deactivate** to enable/disable a user's access.
   - Deactivated users cannot log in.
7. **Deleting**: Click Delete and confirm. Deletion is permanent.

### 6.8 Roles & Permissions

The Roles section (`/admin/roles`) manages roles and their permissions (Admin only):

1. **List View**: Table with role name, description, user count, actions.
2. **Creating a Role**:
   - Click **Add New**.
   - Fill in:
     - **Name** — Role name (e.g., "Moderator", "Contributor")
     - **Description** — What this role is for
   - Click **Save**.
3. **Editing Permissions**:
   - Click a role's name.
   - A grid of permissions is displayed, organized by module:
     - **Content**: Create, Read, Update, Delete, Publish, Archive
     - **Media**: Upload, Edit, Delete
     - **Categories**: Manage
     - **Tags**: Manage
     - **Pages**: Create, Edit, Delete, Publish
     - **Menus**: Manage
     - **Users**: Manage (Admin only)
     - **Roles**: Manage (Admin only)
     - **Comments**: Moderate, Delete
     - **Newsletter**: Manage, Send
     - **Events**: Manage
     - **Jobs**: Manage
     - **Board Members**: Manage
     - **Settings**: View, Edit (Admin only)
     - **CRM**: View, Edit, Delete
     - **Workflow**: Define, Manage
     - **Email Admin**: Access
     - **Audit Logs**: View
   - Check or uncheck permissions as needed.
   - Click **Save Permissions**.

### 6.9 Events Management

The Events Management section (`/admin/events`) allows admins and editors to manage events:

1. **List View**: Table with title, type, dates, location, registration status, actions.
2. **Creating an Event**:
   - Click **Add New**.
   - Fill in:
     - **Title (Arabic & English)**
     - **Slug** — Auto-generated
     - **Description** — Full event description (rich text)
     - **Event Type** — Conference, Workshop, Seminar, Webinar, Meeting, Social
     - **Start Date & Time**
     - **End Date & Time**
     - **Location Name** — Venue name
     - **Address** — Full address
     - **City** — City
     - **Country** — Country
     - **Online Event** — Checkbox for virtual events
     - **Online Link** — Meeting link (Zoom, Teams, etc.)
     - **Featured Image** — Event poster
     - **Organizer** — Person or organization organizing the event
     - **Contact Email** — For event inquiries
     - **Registration Deadline** — Last date to register
     - **Max Attendees** — Capacity limit (leave blank for unlimited)
     - **Registration Open** — Toggle to open/close registration
     - **Status** — Draft, Published, Cancelled, Completed
   - Click **Save**.
3. **Editing**: Click an event to edit.
4. **Viewing Registrations**: Click the registration count on an event to view registered attendees.
5. **Export Registrations**: Click **Export** to download registrations as CSV.

### 6.10 Job Vacancies

The Jobs Management section (`/admin/jobs`) manages job listings:

1. **List View**: Table with title, department, location, type, deadline, status, actions.
2. **Creating a Job**:
   - Click **Add New**.
   - Fill in:
     - **Title (Arabic & English)**
     - **Slug** — Auto-generated
     - **Description** — Full job description (rich text)
     - **Requirements** — Qualifications and skills needed (rich text)
     - **Benefits** — Salary and benefits info (optional)
     - **Department** — Department or division
     - **Location** — City and country
     - **Job Type** — Full-time, Part-time, Contract, Temporary, Remote
     - **Application Deadline** — Last date to accept applications
     - **Contact Email** — For inquiries
     - **Status** — Active, Filled, Expired, Draft
     - **Featured** — Checkbox to feature this job
   - Click **Save**.
3. **Editing**: Click a job to edit.
4. **Viewing Applications**: Click the applications count to view applicants.
5. **Application Management**:
   - View applicant details (name, email, cover letter, CV link)
   - Update application status: New, Reviewed, Shortlisted, Interviewed, Accepted, Rejected
   - Download CV/Resume files
6. **Expired Jobs**: Jobs past their deadline are automatically marked as Expired.

### 6.11 Board Members

The Board Members section (`/admin/board-members`) manages the Board of Directors:

1. **List View**: Table with name, position, term dates, active status, sort order, actions.
2. **Creating a Board Member**:
   - Click **Add New**.
   - Fill in:
     - **Name (Arabic & English)**
     - **Position (Arabic & English)** — e.g., President, Vice President, Secretary, Treasurer, Member
     - **Bio (Arabic & English)** — Short biography or description
     - **Photo** — Upload a photo
     - **Email** — Contact email
     - **Phone** — Contact phone
     - **Term Start** — Start date of term
     - **Term End** — End date of term
     - **Is Active** — Checkbox for current board members
     - **Sort Order** — Display order (lower numbers appear first)
   - Click **Save**.
3. **Editing**: Click a member to edit.
4. **Deleting**: Click Delete and confirm.
5. **Reordering**: Use the sort order field to control display position.

### 6.12 Member Profiles

The Member Profiles section (`/admin/member-profiles`) manages all member profiles:

1. **List View**: Table with name, username, email, institution, specialization, status, actions.
2. **Editing a Profile**:
   - Click a member to edit their profile.
   - Modify any field (see Section 9.1 for field descriptions).
   - Click **Save Changes**.
3. **Search & Filter**: Search by name, institution, or specialization.
4. **Export**: Click **Export** to download profiles as CSV.

### 6.13 Comments

The Comments section (`/admin/comments`) moderates all comments:

1. **List View**: Table with comment text, author, content item, date, status, actions.
2. **Filters**:
   - **Status**: Pending, Approved, Rejected
   - **Content**: Filter by content item
   - **Date Range**
3. **Moderation Actions**:
   - **Approve** — Make the comment visible on the public site
   - **Reject** — Hide the comment (rejected comments are not visible)
   - **Edit** — Modify the comment text before approving
   - **Delete** — Permanently remove the comment
4. **Bulk Moderation**: Select multiple comments and Approve, Reject, or Delete in bulk.
5. **Public Commenting** (for users):
   - Available on published content when comments are enabled.
   - Users must be logged in to comment.
   - Comment form includes: name, email, body text.
   - Comments can be nested (replies to existing comments).
   - All comments require moderation approval before appearing publicly.

### 6.14 Newsletter

The Newsletter section (`/admin/newsletter`) manages subscribers and campaigns:

1. **Subscriber List**: Table with email, name, subscription date, status (Active/Unsubscribed), actions.
2. **Adding a Subscriber**: Click **Add Subscriber** and enter email and optional name.
3. **Importing Subscribers**: Click **Import CSV** to upload a list of subscribers.
4. **Exporting Subscribers**: Click **Export** to download subscriber list as CSV.
5. **Sending a Newsletter**:
   - Click **Send Newsletter**.
   - Fill in:
     - **Subject** — Email subject line
     - **From Name** — Sender display name
     - **From Address** — Sender email address (must be configured)
     - **Content (Text)** — Plain text version
     - **Content (HTML)** — Rich HTML version (use the editor)
     - **Schedule Date** — Optionally schedule for later delivery
   - Click **Send Now** or **Schedule**.
6. **Campaign History**: View past newsletters and their delivery status.

### 6.15 Contact Submissions

The Contact Submissions section (`/admin/contact`) manages messages from the public contact form:

1. **List View**: Table with name, email, subject, category, date, read status, actions.
2. **Filters**:
   - **Read/Unread** — Filter by read status
   - **Category** — Filter by subject category
   - **Date Range**
3. **Viewing a Message**:
   - Click a message to open it.
   - Shows sender name, email, phone, subject, category, message body, date sent.
   - Click **Mark as Read** when you've reviewed it.
4. **Replying**:
   - Click **Reply** to compose a reply.
   - The reply is sent to the sender's email address.
   - A copy of the reply is saved in the message history.
5. **Deleting**: Click Delete to remove a message.

### 6.16 CRM

The CRM section (`/admin/crm`) manages contacts and relationships:

1. **Contact List**: Table with name, email, phone, organization, contact type, relationship level, actions.
2. **Filters**:
   - **Contact Type**: General, Member, Lead, Partner, Sponsor, Media, Other
   - **Relationship Level**: Cold, Casual, Warm, Hot, Key
   - **Search**: Search by name, email, organization
3. **Creating a Contact**:
   - Click **Add New**.
   - Fill in:
     - **First/Last Name**
     - **Email** — Primary email
     - **Phone** — Contact phone
     - **Organization** — Company or institution
     - **Position** — Job title
     - **Contact Type** — Select a type
     - **Relationship Level** — Select a level
     - **Notes** — Internal notes about the contact
     - **Assigned To** — Team member responsible for this contact
   - Click **Save**.
4. **Viewing Contact Details**:
   - Click a contact to view their full profile.
   - **Activity Log** — Chronological list of interactions (emails, calls, meetings)
   - **Notes** — Add and view internal notes
   - **Related Contacts** — Linked contacts
5. **Adding Activity**:
   - From the contact detail page, click **Add Activity**.
   - Choose type: Email, Call, Meeting, Note, Task
   - Fill in date, description, and any follow-up items.
   - Click **Save**.
6. **Export**: Click **Export** to download contacts as CSV.

### 6.17 Workflow Definitions

The Workflow Definitions section (`/admin/workflow`) configures approval workflows:

1. **List View**: Table with workflow name, content type, steps, status, actions.
2. **Creating a Workflow**:
   - Click **Add New**.
   - Fill in:
     - **Name** — Workflow name (e.g., "Standard Approval")
     - **Content Type** — Article, Publication, Event, or All
     - **Description** — What this workflow is for
   - Click **Save**.
3. **Defining Steps**:
   - Click a workflow to edit its steps.
   - Each step has:
     - **Step Name** — e.g., "Editor Review", "Publisher Approval"
     - **Assigned Role** — Who performs this step (Reviewer, Publisher, Admin)
     - **Order** — Sequence number
     - **Required** — Whether this step is mandatory
   - Add steps with **Add Step**.
   - Reorder steps by dragging.
4. **Activating/Deactivating**: Toggle a workflow on or off.
5. **Default Workflow**: The system uses this if no specific workflow is defined for a content type.

### 6.18 Email Administration

The Email Administration section (`/admin/email`) manages the internal email system (Admin only):

1. **Email Accounts** — View and manage user email accounts:
   - List of all email accounts (username, email address, quota used, status)
   - Create new accounts
   - Enable/disable accounts
   - Reset passwords
   - Adjust storage quotas
2. **SMTP Configuration** — Configure outgoing mail server:
   - Host, Port, Username, Password
   - Encryption method (SSL/TLS/STARTTLS)
   - From address and name
   - Send test email
3. **IMAP Configuration** — Configure incoming mail server:
   - Host, Port, Username, Password
   - Encryption method
   - Sync interval
   - Test connection
4. **Distribution Lists** — Manage email groups:
   - Create lists with name and description
   - Add/remove members
   - Send email to entire list
5. **Email Rules (Global)** — System-wide email processing rules.
6. **Quota Management** — Set default and per-user storage limits.

### 6.19 System Settings

The Settings section (`/admin/settings`) configures global system properties:

1. **General Settings**:
   - **Site Name** — Name displayed in the browser tab and header
   - **Site Description** — Tagline or description
   - **Site URL** — The website's public URL
   - **Footer Text** — Custom text for the footer
   - **Language** — Default language
2. **Branding**:
   - **Site Logo** — Upload logo for the header (recommended 200x60px)
   - **Favicon** — Upload favicon (32x32px ICO or PNG)
   - **OG Image** — Default Open Graph image for social sharing (1200x630px)
3. **Contact Information**:
   - **Address** — Physical address
   - **Phone** — Contact phone number
   - **Email** — Contact email address
   - **Social Links** — Facebook, Twitter, LinkedIn, YouTube, Instagram URLs
4. **SEO Settings**:
   - **Default Meta Title** — Fallback for pages without custom meta title
   - **Default Meta Description** — Fallback for pages without custom description
   - **Google Analytics ID** — Tracking ID (e.g., G-XXXXXXXXXX)
   - **robots.txt** — Custom directives
5. **Security Settings**:
   - **Registration** — Enable/disable public registration
   - **Email Verification** — Require email verification for new accounts
   - **2FA Enforcement** — Require 2FA for all users or specific roles
   - **Session Timeout** — Minutes before idle session expires
   - **Max Login Attempts** — Before account lockout
6. **Email Configuration**:
   - **From Address** — Default sender for system emails
   - **From Name** — Default sender name
7. **Maintenance Mode**:
   - **Enable/Disable** — Put the site in maintenance mode
   - **Message** — Custom message for users during maintenance

### 6.20 Audit Logs

The Audit Logs section (`/admin/audit-logs`) provides a record of all significant actions:

1. **List View**: Table with timestamp, user, action type, entity type, entity ID, IP address, details.
2. **Filters**:
   - **Action Type**: Create, Update, Delete, Login, Logout, Publish, Approve, Reject, etc.
   - **Entity Type**: Content, User, Page, Media, etc.
   - **User**: Filter by who performed the action
   - **Date Range**
3. **Search**: Search across details and entity IDs.
4. **Export**: Click **Export** to download logs as CSV.
5. **Log Retention**: Logs are automatically cleaned after 365 days (configurable).

### 6.21 Theme Toggle

The admin panel supports dark and light mode:

1. In the admin header, click the **sun icon** (light mode) or **moon icon** (dark mode).
2. The entire admin interface switches between themes.
3. The preference is stored and remembered for future sessions.
4. The theme is independent of the public website's appearance.

---

## 7. Webmail Client

The webmail client (`/email/inbox`) provides internal email capabilities for logged-in users.

### 7.1 Layout Overview

The webmail interface has a three-pane layout:

- **Left Sidebar**:
  - **Compose Button** — Prominent button to create a new email
  - **Folder List** — Inbox, Sent, Drafts, Trash, Spam, Archive, and any custom folders
  - **Folder Unread Counts** — Number of unread messages in each folder
  - **Quota Meter** — Visual bar showing used vs. total storage
- **Center Panel**:
  - **Search Bar** — Search emails by sender, subject, or content
  - **Filter Controls** — Date, read/unread, has attachments
  - **Message List** — Table showing sender, subject, date, preview, and attachment indicator
  - **Pagination** — Load more messages as needed
- **Right Panel** (or full-width on mobile):
  - Shows the selected message when one is clicked
  - Message toolbar with action buttons

### 7.2 Composing an Email

1. Click the **Compose** button in the sidebar.
2. The compose window opens (modal or full page depending on screen size).
3. Fill in the email fields:
   - **To** — Recipient(s). Start typing to autocomplete from contacts. You can enter multiple addresses separated by commas.
   - **Cc** — Carbon copy recipients (click **Cc** link to show this field).
   - **Bcc** — Blind carbon copy recipients (click **Bcc** link to show this field).
   - **Subject** — Email subject line.
   - **Body** — Write your message using the rich text editor (formatting, images, links, lists).
4. **Attachments**:
   - Click the **Attach** (paperclip) icon or drag and drop files onto the compose area.
   - Max attachment size: 25MB total per email.
   - Supported: Images, documents, PDFs, archives.
   - Attached files appear as a list below the subject line.
   - Click **X** on any attachment to remove it.
5. **Additional Options**:
   - **Signature** — Automatically appended if configured (see Section 7.7).
   - **Reply-to** — Override the default reply-to address.
   - **Importance** — Mark as High or Low importance.
6. **Sending**:
   - Click **Send** to deliver immediately.
   - Or click the dropdown arrow next to **Send** and select **Schedule Send** to choose a future time.
7. After sending, you are returned to the Inbox. A confirmation toast appears.

### 7.3 Reading Email

1. Click any message in the message list to open it.
2. The message is displayed in the reading pane showing:
   - **Header**: Sender, recipients, subject, date/time
   - **Toolbar**: Reply, Reply All, Forward, Delete, Star, Flag, Mark as Unread
   - **Body**: The email content (rich text or plain text)
   - **Attachments**: List of attached files with download buttons
3. **Reply**:
   - Click **Reply** to reply to the sender only.
   - A compose window opens with the original message quoted below.
   - The To field is pre-filled with the sender's address.
   - Subject is pre-filled with "Re: [original subject]".
4. **Reply All**:
   - Click **Reply All** to reply to the sender and all recipients.
   - To and Cc fields are pre-filled.
5. **Forward**:
   - Click **Forward** to forward the message to someone else.
   - Subject is pre-filled with "Fwd: [original subject]".
   - The original message is included as quoted text.
6. **Star/Flag**:
   - Click the **star** icon to star (bookmark) a message.
   - Starred messages appear in the **Starred** folder.
   - Click the **flag** icon to flag a message for follow-up.
7. **Mark as Unread**:
   - Click **Mark as Unread** to return the message to unread status.
   - The unread count updates accordingly.

### 7.4 Folders

The webmail client provides both system and custom folders:

**System Folders**:
| Folder | Description |
|--------|-------------|
| **Inbox** | All incoming messages |
| **Sent** | Messages you have sent |
| **Drafts** | Messages saved as drafts (not yet sent) |
| **Trash** | Deleted messages (can be recovered or permanently deleted) |
| **Spam** | Messages flagged as spam |
| **Archive** | Messages moved for long-term storage |

**Managing Folders**:
1. **Create a Custom Folder**:
   - Right-click on the folder list area and select **New Folder**.
   - Or click the **+** icon next to "Folders".
   - Enter a folder name and click **Create**.
2. **Move Messages Between Folders**:
   - Select a message (or multiple messages) in the message list.
   - Click **Move** in the toolbar.
   - Select the destination folder from the dropdown.
   - Or drag and drop messages onto a folder in the sidebar.
3. **Delete a Custom Folder**:
   - Right-click the folder and select **Delete**.
   - All messages in the folder are moved to Trash.

### 7.5 Email Rules

Create rules to automatically process incoming email:

1. Go to **Email Settings** → **Rules**.
2. Click **New Rule**.
3. Configure the rule:
   - **Rule Name** — A descriptive name (e.g., "Move newsletters")
   - **Conditions** (choose one or more):
     - **From** — Sender email address contains, equals, or does not contain
     - **To** — Recipient address matches
     - **Subject** — Subject contains, starts with, ends with, or does not contain
     - **Body** — Body text contains or does not contain
     - **Has Attachments** — Yes or No
   - **Match Type**: All conditions (AND) or Any condition (OR)
   - **Actions** (choose one or more):
     - **Move to Folder** — Select a destination folder
     - **Mark as Read** — Automatically mark as read
     - **Star** — Star the message
     - **Forward To** — Forward to another email address
     - **Delete** — Move to Trash
     - **Mark as Spam** — Move to Spam folder
     - **Notify** — Send a notification
   - **Enabled** — Check to activate the rule
4. Click **Save**.
5. Rules are applied to new incoming messages only (not retroactively).
6. Rules are processed in order (top-down). Drag to reorder rules.

### 7.6 Contacts & Groups

The Contacts section (`/email/contacts`) manages your personal address book:

**Adding a Contact**:
1. Click **Add Contact**.
2. Fill in:
   - **First Name** / **Last Name**
   - **Email** — Primary email address
   - **Phone** — Optional phone number
   - **Organization** — Company or institution
   - **Notes** — Any additional notes
3. Click **Save**.

**Contact Groups**:
1. Go to **Contacts** → **Groups** tab.
2. Click **New Group**.
3. Enter a group name (e.g., "Research Team", "Board Members").
4. Click **Create**.
5. To add contacts to a group:
   - Open the group.
   - Click **Add Members**.
   - Select contacts from the list.
   - Click **Add**.

**Using Contacts in Compose**:
- Start typing in the To, Cc, or Bcc field.
- Matching contacts from your address book appear in an autocomplete dropdown.
- Click a contact to add them.
- You can also select a contact group to add all members.

### 7.7 Email Signatures

Configure a signature that appears at the bottom of all outgoing emails:

1. Go to **Email Settings** → **Signature**.
2. Toggle **Enable Signature** on.
3. Compose your signature using the rich text editor (supports formatting, links, images).
4. Example signature content:
   ```
   Dr. John Doe
   Senior Researcher | Syrian Soil Science Society
   Email: john.doe@ssssy.org
   Phone: +963-11-XXXXXXX
   ```
5. Choose placement:
   - **Append to new emails only** — Signature added to new messages but not replies/forwards
   - **Append to all outgoing emails** — Added to new messages, replies, and forwards
6. Click **Save**.
7. The signature is automatically inserted when composing emails.

### 7.8 Auto-Reply

Configure an automatic reply (out-of-office) message:

1. Go to **Email Settings** → **Auto-Reply**.
2. Toggle **Enable Auto-Reply** on.
3. Fill in:
   - **Subject** — Auto-reply subject line (e.g., "Out of Office - Dr. John Doe")
   - **Message** — The auto-reply message body (supports rich text)
   - **Start Date** — When auto-reply becomes active
   - **End Date** — When auto-reply stops
4. Additional options:
   - **Send reply only once per sender** — Prevents duplicate replies
   - **Reply to external senders only** — Only auto-reply to people outside your organization
5. Click **Save**.
6. Auto-reply is active between the start and end dates.
7. A banner at the top of the Inbox indicates that auto-reply is active.

### 7.9 Quota Management

Each user has a storage quota for their email:

1. View your quota usage in the sidebar — a horizontal bar shows used vs. total space.
2. **Quota Warning**: When you exceed 80% usage, a yellow warning appears.
3. **Quota Exceeded**: When you exceed 100%, you cannot send or receive new emails until you free up space.
4. **Freeing Up Space**:
   - Delete old messages (remember to empty Trash).
   - Remove large attachments by downloading and deleting.
   - Archive old messages to a local backup.
5. **Default Quota**: 1 GB per user (configurable by Admin).

### 7.10 Message Threads

Emails with the same subject are grouped into conversation threads:

1. In the message list, threaded messages show a small triangle/expand icon.
2. Click the expand icon to see all messages in the thread.
3. The thread displays messages in chronological order.
4. The thread subject shows the total number of messages in parentheses.
5. Click any message in the thread to read it.
6. **Disable Threading**: Go to **Email Settings** → uncheck **Enable Threading**.

### 7.11 Scheduled Sends

You can compose an email now and schedule it to be sent later:

1. Compose your email as normal.
2. Instead of clicking **Send**, click the dropdown arrow next to the **Send** button.
3. Select **Schedule Send**.
4. Choose from preset options:
   - **Tomorrow Morning** — 8:00 AM next day
   - **Tomorrow Afternoon** — 1:00 PM next day
   - **Next Monday** — 8:00 AM next Monday
   - **Custom** — Pick your own date and time
5. Click **Schedule**.
6. The email is saved in the **Scheduled** folder until it's sent.
7. To cancel a scheduled send:
   - Go to **Scheduled** folder.
   - Open the scheduled message.
   - Click **Cancel Schedule**.
   - The message moves to Drafts, where you can edit and send manually.

### 7.12 Email Search

Search across all your email folders:

1. Click the search bar at the top of the message list.
2. Enter your search query.
3. As you type, results are filtered in real time.
4. Search looks in:
   - **From** — Sender name and email
   - **To** — Recipient names and emails
   - **Subject** — Email subject line
   - **Body** — Email content
5. **Advanced Search Options** (click the filter icon):
   - **Folder** — Search within a specific folder
   - **Date Range** — From and to dates
   - **Has Attachments** — Yes/No
   - **Read Status** — Read, Unread, or Any
   - **Starred** — Starred only or all
6. Search results are displayed in the message list with matching terms highlighted.
7. Clear the search box to return to the normal folder view.

---

## 8. Notifications

### 8.1 Notification Bell

The notification bell is located in the top navigation bar (appears when logged in):

- **Bell Icon** — Click to open the notification dropdown
- **Red Badge** — Shows the number of unread notifications (capped at 99+)
- **Dropdown** — Displays the 5 most recent notifications with:
  - Notification title
  - Brief body text (truncated)
  - Read/unread visual indicator
  - Timestamp
- **Mark All Read** — Click to mark all notifications as read
- **No Notifications** — Shows "No notifications" when the list is empty

### 8.2 Notification Types

| Type | Trigger | Example |
|------|---------|---------|
| Workflow Approved | Content you authored was approved | "Your article 'Soil Analysis Methods' has been approved" |
| Workflow Rejected | Content you authored was rejected | "Your article 'Research Findings' has been rejected. Reason: insufficient data" |
| Changes Requested | Reviewer requested modifications | "Changes requested for 'Crop Rotation Study'. Please revise and resubmit" |
| Content Published | Your content was published | "Your article 'New Discoveries' has been published" |
| Comment Reply | Someone replied to your comment | "Dr. Smith replied to your comment on 'Soil pH Testing'" |
| New Comment | Someone commented on your content | "New comment on 'Irrigation Techniques' by Ahmed" |
| Email Received | New email in your inbox | "New email from Dr. Jane Doe: Meeting Reminder" |
| Content Assigned | Content was assigned to you for review | "Article 'Desertification Study' has been assigned to you for review" |
| System Announcement | Admin broadcast message | "System maintenance scheduled for Saturday 10 PM - 2 AM" |
| Event Reminder | Upcoming event reminder | "Reminder: Soil Science Conference starts tomorrow" |

### 8.3 Managing Notifications

- **View All Notifications**: Click **View All** at the bottom of the dropdown to see the full notification list (`/notifications`).
- **Mark as Read**: Click on a notification in the dropdown to navigate to the related item and mark it as read.
- **Mark All Read**: Click the **Mark all read** link at the top of the dropdown.
- **Real-time Updates**: New notifications appear in real time (via WebSocket) without refreshing the page.
- **Notification Settings**: Configure which notification types you receive in **Profile** → **Notification Preferences**.

---

## 9. Profile & Account Management

### 9.1 Editing Your Profile

1. Click your **avatar** or **username** in the top navigation bar.
2. Select **Profile** from the dropdown menu.
3. The profile page is organized into sections:

**Personal Information**:
- First Name (English & Arabic)
- Last Name (English & Arabic)
- Username (cannot be changed after creation)
- Email (changing requires re-verification)
- Phone number

**Professional Information**:
- **Institution** — Your university, research center, or organization
- **Department** — Your department or division
- **Position** — Your job title or academic position
- **Specialization** — Area of expertise
- **Biography** — Professional biography (supports rich text)
- **Research Interests** — Keywords describing your research focus
- **Education** — List of degrees with institutions and years

**Online Profiles**:
- **ORCID ID** — Format: 0000-0001-2345-6789
- **Google Scholar URL** — Full URL to your profile
- **LinkedIn URL** — Full URL to your profile
- **ResearchGate URL** — Full URL to your profile
- **Personal Website** — Your website URL

**Profile Photo**:
- Click the avatar to upload a new photo
- Supported formats: JPEG, PNG, WebP
- Recommended size: 400x400px
- Max file size: 2MB

4. Click **Save Changes** to update your profile.
5. A success message confirms the update.

### 9.2 Security & Password

**Changing Your Password**:
1. Go to **Profile** → **Security** tab.
2. Click **Change Password**.
3. Enter:
   - **Current Password** — Your existing password
   - **New Password** — Minimum 8 characters, must contain uppercase, lowercase, and a number
   - **Confirm New Password** — Re-enter the new password
4. Click **Update Password**.
5. Your session remains active. Use the new password next time you log in.

**Two-Factor Authentication**:
1. Go to **Profile** → **Security** tab.
2. If 2FA is available, click **Enable 2FA**.
3. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).
4. Enter the 6-digit code from the app to confirm setup.
5. 2FA is now enabled. Recovery codes are shown — save them in a secure location.

**Active Sessions**:
1. Go to **Profile** → **Security** tab.
2. View a list of active login sessions with:
   - Device/OS information
   - IP address
   - Last active time
   - Login date
3. Click **Revoke** to end any session (e.g., if you left a session on a shared computer).

### 9.3 Notification Preferences

1. Go to **Profile** → **Notifications** tab.
2. Toggle notification types on or off:
   - **Content Workflow** — Approvals, rejections, publication
   - **Comments** — New comments and replies
   - **Email** — New email notifications
   - **Events** — Event reminders and updates
   - **Newsletter** — Newsletter confirmations
   - **System** — System announcements and maintenance notices
3. Choose notification delivery methods:
   - **In-app** — Notification bell
   - **Email** — Send notification to your email as well
4. Click **Save Preferences**.

---

## 10. Keyboard Shortcuts

The following keyboard shortcuts are available in the admin panel:

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+N` | New content | Content list / Dashboard |
| `Ctrl+S` | Save draft | Content editor / Page builder |
| `Ctrl+Shift+S` | Save and close | Content editor |
| `Ctrl+P` | Preview content | Content editor |
| `Ctrl+Shift+P` | Publish content | Content editor |
| `Ctrl+Z` | Undo | Content editor / Page builder |
| `Ctrl+Shift+Z` | Redo | Content editor / Page builder |
| `Ctrl+F` | Find in editor | Content editor (TipTap) |
| `Ctrl+H` | Find and replace | Content editor (TipTap) |
| `B` | Bold text | Content editor (text selected) |
| `I` | Italic text | Content editor (text selected) |
| `U` | Underline text | Content editor (text selected) |
| `/` | Focus search | Any admin page |
| `G then I` | Go to Inbox | Any admin page |
| `G then D` | Go to Dashboard | Any admin page |
| `G then C` | Go to Content | Any admin page |
| `G then P` | Go to Pages | Any admin page |
| `G then M` | Go to Media | Any admin page |
| `G then U` | Go to Users | Any admin page |
| `G then S` | Go to Settings | Any admin page |
| `Escape` | Close modal / Cancel | Dialog boxes |
| `?` | Show keyboard shortcuts help | Any admin page |

**Note**: Mac users use `Cmd` instead of `Ctrl`.

---

## 11. FAQ

**Q: I forgot my password. How do I reset it?**
A: On the Login page, click "Forgot Password". Enter your email address and click "Send Reset Link". Check your email for the reset link and follow the instructions to set a new password.

**Q: I registered but didn't receive the verification email. What should I do?**
A: First, check your spam/junk folder. If it's not there, try to log in — the system will show a message with a "Resend Verification Email" link. If the problem persists, contact an administrator.

**Q: How do I switch between English and Arabic?**
A: Click the globe icon in the top navigation bar and select your preferred language. The interface will adjust direction (LTR for English, RTL for Arabic) automatically.

**Q: What is the content workflow and how does it work?**
A: The workflow is a review process that ensures content quality. You create content as a Draft, submit it for Review, a Reviewer approves or requests changes, and then a Publisher publishes it. See Section 4.5 for the full workflow diagram.

**Q: Can I edit content after it's published?**
A: Yes. Open the published content and click Edit. Changes are saved as a new version. You can either publish the changes immediately or save them as a draft. The previous version is preserved in the version history.

**Q: How do I schedule content to publish automatically?**
A: When editing approved content, look for the "Schedule Publication" section. Set the desired date and time, then click "Schedule". The system will auto-publish at that time.

**Q: I'm an Editor. How do I assign a reviewer to content?**
A: Open the submitted content. In the workflow section, use the "Assign Reviewer" dropdown to select a reviewer. The reviewer will be notified and the content status changes to "In Review".

**Q: How do I create a custom page using the Page Builder?**
A: Go to Admin Panel → Pages → New Page. Enter a title, choose "Flexible (Page Builder)" layout, and click "Create & Edit". Then drag components from the left palette onto the canvas. See Section 5 for full details.

**Q: What file types can I upload to the Media Library?**
A: Images: JPEG, PNG, WebP, GIF, SVG (max 10MB). Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 25MB). Archives: ZIP, RAR (max 50MB). Videos: MP4, WebM, MOV (max 50MB).

**Q: How do I manage the newsletter?**
A: Go to Admin Panel → Newsletter to view subscribers, add new subscribers, import from CSV, and send newsletters to all active subscribers. You can also schedule newsletters for later delivery.

**Q: Can I undo a published page or content?**
A: Yes. Use the version history feature. Open the item, click "Version History", find the version you want to restore, and click "Rollback to This Version". This creates a new version with the old content.

**Q: How do I apply for a job?**
A: Browse the Jobs page, click on a job listing to view details, then click the "Apply" button. Fill in your name, email, cover letter, and upload your CV. Track your application status in your profile.

**Q: How do I register for an event?**
A: Go to the Events page, find the event, click on it for details, then click the "Register" button. Fill in the registration form and submit. Your registered events appear in "My Events" on your profile.

**Q: I'm an Admin. How do I add a new user?**
A: Go to Admin Panel → Users → Add New. Fill in the user details (username, email, password, role) and click Save. The user will receive a welcome email with login instructions.

**Q: How do I change my email signature?**
A: Go to Email Settings → Signature. Toggle "Enable Signature" on, compose your signature using the editor, and click Save. See Section 7.7 for details.

**Q: What is the storage quota for email?**
A: The default quota is 1 GB per user. You can see your usage in the webmail sidebar. If you exceed 80%, a warning appears. Contact an admin if you need a larger quota.

**Q: How do I set up an auto-reply when I'm out of office?**
A: Go to Email Settings → Auto-Reply. Enable it, compose your message, set start and end dates, and click Save. Auto-reply will be active during the specified dates.

**Q: How do I create custom folders in webmail?**
A: In the webmail sidebar, click the "+" icon next to "Folders", enter a folder name, and click Create. You can drag and drop messages between folders.

**Q: How does dark mode work in the admin panel?**
A: In the admin header, click the sun/moon icon to toggle between light and dark themes. The preference is saved for your next session.

**Q: Can I track who made changes to content?**
A: Yes. Every change is recorded in the audit log. Go to Admin Panel → Audit Logs to view a chronological record of all actions, including who did what and when.

**Q: How do I give a user more permissions?**
A: Go to Admin Panel → Users, find the user, click Edit, and change their Role. You can also customize permissions by editing the role in Admin Panel → Roles.

**Q: Can I prevent certain users from registering?**
A: Yes. An Admin can disable public registration in Settings → Security Settings. You can also manually approve registrations by reviewing new users in the Users section.

---

## 12. Best Practices

### 12.1 Content Creation

- **Use descriptive titles**: Titles should be clear and include relevant keywords for SEO.
- **Write for your audience**: Use language appropriate for soil science professionals while making content accessible.
- **Add featured images**: Content with images gets significantly more views and engagement.
- **Fill in SEO metadata**: Always provide a meta title and description to improve search engine visibility.
- **Use categories and tags**: Proper categorization helps users find related content. Tag articles with relevant keywords.
- **Preview before publishing**: Always preview content to check formatting, images, and links before publishing.
- **Break up long content**: Use headings, lists, and images to break up long articles for readability.
- **Proofread in both languages**: If content is bilingual, proofread both versions carefully.

### 12.2 Workflow

- **Draft early, submit when ready**: Use Draft status to work on content incrementally. Submit only when complete.
- **Provide clear review comments**: When requesting changes, be specific about what needs to be revised and why.
- **Respond to review requests promptly**: Reviewers should evaluate submissions within 48 hours.
- **Use scheduling wisely**: Schedule content for optimal publishing times (e.g., weekday mornings).
- **Archive outdated content**: Regularly review published content and archive items that are no longer relevant.

### 12.3 Media Library

- **Use descriptive filenames**: Rename files to descriptive names before uploading (e.g., "soil-ph-testing-lab.jpg" instead of "IMG_001.jpg").
- **Add alt text**: Always provide alternative text for images to improve accessibility and SEO.
- **Organize in folders**: Use folders to keep the media library organized by year, event, or content type.
- **Delete unused files**: Periodically clean up files that are no longer in use to save storage space.
- **Optimize images**: Resize and compress images before uploading to reduce page load times.

### 12.4 Page Builder

- **Use templates**: Save frequently used component configurations as templates for reuse across pages.
- **Test on mobile**: Always preview your pages in mobile and tablet views before publishing.
- **Keep layouts simple**: Avoid overcrowding pages. Use whitespace effectively.
- **Consistent styling**: Use consistent colors, fonts, and spacing throughout your pages.
- **Accessibility**: Use proper heading hierarchy (H1 → H2 → H3) and ensure sufficient color contrast.

### 12.5 Email

- **Use folders and rules**: Keep your inbox organized with folders and automated rules.
- **Clean up regularly**: Archive or delete old messages to stay within your quota.
- **Use signatures professionally**: Include your name, title, institution, and contact information.
- **Check recipients before sending**: Double-check To, Cc, and Bcc fields to avoid sending to the wrong people.
- **Use scheduled sends for time zones**: If recipients are in different time zones, schedule emails to arrive during their business hours.

### 12.6 Administration

- **Review audit logs weekly**: Regularly check the audit log for unusual activity.
- **Manage user accounts**: Deactivate accounts of users who have left the society.
- **Back up regularly**: Use the backup feature to protect against data loss.
- **Keep roles minimal**: Assign users the minimum permissions they need to do their work.
- **Review comments daily**: Approve or reject pending comments promptly to maintain community engagement.

### 12.7 Security

- **Use strong passwords**: Minimum 12 characters with a mix of uppercase, lowercase, numbers, and symbols.
- **Enable 2FA**: Use two-factor authentication for an extra layer of security.
- **Log out from shared devices**: Always log out when using a shared or public computer.
- **Don't share accounts**: Each user should have their own account with appropriate permissions.
- **Report suspicious activity**: Contact an administrator immediately if you notice any unusual system behavior.

---

*This user guide was compiled for the Syrian Soil Science Society (SSSSY) website.*

*Last updated: June 2026*
