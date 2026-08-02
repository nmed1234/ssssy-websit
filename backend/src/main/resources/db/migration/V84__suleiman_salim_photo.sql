-- =============================================================================
-- V84: Link profile photo for Dr. Suleiman Mahmoud Salim (SSSS-011).
--      Photo file: frontend/public/members/suleiman-mahmoud-salim.jpg
--      Served at: /members/suleiman-mahmoud-salim.jpg
-- =============================================================================

DO $$
DECLARE
    u_suleiman UUID := 'a2000001-0000-0000-0000-000000000011';
BEGIN

    UPDATE member_profiles
    SET
        photo_url  = '/members/suleiman-mahmoud-salim.jpg',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = u_suleiman;

    IF NOT FOUND THEN
        RAISE WARNING 'V84: member_profile for Dr. Suleiman Salim (%) not found — skipping photo update.', u_suleiman;
    ELSE
        RAISE NOTICE 'V84: Photo linked for Dr. Suleiman Mahmoud Salim (/members/suleiman-mahmoud-salim.jpg).';
    END IF;

END $$;
