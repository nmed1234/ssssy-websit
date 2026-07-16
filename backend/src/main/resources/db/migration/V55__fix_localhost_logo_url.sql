-- V55: Fix site.logo_url — replace localhost placeholder with empty string
-- so the frontend falls back to the bundled /logo.svg
UPDATE system_config
SET config_value = '',
    updated_at   = CURRENT_TIMESTAMP
WHERE config_key = 'site.logo_url'
  AND config_value LIKE '%localhost%';
