-- =============================================================================
-- V85: Add new member Dr. Mohammed Dakkeh (SSSS-012).
--      Professor at the Faculty of Agricultural Engineering,
--      Tishreen University (Lattakia) — Department of Soil Science and Water.
--      Previous: Faculty of Agricultural Engineering, University of Aleppo (1991–2017).
--      Specialization: Soil Conservation / Wind Erosion.
-- =============================================================================

DO $$
DECLARE
    member_role_id UUID;
    u_dakkeh UUID := 'a2000001-0000-0000-0000-000000000012';

BEGIN
    SELECT id INTO member_role_id FROM roles WHERE name = 'MEMBER' LIMIT 1;
    IF member_role_id IS NULL THEN
        RAISE EXCEPTION 'V85: MEMBER role not found';
    END IF;

    -- Clean up if re-running
    DELETE FROM board_members   WHERE user_id = u_dakkeh;
    DELETE FROM member_profiles WHERE user_id = u_dakkeh;
    DELETE FROM users           WHERE id      = u_dakkeh;

    -- =========================================================================
    -- 1. INSERT USER
    -- =========================================================================
    INSERT INTO users (
        id, username, email, password_hash, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        position, institution, department, specialization, biography,
        phone, is_active, is_email_verified, created_at, updated_at
    ) VALUES (
        u_dakkeh,
        'mohammed.dakkeh',
        'dikkeh@gmail.com',
        '$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX',
        member_role_id,
        'Mohammed', 'Dakkeh', 'محمد', 'دكه',
        'أستاذ في قسم علوم التربة والمياه',
        'جامعة تشرين',
        'قسم علوم التربة والمياه — كلية الهندسة الزراعية',
        'صيانة التربة — الانجراف الريحي',
        'أستاذ في قسم علوم التربة والمياه بكلية الهندسة الزراعية، جامعة تشرين، اعتباراً من أيلول 2017. عمل سابقاً في كلية الهندسة الزراعية بجامعة حلب منذ عام 1991 وحتى أيلول 2017. حاصل على الدكتوراه في العلوم الزراعية تخصص صيانة التربة من جامعة سانت استيفان (جوديللو) — هنغاريا عام 1991. متخصص في الانجراف الريحي، الحواجز النباتية، الزراعة الكنتورية، وإدارة الأراضي الجافة. له أكثر من 30 بحثاً علمياً منشوراً باللغتين العربية والأجنبية.',
        '0933989063',
        true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (username) DO UPDATE SET
        email              = EXCLUDED.email,
        first_name_en      = EXCLUDED.first_name_en,
        last_name_en       = EXCLUDED.last_name_en,
        first_name_ar      = EXCLUDED.first_name_ar,
        last_name_ar       = EXCLUDED.last_name_ar,
        position           = EXCLUDED.position,
        institution        = EXCLUDED.institution,
        department         = EXCLUDED.department,
        specialization     = EXCLUDED.specialization,
        biography          = EXCLUDED.biography,
        phone              = EXCLUDED.phone,
        updated_at         = CURRENT_TIMESTAMP;

    -- =========================================================================
    -- 2. INSERT MEMBER PROFILE
    -- =========================================================================
    INSERT INTO member_profiles (
        user_id, membership_type, membership_number,
        specialization, specialization_detail,
        education, research_interests,
        name_ar, name_en, title_ar,
        birth_year, birth_city, nationality, marital_status,
        career_summary, memberships, languages,
        publications_count, is_public, joined_at,
        slug, photo_url,
        created_at, updated_at
    ) VALUES (
        u_dakkeh,
        'FOUNDER', 'SSSS-012',
        'علوم التربة',
        'صيانة التربة — الانجراف الريحي — الحواجز النباتية — الزراعة الكنتورية — إدارة الأراضي الجافة — نظم المعلومات الجغرافية والاستشعار عن بعد — المعالجة النباتية للترب الملوثة — خصوبة التربة والتسميد',
        'إجازة عامة في العلوم الزراعية — كلية الزراعة، جامعة تشرين — 1983
دكتوراه فلسفة في العلوم الزراعية تخصص صيانة التربة — جامعة سانت استيفان (جوديللو)، هنغاريا — 1991',
        'صيانة التربة، الانجراف الريحي وعوامله المسببة، الحواجز النباتية، الزراعة الكنتورية، تدهور الأراضي، نظم المعلومات الجغرافية والاستشعار عن بعد، المعالجة النباتية للترب الملوثة بالرصاص والكادميوم، حرائق الغابات وأثرها على التربة',
        'الدكتور محمد دكه', 'Dr. Mohammed Dakkeh', 'دكتور',
        NULL, NULL, 'سوري', NULL,
        'أستاذ (من عام 2005) — كلية الهندسة الزراعية، جامعة حلب ثم جامعة تشرين.
أستاذ مساعد (1997–2005) — جامعة حلب.
مدرّس (1992–1997) — جامعة حلب.
عضو هيئة تحرير المجلة السورية للبحوث الزراعية.
مشارك في مشاريع WEPS و WEPP لنمذجة الانجراف الريحي.
إشراف على رسائل ماجستير عديدة في علوم التربة بجامعتَي حلب وتشرين.
أكثر من 30 بحثاً علمياً منشوراً محلياً ودولياً.',
        'عضو جمعية علوم التربة السورية',
        'الهنغارية (ممتاز جداً)، الإنجليزية (جيد)',
        30, true, '2025-01-01',
        'mohammed-dakkeh', '/members/mohammed-dakkeh.jpg',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name_ar               = EXCLUDED.name_ar,
        name_en               = EXCLUDED.name_en,
        title_ar              = EXCLUDED.title_ar,
        specialization        = EXCLUDED.specialization,
        specialization_detail = EXCLUDED.specialization_detail,
        education             = EXCLUDED.education,
        research_interests    = EXCLUDED.research_interests,
        career_summary        = EXCLUDED.career_summary,
        memberships           = EXCLUDED.memberships,
        languages             = EXCLUDED.languages,
        publications_count    = EXCLUDED.publications_count,
        birth_city            = EXCLUDED.birth_city,
        nationality           = EXCLUDED.nationality,
        photo_url             = EXCLUDED.photo_url,
        slug                  = EXCLUDED.slug,
        updated_at            = CURRENT_TIMESTAMP;

    RAISE NOTICE 'V85: Member Dr. Mohammed Dakkeh (SSSS-012) inserted/updated successfully.';

END $$;
