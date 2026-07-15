-- V37: Seed border, shadow, and spacing theme settings

INSERT INTO theme_settings (setting_key, setting_value, setting_type, group_name, label)
VALUES
  -- borders
  ('border_radius_sm',   '0.25rem', 'text', 'borders', 'Small Border Radius'),
  ('border_radius_base', '0.5rem',  'text', 'borders', 'Base Border Radius'),
  ('border_radius_md',   '0.75rem', 'text', 'borders', 'Medium Border Radius'),
  ('border_radius_lg',   '1rem',    'text', 'borders', 'Large Border Radius'),
  ('border_radius_xl',   '1.5rem',  'text', 'borders', 'X-Large Border Radius'),
  ('border_radius_full', '9999px',  'text', 'borders', 'Full/Pill Border Radius'),
  ('border_width_base',  '1px',     'text', 'borders', 'Default Border Width'),
  -- shadows
  ('shadow_sm',  '0 1px 3px rgba(0,0,0,0.12)',              'text', 'shadows', 'Small Shadow'),
  ('shadow_md',  '0 4px 16px rgba(0,0,0,0.15)',             'text', 'shadows', 'Medium Shadow'),
  ('shadow_lg',  '0 8px 32px rgba(0,0,0,0.18)',             'text', 'shadows', 'Large Shadow'),
  ('shadow_xl',  '0 20px 60px rgba(0,0,0,0.22)',            'text', 'shadows', 'X-Large Shadow'),
  ('shadow_card','0 2px 8px rgba(0,0,0,0.08)',              'text', 'shadows', 'Card Shadow'),
  ('shadow_none','none',                                     'text', 'shadows', 'No Shadow'),
  -- spacing
  ('spacing_xs',  '0.25rem', 'text', 'spacing', 'XS Spacing'),
  ('spacing_sm',  '0.5rem',  'text', 'spacing', 'SM Spacing'),
  ('spacing_md',  '1rem',    'text', 'spacing', 'MD Spacing'),
  ('spacing_lg',  '1.5rem',  'text', 'spacing', 'LG Spacing'),
  ('spacing_xl',  '2rem',    'text', 'spacing', 'XL Spacing'),
  ('spacing_2xl', '3rem',    'text', 'spacing', '2XL Spacing'),
  ('spacing_3xl', '4rem',    'text', 'spacing', '3XL Spacing'),
  -- layout
  ('container_max_width', '1280px', 'text', 'layout', 'Container Max Width'),
  ('container_padding',   '1.5rem', 'text', 'layout', 'Container Padding'),
  ('grid_columns',        '12',     'text', 'layout', 'Grid Columns')
ON CONFLICT (setting_key) DO NOTHING;
