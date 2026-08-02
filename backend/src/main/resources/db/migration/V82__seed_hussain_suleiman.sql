-- =============================================================================
-- V82: Add new member Dr. Hussain Suleiman (SSSS-010).
--      Instructor at the Faculty of Agricultural Engineering,
--      University of the Euphrates — Department of Soil and Land Reclamation.
--      Specialization: Soil Science & Land Reclamation.
-- =============================================================================

DO $$
DECLARE
    member_role_id UUID;
    u_hussain UUID := 'a2000001-0000-0000-0000-000000000010';

BEGIN
    SELECT id INTO member_role_id FROM roles WHERE name = 'MEMBER' LIMIT 1;
    IF member_role_id IS NULL THEN
        RAISE EXCEPTION 'V82: MEMBER role not found';
    END IF;

    -- Clean up if re-running
    DELETE FROM board_members  WHERE user_id = u_hussain;
    DELETE FROM member_profiles WHERE user_id = u_hussain;
    DELETE FROM users WHERE id = u_hussain;

    -- =========================================================================
    -- 1. INSERT USER
    -- =========================================================================
    INSERT INTO users (
        id, username, email, password_hash, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        position, institution, department, specialization, biography,
        phone, is_active, is_email_verified, created_at, updated_at
    ) VALUES (
        u_hussain,
        'hussain.suleiman',
        'alhnoshalhnosh@gmail.com',
        '$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX',
        member_role_id,
        'Hussain', 'Suleiman', 'حسين', 'سليمان',
        'مدرّس في كلية الهندسة الزراعية',
        'جامعة الفرات السورية',
        'قسم التربة واستصلاح الأراضي — كلية الهندسة الزراعية',
        'علوم التربة واستصلاح الأراضي',
        'مدرّس في قسم التربة واستصلاح الأراضي بكلية الهندسة الزراعية، جامعة الفرات السورية. دكتوراه في الهندسة الزراعية تخصص التربة واستصلاح الأراضي من جامعة الفرات 2020 بدرجة مشرف. متخصص في تحليل التربة فيزيائياً وكيميائياً وتصنيف الأراضي وإدارة التربة الجافة والقاحلة وإدارة الموارد المائية والعواصف الغبارية.',
        '00963987250464',
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
        u_hussain,
        'FOUNDER', 'SSSS-010',
        'علوم التربة واستصلاح الأراضي',
        'تحليل التربة فيزيائياً وكيميائياً — تصنيف الأراضي — إدارة التربة الجافة والقاحلة — إدارة الموارد المائية والعواصف الغبارية',
        'دكتوراه في الهندسة الزراعية تخصص التربة واستصلاح الأراضي — جامعة الفرات السورية 2020 (بدرجة مشرف)',
        'تحليل التربة فيزيائياً وكيميائياً، تصنيف الأراضي القاحلة، إدارة التربة الجافة، إدارة الموارد المائية، العواصف الغبارية، استصلاح الأراضي',
        'الدكتور حسين سليمان', 'Dr. Hussain Suleiman', 'دكتور',
        NULL, 'القامشلي', 'سوري', NULL,
        'مدرّس في كلية الهندسة الزراعية — جامعة الفرات السورية، دير الزور (2020 حتى تاريخه).
نائب عميد كلية العلوم — جامعة الفرات (2022).
نائب عميد كلية العلوم للشؤون العلمية والتقنية — جامعة الفرات (2022).
إدارة الأجهزة العلمية في كلية الهندسة الزراعية (2022).
دورة تدريبية في تقنيات التحليل — جامعة ساهوس 2002.
دورة استخدام جهاز XRD — هيئة الطاقة الذرية السورية 2002.',
        'عضو نقابة المهندسين الزراعيين',
        'العربية (الأم)، الإنجليزية (B2)',
        NULL, true, '2025-01-01',
        'hussain-suleiman', '/members/hussain-suleiman.jpg',
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

    RAISE NOTICE 'V82: Member Dr. Hussain Suleiman (SSSS-010) inserted/updated successfully.';

END $$;
