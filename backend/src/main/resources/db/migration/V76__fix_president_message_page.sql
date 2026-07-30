-- =============================================================================
-- V76: Fix president message page — move content to the correct existing page
--
-- V75 accidentally created a NEW page with slug='president' instead of updating
-- the existing page with slug='president-message'.
--
-- This migration:
--   1. Removes the incorrectly created 'president' page (V75 leftover)
--   2. Updates the correct 'president-message' page metadata
--   3. Replaces its sections with the full bilingual content + photos
-- =============================================================================

DO $$
DECLARE
    v_pm_id  UUID;   -- president-message page id (the correct existing one)
    v_dup_id UUID;   -- the wrong 'president' page created by V75
    v_aid    UUID;   -- admin user id
BEGIN
    -- Resolve admin user
    SELECT u.id INTO v_aid
      FROM users u
      JOIN roles r ON u.role_id = r.id
     WHERE r.name IN ('ADMIN','SUPER_ADMIN')
     ORDER BY u.created_at
     LIMIT 1;

    -- ── Step 1: Remove the wrongly-created 'president' page from V75 ──────────
    SELECT p.id INTO v_dup_id FROM pages p WHERE p.slug = 'president' LIMIT 1;
    IF v_dup_id IS NOT NULL THEN
        DELETE FROM page_sections ps WHERE ps.page_id = v_dup_id;
        DELETE FROM pages p WHERE p.id = v_dup_id;
        RAISE NOTICE 'V76: Removed incorrect president page (id=%)', v_dup_id;
    ELSE
        RAISE NOTICE 'V76: No duplicate president page found — skipping cleanup';
    END IF;

    -- ── Step 2: Resolve the correct president-message page ───────────────────
    SELECT p.id INTO v_pm_id FROM pages p WHERE p.slug = 'president-message' LIMIT 1;

    IF v_pm_id IS NULL THEN
        RAISE NOTICE 'V76: president-message page not found — creating it';
        v_pm_id := gen_random_uuid();
        INSERT INTO pages (
            id, title_ar, title_en, slug, layout_type,
            is_published, is_homepage, sort_order, author_id,
            meta_title, meta_description,
            og_title, og_description,
            created_at, updated_at
        ) VALUES (
            v_pm_id,
            'كلمة رئيس الجمعية',
            'Message from the President',
            'president-message', 'FLEXIBLE',
            true, false, 15, v_aid,
            'كلمة رئيس الجمعية | جمعية علوم التربة السورية',
            'كلمة الدكتور عبد الكريم جعفر، مؤسس ورئيس جمعية علوم التربة السورية، حول رؤية الجمعية وأهدافها.',
            'كلمة رئيس جمعية علوم التربة السورية — الدكتور عبد الكريم جعفر',
            'رسالة علمية تدعو إلى حماية التربة وتعزيز البحث العلمي لمستقبل مستدام.',
            NOW(), NOW()
        );
    ELSE
        -- Update metadata on the existing page
        UPDATE pages SET
            title_ar         = 'كلمة رئيس الجمعية',
            title_en         = 'Message from the President',
            meta_title       = 'كلمة رئيس الجمعية | جمعية علوم التربة السورية',
            meta_description = 'كلمة الدكتور عبد الكريم جعفر، مؤسس ورئيس جمعية علوم التربة السورية، حول رؤية الجمعية وأهدافها.',
            og_title         = 'كلمة رئيس جمعية علوم التربة السورية — الدكتور عبد الكريم جعفر',
            og_description   = 'رسالة علمية تدعو إلى حماية التربة وتعزيز البحث العلمي لمستقبل مستدام.',
            layout_json      = NULL,
            is_published     = true,
            updated_at       = NOW()
        WHERE id = v_pm_id;
        RAISE NOTICE 'V76: Updated president-message page metadata (id=%)', v_pm_id;
    END IF;

    -- ── Step 3: Replace all sections with correct bilingual content ───────────
    DELETE FROM page_sections ps WHERE ps.page_id = v_pm_id;

    -- SECTION 1 — Hero Banner (sort_order: 10)
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_pm_id, 'president-message-hero-banner', '{}'::jsonb,
        '{
            "titleAr":    "كلمة رئيس الجمعية",
            "titleEn":    "Message from the President",
            "subtitleAr": "الدكتور عبد الكريم جعفر — مؤسس ورئيس جمعية علوم التربة السورية",
            "subtitleEn": "Dr. Abd Al Karim Jaafar — Founder & President, Soil Science Society of Syria",
            "minHeight":  "420px"
        }'::jsonb,
        '{}'::jsonb,
        10, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- SECTION 2 — President Message Content (sort_order: 20)
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_pm_id, 'president-message-content-section', '{}'::jsonb,
        '{
            "headingAr":        "كلمة رئيس الجمعية",
            "headingEn":        "Message from the President",
            "presidentNameAr":  "الدكتور عبد الكريم جعفر",
            "presidentName":    "Dr. Abd Al Karim Jaafar",
            "presidentTitleAr": "مؤسس ورئيس جمعية علوم التربة السورية",
            "presidentTitle":   "Founder & President, Soil Science Society of Syria",
            "photo":  "/images/president/president-main.jpg",
            "photo2": "/images/president/president-real.jpg",
            "quoteAr": "إن قوة الجمعية تكمن في أعضائها وشركائها، وفي روح التعاون التي تجمع العلماء والباحثين حول هدف مشترك: فهم التربة وحمايتها وإدارتها من أجل مستقبل أفضل للإنسان والبيئة.",
            "quoteEn": "The strength of the Society lies in its members, partners, and the spirit of cooperation that brings scientists and researchers together around a common goal: to understand, protect, and sustainably manage soils for a better future for humanity and the environment.",
            "signatureAr": "مؤسس ورئيس جمعية علوم التربة السورية",
            "signatureEn": "Founder & President, Soil Science Society of Syria",
            "paragraphs": [
                {
                    "textAr": "تأسست جمعية علوم التربة السورية انطلاقاً من الحاجة إلى وجود إطار علمي يجمع المختصين والباحثين والمهتمين بعلوم التربة، ويعمل على تعزيز دور هذا العلم الحيوي في خدمة الإنسان والبيئة وتحقيق التنمية المستدامة.",
                    "textEn": "The Soil Science Society of Syria (SSSS) was established in response to the need for a scientific framework that brings together specialists, researchers, and those interested in soil science, while enhancing the role of this vital discipline in serving humanity, protecting the environment, and achieving sustainable development."
                },
                {
                    "textAr": "إن التربة ليست مجرد وسط لنمو النباتات، بل هي نظام بيئي متكامل يحمل أهمية بالغة في دعم الحياة، والمحافظة على التنوع الحيوي، وتنظيم دورة المياه، والمساهمة في تحقيق الأمن الغذائي ومواجهة التحديات البيئية المتزايدة. ومن هنا تأتي أهمية تطوير علوم التربة وتعزيز مكانتها ضمن منظومة العلوم التطبيقية.",
                    "textEn": "Soil is not merely a medium for plant growth; it is an integrated ecosystem of great importance for sustaining life, conserving biodiversity, regulating the water cycle, contributing to food security, and addressing the increasing environmental challenges facing our world. Therefore, advancing soil science and strengthening its position among the applied sciences are essential priorities."
                },
                {
                    "textAr": "تسعى جمعية علوم التربة السورية إلى أن تكون منصة علمية تجمع الخبرات والكفاءات، وتشجع البحث العلمي والابتكار، وتدعم تبادل المعرفة بين العلماء والباحثين والطلاب والجهات المعنية. كما تعمل على نشر ثقافة الإدارة المستدامة للتربة، وتعزيز التعاون بين الجامعات ومراكز البحث والمؤسسات الوطنية والدولية.",
                    "textEn": "Soil Science Society of Syria seeks to serve as a scientific platform that brings together expertise and competencies, promotes scientific research and innovation, and supports knowledge exchange among scientists, researchers, students, and relevant stakeholders. It also works to promote awareness of sustainable soil management and strengthen cooperation among universities, research centers, and national and international institutions."
                },
                {
                    "textAr": "وتتمثل رؤيتنا في بناء مجتمع علمي متخصص يسهم في تطوير علوم التربة، وإيجاد حلول علمية للتحديات المرتبطة بتدهور الأراضي، وتغير المناخ، وإدارة الموارد الطبيعية، بما يحقق مستقبلاً أكثر استدامة للأجيال القادمة.",
                    "textEn": "Our vision is to build a specialized scientific community that contributes to the advancement of soil science, develops scientific solutions to challenges related to land degradation, climate change, and natural resource management, and supports a more sustainable future for generations to come."
                },
                {
                    "textAr": "وستواصل جمعية علوم التربة السورية جهودها من خلال تنظيم المؤتمرات والندوات العلمية، ودعم الدراسات والأبحاث، وتشجيع تدريب وتأهيل الكوادر الشابة، وربط المعرفة الأكاديمية بالتطبيقات العملية التي تخدم المجتمع.",
                    "textEn": "Soil Science Society of Syria will continue its efforts through organizing scientific conferences, seminars, and workshops, supporting scientific studies and research, encouraging the training and qualification of young scientific talents, and linking academic knowledge with practical applications that serve society."
                }
            ]
        }'::jsonb,
        '{}'::jsonb,
        20, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    RAISE NOTICE 'V76: president-message page fixed successfully (id=%)', v_pm_id;
END $$;
