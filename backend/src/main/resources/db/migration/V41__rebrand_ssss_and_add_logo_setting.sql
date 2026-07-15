-- V41__rebrand_ssss_and_add_logo_setting.sql
-- Rebrand: update SSSSY → SSSS in all seeded data
-- Add site.logo_url and site.short_name as system_config settings (settings-panel editable)

-- ─── 1. Update content_strings: replace SSSSY with SSSS in all values ────────

UPDATE content_strings SET
  value_en = REPLACE(value_en, 'SSSSY', 'SSSS'),
  value_ar = REPLACE(value_ar, 'SSSSY', 'SSSS'),
  updated_at = NOW()
WHERE value_en ILIKE '%SSSSY%' OR value_ar ILIKE '%SSSSY%';

-- Also update the short_name string key specifically
UPDATE content_strings SET
  value_en = 'SSSS',
  updated_at = NOW()
WHERE string_key = 'site.short_name' AND value_en = 'SSSSY';

-- ─── 2. Update system_config: replace SSSSY with SSSS in all values ──────────

UPDATE system_config SET
  config_value = REPLACE(config_value, 'SSSSY', 'SSSS'),
  updated_at = NOW()
WHERE config_value ILIKE '%SSSSY%';

-- ─── 3. Ensure site.logo_url exists in system_config (upsert) ────────────────
-- V26 already inserts this but only with gen_random_uuid() so no stable conflict key.
-- system_config.config_key has a UNIQUE constraint — use ON CONFLICT to be safe.

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'site.logo_url',
  '',
  'site',
  'URL for the site logo image shown in the public header. Upload to Media Library and paste the URL here.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  description = EXCLUDED.description,
  config_group = 'site',
  updated_at = NOW();

-- ─── 4. Ensure site.short_name exists in system_config (upsert) ──────────────

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'site.short_name',
  'SSSS',
  'site',
  'Short name / acronym shown in the header and footer. E.g. SSSS',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = CASE WHEN system_config.config_value IN ('SSSSY', '') THEN 'SSSS' ELSE system_config.config_value END,
  description = EXCLUDED.description,
  config_group = 'site',
  updated_at = NOW();

-- ─── 5. Ensure site.name exists in system_config (upsert) ────────────────────

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'site.name',
  'Syrian Soil Science Society',
  'site',
  'Full name of the organisation shown in the header.',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  description = EXCLUDED.description,
  config_group = 'site',
  updated_at = NOW();

-- ─── 6. Ensure contact settings exist in system_config (upsert) ──────────────

INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'contact.email',  'info@ssss.org', 'contact', 'Organisation contact email', NOW(), NOW()),
  (gen_random_uuid(), 'contact.phone',  '+963 11 234 5678', 'contact', 'Organisation contact phone', NOW(), NOW()),
  (gen_random_uuid(), 'contact.address','Damascus, Syria', 'contact', 'Organisation contact address', NOW(), NOW()),
  (gen_random_uuid(), 'footer.copyright','Syrian Soil Science Society (SSSS). All rights reserved.', 'footer', 'Footer copyright text', NOW(), NOW())
ON CONFLICT (config_key) DO UPDATE SET
  description = EXCLUDED.description,
  config_group = EXCLUDED.config_group,
  updated_at = NOW();
