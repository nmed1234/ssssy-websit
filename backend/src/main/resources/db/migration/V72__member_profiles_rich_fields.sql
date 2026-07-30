-- =============================================================================
-- V72: Add rich fields to member_profiles for real member data
--      + add slug column to users table for member detail pages
-- =============================================================================

-- Add new rich fields to member_profiles
ALTER TABLE member_profiles
    ADD COLUMN IF NOT EXISTS name_ar            VARCHAR(200),
    ADD COLUMN IF NOT EXISTS name_en            VARCHAR(200),
    ADD COLUMN IF NOT EXISTS title_ar           VARCHAR(100),
    ADD COLUMN IF NOT EXISTS specialization_detail VARCHAR(255),
    ADD COLUMN IF NOT EXISTS birth_year         INTEGER,
    ADD COLUMN IF NOT EXISTS birth_city         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS nationality        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS marital_status     VARCHAR(50),
    ADD COLUMN IF NOT EXISTS career_summary     TEXT,
    ADD COLUMN IF NOT EXISTS memberships        TEXT,
    ADD COLUMN IF NOT EXISTS languages          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS photo_url          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS slug               VARCHAR(255);

-- Unique index on slug (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_profiles_slug
    ON member_profiles (slug)
    WHERE slug IS NOT NULL;

-- Index for public listing performance
CREATE INDEX IF NOT EXISTS idx_member_profiles_name_ar
    ON member_profiles (name_ar);
