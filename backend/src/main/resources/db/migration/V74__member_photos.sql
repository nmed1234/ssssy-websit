-- =============================================================================
-- V74: Link member profile photos (served from /members/ static folder).
--      Photos were placed in frontend/public/members/ and are served at /members/*.
-- =============================================================================

DO $$
DECLARE
    u_shater   UUID := 'a2000001-0000-0000-0000-000000000001';
    u_zoubi    UUID := 'a2000001-0000-0000-0000-000000000003';
    u_khalouf  UUID := 'a2000001-0000-0000-0000-000000000004';
    u_omar     UUID := 'a2000001-0000-0000-0000-000000000005';
    u_balkhi   UUID := 'a2000001-0000-0000-0000-000000000006';
    u_oudeh    UUID := 'a2000001-0000-0000-0000-000000000007';
    u_bahlawan UUID := 'a2000001-0000-0000-0000-000000000008';
BEGIN

    UPDATE member_profiles SET photo_url = '/members/mohammed-said-al-shater.jpg',    updated_at = CURRENT_TIMESTAMP WHERE user_id = u_shater;
    UPDATE member_profiles SET photo_url = '/members/mohammed-manhal-al-zoubi.jpg',   updated_at = CURRENT_TIMESTAMP WHERE user_id = u_zoubi;
    UPDATE member_profiles SET photo_url = '/members/alaa-hassan-khalouf.jpg',         updated_at = CURRENT_TIMESTAMP WHERE user_id = u_khalouf;
    UPDATE member_profiles SET photo_url = '/members/omar-abdullah-abdul-razzaq.jpg', updated_at = CURRENT_TIMESTAMP WHERE user_id = u_omar;
    UPDATE member_profiles SET photo_url = '/members/akram-mohammed-al-balkhi.jpg',   updated_at = CURRENT_TIMESTAMP WHERE user_id = u_balkhi;
    UPDATE member_profiles SET photo_url = '/members/mahmoud-oudeh.jpg',              updated_at = CURRENT_TIMESTAMP WHERE user_id = u_oudeh;
    UPDATE member_profiles SET photo_url = '/members/mohammed-hussam-bahlawan.jpg',   updated_at = CURRENT_TIMESTAMP WHERE user_id = u_bahlawan;
    -- u_haidar has no photo — left as NULL (fallback avatar will be shown)

    RAISE NOTICE 'V74: Member photos linked successfully (7 of 8 members have photos).';
END $$;
