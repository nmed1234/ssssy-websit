-- =============================================================================
-- V80: Link profile photo for Dr. Louay Mahmoud Refahee (SSSS-009).
--      Photo file: frontend/public/members/louay-mahmoud-refahee.jpg
--      Served at: /members/louay-mahmoud-refahee.jpg
-- =============================================================================

DO $$
DECLARE
    u_louay UUID := 'a2000001-0000-0000-0000-000000000009';
BEGIN

    UPDATE member_profiles
    SET
        photo_url  = '/members/louay-mahmoud-refahee.jpg',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = u_louay;

    IF NOT FOUND THEN
        RAISE WARNING 'V80: member_profile for Dr. Louay Refahee (%) not found — skipping photo update.', u_louay;
    ELSE
        RAISE NOTICE 'V80: Photo linked for Dr. Louay Mahmoud Refahee (/members/louay-mahmoud-refahee.jpg).';
    END IF;

END $$;
