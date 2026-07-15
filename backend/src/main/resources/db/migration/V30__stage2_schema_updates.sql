-- Stage 2: Advanced CMS & Page Builder schema changes

-- 1. Create component_presets table
CREATE TABLE IF NOT EXISTS component_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(200),
  name_en VARCHAR(200),
  component_type VARCHAR(100) NOT NULL,
  config_json JSONB DEFAULT '{}'::jsonb,
  data_json JSONB DEFAULT '{}'::jsonb,
  styling_json JSONB DEFAULT '{}'::jsonb,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create content_version_history table
CREATE TABLE IF NOT EXISTS content_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100) NOT NULL,
  content_id UUID NOT NULL,
  version_number INT NOT NULL,
  data_snapshot JSONB NOT NULL,
  change_description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(content_type, content_id, version_number)
);

-- 3. Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(200),
  name_en VARCHAR(200),
  theme_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Create content_approval_log table
CREATE TABLE IF NOT EXISTS content_approval_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100) NOT NULL,
  content_id UUID NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  comments TEXT,
  action_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Add new columns to site_sections
ALTER TABLE site_sections
ADD COLUMN IF NOT EXISTS events_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS conditions_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- 6. Add new columns to page_sections
ALTER TABLE page_sections
ADD COLUMN IF NOT EXISTS events_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS conditions_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- 7. Performance indexes
CREATE INDEX IF NOT EXISTS idx_content_version_history_lookup
  ON content_version_history(content_type, content_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_content_approval_log_lookup
  ON content_approval_log(content_type, content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_component_presets_type
  ON component_presets(component_type, is_system);
