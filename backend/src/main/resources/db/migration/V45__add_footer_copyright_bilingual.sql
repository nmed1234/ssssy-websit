-- V45__add_footer_copyright_bilingual.sql
-- Add footer.copyright_en and footer.copyright_ar to system_config so the
-- footer copyright line is shown in the correct language and can be managed
-- from the admin Settings panel.

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'footer.copyright_en',
  'Soil Science Society of Syria (SSSS). All rights reserved.',
  'footer',
  'Footer copyright text shown when the UI language is English.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = CASE
    WHEN system_config.config_value = '' THEN 'Soil Science Society of Syria (SSSS). All rights reserved.'
    ELSE system_config.config_value
  END,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'footer.copyright_ar',
  'جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة.',
  'footer',
  'نص حقوق النشر في تذييل الصفحة عند تحديد اللغة العربية.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = CASE
    WHEN system_config.config_value = '' THEN 'جمعية علوم التربة السورية (SSSS). جميع الحقوق محفوظة.'
    ELSE system_config.config_value
  END,
  description = EXCLUDED.description,
  updated_at = NOW();
