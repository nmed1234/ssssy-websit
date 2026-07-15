-- V44__add_site_name_bilingual.sql
-- Add site.name_en and site.name_ar to system_config so the header text
-- can be shown in the correct language and managed from the admin Settings panel.

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'site.name_en',
  'Soil Science Society of Syria (SSSS)',
  'site',
  'Site name displayed in the header when the UI language is English.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = CASE
    WHEN system_config.config_value = '' THEN 'Soil Science Society of Syria (SSSS)'
    ELSE system_config.config_value
  END,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'site.name_ar',
  'جمعية علوم التربة السورية (SSSS)',
  'site',
  'اسم الموقع الظاهر في الترويسة عند تحديد اللغة العربية.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = CASE
    WHEN system_config.config_value = '' THEN 'جمعية علوم التربة السورية (SSSS)'
    ELSE system_config.config_value
  END,
  description = EXCLUDED.description,
  updated_at = NOW();
