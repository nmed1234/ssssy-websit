-- =============================================================================
-- V39: CMS Foundation Stage 1
-- Covers all 8 sub-tasks for the cms-foundation-stage1 spec.
-- All DDL uses IF NOT EXISTS guards to keep the script idempotent.
-- TIMESTAMP WITHOUT TIME ZONE is used consistently (no TIMESTAMPTZ).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1.1  Audit trail for all page changes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_audit_trail (
    id             UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id        UUID                        NOT NULL REFERENCES pages(id),
    user_id        UUID                        NOT NULL REFERENCES users(id),
    action         VARCHAR(50)                 NOT NULL
                       CHECK (action IN ('CREATE','UPDATE','DELETE','PUBLISH','UNPUBLISH','WORKFLOW_TRANSITION')),
    timestamp      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    changed_fields JSONB                       NOT NULL DEFAULT '{}'
    -- No ON DELETE CASCADE — audit records are append-only and retained indefinitely
);

CREATE INDEX IF NOT EXISTS idx_page_audit_page_id ON page_audit_trail (page_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_audit_user_id ON page_audit_trail (user_id);


-- ---------------------------------------------------------------------------
-- 1.2  Workflow state-transition history (page-specific)
--      NOTE: A general workflow_transitions table already exists in V11 for the
--      content-item workflow engine.  This table is named
--      page_workflow_transitions to avoid a naming collision while preserving
--      the intended schema exactly as specified in the design document.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_workflow_transitions (
    id         UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id    UUID                        NOT NULL REFERENCES pages(id),
    from_state VARCHAR(50)                 NOT NULL,
    to_state   VARCHAR(50)                 NOT NULL,
    user_id    UUID                        NOT NULL REFERENCES users(id),
    timestamp  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    notes      VARCHAR(1000)               -- nullable: rejection reason, etc.
);

CREATE INDEX IF NOT EXISTS idx_wf_transitions_page ON page_workflow_transitions (page_id, timestamp DESC);


-- ---------------------------------------------------------------------------
-- 1.3  Reusable page layout templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_templates (
    id            UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name          VARCHAR(100)                NOT NULL,
    category      VARCHAR(50)                 NOT NULL
                      CHECK (category IN ('Layout','Landing','About','Contact','Blog')),
    description   VARCHAR(500),
    layout_json   TEXT                        NOT NULL,
    thumbnail_url VARCHAR(1000),
    usage_count   INTEGER                     NOT NULL DEFAULT 0,
    created_by    UUID                        NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------------------------
-- 1.4  Extend media_files: caption columns, tags, uploader, FTS index
--      (alt_text_en, alt_text_ar, original_filename already exist from V3)
-- ---------------------------------------------------------------------------
ALTER TABLE media_files
    ADD COLUMN IF NOT EXISTS caption_en  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS caption_ar  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS tags        TEXT,
    ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES users(id);

-- Generated TSVECTOR column for full-text search.
-- Only added when fts_index does not already exist (idempotent via IF NOT EXISTS).
ALTER TABLE media_files
    ADD COLUMN IF NOT EXISTS fts_index TSVECTOR
        GENERATED ALWAYS AS (
            to_tsvector(
                'english',
                coalesce(alt_text_en,       '') || ' ' ||
                coalesce(alt_text_ar,       '') || ' ' ||
                coalesce(caption_en,        '') || ' ' ||
                coalesce(caption_ar,        '') || ' ' ||
                coalesce(tags,              '') || ' ' ||
                coalesce(original_filename, '')
            )
        ) STORED;

CREATE INDEX IF NOT EXISTS idx_media_files_fts ON media_files USING GIN (fts_index);


-- ---------------------------------------------------------------------------
-- 1.5  Preview tokens (64-hex token, 1-hour expiry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preview_tokens (
    id          UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id     UUID                        NOT NULL REFERENCES pages(id),
    token       CHAR(64)                    NOT NULL UNIQUE,   -- 32 random bytes hex-encoded
    layout_json TEXT                        NOT NULL,          -- layout snapshot at preview time
    created_by  UUID                        NOT NULL REFERENCES users(id),
    expires_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on token for fast lookup (UNIQUE already creates a btree, but explicit
-- index makes intent clear and matches the spec requirement).
CREATE INDEX IF NOT EXISTS idx_preview_tokens_token ON preview_tokens (token);


-- ---------------------------------------------------------------------------
-- 1.6  URL redirects (auto-inserted on slug change, type 301 by default)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS url_redirects (
    id            UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    from_path     VARCHAR(500)                NOT NULL,
    to_path       VARCHAR(500)                NOT NULL,
    redirect_type INTEGER                     NOT NULL DEFAULT 301,
    page_id       UUID                        REFERENCES pages(id),
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_url_redirects_from ON url_redirects (from_path);


-- ---------------------------------------------------------------------------
-- 1.7  Backup table for page_sections (empty shell, populated before mutations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_sections_backup
    AS TABLE page_sections WITH NO DATA;


-- ---------------------------------------------------------------------------
-- 1.8  Extend pages table: workflow, visibility, language, translation, soft-delete
--      NOTE: deleted_at already exists from V7 — guarded with IF NOT EXISTS.
-- ---------------------------------------------------------------------------
ALTER TABLE pages
    ADD COLUMN IF NOT EXISTS workflow_status      VARCHAR(50)                 NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS allowed_roles        TEXT[],
    ADD COLUMN IF NOT EXISTS visibility           VARCHAR(50)                 NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN IF NOT EXISTS translation_group_id UUID,
    ADD COLUMN IF NOT EXISTS language             VARCHAR(10)                 NOT NULL DEFAULT 'EN',
    -- deleted_at is already present from V7; IF NOT EXISTS makes this safe
    ADD COLUMN IF NOT EXISTS deleted_at           TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_by           UUID REFERENCES users(id);

-- Backfill workflow_status based on existing is_published flag
UPDATE pages
    SET workflow_status = 'PUBLISHED'
    WHERE is_published = true
      AND workflow_status = 'DRAFT';   -- only touch rows still at default

UPDATE pages
    SET workflow_status = 'DRAFT'
    WHERE (is_published = false OR is_published IS NULL)
      AND workflow_status = 'DRAFT';   -- already default, explicit for clarity

-- Backfill language and visibility for any rows that are still NULL
-- (language / visibility have NOT NULL defaults, but rows inserted before this
--  migration via direct SQL may have NULL in those columns if the column was
--  added with a default that didn't apply to pre-existing rows in the same txn)
UPDATE pages
    SET language   = 'EN'
    WHERE language IS NULL;

UPDATE pages
    SET visibility = 'PUBLIC'
    WHERE visibility IS NULL;

-- Performance indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_pages_workflow_status   ON pages (workflow_status);
CREATE INDEX IF NOT EXISTS idx_pages_translation_group ON pages (translation_group_id);
CREATE INDEX IF NOT EXISTS idx_pages_deleted_at        ON pages (deleted_at);
