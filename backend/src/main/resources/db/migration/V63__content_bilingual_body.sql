-- V63: Add bilingual body and excerpt fields to content_items
-- The existing `body` column stays as-is (backwards-compatible Arabic fallback).
-- New columns:
--   body_ar   — Arabic rich-text body  (TEXT, replaces the legacy body for AR content)
--   body_en   — English rich-text body
--   excerpt_ar — Arabic excerpt / teaser

ALTER TABLE content_items
    ADD COLUMN IF NOT EXISTS body_ar   TEXT,
    ADD COLUMN IF NOT EXISTS body_en   TEXT,
    ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;

-- Back-fill: treat existing `body` as Arabic body so nothing is lost
UPDATE content_items
SET body_ar = body::text
WHERE body_ar IS NULL AND body IS NOT NULL;

-- Back-fill: treat existing `excerpt` as Arabic excerpt
UPDATE content_items
SET excerpt_ar = excerpt
WHERE excerpt_ar IS NULL AND excerpt IS NOT NULL;
