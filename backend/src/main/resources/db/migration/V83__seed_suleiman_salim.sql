-- =============================================================================
-- V83: Add new member Dr. Suleiman Mahmoud Salim (SSSS-011).
--      Assistant Professor at the Faculty of Agricultural Engineering,
--      University of Damascus — Department of Soil Science.
--      Specialization: Soil Reclamation / Salt-Affected Soils.
-- =============================================================================

DO $$
DECLARE
    member_role_id UUID;
    u_suleiman UUID := 'a2000001-0000-0000-0000-000000000011';

BEGIN
    SELECT id INTO member_role_id FROM roles WHERE name = 'MEMBER' LIMIT 1;
    IF member_role_id IS NULL THEN
        RAISE EXCEPTION 'V83: MEMBER role not found';
    END IF;

    -- Clean up if re-running
    DELETE FROM board_members   WHERE user_id = u_suleiman;
    DELETE FROM member_profiles WHERE user_id = u_suleiman;
    DELETE FROM users           WHERE id      = u_suleiman;

    -- =========================================================================
    -- 1. INSERT USER
    -- =========================================================================
    INSERT INTO users (
        id, username, email, password_hash, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        position, institution, department, specialization, biography,
        is_active, is_email_verified, created_at, updated_at
    ) VALUES (
        u_suleiman,
        'suleiman.salim',
        'suleiman.salim@damascus.edu.sy',
        '$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX',
        member_role_id,
        'Suleiman Mahmoud', 'Salim', 'سليمان محمود', 'سليم',
        'أستاذ مساعد في قسم علوم التربة',
        'جامعة دمشق',
        'قسم علوم التربة — كلية الهندسة الزراعية',
        'استصلاح الترب المتأثرة بالأملاح',
        'أستاذ مساعد في قسم علوم التربة بكلية الهندسة الزراعية، جامعة دمشق. حاصل على الماجستير والدكتوراه في علوم التربة من المدرسة الوطنية العليا الزراعية في رين والمعهد الوطني للبحوث الزراعية في فرساي — فرنسا. متخصص في استصلاح الترب المتأثرة بالأملاح. رئيس قسم علوم التربة 2024–2025.',
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
        u_suleiman,
        'FOUNDER', 'SSSS-011',
        'علوم التربة',
        'استصلاح الترب المتأثرة بالأملاح — معادن التربة — منشأ وتصنيف التربة — فيزياء التربة — تلوث التربة — كيمياء التربة — خصوبة التربة والتسميد',
        'دكتوراه في علوم التربة — المدرسة الوطنية العليا الزراعية في رين + المعهد الوطني للبحوث الزراعية في فرساي (INRA)، فرنسا
ماجستير في علوم التربة — المدرسة الوطنية العليا الزراعية في رين + INRA فرساي، فرنسا',
        'استصلاح الأراضي، معادن التربة، منشأ وتصنيف التربة، فيزياء التربة، تلوث التربة، كيمياء التربة، خصوبة التربة والتسميد',
        'الدكتور سليمان محمود سليم', 'Dr. Suleiman Mahmoud Salim', 'دكتور',
        NULL, NULL, 'سوري', NULL,
        'أستاذ مساعد في قسم علوم التربة — كلية الهندسة الزراعية، جامعة دمشق.
رئيس قسم علوم التربة 2024–2025.
الإشراف على العديد من رسائل الماجستير وأطروحات الدكتوراه.
نشر العديد من المقالات العلمية محلياً ودولياً في مجال استصلاح الترب وعلوم التربة.',
        'عضو جمعية علوم التربة السورية',
        'العربية (الأم)، الفرنسية، الإنجليزية',
        NULL, true, '2025-01-01',
        'suleiman-mahmoud-salim', '/members/suleiman-mahmoud-salim.jpg',
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
        birth_city            = EXCLUDED.birth_city,
        nationality           = EXCLUDED.nationality,
        photo_url             = EXCLUDED.photo_url,
        slug                  = EXCLUDED.slug,
        updated_at            = CURRENT_TIMESTAMP;

    RAISE NOTICE 'V83: Member Dr. Suleiman Mahmoud Salim (SSSS-011) inserted/updated successfully.';

END $$;
