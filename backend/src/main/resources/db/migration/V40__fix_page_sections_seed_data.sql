-- =============================================================================
-- V40: Fix page section seed data — replace content-string key references
--      with real text values so the block builder PropertyPanel shows content.
--
-- Background:
--   V29 seeded page_sections rows with data like {"titleKey":"about.hero.title"}
--   instead of the actual text.  The block builder reads block.props directly
--   (no useContentStrings context), so those key references appear as empty fields
--   in the PropertyPanel.
--
--   This migration:
--   1. Updates page_sections data columns with real bilingual text values.
--   2. Clears layout_json on the affected pages so the admin builder re-migrates
--      from the corrected page_sections rows on next open.
-- =============================================================================

-- ── About page ────────────────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "About the Syrian Soil Science Society",
  "titleAr":  "عن الجمعية السورية لعلوم التربة",
  "subtitle": "Learn about our society, our history, and our commitment to advancing soil science in Syria.",
  "subtitleAr":"تعرّف على جمعيتنا وتاريخها والتزامنا بتطوير علوم التربة في سوريا."
}'::jsonb
WHERE component_type = 'about-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":   "Society Overview",
  "headingAr": "نظرة عامة",
  "paragraphs": [
    {
      "textEn": "The Syrian Soil Science Society (SSSSY) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria. Founded in 2008, the society brings together researchers, educators, students, and practitioners working in soil science and related environmental fields.",
      "textAr": "الجمعية السورية لعلوم التربة (ج.س.ع.ت) هي منظمة مهنية غير ربحية مكرسة لتطوير علوم التربة في سوريا. تأسست عام 2008، وتجمع الباحثين والمعلمين والطلاب والممارسين العاملين في علوم التربة والمجالات البيئية ذات الصلة."
    },
    {
      "textEn": "SSSSY serves as a platform for knowledge exchange, scientific collaboration, and professional development. Through conferences, workshops, publications, and outreach programs, the society promotes sustainable soil management practices.",
      "textAr": "تعمل الجمعية كمنصة لتبادل المعرفة والتعاون العلمي والتطوير المهني، وتعزز ممارسات الإدارة المستدامة للتربة من خلال المؤتمرات والورش والمنشورات."
    }
  ]
}'::jsonb
WHERE component_type = 'about-overview-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":    "Vision, Mission & Objectives",
  "headingAr":  "الرؤية والرسالة والأهداف",
  "subheading": "Our guiding principles that shape every initiative and program we undertake.",
  "subheadingAr":"مبادئنا التوجيهية التي تشكّل كل مبادرة وبرنامج نضطلع به.",
  "panels": [
    {
      "icon": "Target",
      "titleEn":   "Our Vision",
      "titleAr":   "رؤيتنا",
      "contentEn": "To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.",
      "contentAr": "أن نكون السلطة العلمية الرائدة في علوم التربة في سوريا والمنطقة.",
      "gradientClass": "from-forest to-forest-light"
    },
    {
      "icon": "Eye",
      "titleEn":   "Our Mission",
      "titleAr":   "رسالتنا",
      "contentEn": "To advance soil science through research, education, and advocacy, promoting sustainable land use practices.",
      "contentAr": "تعزيز علوم التربة من خلال البحث والتعليم والمناصرة.",
      "gradientClass": "from-soil-clay to-soil-dark"
    },
    {
      "icon": "List",
      "titleEn":   "Our Objectives",
      "titleAr":   "أهدافنا",
      "contentEn": "Promote research, facilitate knowledge exchange, support education and training, advocate for soil-friendly policies.",
      "contentAr": "تعزيز البحث، تسهيل تبادل المعرفة، دعم التعليم، والمناصرة من أجل سياسات صديقة للتربة.",
      "gradientClass": "from-forest-light to-forest"
    }
  ]
}'::jsonb
WHERE component_type = 'about-vision-mission-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":   "Organizational Structure",
  "headingAr": "الهيكل التنظيمي",
  "paragraphs": [
    {
      "textEn": "The society is governed by a General Assembly comprising all active members, which elects a Board of Directors for a four-year term.",
      "textAr": "تُدار الجمعية من خلال جمعية عمومية تضم جميع الأعضاء النشطين، وتنتخب مجلس إدارة لمدة أربع سنوات."
    },
    {
      "textEn": "The Board consists of a President, Vice President, Secretary, Treasurer, and several committee chairs representing key areas.",
      "textAr": "يتألف المجلس من رئيس ونائب رئيس وأمين سر وأمين صندوق ورؤساء لجان يمثلون المجالات الرئيسية."
    }
  ]
}'::jsonb
WHERE component_type = 'about-organizational-chart-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":    "Our Journey",
  "headingAr":  "مسيرتنا",
  "subheading": "Key milestones in the history of the Syrian Soil Science Society.",
  "subheadingAr":"أبرز المحطات في تاريخ الجمعية السورية لعلوم التربة.",
  "items": [
    { "year": "2008", "titleEn": "Society Founded",       "titleAr": "تأسيس الجمعية",        "descEn": "SSSSY was established by a group of soil scientists and researchers.", "descAr": "تأسست الجمعية على يد مجموعة من علماء التربة والباحثين." },
    { "year": "2012", "titleEn": "First Conference",      "titleAr": "أول مؤتمر",             "descEn": "The first national soil science conference was held in Damascus.", "descAr": "عُقد أول مؤتمر وطني لعلوم التربة في دمشق." },
    { "year": "2018", "titleEn": "Research Journal",      "titleAr": "مجلة البحث العلمي",     "descEn": "Launched the Syrian Journal of Soil Science, a peer-reviewed publication.", "descAr": "إطلاق المجلة السورية لعلوم التربة، وهي مجلة محكّمة." },
    { "year": "2024", "titleEn": "Digital Transformation","titleAr": "التحول الرقمي",          "descEn": "Migrated to a digital platform for publications, events, and member services.", "descAr": "الانتقال إلى منصة رقمية للمنشورات والفعاليات وخدمات الأعضاء." }
  ]
}'::jsonb
WHERE component_type = 'about-timeline-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":   "Downloadable Documents",
  "headingAr": "الوثائق القابلة للتنزيل",
  "documents": [
    { "labelEn": "SSSSY Bylaws",          "labelAr": "النظام الأساسي للجمعية",   "url": "/bylaws.pdf",             "fileType": "PDF" },
    { "labelEn": "Annual Report 2024",    "labelAr": "التقرير السنوي 2024",      "url": "/annual-report-2024.pdf", "fileType": "PDF" },
    { "labelEn": "Membership Form",       "labelAr": "نموذج العضوية",             "url": "/membership-form.pdf",    "fileType": "PDF" },
    { "labelEn": "Strategic Plan 2024-28","labelAr": "الخطة الاستراتيجية 2024-28","url": "/strategic-plan.pdf",    "fileType": "PDF" }
  ]
}'::jsonb
WHERE component_type = 'about-documents-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

UPDATE page_sections
SET data = '{
  "heading":    "Photo Gallery",
  "headingAr":  "معرض الصور",
  "subheading": "A glimpse into our events, conferences, and field activities.",
  "subheadingAr":"لمحة من فعالياتنا ومؤتمراتنا وأنشطتنا الميدانية.",
  "images": []
}'::jsonb
WHERE component_type = 'about-gallery-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'about');

-- ── Board page ────────────────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "Board of Directors",
  "titleAr":  "مجلس الإدارة",
  "subtitle": "Meet the dedicated leaders guiding our society.",
  "subtitleAr":"تعرّف على القادة المتفانين الذين يقودون جمعيتنا."
}'::jsonb
WHERE component_type = 'board-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'board');

UPDATE page_sections
SET data = '{
  "heading":    "Board Leadership",
  "headingAr":  "قيادة المجلس",
  "subheading": "Our leadership team",
  "subheadingAr":"فريق القيادة لدينا",
  "showAllMembers": true
}'::jsonb
WHERE component_type = 'board-members-grid'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'board');

UPDATE page_sections
SET data = '{
  "heading":   "Our Current Term",
  "headingAr": "دورتنا الحالية",
  "paragraphs": [
    {
      "textEn": "The current board serves a 3-year term from 2024 to 2027, dedicated to advancing the society''s mission.",
      "textAr": "يخدم المجلس الحالي لفترة 3 سنوات من 2024 إلى 2027، مكرساً لتطوير مهمة الجمعية."
    },
    {
      "textEn": "The next board election will be held in early 2027. All active members are eligible to vote.",
      "textAr": "ستُعقد انتخابات المجلس القادمة في مطلع عام 2027. يحق لجميع الأعضاء الفاعلين التصويت."
    }
  ]
}'::jsonb
WHERE component_type = 'board-term-information-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'board');

-- ── Contact page ──────────────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "Contact Us",
  "titleAr":  "اتصل بنا",
  "subtitle": "Have a question or want to collaborate? We''d love to hear from you.",
  "subtitleAr":"هل لديك سؤال أو تريد التعاون؟ يسعدنا التواصل معك."
}'::jsonb
WHERE component_type = 'contact-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'contact');

UPDATE page_sections
SET data = '{
  "heading":    "Send Us a Message",
  "headingAr":  "أرسل لنا رسالة",
  "showPhone":   true,
  "showSubject": true
}'::jsonb
WHERE component_type = 'contact-form-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'contact');

-- ── Newsletter page ───────────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "Stay Connected",
  "titleAr":  "ابقَ على تواصل",
  "subtitle": "Subscribe to receive the latest news and updates from our society.",
  "subtitleAr":"اشترك لتلقّي آخر الأخبار والتحديثات من جمعيتنا."
}'::jsonb
WHERE component_type = 'newsletter-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'newsletter');

-- ── President message page ────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "Message from the President",
  "titleAr":  "رسالة الرئيس",
  "subtitle": "A message from our president about our mission and vision.",
  "subtitleAr":"رسالة من رئيسنا حول مهمتنا ورؤيتنا."
}'::jsonb
WHERE component_type = 'president-message-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'president-message');

UPDATE page_sections
SET data = '{
  "heading":        "President''s Message",
  "headingAr":      "رسالة الرئيس",
  "presidentName":  "Dr. Ahmad Al-Rifai",
  "presidentNameAr":"د. أحمد الرفاعي",
  "presidentTitle": "President of the Syrian Soil Science Society",
  "presidentTitleAr":"رئيس الجمعية السورية لعلوم التربة",
  "paragraphs": [
    {
      "textEn": "Dear Members, Colleagues, and Friends of the Syrian Soil Science Society, it is with great pride and enthusiasm that I welcome you to our society.",
      "textAr": "أعزاء الأعضاء والزملاء وأصدقاء الجمعية السورية لعلوم التربة، يسعدني بكل فخر وحماس الترحيب بكم في جمعيتنا."
    },
    {
      "textEn": "Our mission is to advance soil science research, education, and sustainable land management across Syria and the region.",
      "textAr": "تتمثل مهمتنا في تعزيز البحث في علوم التربة والتعليم وإدارة الأراضي المستدامة في سوريا والمنطقة."
    }
  ]
}'::jsonb
WHERE component_type = 'president-message-content-section'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'president-message');

-- ── Publications page ─────────────────────────────────────────────────────────

UPDATE page_sections
SET data = '{
  "title":    "Our Publications",
  "titleAr":  "منشوراتنا",
  "subtitle": "Explore our research papers, reports, and knowledge resources.",
  "subtitleAr":"استعرض أوراقنا البحثية وتقاريرنا ومصادر المعرفة."
}'::jsonb
WHERE component_type = 'publications-hero-banner'
  AND page_id IN (SELECT id FROM pages WHERE slug = 'publications');

-- ── Clear stale layout_json so builder re-migrates from corrected sections ────
-- This forces a fresh migration on next admin open, so props pick up the new values.

UPDATE pages
SET layout_json = NULL
WHERE slug IN ('about', 'board', 'contact', 'newsletter', 'president-message', 'publications')
  AND layout_json IS NOT NULL;
