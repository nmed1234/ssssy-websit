-- V62: Add draft/publish workflow and version history to site_sections.
--      Additive migration only — no existing data is removed or changed.
--      Existing rows are migrated to PUBLISHED status with their current
--      data/config/styling copied into the published snapshot columns.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extend site_sections with draft/publish columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE site_sections
    ADD COLUMN IF NOT EXISTS status           VARCHAR(20)  NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS published_data   JSONB,
    ADD COLUMN IF NOT EXISTS published_config JSONB,
    ADD COLUMN IF NOT EXISTS published_styling JSONB,
    ADD COLUMN IF NOT EXISTS published_at     TIMESTAMP;

-- Back-fill: copy current data into the published snapshot for all existing rows
UPDATE site_sections
SET
    published_data    = data::jsonb,
    published_config  = config::jsonb,
    published_styling = styling::jsonb,
    published_at      = updated_at
WHERE published_data IS NULL;

-- Index for fast public-facing queries (active + published, sorted)
CREATE INDEX IF NOT EXISTS idx_site_sections_status
    ON site_sections(status);

CREATE INDEX IF NOT EXISTS idx_site_sections_location_status
    ON site_sections(location, status, is_active, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create site_section_versions table (version history / rollback)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_section_versions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id      UUID        NOT NULL,
    version_number  INTEGER     NOT NULL,
    data            JSONB       NOT NULL DEFAULT '{}',
    config          JSONB       NOT NULL DEFAULT '{}',
    styling         JSONB       NOT NULL DEFAULT '{}',
    published_by    VARCHAR(255),
    change_summary  VARCHAR(500),
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ssv_section
        FOREIGN KEY (section_id)
        REFERENCES site_sections(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_ssv_section_version
        UNIQUE (section_id, version_number)
);

-- Primary lookup: all versions for a section, newest first
CREATE INDEX IF NOT EXISTS idx_ssv_section_version
    ON site_section_versions(section_id, version_number DESC);

-- Fast lookup of the latest version number for a section
CREATE INDEX IF NOT EXISTS idx_ssv_section_id
    ON site_section_versions(section_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Seed initial version-1 snapshots for every existing published section
--    so that rollback history is available from day one
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO site_section_versions (section_id, version_number, data, config, styling, published_by, change_summary, created_at)
SELECT
    id,
    1,
    COALESCE(data::jsonb,    '{}'),
    COALESCE(config::jsonb,  '{}'),
    COALESCE(styling::jsonb, '{}'),
    'system',
    'Initial version — migrated from V62',
    COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
FROM site_sections
ON CONFLICT (section_id, version_number) DO NOTHING;
