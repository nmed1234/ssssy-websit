-- V35: Full themes table (named theme presets with activate/deactivate)
-- Distinct from theme_settings (key/value). This table stores complete named themes.

CREATE TABLE IF NOT EXISTS themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar     VARCHAR(200),
  name_en     VARCHAR(200) NOT NULL,
  theme_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);

-- Insert the default "SSSSY Default" theme seeded from existing theme_settings
INSERT INTO themes (name_en, name_ar, is_system, is_active, theme_json)
VALUES (
  'SSSSY Default',
  'النسق الافتراضي',
  TRUE,
  TRUE,
  '{
    "colors": {
      "primary":   "#3E2723",
      "secondary": "#558B2F",
      "accent":    "#D7CCC8",
      "background":"#FFF8E1",
      "text":      "#1f2328"
    },
    "fonts": {
      "heading": "Inter",
      "body":    "Merriweather"
    },
    "layout": {
      "borderRadius": "0.5rem",
      "containerMaxWidth": "1280px"
    }
  }'::jsonb
)
ON CONFLICT DO NOTHING;
