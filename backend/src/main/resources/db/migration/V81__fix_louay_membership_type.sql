-- =============================================================================
-- V81: Fix membership_type for Dr. Louay Mahmoud Refahee (SSSS-009).
--      Change MEMBER → FOUNDER to match the rest of the founding members.
-- =============================================================================

DO $$
DECLARE
    u_louay UUID := 'a2000001-0000-0000-0000-000000000009';
BEGIN

    UPDATE member_profiles
    SET
        membership_type = 'FOUNDER',
        updated_at      = CURRENT_TIMESTAMP
    WHERE user_id = u_louay;

    IF NOT FOUND THEN
        RAISE WARNING 'V81: member_profile for Dr. Louay (%) not found.', u_louay;
    ELSE
        RAISE NOTICE 'V81: membership_type updated to FOUNDER for Dr. Louay Mahmoud Refahee.';
    END IF;

END $$;
