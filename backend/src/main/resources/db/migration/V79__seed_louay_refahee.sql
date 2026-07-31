-- =============================================================================
-- V79: Add new member Dr. Louay Mahmoud Refahee (SSSS-009).
--      Instructor at the Faculty of Agriculture, University of Damascus.
--      Specialization: Soil Chemistry.
-- =============================================================================

DO $$
DECLARE
    member_role_id UUID;
    u_louay UUID := 'a2000001-0000-0000-0000-000000000009';

BEGIN
    SELECT id INTO member_role_id FROM roles WHERE name = 'MEMBER' LIMIT 1;
    IF member_role_id IS NULL THEN
        RAISE EXCEPTION 'V79: MEMBER role not found';
    END IF;

    -- Clean up if re-running
    DELETE FROM board_members  WHERE user_id = u_louay;
    DELETE FROM member_profiles WHERE user_id = u_louay;
    DELETE FROM users WHERE id = u_louay;

    -- =========================================================================
    -- 1. INSERT USER
    -- =========================================================================
    INSERT INTO users (
        id, username, email, password_hash, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        position, institution, department, specialization, biography,
        phone, is_active, is_email_verified, created_at, updated_at
    ) VALUES (
        u_louay,
        'louay.refahee',
        'LOUIREFAHEE@YAHOO.COM',
        '$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX',
        member_role_id,
        'Louay Mahmoud', 'Refahee', 'لؤي محمود', 'رفاعي',
        'مدرّس في كلية الزراعة',
        'جامعة دمشق',
        'قسم علوم التربة — كلية الزراعة',
        'كيمياء التربة',
        'مدرّس في كلية الزراعة بجامعة دمشق. دكتوراه في الهندسة الزراعية تخصص كيمياء التربة من جامعة دمشق 2019 بمعدل 89.40 امتياز. متخصص في كيمياء التربة وتلوث التربة والمياه والبيولوجيا الدقيقة للتربة. له 8 أبحاث منشورة في مجلات علمية محكمة تتناول التركيب المعدني للتربة والعناصر الثقيلة وديناميكية الفسفور.',
        '0994513509',
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
        u_louay,
        'FOUNDER', 'SSSS-009',
        'كيمياء التربة', 'تلوث التربة والمياه — العناصر الثقيلة — بيولوجيا التربة',
        'دكتوراه في الهندسة الزراعية تخصص كيمياء التربة — جامعة دمشق 2019 (89.40 امتياز)',
        'كيمياء التربة، التركيب المعدني للتربة، تلوث التربة والمياه، العناصر الثقيلة المتاحة، بيولوجيا التربة، ديناميكية الفسفور، أنظمة الري والتسميد',
        'الدكتور لؤي محمود رفاعي', 'Dr. Louay Mahmoud Refahee', 'دكتور',
        1986, 'يبرود', 'سوري', NULL,
        'معيد في كلية الزراعة — جامعة دمشق (11/10/2010).
مدرّس في كلية الزراعة — جامعة دمشق (23/12/2019 حتى تاريخه).
المقررات المُدرَّسة: كيمياء التربة، أسس علم التربة، أحياء دقيقة، تلوث التربة والمياه ومعالجتها، بيولوجيا التربة، مورفولوجيا التربة، أنظمة الري والتسميد.',
        'عضو نقابة المهندسين الزراعيين',
        'العربية (الأم)، الإنجليزية',
        8, true, '2025-01-01',
        'louay-mahmoud-refahee', NULL,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name_ar              = EXCLUDED.name_ar,
        name_en              = EXCLUDED.name_en,
        title_ar             = EXCLUDED.title_ar,
        specialization       = EXCLUDED.specialization,
        specialization_detail = EXCLUDED.specialization_detail,
        education            = EXCLUDED.education,
        research_interests   = EXCLUDED.research_interests,
        career_summary       = EXCLUDED.career_summary,
        memberships          = EXCLUDED.memberships,
        languages            = EXCLUDED.languages,
        birth_year           = EXCLUDED.birth_year,
        birth_city           = EXCLUDED.birth_city,
        nationality          = EXCLUDED.nationality,
        publications_count   = EXCLUDED.publications_count,
        slug                 = EXCLUDED.slug,
        updated_at           = CURRENT_TIMESTAMP;

    RAISE NOTICE 'V79: Member Dr. Louay Mahmoud Refahee (SSSS-009) inserted/updated successfully.';

END $$;
