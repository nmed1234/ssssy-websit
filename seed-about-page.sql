-- Seed About Page Content Strings and Page Sections
BEGIN;

-- Insert About Page Content Strings
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  -- About Hero Banner
  (gen_random_uuid(), 'about.hero.arabicHeading', 'من نحن', 'من نحن', 'about', 'About page hero arabic heading'),
  (gen_random_uuid(), 'about.hero.heading', 'About Us', 'عن الجمعية', 'about', 'About page hero main heading'),
  (gen_random_uuid(), 'about.hero.description', 'Learn about our society, our history, and our commitment to advancing soil science in Syria.', 'تعرف على جمعيتنا وتاريخنا والتزامنا بتطوير علوم التربة في سوريا.', 'about', 'About page hero description'),
  -- About Overview Section
  (gen_random_uuid(), 'about.overview.heading', 'Society Overview', 'نظرة عامة على الجمعية', 'about', 'About overview section heading'),
  (gen_random_uuid(), 'about.overview.paragraph1', 'The Syrian Soil Science Society (SSSSY) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria. Founded in 2008, the society brings together researchers, educators, students, and practitioners working in soil science and related environmental fields.', 'الجمعية السورية لعلوم التربة (SSSSY) هي منظمة علمية مهنية غير ربحية مكرسة لتطوير علوم التربة في سوريا. تأسست عام 2008، وتجمع الجمعية الباحثين والمعلمين والطلاب والممارسين العاملين في علوم التربة والمناهج البيئية ذات الصلة.', 'about', 'About overview first paragraph'),
  (gen_random_uuid(), 'about.overview.paragraph2', 'SSSSY serves as a platform for knowledge exchange, scientific collaboration, and professional development. Through conferences, workshops, publications, and outreach programs, the society promotes sustainable soil management practices and advocates for policies that protect and enhance Syria''s soil resources.', 'تخدم الجمعية كمنصة لتبادل المعرفة والتعاون العلمي والتطوير المهني. من خلال المؤتمرات وورش العمل والمنشورات والبرامج التوعية، تعزز الجمعية ممارسات إدارة التربة المستدامة وتدافع عن السياسات التي تحمي وتعزز موارد التربة في سوريا.', 'about', 'About overview second paragraph'),
  (gen_random_uuid(), 'about.overview.paragraph3', 'The society is committed to building capacity among young scientists, fostering interdisciplinary research, and raising public awareness about the critical role of soil in food security, environmental sustainability, and climate resilience. Over the past decade, SSSSY has grown into a respected institution both nationally and regionally, with a network of over 500 members across Syria and the Middle East.', 'تلتزم الجمعية ببناء القدرات بين العلماء الشباب وتعزيز البحث متعدد التخصصات وزيادة الوعي العام بالدور الحاسم للتربة في الأمن الغذائي والاستدامة البيئية ومقاومة المناخ. على مدار العقد الماضي، نمت الجمعية لتصبح مؤسسة محترمة على المستوى الوطني والاقليمي، مع شبكة تضم أكثر من 500 عضو في سوريا والشرق الأوسط.', 'about', 'About overview third paragraph'),
  -- About Vision Mission Section
  (gen_random_uuid(), 'about.visionMission.heading', 'Vision, Mission & Objectives', 'الرؤية والرسالة والأهداف', 'about', 'Vision mission section heading'),
  (gen_random_uuid(), 'about.visionMission.subheading', 'Our guiding principles that shape every initiative and program we undertake.', 'مبادئنا الإرشادية التي تشكل كل مبادرة وبرنامج ننفذه.', 'about', 'Vision mission section subheading'),
  (gen_random_uuid(), 'about.visionMission.visionTitle', 'Our Vision', 'رؤيتنا', 'about', 'Vision card title'),
  (gen_random_uuid(), 'about.visionMission.visionDescription', 'To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably for the benefit of people and the environment.', 'أن نكون المرجع العلمي الرائد في علوم التربة في سوريا والمنطقة، لخلق مستقبل تُدار فيه التربة بشكل مستدام لفائدة البشر والبيئة.', 'about', 'Vision card description'),
  (gen_random_uuid(), 'about.visionMission.missionTitle', 'Our Mission', 'رسالتنا', 'about', 'Mission card title'),
  (gen_random_uuid(), 'about.visionMission.missionDescription', 'To advance soil science through research, education, and advocacy, promoting sustainable land use practices that enhance agricultural productivity, environmental quality, and human well-being.', 'تطوير علوم التربة من خلال البحث والتعليم والدعوة، وتعزيز ممارسات الاستخدام المستدام للأراضي التي تعزز الإنتاجية الزراعية والجودة البيئية ورفاهية البشر.', 'about', 'Mission card description'),
  (gen_random_uuid(), 'about.visionMission.objectivesTitle', 'Our Objectives', 'أهدافنا', 'about', 'Objectives card title'),
  (gen_random_uuid(), 'about.visionMission.objectivesDescription', '1) Promote soil research and innovation. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies. 5) Build partnerships with national and international organizations.', '1) تعزيز البحث والابتكار في التربة. 2) تسهيل تبادل المعرفة. 3) دعم التعليم والتدريب. 4) الدعوة إلى سياسات صديقة للتربة. 5) بناء شراكات مع منظمات وطنية ودولية.', 'about', 'Objectives card description'),
  -- About Organizational Chart Section
  (gen_random_uuid(), 'about.orgChart.heading', 'Organizational Structure', 'الهيكل التنظيمي', 'about', 'Organizational chart section heading'),
  (gen_random_uuid(), 'about.orgChart.paragraph1', 'The society is governed by a General Assembly comprising all active members, which elects a Board of Directors for a four-year term. The Board is responsible for setting strategic direction, overseeing operations, and managing the society''s finances and programs.', 'تُدار الجمعية من قبل الجمعية العامة التي تشمل جميع الأعضاء النشطين، والتي تختار مجلس إدارة لمدة أربع سنوات. يتحمل المجلس المسؤولية عن وضع التوجه الاستراتيجي والمراقبة للعمليات وإدارة شؤون الجمعية المالية والبرامج.', 'about', 'Organizational chart section first paragraph'),
  (gen_random_uuid(), 'about.orgChart.paragraph2', 'The Board consists of a President, Vice President, Secretary, Treasurer, and several committee chairs representing key areas: Research & Publications, Education & Training, Events & Conferences, Membership & Outreach, and International Relations.', 'يتكون المجلس من رئيس ونائب رئيس وأمين وأمين الصندوق ورؤساء لجان عديدة تمثِّل المجالات الرئيسية: البحث والمنشورات والتعليم والتدريب والمناسبات والمؤتمرات والعضوية والتوعية والعلاقات الدولية.', 'about', 'Organizational chart section second paragraph'),
  (gen_random_uuid(), 'about.orgChart.paragraph3', 'Standing committees and working groups are formed as needed to address specific topics such as soil conservation, soil fertility, soil contamination, and remote sensing applications in soil science.', 'يتم تشكيل اللجان الدائمة ومجموعات العمل حسب الحاجة لمعالجة مواضيع محددة مثل الحفظ على التربة وتكوير التربة وتلوث التربة وتطبيقات الاستشعار عن بعد في علوم التربة.', 'about', 'Organizational chart section third paragraph'),
  -- About Timeline Section
  (gen_random_uuid(), 'about.timeline.heading', 'Our Journey', 'رحلتنا', 'about', 'Timeline section heading'),
  (gen_random_uuid(), 'about.timeline.subheading', 'Key milestones in the history of the Syrian Soil Science Society.', 'المراحل الأساسية في تاريخ الجمعية السورية لعلوم التربة.', 'about', 'Timeline section subheading'),
  (gen_random_uuid(), 'about.timeline.year2008', '2008', '2008', 'about', 'Timeline year 2008'),
  (gen_random_uuid(), 'about.timeline.title2008', 'Society Founded', 'تأسيس الجمعية', 'about', 'Timeline 2008 title'),
  (gen_random_uuid(), 'about.timeline.desc2008', 'SSSSY was established by a group of soil scientists and researchers.', 'تأسست الجمعية من قبل مجموعة من علماء وباحثي التربة.', 'about', 'Timeline 2008 description'),
  (gen_random_uuid(), 'about.timeline.year2012', '2012', '2012', 'about', 'Timeline year 2012'),
  (gen_random_uuid(), 'about.timeline.title2012', 'First Conference', 'المؤتمر الأول', 'about', 'Timeline 2012 title'),
  (gen_random_uuid(), 'about.timeline.desc2012', 'The first national soil science conference was held in Damascus.', 'عقد المؤتمر الوطني الأول لعلوم التربة في دمشق.', 'about', 'Timeline 2012 description'),
  (gen_random_uuid(), 'about.timeline.year2018', '2018', '2018', 'about', 'Timeline year 2018'),
  (gen_random_uuid(), 'about.timeline.title2018', 'Research Journal', 'مجلة البحث', 'about', 'Timeline 2018 title'),
  (gen_random_uuid(), 'about.timeline.desc2018', 'Launched the Syrian Journal of Soil Science, a peer-reviewed publication.', 'إصدار المجلة السورية لعلوم التربة، وهي منشور محكمة.', 'about', 'Timeline 2018 description'),
  (gen_random_uuid(), 'about.timeline.year2024', '2024', '2024', 'about', 'Timeline year 2024'),
  (gen_random_uuid(), 'about.timeline.title2024', 'Digital Transformation', 'التحول الرقمي', 'about', 'Timeline 2024 title'),
  (gen_random_uuid(), 'about.timeline.desc2024', 'Migrated to a digital platform for publications, events, and member services.', 'الانتقال إلى منصة رقمية للمنشورات والمناسبات وخدمات الأعضاء.', 'about', 'Timeline 2024 description'),
  -- About Documents Section
  (gen_random_uuid(), 'about.documents.heading', 'Downloadable Documents', 'المستندات القابلة للتنزيل', 'about', 'Documents section heading'),
  (gen_random_uuid(), 'about.documents.bylaws', 'SSSSY Bylaws (PDF)', 'لوائح الجمعية (PDF)', 'about', 'Bylaws document'),
  (gen_random_uuid(), 'about.documents.annualReport', 'Annual Report 2024 (PDF)', 'التقرير السنوي 2024 (PDF)', 'about', 'Annual report document'),
  (gen_random_uuid(), 'about.documents.membershipForm', 'Membership Form (PDF)', 'نموذج العضوية (PDF)', 'about', 'Membership form document'),
  (gen_random_uuid(), 'about.documents.strategicPlan', 'Strategic Plan 2024-2028 (PDF)', 'الخطة الاستراتيجية 2024-2028 (PDF)', 'about', 'Strategic plan document'),
  (gen_random_uuid(), 'about.documents.download', 'Download', 'تنزيل', 'about', 'Download button text'),
  -- About Gallery Section
  (gen_random_uuid(), 'about.gallery.heading', 'Photo Gallery', 'معرض الصور', 'about', 'Gallery section heading'),
  (gen_random_uuid(), 'about.gallery.subheading', 'A glimpse into our events, conferences, and field activities.', 'نظرة خاطفة على مناسباتنا ومؤتمراتنا وأنشطتنا الميدانية.', 'about', 'Gallery section subheading')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert About Page Sections (if not already present)
-- First, find the About page's id (we'll need to assume there's a page with slug 'about')
WITH about_page AS (
  SELECT id FROM pages WHERE slug = 'about' LIMIT 1
),
existing_sections AS (
  SELECT component_type FROM page_sections WHERE page_id = (SELECT id FROM about_page)
)
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-hero-banner',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  0,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-hero-banner')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-overview-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  1,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-overview-section')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-vision-mission-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  2,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-vision-mission-section')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-organizational-chart-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  3,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-organizational-chart-section')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-timeline-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  4,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-timeline-section')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-documents-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  5,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-documents-section')

UNION ALL

SELECT
  gen_random_uuid(),
  (SELECT id FROM about_page),
  'about-gallery-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  6,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_sections WHERE component_type = 'about-gallery-section');

COMMIT;
