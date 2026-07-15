CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
  group_name VARCHAR(50) NOT NULL DEFAULT 'general',
  label VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ shadcn-style color variables (HSL triplets) ============
INSERT INTO theme_settings (setting_key, setting_value, setting_type, group_name, label) VALUES
  ('shad_primary', '15 30% 35%', 'color', 'colors', 'Primary Color (HSL)'),
  ('shad_primary_foreground', '40 30% 96%', 'color', 'colors', 'Primary Foreground (HSL)'),
  ('shad_secondary', '120 30% 35%', 'color', 'colors', 'Secondary Color (HSL)'),
  ('shad_secondary_foreground', '0 0% 100%', 'color', 'colors', 'Secondary Foreground (HSL)'),
  ('shad_accent', '30 25% 70%', 'color', 'colors', 'Accent Color (HSL)'),
  ('shad_accent_foreground', '20 30% 15%', 'color', 'colors', 'Accent Foreground (HSL)'),
  ('shad_muted', '40 15% 85%', 'color', 'colors', 'Muted Background (HSL)'),
  ('shad_muted_foreground', '20 10% 40%', 'color', 'colors', 'Muted Foreground (HSL)'),
  ('shad_background', '40 30% 96%', 'color', 'colors', 'Page Background (HSL)'),
  ('shad_foreground', '20 30% 15%', 'color', 'colors', 'Page Foreground (HSL)'),
  ('shad_border', '30 15% 80%', 'color', 'colors', 'Border Color (HSL)'),
  ('shad_ring', '15 30% 35%', 'color', 'colors', 'Focus Ring (HSL)'),
  ('shad_destructive', '0 84% 60%', 'color', 'colors', 'Destructive Color (HSL)');

-- ============ brand hex color variables ============
INSERT INTO theme_settings (setting_key, setting_value, setting_type, group_name, label) VALUES
  ('color_soil_dark', '#3E2723', 'color', 'brand_colors', 'Soil Dark'),
  ('color_soil_clay', '#6D4C41', 'color', 'brand_colors', 'Soil Clay'),
  ('color_soil_rich', '#8D6E63', 'color', 'brand_colors', 'Soil Rich'),
  ('color_soil_taupe', '#BCAAA4', 'color', 'brand_colors', 'Soil Taupe'),
  ('color_soil_sand', '#D7CCC8', 'color', 'brand_colors', 'Soil Sand'),
  ('color_soil_cream', '#FFF8E1', 'color', 'brand_colors', 'Soil Cream'),
  ('color_forest', '#2E7D32', 'color', 'brand_colors', 'Forest Green'),
  ('color_forest_light', '#558B2F', 'color', 'brand_colors', 'Forest Light Green'),
  ('color_earth_gray', '#616161', 'color', 'brand_colors', 'Earth Gray'),
  ('color_deep_soil', '#4E342E', 'color', 'brand_colors', 'Deep Soil');

-- ============ fonts ============
INSERT INTO theme_settings (setting_key, setting_value, setting_type, group_name, label) VALUES
  ('font_heading', 'Inter', 'font', 'fonts', 'Heading Font'),
  ('font_body', 'Merriweather', 'font', 'fonts', 'Body Font');

-- ============ layout ============
INSERT INTO theme_settings (setting_key, setting_value, setting_type, group_name, label) VALUES
  ('layout_radius', '0.5rem', 'text', 'layout', 'Base Border Radius');

CREATE INDEX idx_theme_settings_group ON theme_settings(group_name);
