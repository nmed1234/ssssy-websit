-- V34: Add Stage-2 missing columns to page_sections and site_sections
-- The DB was at V33 when these columns were first needed.
-- All statements use IF NOT EXISTS so this is safe to run multiple times.

ALTER TABLE page_sections
  ADD COLUMN IF NOT EXISTS events_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version         INT   NOT NULL DEFAULT 1;

ALTER TABLE site_sections
  ADD COLUMN IF NOT EXISTS events_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version         INT   NOT NULL DEFAULT 1;

-- Ensure Stage-2 support tables exist (idempotent)
CREATE TABLE IF NOT EXISTS component_presets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar        VARCHAR(200),
  name_en        VARCHAR(200),
  component_type VARCHAR(100) NOT NULL,
  config_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
  styling_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_system      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_version_history (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type       VARCHAR(100) NOT NULL,
  content_id         UUID         NOT NULL,
  version_number     INT          NOT NULL,
  data_snapshot      JSONB        NOT NULL,
  change_description TEXT,
  created_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (content_type, content_id, version_number)
);

CREATE TABLE IF NOT EXISTS content_approval_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100) NOT NULL,
  content_id   UUID         NOT NULL,
  old_status   VARCHAR(50),
  new_status   VARCHAR(50)  NOT NULL,
  comments     TEXT,
  action_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_content_version_history_lookup
  ON content_version_history (content_type, content_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_content_approval_log_lookup
  ON content_approval_log (content_type, content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_component_presets_type
  ON component_presets (component_type, is_system);
