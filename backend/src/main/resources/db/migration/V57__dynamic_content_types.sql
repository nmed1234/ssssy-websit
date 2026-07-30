-- Phase 3: Dynamic Content Type Engine
-- Drupal-style runtime content types with JSONB field storage

-- ─── Content Type Definitions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_type_definitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL UNIQUE,   -- "research-paper"
    label_en            VARCHAR(255) NOT NULL,
    label_ar            VARCHAR(255),
    description         TEXT,
    icon                VARCHAR(100) DEFAULT 'FileText',
    workflow_id         UUID REFERENCES workflows(id) ON DELETE SET NULL,
    allow_comments      BOOLEAN NOT NULL DEFAULT false,
    allow_member_submit BOOLEAN NOT NULL DEFAULT false,  -- members can submit entries
    requires_approval   BOOLEAN NOT NULL DEFAULT true,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    sort_order          INT NOT NULL DEFAULT 0,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ctd_name   ON content_type_definitions(name);
CREATE INDEX IF NOT EXISTS idx_ctd_active ON content_type_definitions(is_active);

-- ─── Content Type Fields ──────────────────────────────────────────────────────
-- One row per field per content type (ordered by sort_order)
CREATE TABLE IF NOT EXISTS content_type_fields (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type_id   UUID NOT NULL REFERENCES content_type_definitions(id) ON DELETE CASCADE,
    field_name        VARCHAR(100) NOT NULL,       -- "abstract"  (used as JSON key)
    field_label_en    VARCHAR(255) NOT NULL,
    field_label_ar    VARCHAR(255),
    field_type        VARCHAR(50)  NOT NULL,       -- text|richtext|number|date|media|select|checkbox|url|email
    is_required       BOOLEAN NOT NULL DEFAULT false,
    is_searchable     BOOLEAN NOT NULL DEFAULT false,
    is_listed         BOOLEAN NOT NULL DEFAULT true,   -- show in list view
    placeholder_en    VARCHAR(255),
    placeholder_ar    VARCHAR(255),
    help_text_en      TEXT,
    help_text_ar      TEXT,
    options_json      JSONB,                       -- [{value,label,labelAr}] for select/radio
    validation_json   JSONB,                       -- {min,max,pattern,message}
    sort_order        INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ctf_type_id ON content_type_fields(content_type_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ctf_unique_name ON content_type_fields(content_type_id, field_name);

-- ─── Dynamic Content Entries ──────────────────────────────────────────────────
-- All data for all dynamic content types is stored here in JSONB
CREATE TABLE IF NOT EXISTS dynamic_content_entries (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type_name     VARCHAR(100) NOT NULL REFERENCES content_type_definitions(name) ON DELETE RESTRICT,
    slug                  VARCHAR(550) NOT NULL UNIQUE,
    status                VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',  -- DRAFT|PENDING_REVIEW|APPROVED|PUBLISHED|ARCHIVED
    author_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    workflow_state        VARCHAR(50),
    field_data            JSONB NOT NULL DEFAULT '{}',    -- {"abstract":"...","doi":"..."}
    featured_image_url    VARCHAR(500),
    meta_title            VARCHAR(255),
    meta_description      TEXT,
    published_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dce_type_name   ON dynamic_content_entries(content_type_name);
CREATE INDEX IF NOT EXISTS idx_dce_status      ON dynamic_content_entries(status);
CREATE INDEX IF NOT EXISTS idx_dce_author_id   ON dynamic_content_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_dce_published_at ON dynamic_content_entries(published_at DESC);
-- GIN index for full-text search on JSONB field data
CREATE INDEX IF NOT EXISTS idx_dce_field_data_gin ON dynamic_content_entries USING GIN(field_data);
