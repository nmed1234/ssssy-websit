-- =============================================================================
-- V54: Re-seed founder data that V53 silently skipped.
--
--      V53 failed because:
--        1. It looked for role name = 'USER' which does not exist (roles are
--           SUPER_ADMIN, ADMIN, PUBLISHER, REVIEWER, EDITOR, MEMBER, VISITOR).
--        2. It inserted into column "password" which does not exist
--           (the column is "password_hash").
--
--      This migration fixes both issues and inserts the 11 founding members.
-- =============================================================================

DO $$
DECLARE
    member_role_id UUID;

    u_abdulkarim  UUID := 'f1000001-0000-0000-0000-000000000001';
    u_mahmoud     UUID := 'f1000001-0000-0000-0000-000000000002';
    u_haidar      UUID := 'f1000001-0000-0000-0000-000000000003';
    u_alaa        UUID := 'f1000001-0000-0000-0000-000000000004';
    u_lina        UUID := 'f1000001-0000-0000-0000-000000000005';
    u_jihan       UUID := 'f1000001-0000-0000-0000-000000000006';
    u_hussein     UUID := 'f1000001-0000-0000-0000-000000000007';
    u_laila       UUID := 'f1000001-0000-0000-0000-000000000008';
    u_essam       UUID := 'f1000001-0000-0000-0000-000000000009';
    u_akram       UUID := 'f1000001-0000-0000-0000-000000000010';
    u_mohammad    UUID := 'f1000001-0000-0000-0000-000000000011';

BEGIN
    -- Use MEMBER role (the closest equivalent to a regular member)
    SELECT id INTO member_role_id FROM roles WHERE name = 'MEMBER' LIMIT 1;

    IF member_role_id IS NULL THEN
        RAISE EXCEPTION 'V54: MEMBER role not found — cannot seed founders';
    END IF;

    -- =========================================================================
    -- 1. USERS — correct column name is password_hash, role is MEMBER
    -- =========================================================================

    INSERT INTO users (
        id, username, email, password_hash, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        is_active, is_email_verified, created_at, updated_at
    ) VALUES
    (u_abdulkarim, 'abdulkarim.jaafar', 'abdulkarim.jaafar@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Abdulkarim', 'Jaafar', 'عبد الكريم', 'جعفر',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_mahmoud, 'mahmoud.oudeh', 'mahmoud.oudeh@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Mahmoud', 'Oudeh', 'محمود', 'عودة',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_haidar, 'haidar.alhassan', 'haidar.alhassan@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Haidar', 'Al-Hassan', 'حيدر', 'الحسن',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_alaa, 'alaa.khalouf', 'alaa.khalouf@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Alaa', 'Khalouf', 'علاء', 'خلوف',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_lina, 'lina.naddaf', 'lina.naddaf@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Lina', 'Al-Naddaf', 'لينا', 'النداف',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_jihan, 'jihan.khalil', 'jihan.khalil@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Jihan', 'Khalil', 'جيهان', 'خليل',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_hussein, 'hussein.suleiman', 'hussein.suleiman@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Hussein', 'Suleiman', 'حسين', 'سليمان',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_laila, 'laila.ahmad', 'laila.ahmad@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Laila', 'Ahmad', 'ليلى', 'أحمد',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_essam, 'essam.alkhoury', 'essam.alkhoury@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Essam', 'Al-Khoury', 'عصام', 'الخوري',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_akram, 'akram.balkhi', 'akram.balkhi@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Akram', 'Al-Balkhi', 'أكرم', 'البلخي',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_mohammad, 'mohammad.zoubi', 'mohammad.zoubi@ssss.sy',
     '$2a$10$disabled.placeholder.not.usable.for.login.XXXXXX',
     member_role_id, 'Mohammad', 'Al-Zoubi', 'محمد', 'الزعبي',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT (username) DO NOTHING;

    -- =========================================================================
    -- 2. MEMBER PROFILES
    -- =========================================================================

    INSERT INTO member_profiles (
        user_id, membership_type, membership_number,
        specialization, education, is_public, joined_at, created_at, updated_at
    ) VALUES
    (u_abdulkarim, 'FOUNDER', 'SSSS-001', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_mahmoud,    'FOUNDER', 'SSSS-002', 'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_haidar,     'FOUNDER', 'SSSS-003', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_alaa,       'FOUNDER', 'SSSS-004', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_lina,       'FOUNDER', 'SSSS-005', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_jihan,      'FOUNDER', 'SSSS-006', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_hussein,    'FOUNDER', 'SSSS-007', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_laila,      'FOUNDER', 'SSSS-008', 'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_essam,      'FOUNDER', 'SSSS-009', 'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_akram,      'FOUNDER', 'SSSS-010', 'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_mohammad,   'FOUNDER', 'SSSS-011', 'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT (user_id) DO NOTHING;

    -- =========================================================================
    -- 3. BOARD MEMBERS
    -- =========================================================================

    INSERT INTO board_members (
        user_id, position_ar, position_en,
        term_start, term_end, bio, sort_order, is_active,
        created_at, updated_at
    ) VALUES
    (u_mahmoud,
     'أستاذ دكتور — عضو مؤسس', 'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_essam,
     'أستاذ دكتور — عضو مؤسس', 'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_akram,
     'أستاذ دكتور — عضو مؤسس', 'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_mohammad,
     'أستاذ دكتور — عضو مؤسس', 'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_haidar,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_alaa,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_lina,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_jihan,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_hussein,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Deir ez-Zor. One of the eleven founding members of the Soil Science Society of Syria.',
     9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_laila,
     'دكتور جامعي — عضو مؤسس', 'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_abdulkarim,
     'مدرس — عضو مؤسس', 'Teacher (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'Holds a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT DO NOTHING;

    -- =========================================================================
    -- 4. TESTIMONIALS — real founder quotes
    -- =========================================================================

    UPDATE site_sections
    SET data = '{
      "items": [
        {
          "nameEn": "Prof. Mahmoud Anis Oudeh",
          "nameAr": "أ.د. محمود أنيس عودة",
          "roleEn": "Founding Member — University Professor, Homs",
          "roleAr": "عضو مؤسس — أستاذ جامعي، حمص",
          "quoteEn": "The Soil Science Society of Syria was founded to unite researchers, academics, and practitioners under one scientific home — advancing knowledge and protecting our land for future generations.",
          "quoteAr": "تأسست جمعية علوم التربة السورية لتوحيد الباحثين والأكاديميين والممارسين تحت سقف علمي واحد — لتطوير المعرفة وحماية أرضنا للأجيال القادمة."
        },
        {
          "nameEn": "Dr. Lina Mamdouh Al-Naddaf",
          "nameAr": "د. لينا ممدوح النداف",
          "roleEn": "Founding Member — University Lecturer, Homs",
          "roleAr": "عضو مؤسس — دكتور جامعي، حمص",
          "quoteEn": "Sustainable soil management is not just a scientific goal — it is a national responsibility. The society gives us the platform to translate research into real policy impact.",
          "quoteAr": "الإدارة المستدامة للتربة ليست هدفاً علمياً فحسب، بل هي مسؤولية وطنية. الجمعية تمنحنا المنصة لتحويل الأبحاث إلى أثر حقيقي في السياسات."
        },
        {
          "nameEn": "Prof. Akram Mohammad Al-Balkhi",
          "nameAr": "أ.د. أكرم محمد البلخي",
          "roleEn": "Founding Member — University Professor, Damascus",
          "roleAr": "عضو مؤسس — أستاذ جامعي، دمشق",
          "quoteEn": "Syria''s agricultural future depends on healthy soils. Through the society''s conferences, workshops, and peer-reviewed publications, we are building the scientific foundation this country needs.",
          "quoteAr": "مستقبل الزراعة في سوريا يعتمد على صحة التربة. من خلال مؤتمرات الجمعية وورش عملها ومنشوراتها المحكمة، نبني الأساس العلمي الذي تحتاجه هذه البلاد."
        }
      ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
    WHERE slug = 'testimonials';

    -- =========================================================================
    -- 5. STATISTICS — accurate SSSS numbers
    -- =========================================================================

    UPDATE site_sections
    SET data = '{
      "items": [
        {"titleEn": "Founding Members",    "titleAr": "الأعضاء المؤسسون",      "value": "11"},
        {"titleEn": "PhD Holders",          "titleAr": "حاملو شهادة الدكتوراه", "value": "11"},
        {"titleEn": "Governorates Covered", "titleAr": "المحافظات المشمولة",    "value": "5+"},
        {"titleEn": "Focus Areas",          "titleAr": "مجالات التركيز",        "value": "3"}
      ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
    WHERE slug = 'statistics';

END $$;
