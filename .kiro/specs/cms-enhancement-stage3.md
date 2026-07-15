# CMS Enhancement — Stage 3: Document Management System (DMS)

## Overview

Stage 3 transforms the CMS into a full Document Management System comparable to **Alfresco Community Edition** and **OpenKM**. This goes beyond web page management to cover enterprise document lifecycle: ingestion, classification, versioning, retention, search, collaboration, and workflow.

**Dependencies:** Stage 1 and Stage 2 must be complete before Stage 3 begins.

---

## Alfresco / OpenKM Feature Comparison & Implementation Plan

### 1. Document Repository (Core DMS)

**Alfresco equivalent:** Content Repository (alfresco/contentstore)
**OpenKM equivalent:** Repository > Documents

| Feature | Alfresco | OpenKM | This CMS (Stage 3 Target) |
|---------|----------|--------|--------------------------|
| File storage | Content store + DB | DB + filesystem | MinIO + PostgreSQL |
| Folder hierarchy | Spaces | Folders | media_folders (extended) |
| Document types | Content models | Document types | Custom document types |
| MIME support | All formats | All formats | PDF, DOCX, XLSX, PPTX, images, video |
| Check-in/Check-out | ✅ | ✅ | ✅ Planned |
| Version history | ✅ Full | ✅ Full | ✅ Planned |
| Metadata | Custom properties | Custom metadata | Custom fields per doc type |
| Access control | ACL per node | ACL per folder/doc | Role + per-document ACL |

**Implementation:**

```sql
-- Document repository
CREATE TABLE dms_documents (
    id              UUID PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    document_type   VARCHAR(100),        -- PDF, Report, Contract, etc.
    filename        VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    size_bytes      BIGINT NOT NULL,
    storage_path    VARCHAR(1000) NOT NULL, -- MinIO object key
    folder_id       UUID REFERENCES dms_folders(id),
    checked_out_by  UUID REFERENCES users(id),
    checked_out_at  TIMESTAMPTZ,
    status          VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, DELETED
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE dms_document_versions (
    id              UUID PRIMARY KEY,
    document_id     UUID REFERENCES dms_documents(id),
    version_number  VARCHAR(20) NOT NULL,  -- 1.0, 1.1, 2.0
    storage_path    VARCHAR(1000) NOT NULL, -- MinIO object key for this version
    size_bytes      BIGINT,
    change_comment  TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dms_folders (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    path        TEXT NOT NULL,            -- materialized path: /root/legal/contracts/
    parent_id   UUID REFERENCES dms_folders(id),
    description TEXT,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. Document Metadata & Classification

**Alfresco equivalent:** Content Models, Aspects
**OpenKM equivalent:** Metadata groups, Keywords

- **Document Types with Custom Metadata Schemas**
  - Research Paper: abstract, journal, DOI, publication date, authors
  - Internal Report: report period, department, classification level
  - Contract: effective date, expiry date, counterparty, contract value
  - Meeting Minutes: meeting date, attendees, agenda items
  - Policy Document: effective date, review date, responsible unit

- **Metadata Inheritance**
  - Child documents inherit folder metadata defaults
  - Override at document level

- **Keywords & Tags**
  - Flat keyword tagging (like Alfresco keyword aspect)
  - Multi-language keyword display

- **Custom Metadata Search**
  - Search by any metadata field value
  - Date range filters (publication date, effective date)
  - Combined FTS + metadata query

---

### 3. Document Lifecycle & Retention

**Alfresco equivalent:** Records Management (RM) module
**OpenKM equivalent:** Retention policies

- **Document Lifecycle States**
  - DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED → DESTROYED
  - Each transition records who changed state and when

- **Retention Policies**
  - Define retention periods per document type (e.g., financial records: 7 years)
  - Auto-schedule archival when retention period expires
  - Legal hold: freeze document from archival (litigation hold)
  - Retention audit trail (who extended hold, when, reason)

- **Archival System**
  - Move archived documents to cold storage tier in MinIO (different bucket)
  - Archived documents searchable but read-only
  - Restore from archive (requires ADMIN approval via workflow)

```sql
CREATE TABLE dms_retention_policies (
    id                  UUID PRIMARY KEY,
    document_type       VARCHAR(100) NOT NULL,
    retention_years     INTEGER NOT NULL,
    action_on_expiry    VARCHAR(50) NOT NULL, -- ARCHIVE, DESTROY, REVIEW
    legal_basis         TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dms_document_holds (
    id              UUID PRIMARY KEY,
    document_id     UUID REFERENCES dms_documents(id),
    hold_reason     TEXT NOT NULL,
    held_by         UUID REFERENCES users(id),
    held_at         TIMESTAMPTZ DEFAULT NOW(),
    released_by     UUID REFERENCES users(id),
    released_at     TIMESTAMPTZ
);
```

---

### 4. Full-Text Search & Indexing

**Alfresco equivalent:** Apache Solr integration
**OpenKM equivalent:** Lucene-based search

- **Document Content Extraction**
  - PDF text extraction (Apache PDFBox)
  - DOCX/XLSX content extraction (Apache POI)
  - OCR for scanned PDFs (Tesseract via subprocess or REST API)
  - Index extracted text in PostgreSQL FTS or Elasticsearch

- **Advanced Search Operators**
  - Boolean: AND, OR, NOT
  - Phrase search: "climate change"
  - Wildcard: soil* (matches soil, soils, soilless)
  - Proximity: "water soil"~5 (within 5 words of each other)
  - Field-specific: `title:"research" AND author:"Hassan"`

- **Search Result Highlighting**
  - Show surrounding context of matched terms
  - Highlight matched terms in document preview

- **Search API**
  - `GET /api/dms/search?q=...&type=&dateFrom=&dateTo=&folderId=&page=&size=`
  - Returns: id, title, type, snippet (highlighted), relevance score, folder path, created date

---

### 5. Check-In / Check-Out System

**Alfresco equivalent:** Version Control checkout/checkin
**OpenKM equivalent:** Document lock/unlock

- **Checkout**
  - Lock document for exclusive editing
  - Download working copy
  - Other users see "Checked out by [name]" badge
  - Admin can force-release a checkout

- **Check-In**
  - Upload new version after editing
  - Mandatory change comment
  - Version number increment (minor: 1.0→1.1 for patch, major: 1.0→2.0 for significant changes)
  - Automatic unlock on check-in

- **Version Diff**
  - For text-based documents: show diff of extracted text between versions
  - For all documents: show metadata changes between versions
  - Download any specific version

```
Flow:
User → Check Out → Download → Edit locally → Check In → New Version Created
          ↓                                       ↑
     Document locked                      Upload new file
     Others see lock                      Provide change comment
     Admin can break lock                 Choose major/minor bump
```

---

### 6. Access Control & Permissions (ACL)

**Alfresco equivalent:** Permission service (role + node-level ACL)
**OpenKM equivalent:** Role-based access + folder permissions

- **Hierarchical Permission Inheritance**
  - Permissions set on folder apply to all children
  - Override at document level for sensitive documents
  - Permission inheritance chain display

- **Permission Types**
  - READ: view and download document
  - WRITE: upload new version, edit metadata
  - DELETE: soft-delete document
  - MANAGE: change permissions, lock/unlock, workflow management
  - FULL_CONTROL: all above

- **Permission Groups**
  - Assign permissions to groups of users (roles or custom groups)
  - Group membership management
  - Time-limited permissions (access expires on date)

- **Public Sharing Links**
  - Generate shareable link with expiry and optional password
  - Track link access (who downloaded, when)
  - Revoke link at any time

---

### 7. Document Workflow Integration

**Alfresco equivalent:** Activiti BPM + Task Management
**OpenKM equivalent:** Workflow module

- **Document Approval Workflow**
  - Extends page builder workflow to documents
  - DRAFT → REVIEW → LEGAL_REVIEW (optional) → APPROVED → PUBLISHED
  - Parallel reviews (multiple reviewers sign off simultaneously)
  - Sequential review chains

- **Task Management**
  - Assign review tasks to specific users
  - Deadline per task
  - Task reminder emails (1 day before, day of deadline)
  - Escalation: auto-reassign overdue tasks to supervisor

- **Delegation**
  - Reviewer can delegate task to another user
  - Delegation audit trail

```sql
CREATE TABLE dms_tasks (
    id              UUID PRIMARY KEY,
    document_id     UUID REFERENCES dms_documents(id),
    task_type       VARCHAR(50) NOT NULL, -- REVIEW, APPROVE, SIGN, ACKNOWLEDGE
    assigned_to     UUID REFERENCES users(id),
    assigned_by     UUID REFERENCES users(id),
    due_date        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    status          VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, OVERDUE, DELEGATED
    notes           TEXT,
    delegated_to    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 8. Collaboration Features

**Alfresco equivalent:** Alfresco Share collaboration
**OpenKM equivalent:** Discussion/Notes

- **Document Comments & Annotations**
  - Inline comments on specific pages of PDFs
  - General document comments (threaded)
  - @mention users in comments
  - Resolve/unresolve comment threads

- **Document Notes (Sticky Notes)**
  - Private notes visible only to author
  - Shared notes visible to all users with READ permission

- **Co-authoring (Basic)**
  - Lock sections of a document for editing (page-level, not character-level)
  - See who else is viewing the document currently (presence indicator)

- **Activity Feed**
  - Per-document: all changes, comments, version updates, workflow events
  - Personal: activity on documents you created, reviewed, or are watching
  - Watch/unwatch documents for notifications

---

### 9. Reporting & Compliance

**Alfresco equivalent:** Alfresco Analytics, Records Management reports
**OpenKM equivalent:** Reports module

- **Document Reports**
  - Documents by type (count, total size)
  - Documents by status (active/archived/deleted)
  - Documents expiring within N days (retention report)
  - Documents on legal hold
  - User activity report (uploads, downloads, reviews)

- **Audit Reports**
  - Full access log per document (view, download, edit, share)
  - Compliance report: documents without required metadata
  - Version history report

- **Export Formats**
  - PDF, CSV, Excel for all reports
  - Scheduled report delivery via email

---

### 10. Integration APIs

**Alfresco equivalent:** CMIS (Content Management Interoperability Services) REST API
**OpenKM equivalent:** REST API

- **CMIS-Compatible REST API**
  - Industry-standard document management API
  - Enables integration with third-party tools (Word, Excel, email clients)
  - Endpoints: browse repository, get document, upload, checkout, checkin, search

- **Webhooks**
  - Fire webhooks on: document upload, version change, workflow state change, comment added
  - Configurable per event type and target URL
  - Webhook delivery log with retry on failure

- **Email-to-Document Ingestion**
  - Monitor a designated email address
  - Emails and attachments automatically saved as documents in a configured folder
  - Metadata extracted from email (sender, subject, date)

---

## Technology Stack Additions (Stage 3)

```
Backend additions:
  - Apache PDFBox (PDF text extraction)
  - Apache POI (DOCX/XLSX content extraction)
  - Tesseract4J or REST call to Tesseract microservice (OCR)
  - Elasticsearch (optional, for advanced search scalability)
  - Activiti or Camunda BPM (optional, for BPMN workflow)

New Spring Boot services:
  - DmsDocumentService
  - DmsVersioningService
  - DmsSearchService (FTS / Elasticsearch)
  - DmsRetentionService (scheduled archival jobs)
  - DmsWorkflowService
  - DmsTaskService
  - DmsAclService
  - DocumentContentExtractorService
  - DmsWebhookService

New Database Tables: ~15 new tables
New Frontend Pages:
  - /admin/dms             — Document repository browser
  - /admin/dms/search      — Advanced document search
  - /admin/dms/tasks       — My tasks dashboard
  - /admin/dms/reports     — Compliance reports
  - /admin/dms/retention   — Retention policy manager
  - /admin/dms/settings    — DMS configuration

Frontend Libraries:
  - PDF.js (PDF preview in browser)
  - Diff library for text version comparison
```

---

## Full Feature Comparison Summary

| Category | WordPress | Drupal | Joomla | Alfresco | OpenKM | **This CMS After Stage 3** |
|----------|-----------|--------|--------|----------|--------|---------------------------|
| Page Builder | ✅ Gutenberg | ✅ Layout Builder | ✅ | ❌ | ❌ | ✅✅ Enterprise |
| Content Types | ✅ CPT | ✅✅ Full | ✅ | ✅ Content Models | ✅ Doc Types | ✅✅ Full + Custom |
| Workflow | ⚠️ Basic | ✅✅ Full | ✅ | ✅✅ Activiti BPM | ✅ | ✅✅ Multi-step + BPM |
| Media Library | ✅ | ✅ | ✅ | ✅✅ Full DMS | ✅✅ Full DMS | ✅✅ Full DMS |
| Document Mgmt | ❌ | ❌ | ❌ | ✅✅ Best-in-class | ✅✅ Full | ✅✅ Full DMS |
| Versioning | ✅ Revisions | ✅✅ Full | ✅ | ✅✅ Full | ✅✅ Full | ✅✅ Full |
| Search | ✅ | ✅✅ Solr | ✅ | ✅✅ Solr | ✅✅ Lucene | ✅✅ FTS + Extract |
| Access Control | ✅ Role-based | ✅✅ Granular | ✅ | ✅✅ ACL per node | ✅✅ ACL | ✅✅ ACL per doc |
| Retention/RM | ❌ | ❌ | ❌ | ✅✅ Full RM | ✅✅ Full | ✅✅ Full RM |
| Collaboration | ⚠️ Comments | ✅ | ✅ | ✅✅ Alfresco Share | ✅ | ✅✅ Full |
| Analytics | ✅ Plugin | ✅ Module | ✅ | ✅✅ | ✅ | ✅✅ Built-in |
| Multilingual | ✅ Plugin | ✅✅ Native | ✅✅ Native | ✅ | ✅ | ✅✅ Native |
| SEO | ✅✅ Yoast | ✅ Metatag | ✅ | ❌ | ❌ | ✅✅ Full |
| CMIS API | ❌ | ❌ | ❌ | ✅✅ | ✅✅ | ✅✅ |
| Email-to-Doc | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

**Estimated Stage 3 timeline: 10–14 weeks**

---

## Stage 4 Preview: Alfresco-Level BPM & Process Automation

Stage 4 (future roadmap) will add:

- **BPMN 2.0 Workflow Designer** — Visual business process modeler in admin UI
- **Process Automation** — Trigger actions on events (send email, create task, move document)
- **Digital Signatures** — E-signature integration (DocuSign, local PKI)
- **Form Builder** — Dynamic forms linked to document types (capture structured input)
- **Advanced OCR Pipeline** — Auto-classify scanned documents by content type using ML
- **External Repository Connectors** — Mount SharePoint, Google Drive, Dropbox as virtual folders
- **Mobile App** — Native iOS/Android app for document access and approval tasks
- **Digital Asset Management** — Brand asset library with usage rights tracking
- **AI Content Assistant** — Auto-tag documents, suggest related content, summarize documents
