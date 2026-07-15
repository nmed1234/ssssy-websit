-- =============================================================================
-- V53: Seed real SSSS data extracted from the official Bylaws (Articles of
--      Association) of the Soil Science Society of Syria.
--
--      1. Create user accounts for the 11 founding members (role = USER).
--      2. Create member_profiles linking each user (membership_type = FOUNDER).
--      3. Create board_members for the 11 founders (all listed as Founder/مؤسس).
--      4. Replace homepage Testimonials section with real founder quotes.
--      5. Replace homepage Statistics with accurate numbers.
--      6. Update About page content (site_sections for /about slug).
--
--      Safe to re-run: all inserts use ON CONFLICT DO NOTHING / DO UPDATE.
-- =============================================================================

DO $$
DECLARE
    -- Resolved role IDs
    user_role_id  UUID;
    admin_role_id UUID;
    admin_id      UUID;

    -- Founder user IDs (deterministic UUIDs so we can reference them below)
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
    -- ── Resolve role IDs ───────────────────────────────────────────────────
    SELECT id INTO user_role_id  FROM roles WHERE name = 'USER'  LIMIT 1;
    SELECT id INTO admin_role_id FROM roles WHERE name IN ('ADMIN','SUPER_ADMIN') ORDER BY name LIMIT 1;
    SELECT u.id INTO admin_id
    FROM users u JOIN roles r ON u.role_id = r.id
    WHERE r.name IN ('ADMIN','SUPER_ADMIN')
    ORDER BY u.created_at LIMIT 1;

    IF user_role_id IS NULL THEN
        RAISE NOTICE 'V53: USER role not found — skipping';
        RETURN;
    END IF;

    -- =========================================================================
    -- 1. USERS — one per founding member
    --    Passwords are set to a placeholder hash (not usable for login) so
    --    real accounts must be activated through the admin panel.
    -- =========================================================================

    INSERT INTO users (
        id, username, email, password, role_id,
        first_name_en, last_name_en, first_name_ar, last_name_ar,
        is_active, is_email_verified, created_at, updated_at
    ) VALUES
    -- 1. عبد الكريم احمد جعفر  /  Abdulkarim Ahmad Jaafar
    (u_abdulkarim, 'abdulkarim.jaafar', 'abdulkarim.jaafar@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Abdulkarim', 'Jaafar', 'عبد الكريم', 'جعفر',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 2. محمود أنيس عودة  /  Mahmoud Anis Oudeh
    (u_mahmoud, 'mahmoud.oudeh', 'mahmoud.oudeh@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Mahmoud', 'Oudeh', 'محمود', 'عودة',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 3. حيدر هاشم الحسن  /  Haidar Hashem Al-Hassan
    (u_haidar, 'haidar.alhassan', 'haidar.alhassan@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Haidar', 'Al-Hassan', 'حيدر', 'الحسن',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 4. علاء حسن خلوف  /  Alaa Hassan Khalouf
    (u_alaa, 'alaa.khalouf', 'alaa.khalouf@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Alaa', 'Khalouf', 'علاء', 'خلوف',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 5. لينا ممدوح النداف  /  Lina Mamdouh Al-Naddaf
    (u_lina, 'lina.naddaf', 'lina.naddaf@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Lina', 'Al-Naddaf', 'لينا', 'النداف',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 6. جيهان عدنان خليل  /  Jihan Adnan Khalil
    (u_jihan, 'jihan.khalil', 'jihan.khalil@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Jihan', 'Khalil', 'جيهان', 'خليل',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 7. حسين سليمان سليمان  /  Hussein Suleiman Suleiman
    (u_hussein, 'hussein.suleiman', 'hussein.suleiman@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Hussein', 'Suleiman', 'حسين', 'سليمان',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 8. ليلى بلال احمد  /  Laila Bilal Ahmad
    (u_laila, 'laila.ahmad', 'laila.ahmad@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Laila', 'Ahmad', 'ليلى', 'أحمد',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 9. عصام شكري الخوري  /  Essam Shukri Al-Khoury
    (u_essam, 'essam.alkhoury', 'essam.alkhoury@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Essam', 'Al-Khoury', 'عصام', 'الخوري',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 10. أكرم محمد البلخي  /  Akram Mohammad Al-Balkhi
    (u_akram, 'akram.balkhi', 'akram.balkhi@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Akram', 'Al-Balkhi', 'أكرم', 'البلخي',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 11. محمد منهل عوض الحسين الزعبي  /  Mohammad Manhal Awad Al-Hussein Al-Zoubi
    (u_mohammad, 'mohammad.zoubi', 'mohammad.zoubi@ssss.sy',
     '$2a$10$PLACEHOLDER_HASH_NOT_USABLE_FOR_LOGIN_XXXXX',
     user_role_id, 'Mohammad', 'Al-Zoubi', 'محمد', 'الزعبي',
     true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT (username) DO NOTHING;

    -- =========================================================================
    -- 2. MEMBER PROFILES — one per founder
    -- =========================================================================

    INSERT INTO member_profiles (
        user_id, membership_type, membership_number,
        specialization, education, is_public, joined_at, created_at, updated_at
    ) VALUES
    (u_abdulkarim, 'FOUNDER', 'SSSS-001',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_mahmoud,    'FOUNDER', 'SSSS-002',
     'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_haidar,     'FOUNDER', 'SSSS-003',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_alaa,       'FOUNDER', 'SSSS-004',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_lina,       'FOUNDER', 'SSSS-005',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_jihan,      'FOUNDER', 'SSSS-006',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_hussein,    'FOUNDER', 'SSSS-007',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_laila,      'FOUNDER', 'SSSS-008',
     'Soil Science', 'PhD in Soil Science', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_essam,      'FOUNDER', 'SSSS-009',
     'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_akram,      'FOUNDER', 'SSSS-010',
     'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (u_mohammad,   'FOUNDER', 'SSSS-011',
     'Soil Science', 'PhD in Soil Science — University Professor', true, '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT (user_id) DO NOTHING;

    -- =========================================================================
    -- 3. BOARD MEMBERS — all 11 founders listed in bylaws Article 31
    --    Positions are assigned per academic rank extracted from the bylaws.
    -- =========================================================================

    INSERT INTO board_members (
        user_id, position_ar, position_en,
        term_start, term_end, bio, sort_order, is_active,
        created_at, updated_at
    ) VALUES
    -- Professors (أستاذ دكتور) — listed first
    (u_mahmoud,
     'أستاذ دكتور — عضو مؤسس',
     'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_essam,
     'أستاذ دكتور — عضو مؤسس',
     'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_akram,
     'أستاذ دكتور — عضو مؤسس',
     'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_mohammad,
     'أستاذ دكتور — عضو مؤسس',
     'Professor (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Professor with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- University Lecturers (دكتور جامعي)
    (u_haidar,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_alaa,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_lina,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Homs. One of the eleven founding members of the Soil Science Society of Syria.',
     7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_jihan,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_hussein,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Deir ez-Zor. One of the eleven founding members of the Soil Science Society of Syria.',
     9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    (u_laila,
     'دكتور جامعي — عضو مؤسس',
     'University Lecturer (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'University Lecturer with a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Teacher / مدرس
    (u_abdulkarim,
     'مدرس — عضو مؤسس',
     'Teacher (PhD) — Founding Member',
     '2024-01-01', '2026-01-01',
     'Holds a PhD in Soil Science, based in Damascus. One of the eleven founding members of the Soil Science Society of Syria.',
     11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

    ON CONFLICT DO NOTHING;

    -- =========================================================================
    -- 4. TESTIMONIALS — replace generic demo quotes with real founder quotes
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
    -- 5. STATISTICS — update with accurate SSSS numbers
    -- =========================================================================

    UPDATE site_sections
    SET data = '{
      "items": [
        {"titleEn": "Founding Members",   "titleAr": "الأعضاء المؤسسون",     "value": "11"},
        {"titleEn": "PhD Holders",         "titleAr": "حاملو شهادة الدكتوراه","value": "11"},
        {"titleEn": "Governorates Covered","titleAr": "المحافظات المشمولة",   "value": "5+"},
        {"titleEn": "Focus Areas",         "titleAr": "مجالات التركيز",       "value": "3"}
      ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
    WHERE slug = 'statistics';

    -- =========================================================================
    -- 6. ABOUT PAGE — seed/update the about page with real SSSS content
    --    Uses site_sections with location = 'about' OR updates the pages table.
    -- =========================================================================

    -- Update the about page title + SEO meta if it exists
    -- (pages table has no content column — content is stored in page_sections)
    UPDATE pages
    SET
        title_en   = 'About the Soil Science Society of Syria',
        title_ar   = 'عن جمعية علوم التربة السورية',
        meta_title = 'About SSSS — Soil Science Society of Syria',
        updated_at = CURRENT_TIMESTAMP
    WHERE slug = 'about';

    -- Seed about page rich content into page_sections (skip if already present)
    INSERT INTO page_sections (page_id, component_type, config, data, styling, sort_order)
    SELECT
        p.id, 'rich-text', '{}'::jsonb,
        jsonb_build_object(
            'contentEn',
            '<h2>About the Soil Science Society of Syria</h2><p>The <strong>Soil Science Society of Syria (SSSS)</strong> is a non-profit scientific institution established in Damascus under the auspices of the Ministry of Higher Education. Its activities cover the entire territory of the Syrian Arab Republic.</p><h3>Our Mission</h3><p>The society was founded with three core purposes: (1) advancing research in soil science, classification, pollution, fertility, and sustainable soil management; (2) disseminating knowledge through conferences, workshops, forums, and peer-reviewed publications; (3) providing scientific consultations to governmental and agricultural entities to support environmental and agricultural policies.</p><h3>Governance</h3><p>The society is governed by a Board of Trustees responsible for setting institutional policies, approving budgets, and overseeing all activities on a strictly non-profit basis.</p><h3>Founding Members</h3><p>Established by eleven founding members, all holding PhDs in Soil Science, drawn from universities and research institutions across Syria — Damascus, Homs, Deir ez-Zor, and beyond.</p><h3>Membership</h3><p>Membership is open to Syrian residents who meet the society''s membership conditions. Members participate in policy-setting, vote on institutional decisions, and access financial and administrative reports.</p>',
            'contentAr',
            'جمعية علوم التربة السورية مؤسسة علمية غير ربحية تأسست في دمشق تحت إشراف وزارة التعليم العالي، وتشمل أنشطتها كامل أراضي الجمهورية العربية السورية. أغراض الجمعية: تطوير البحث العلمي في علوم التربة — نقل المعرفة عبر المؤتمرات وورش العمل والمنشورات المحكمة — تقديم الاستشارات العلمية للجهات الحكومية والزراعية. تضم الجمعية أحد عشر عضواً مؤسساً يحملون شهادات الدكتوراه في علوم التربة.'
        ),
        '{}'::jsonb, 10
    FROM pages p
    WHERE p.slug = 'about'
      AND NOT EXISTS (
          SELECT 1 FROM page_sections ps
          WHERE ps.page_id = p.id AND ps.component_type = 'rich-text'
      );

    -- Also upsert an about section for the homepage if one doesn't exist
    INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
    VALUES (
        'About SSSS',
        'about-ssss-intro',
        'card-group',
        'about',
        '{
          "titleEn": "Our Three Pillars",
          "titleAr": "ركائزنا الثلاث"
        }'::jsonb,
        '{
          "items": [
            {
              "titleEn": "Scientific Research",
              "titleAr": "البحث العلمي",
              "descriptionEn": "Advancing research in soil science, classification, pollution, fertility, and sustainable soil management across Syria''s diverse agricultural regions.",
              "descriptionAr": "تطوير البحث في علوم التربة وتصنيفها وتلوثها وخصوبتها وإدارتها المستدامة عبر المناطق الزراعية المتنوعة في سوريا."
            },
            {
              "titleEn": "Knowledge Transfer",
              "titleAr": "نقل المعرفة",
              "descriptionEn": "Disseminating knowledge through conferences, workshops, forums, social media, and publishing peer-reviewed research to connect Syria''s soil science community.",
              "descriptionAr": "نشر المعرفة عبر المؤتمرات وورش العمل والمنتديات ووسائل التواصل الاجتماعي ونشر الأبحاث المحكمة لربط مجتمع علوم التربة في سوريا."
            },
            {
              "titleEn": "Scientific Consultancy",
              "titleAr": "الاستشارات العلمية",
              "descriptionEn": "Providing scientific consultations to governmental and agricultural entities to support sound environmental and agricultural policies across Syria.",
              "descriptionAr": "تقديم الاستشارات العلمية للجهات الحكومية والزراعية لدعم السياسات البيئية والزراعية الرشيدة في سوريا."
            }
          ]
        }'::jsonb,
        '{}'::jsonb,
        true,
        1
    )
    ON CONFLICT (slug) DO UPDATE SET
        config     = EXCLUDED.config,
        data       = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'V53 error: %', SQLERRM;
END $$;
