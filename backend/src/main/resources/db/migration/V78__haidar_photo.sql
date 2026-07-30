-- =============================================================================
-- V78: Add profile photo for Dr. Haidar Hashem Al-Hassan (SSSS-002).
--      Photo file: frontend/public/members/haidar-hashem-al-hassan.jpg
--      Served at: /members/haidar-hashem-al-hassan.jpg
-- =============================================================================

DO $$
DECLARE
    u_haidar UUID := 'a2000001-0000-0000-0000-000000000002';
BEGIN

    UPDATE member_profiles
    SET
        photo_url  = '/members/haidar-hashem-al-hassan.jpg',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = u_haidar;

    IF NOT FOUND THEN
        RAISE WARNING 'V78: member_profile for Dr. Haidar (%) not found — skipping photo update.', u_haidar;
    ELSE
        RAISE NOTICE 'V78: Photo linked for Dr. Haidar Hashem Al-Hassan (/members/haidar-hashem-al-hassan.jpg).';
    END IF;

END $$;
