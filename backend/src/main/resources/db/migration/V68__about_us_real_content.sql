-- =============================================================================
-- V68: About Us Page — Real Content from Official Bylaws
--
-- Source: القرار رقم 1054.7 الصادر عن وزارة الشؤون الاجتماعية والعمل
--         (النظام الداخلي لجمعية علوم التربة السورية)
--
-- This migration:
--   1. Updates the 'about' page metadata with accurate bilingual titles/SEO.
--   2. Clears layout_json cache so the CMS re-reads from page_sections.
--   3. Replaces all existing about page_sections with 7 rich bilingual sections:
--        - Hero Banner (bilingual, with founding decree reference)
--        - Society Overview (official name, location, legal basis)
--        - Founding Decree (official document image)
--        - 10 Objectives (from Article 3 / مادة 3)
--        - Classifications & Membership
--        - Governance Structure (Board of Directors per Articles 24-38)
--        - Founding Members Table (11 founders from Article 56)
--
-- Safe to re-run: DELETE + INSERT pattern scoped to slug='about'.
-- =============================================================================

DO $$
DECLARE
    about_id   UUID;
    admin_id   UUID;
BEGIN
    -- Resolve the about page id
    SELECT id INTO about_id FROM pages WHERE slug = 'about' LIMIT 1;
    SELECT u.id INTO admin_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
     WHERE r.name IN ('ADMIN','SUPER_ADMIN')
     ORDER BY u.created_at
     LIMIT 1;

    IF about_id IS NULL THEN
        RAISE NOTICE 'V68: about page not found — creating it';
        about_id := gen_random_uuid();
        INSERT INTO pages (
            id, title_ar, title_en, slug, layout_type,
            is_published, is_homepage, sort_order, author_id,
            meta_title, meta_description,
            og_title, og_description,
            created_at, updated_at
        ) VALUES (
            about_id,
            'عن جمعية علوم التربة السورية',
            'About the Soil Science Society of Syria',
            'about', 'FLEXIBLE',
            true, false, 0, admin_id,
            'عن الجمعية | جمعية علوم التربة السورية',
            'تعرف على جمعية علوم التربة السورية، تأسيسها القانوني، أهدافها، هيكلها التنظيمي، وأعضاؤها المؤسسون.',
            'عن جمعية علوم التربة السورية',
            'جمعية علمية غير ربحية مكرسة لحماية التربة السورية وتطوير علوم التربة والتنمية المستدامة.',
            NOW(), NOW()
        );
    ELSE
        -- Update page metadata with accurate bilingual content
        UPDATE pages SET
            title_ar          = 'عن جمعية علوم التربة السورية',
            title_en          = 'About the Soil Science Society of Syria',
            meta_title        = 'عن الجمعية | جمعية علوم التربة السورية',
            meta_description  = 'تعرف على جمعية علوم التربة السورية، تأسيسها القانوني، أهدافها، هيكلها التنظيمي، وأعضاؤها المؤسسون.',
            og_title          = 'عن جمعية علوم التربة السورية',
            og_description    = 'جمعية علمية غير ربحية مكرسة لحماية التربة السورية وتطوير علوم التربة والتنمية المستدامة.',
            layout_json       = NULL,   -- force CMS builder to re-read page_sections
            updated_at        = NOW()
        WHERE id = about_id;
    END IF;

    -- ── Remove all stale sections for this page ────────────────────────────
    DELETE FROM page_sections WHERE page_id = about_id;

    -- =========================================================================
    -- SECTION 1 — Hero Banner
    -- sort_order: 10
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-hero-banner', '{}'::jsonb,
        '{
            "titleAr":      "جمعية علوم التربة السورية",
            "titleEn":      "Soil Science Society of Syria",
            "subtitleAr":   "مؤسسة علمية غير ربحية — دمشق، سوريا",
            "subtitleEn":   "A Non-Profit Scientific Institution — Damascus, Syria",
            "badgeAr":      "مُرخَّصة بموجب القرار رقم 1054.7",
            "badgeEn":      "Licensed under Decree No. 1054.7",
            "descriptionAr":"تأسست جمعية علوم التربة السورية بموجب القرار الجمهوري والتشريعات النافذة، وتتخذ من كلية الهندسة الزراعية في جامعة دمشق مقراً لها، وتشمل أنشطتها كافة أراضي الجمهورية العربية السورية.",
            "descriptionEn":"The Soil Science Society of Syria was established under official decree and applicable legislation, headquartered at the Faculty of Agricultural Engineering, University of Damascus, covering the entire territory of the Syrian Arab Republic."
        }'::jsonb,
        '{
            "backgroundColor":"bg-gradient-to-br from-green-900 via-green-800 to-green-700",
            "padding":"py-20 md:py-28",
            "textAlign":"text-center"
        }'::jsonb,
        10, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 2 — Society Overview (Official Legal Basis)
    -- sort_order: 20
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-overview-section', '{}'::jsonb,
        '{
            "headingAr": "نظرة عامة عن الجمعية",
            "headingEn": "Society Overview",
            "paragraphsAr": [
                "تُشهَّر الجمعية في محافظة دمشق باسم «جمعية علوم التربة السورية»، وتتناول نشاطها كافة أراضي الجمهورية العربية السورية وفق أحكام قانون الجمعيات والمؤسسات الخاصة رقم 93 لعام 1958 والقرار الجمهوري رقم 9/9 لعام 2025.",
                "يقع مقر الجمعية في مدينة دمشق — كلية الهندسة الزراعية في جامعة دمشق. العنوان الإلكتروني: a.karimjaafar@gmail.com",
                "تُصنَّف الجمعية ضمن أربعة مجالات رئيسية: البيئة — التعليم والتمكين — التنمية والإسكان — الثقافة والرياضة والتسلية والفنون."
            ],
            "paragraphsEn": [
                "The Society is registered in Damascus governorate under the name «Soil Science Society of Syria», and its activities cover the entire territory of the Syrian Arab Republic in accordance with Law No. 93 of 1958 on Associations and Private Institutions, and Presidential Decree No. 9/9 of 2025.",
                "The Society''s headquarters is located in Damascus — Faculty of Agricultural Engineering, University of Damascus. Email: a.karimjaafar@gmail.com",
                "The Society is classified under four main fields: Environment — Education & Empowerment — Development & Housing — Culture, Sports, Recreation & Arts."
            ],
            "classificationsAr": ["البيئة", "التعليم والتمكين", "التنمية والإسكان", "الثقافة والرياضة والفنون"],
            "classificationsEn": ["Environment", "Education & Empowerment", "Development & Housing", "Culture, Sports & Arts"]
        }'::jsonb,
        '{
            "backgroundColor":"bg-white",
            "padding":"py-16 md:py-20"
        }'::jsonb,
        20, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 3 — Official Founding Decree Image
    -- sort_order: 30
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-decree-section', '{}'::jsonb,
        '{
            "headingAr": "وثيقة التأسيس الرسمية",
            "headingEn": "Official Founding Decree",
            "captionAr": "القرار رقم 1054.7 الصادر عن وزارة الشؤون الاجتماعية والعمل — دمشق، 2025",
            "captionEn": "Decree No. 1054.7 issued by the Ministry of Social Affairs and Labour — Damascus, 2025",
            "imageUrl":  "/images/founding-decree.jpg",
            "imageAlt":  "Official founding decree of the Soil Science Society of Syria"
        }'::jsonb,
        '{
            "backgroundColor":"bg-gray-50",
            "padding":"py-14 md:py-18"
        }'::jsonb,
        30, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 4 — 10 Objectives (Article 3 / مادة 3)
    -- sort_order: 40
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-objectives-section', '{}'::jsonb,
        '{
            "headingAr": "الأهداف والنشاط الرئيسي",
            "headingEn": "Objectives & Core Activities",
            "subheadingAr": "المادة 3 من النظام الداخلي — أهداف الجمعية العشرة",
            "subheadingEn": "Article 3 of the Internal Bylaws — Ten Society Objectives",
            "objectives": [
                {
                    "numberAr": "١",
                    "numberEn": "1",
                    "icon": "🌱",
                    "titleAr": "حماية الموارد الطبيعية",
                    "titleEn": "Protecting Natural Resources",
                    "bodyAr": "المساهمة في حماية الموارد الطبيعية ودعم التنمية المستدامة.",
                    "bodyEn": "Contributing to the protection of natural resources and supporting sustainable development."
                },
                {
                    "numberAr": "٢",
                    "numberEn": "2",
                    "icon": "🌍",
                    "titleAr": "حماية التربة السورية",
                    "titleEn": "Protecting Syrian Soil",
                    "bodyAr": "المساهمة في حماية التربة السورية والحد من تدهورها.",
                    "bodyEn": "Contributing to the protection of Syrian soil and combating its degradation."
                },
                {
                    "numberAr": "٣",
                    "numberEn": "3",
                    "icon": "🔬",
                    "titleAr": "تعزيز البحث العلمي",
                    "titleEn": "Promoting Scientific Research",
                    "bodyAr": "المساهمة في تعزيز البحث العلمي في مجالات علوم التربة والبيئة والتنمية المستدامة، ودعم الدراسات الأكاديمية والتطبيقية التي تسهم في مواجهة التغير المناخي وحماية الموارد الطبيعية.",
                    "bodyEn": "Promoting scientific research in soil science, environment, and sustainable development, supporting academic and applied studies addressing climate change and natural resource protection."
                },
                {
                    "numberAr": "٤",
                    "numberEn": "4",
                    "icon": "📚",
                    "titleAr": "النشر العلمي",
                    "titleEn": "Scientific Publishing",
                    "bodyAr": "المساهمة في إصدار ونشر الكتب والدوريات العلمية باللغتين العربية والإنجليزية وتوثيق ونشر المعرفة العلمية وإبراز الإنجازات المحلية بعد أخذ الموافقات اللازمة.",
                    "bodyEn": "Publishing books and scientific journals in Arabic and English, documenting and disseminating scientific knowledge, and highlighting local achievements after obtaining necessary approvals."
                },
                {
                    "numberAr": "٥",
                    "numberEn": "5",
                    "icon": "🎓",
                    "titleAr": "بناء القدرات الوطنية",
                    "titleEn": "Building National Capacity",
                    "bodyAr": "المساهمة في بناء قدرات الكوادر الوطنية من باحثين وطلاب ومزارعين ومجتمعات محلية عبر التدريب المستمر والدورات التعليمية المتخصصة.",
                    "bodyEn": "Building the capacity of national cadres — researchers, students, farmers, and local communities — through continuous training and specialized educational courses."
                },
                {
                    "numberAr": "٦",
                    "numberEn": "6",
                    "icon": "🏫",
                    "titleAr": "تطوير العملية التعليمية",
                    "titleEn": "Developing Education",
                    "bodyAr": "المساهمة في تطوير العملية التعليمية في جميع مستوياتها — التعليم الأساسي والثانوي وتعليم الكبار والتعليم العالي والدراسات العليا — من خلال إعداد برامج مساعدة ومناهج تعليمية مع الجامعات والمعاهد.",
                    "bodyEn": "Developing education at all levels — basic, secondary, adult education, higher education, and postgraduate studies — through supportive programs and curricula developed with universities and institutes."
                },
                {
                    "numberAr": "٧",
                    "numberEn": "7",
                    "icon": "💼",
                    "titleAr": "التمكين الاقتصادي والاجتماعي",
                    "titleEn": "Economic & Social Empowerment",
                    "bodyAr": "الإسهام في تمكين المجتمعات اقتصادياً واجتماعياً عبر دعم المشاريع الصغيرة والمتوسطة، وتنمية المهارات المهنية، وخلق فرص عمل جديدة خاصة للشباب والنساء والفئات الهشة.",
                    "bodyEn": "Empowering communities economically and socially through supporting small and medium enterprises, developing professional skills, and creating new employment opportunities especially for youth, women, and vulnerable groups."
                },
                {
                    "numberAr": "٨",
                    "numberEn": "8",
                    "icon": "🏘️",
                    "titleAr": "التنمية والإسكان",
                    "titleEn": "Development & Housing",
                    "bodyAr": "المساهمة في دعم مشاريع التنمية والإسكان وتحسين البيئة العمرانية والسكنية وتشجيع الحلول المستدامة في التخطيط الحضري وإعادة الإعمار.",
                    "bodyEn": "Supporting development and housing projects, improving the urban and residential environment, and encouraging sustainable solutions in urban planning and reconstruction."
                },
                {
                    "numberAr": "٩",
                    "numberEn": "9",
                    "icon": "🌿",
                    "titleAr": "التوعية البيئية",
                    "titleEn": "Environmental Awareness",
                    "bodyAr": "المساهمة في نشر التوعية البيئية والمجتمعية بأهمية التربة والموارد الطبيعية كركيزة لتحقيق الأمن الغذائي وضمان التوازن البيئي.",
                    "bodyEn": "Promoting environmental and community awareness of the importance of soil and natural resources as a cornerstone for achieving food security and environmental balance."
                },
                {
                    "numberAr": "١٠",
                    "numberEn": "10",
                    "icon": "🤝",
                    "titleAr": "الشراكة والتعاون الدولي",
                    "titleEn": "Partnerships & International Cooperation",
                    "bodyAr": "المساهمة في إقامة مراكز أبحاث وتعاون مع الجامعات والمنظمات المحلية والدولية وتبادل الخبرات بعد أخذ الموافقات اللازمة.",
                    "bodyEn": "Establishing research centers and cooperation with local and international universities and organizations, exchanging expertise after obtaining necessary approvals."
                }
            ]
        }'::jsonb,
        '{
            "backgroundColor":"bg-green-50",
            "padding":"py-16 md:py-20"
        }'::jsonb,
        40, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 5 — Membership Types & Conditions
    -- sort_order: 50
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-membership-section', '{}'::jsonb,
        '{
            "headingAr": "العضوية",
            "headingEn": "Membership",
            "subheadingAr": "المادة 4 — أنواع العضوية وحقوقها",
            "subheadingEn": "Article 4 — Membership Types and Rights",
            "membershipTypes": [
                {
                    "icon": "👤",
                    "titleAr": "العضو العامل",
                    "titleEn": "Working Member",
                    "descAr": "يقبل كتابةً النظام الداخلي للجمعية ويلتزم بتسديد رسوم الانتساب والاشتراك، ويحق له حضور اجتماعات الهيئة العامة والتصويت.",
                    "descEn": "Accepts the bylaws in writing, pays registration and subscription fees, and is entitled to attend and vote in General Assembly meetings."
                },
                {
                    "icon": "🤲",
                    "titleAr": "العضو المؤازر",
                    "titleEn": "Supporting Member",
                    "descAr": "يرغب بتقديم الدعم المادي أو المعنوي أو كليهما، وليس له حق حضور اجتماعات الهيئة العامة.",
                    "descEn": "Wishes to provide financial or moral support (or both), without the right to attend General Assembly meetings."
                },
                {
                    "icon": "🏅",
                    "titleAr": "عضو الشرف",
                    "titleEn": "Honorary Member",
                    "descAr": "تمنحه الجمعية هذه الصفة تقديراً للخدمات الجليلة التي أسداها لها.",
                    "descEn": "Granted by the Society in recognition of outstanding services rendered to it."
                }
            ],
            "conditionsHeadingAr": "شروط العضوية",
            "conditionsHeadingEn": "Membership Conditions",
            "conditionsAr": [
                "ألا يكون محكوماً بجناية أو بجنحة شائنة",
                "أن يكون حسن السلوك والسيرة",
                "أن يكون مقيماً داخل أراضي الجمهورية العربية السورية",
                "أن يتجاوز الثامنة عشر من العمر",
                "أن يقبل كتابةً نظام الجمعية",
                "أن يتقدم بطلب للانتساب مرفقاً برسم الانتساب",
                "أن يكون حاملاً لشهادة المعهد الزراعي كحد أدنى"
            ],
            "conditionsEn": [
                "Not convicted of a felony or a disgraceful misdemeanor",
                "Must be of good conduct and character",
                "Must be a resident within the Syrian Arab Republic",
                "Must be over eighteen years of age",
                "Must have accepted the Society''s bylaws in writing",
                "Must submit a membership application with the registration fee",
                "Must hold at minimum an agricultural institute certificate"
            ],
            "feesAr": "رسم الانتساب: 300,000 ل.س — رسم الاشتراك السنوي: 100,000 ل.س",
            "feesEn": "Registration fee: SYP 300,000 — Annual subscription fee: SYP 100,000"
        }'::jsonb,
        '{
            "backgroundColor":"bg-white",
            "padding":"py-16 md:py-20"
        }'::jsonb,
        50, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 6 — Governance Structure (Board of Directors)
    -- sort_order: 60
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-governance-section', '{}'::jsonb,
        '{
            "headingAr": "الهيكل التنظيمي",
            "headingEn": "Governance Structure",
            "introAr": "تُدار الجمعية من خلال هيئة عامة تضم جميع الأعضاء العاملين الملتزمين، وتنتخب مجلس إدارة مؤلف من 7 أعضاء لمدة سنتين قابلة للتجديد.",
            "introEn": "The Society is governed by a General Assembly of all compliant active members, which elects a Board of Directors of 7 members for a renewable two-year term.",
            "roles": [
                {
                    "icon": "👑",
                    "titleAr": "الرئيس",
                    "titleEn": "President",
                    "descAr": "يمثل الجمعية أمام القضاء وفي علاقاتها مع الجمهور والدوائر الرسمية، وهو آمر الصرف في جميع نفقات الجمعية.",
                    "descEn": "Represents the Society before courts and in its relations with the public and official bodies; is the payment authorizing officer."
                },
                {
                    "icon": "🤝",
                    "titleAr": "نائب الرئيس",
                    "titleEn": "Vice President",
                    "descAr": "يقوم بمهام الرئيس أثناء غيابه وبكل عمل يسنده إليه.",
                    "descEn": "Performs the President''s duties during absence and any other duties assigned."
                },
                {
                    "icon": "📝",
                    "titleAr": "أمين السر",
                    "titleEn": "Secretary General",
                    "descAr": "يدوّن محاضر الاجتماعات، ويحرر الدعوات، ويستلم المراسلات، ويحفظ السجلات والأختام.",
                    "descEn": "Records meeting minutes, drafts invitations, manages correspondence, and safeguards records and seals."
                },
                {
                    "icon": "💰",
                    "titleAr": "أمين الصندوق",
                    "titleEn": "Treasurer",
                    "descAr": "يشرف على الرسوم والمبالغ الواردة، يؤدي النفقات، ويقدم تقريراً مالياً شهرياً لمجلس الإدارة.",
                    "descEn": "Oversees fees and incoming funds, authorizes expenditures, and presents a monthly financial report to the Board."
                },
                {
                    "icon": "🧑‍⚖️",
                    "titleAr": "أعضاء المجلس",
                    "titleEn": "Board Members",
                    "descAr": "ثلاثة أعضاء إضافيون تنتخبهم الهيئة العامة للمشاركة في قرارات إدارة الجمعية وتشكيل اللجان اللازمة.",
                    "descEn": "Three additional elected members participating in governance decisions and forming required committees."
                }
            ],
            "boardSizeAr": "عدد أعضاء مجلس الإدارة: 7 أعضاء (عدد فردي، الحد الأدنى 5)",
            "boardSizeEn": "Board size: 7 members (odd number, minimum 5)",
            "termAr": "مدة الولاية: سنتان قابلة للتجديد",
            "termEn": "Term: 2 years, renewable",
            "electionsAr": "الانتخابات: سرية ومباشرة في اجتماع الهيئة العامة السنوي",
            "electionsEn": "Elections: Secret and direct during the annual General Assembly meeting"
        }'::jsonb,
        '{
            "backgroundColor":"bg-green-50",
            "padding":"py-16 md:py-20"
        }'::jsonb,
        60, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    -- =========================================================================
    -- SECTION 7 — Founding Members Table (Article 56 / مادة 56)
    -- sort_order: 70
    -- =========================================================================
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), about_id, 'about-founders-section', '{}'::jsonb,
        '{
            "headingAr": "الأعضاء المؤسسون",
            "headingEn": "Founding Members",
            "subheadingAr": "المادة 56 — أعضاء مجلس الإدارة المؤسسون",
            "subheadingEn": "Article 56 — Founding Board Members",
            "introAr": "تأسست الجمعية بجهود أحد عشر عضواً مؤسساً، جميعهم حاملون لشهادة الدكتوراه في الهندسة الزراعية من جامعات سورية.",
            "introEn": "The Society was founded by eleven founding members, all holding PhDs in Agricultural Engineering from Syrian universities.",
            "founders": [
                {
                    "nameAr": "عبد الكريم أحمد جعفر",
                    "nameEn": "Abdulkarim Ahmad Jaafar",
                    "birthplaceAr": "الرقة",
                    "birthplaceEn": "Al-Raqqa",
                    "birthdate": "30/06/1981",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "رئيس الجمعية — مؤسس",
                    "roleEn": "President — Founding Member",
                    "residenceAr": "دمشق، مساكن برزة، جانب كلية الزراعة",
                    "residenceEn": "Damascus, Barzeh, near Faculty of Agriculture",
                    "phone": "0993170794"
                },
                {
                    "nameAr": "سليمان محمود سليم",
                    "nameEn": "Suleiman Mahmoud Salim",
                    "birthplaceAr": "اليرموك",
                    "birthplaceEn": "Al-Yarmouk",
                    "birthdate": "01/10/1966",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "نائب رئيس الجمعية — مؤسس",
                    "roleEn": "Vice President — Founding Member",
                    "residenceAr": "ريف دمشق — صحنايا",
                    "residenceEn": "Rural Damascus — Sahnaya",
                    "phone": "0952425381"
                },
                {
                    "nameAr": "أكرم محمد البلخي",
                    "nameEn": "Akram Mohammad Al-Balkhi",
                    "birthplaceAr": "محجة",
                    "birthplaceEn": "Mahajjeh",
                    "birthdate": "06/10/1971",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مجلس — مؤسس",
                    "roleEn": "Board Member — Founding Member",
                    "residenceAr": "دمشق، مساكن برزة، جانب كلية الزراعة",
                    "residenceEn": "Damascus, Barzeh, near Faculty of Agriculture",
                    "phone": "0966296815"
                },
                {
                    "nameAr": "محمود أنيس عودة",
                    "nameEn": "Mahmoud Anis Oudeh",
                    "birthplaceAr": "سكرة",
                    "birthplaceEn": "Sukkarah",
                    "birthdate": "06/12/1956",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مؤسس",
                    "roleEn": "Founding Member",
                    "residenceAr": "حمص — سكرة الغربية",
                    "residenceEn": "Homs — West Sukkarah",
                    "phone": "0944893467"
                },
                {
                    "nameAr": "حيدر هاشم الحسن",
                    "nameEn": "Haidar Hashem Al-Hassan",
                    "birthplaceAr": "كفرعبده",
                    "birthplaceEn": "Kfar-Abda",
                    "birthdate": "01/01/1976",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مؤسس",
                    "roleEn": "Founding Member",
                    "residenceAr": "حمص — كرم اللوز",
                    "residenceEn": "Homs — Karm Al-Loz",
                    "phone": "0932448989"
                },
                {
                    "nameAr": "لؤي محمود الرفاعي",
                    "nameEn": "Luay Mahmoud Al-Rifai",
                    "birthplaceAr": "يبرود",
                    "birthplaceEn": "Yabroud",
                    "birthdate": "10/08/1986",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "أمين الصندوق — مؤسس",
                    "roleEn": "Treasurer — Founding Member",
                    "residenceAr": "ريف دمشق — صحنايا",
                    "residenceEn": "Rural Damascus — Sahnaya",
                    "phone": "0994513509"
                },
                {
                    "nameAr": "محمد منهل عوض الحسين الزعبي",
                    "nameEn": "Mohammad Manhal Awad Al-Zoubi",
                    "birthplaceAr": "درعا المحطة",
                    "birthplaceEn": "Daraa Al-Mahatta",
                    "birthdate": "19/11/1971",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مجلس — مؤسس",
                    "roleEn": "Board Member — Founding Member",
                    "residenceAr": "ريف دمشق — داريا",
                    "residenceEn": "Rural Damascus — Darayya",
                    "phone": "0933334783"
                },
                {
                    "nameAr": "علاء حسن خلوف",
                    "nameEn": "Alaa Hassan Khalouf",
                    "birthplaceAr": "حمص",
                    "birthplaceEn": "Homs",
                    "birthdate": "07/12/1983",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "أمين السر — مؤسس",
                    "roleEn": "Secretary General — Founding Member",
                    "residenceAr": "دمشق — المدينة القديمة",
                    "residenceEn": "Damascus — Old City",
                    "phone": "0934451168"
                },
                {
                    "nameAr": "محمد سعيد محمد ديب الشاطر",
                    "nameEn": "Mohammad Saeed Al-Shater",
                    "birthplaceAr": "دمشق",
                    "birthplaceEn": "Damascus",
                    "birthdate": "06/06/1950",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مجلس — مؤسس",
                    "roleEn": "Board Member — Founding Member",
                    "residenceAr": "دمشق — برامكة",
                    "residenceEn": "Damascus — Barmakeh",
                    "phone": ""
                },
                {
                    "nameAr": "عمر عبد الله عبد الرزاق",
                    "nameEn": "Omar Abdullah Abd Al-Razzaq",
                    "birthplaceAr": "الميادين",
                    "birthplaceEn": "Mayadin",
                    "birthdate": "23/04/1962",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مؤسس",
                    "roleEn": "Founding Member",
                    "residenceAr": "دير الزور — فيلات البلدية",
                    "residenceEn": "Deir ez-Zor — Municipal Villas",
                    "phone": "0944984574"
                },
                {
                    "nameAr": "محمد حسام بهلوان",
                    "nameEn": "Mohammad Hussam Bahlawan",
                    "birthplaceAr": "حلب",
                    "birthplaceEn": "Aleppo",
                    "birthdate": "03/02/1964",
                    "qualificationAr": "دكتوراه هندسة زراعية",
                    "qualificationEn": "PhD in Agricultural Engineering",
                    "roleAr": "عضو مؤسس",
                    "roleEn": "Founding Member",
                    "residenceAr": "حلب — الشهباء الجديدة، شارع الغزالي",
                    "residenceEn": "Aleppo — New Shahba, Al-Ghazali Street",
                    "phone": "0944984574"
                }
            ]
        }'::jsonb,
        '{
            "backgroundColor":"bg-white",
            "padding":"py-16 md:py-20"
        }'::jsonb,
        70, 'ALWAYS', true, 'fade-in', NOW(), NOW()
    );

    RAISE NOTICE 'V68: About Us page seeded successfully with 7 sections from official bylaws.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'V68 error: %', SQLERRM;
END $$;
