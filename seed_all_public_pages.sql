-- Seed: All public pages, content strings, page sections, homepage sections, and menu
-- Safe to run repeatedly:
--   - pages/content_strings/site_sections use upserts
--   - managed page_sections are deduplicated, updated, then inserted if missing
--   - header menu items are rebuilt from a single canonical list
-- Notes:
--   - detail routes like /events/[slug] and /jobs/[slug] are content-driven and are not seeded as pages
--   - the homepage is rendered from site_sections(location = 'homepage'), not page_sections

BEGIN;

-- ========================================================================
-- 1. SEED PAGE RECORDS
-- ========================================================================
WITH admin_user AS (
  SELECT id
  FROM users
  ORDER BY created_at NULLS LAST, id
  LIMIT 1
),
managed_pages(slug, title_ar, title_en, layout_type, is_homepage, meta_title, meta_description) AS (
  VALUES
    ('', 'الرئيسية', 'Home', 'FLEXIBLE', true, 'Syrian Soil Science Society', 'Advancing soil science research, education, and sustainable land management in Syria.'),
    ('about', 'عن الجمعية', 'About', 'FLEXIBLE', false, 'About the Society', 'Learn about the mission, vision, and history of the Syrian Soil Science Society.'),
    ('board', 'أعضاء المجلس', 'Board', 'FLEXIBLE', false, 'Board Members', 'Meet the leadership of the Syrian Soil Science Society.'),
    ('contact', 'اتصل بنا', 'Contact', 'FLEXIBLE', false, 'Contact Us', 'Get in touch with the Syrian Soil Science Society.'),
    ('events', 'الفعاليات', 'Events', 'FLEXIBLE', false, 'Events', 'Browse conferences, workshops, and scientific events.'),
    ('jobs', 'الوظائف', 'Jobs', 'FLEXIBLE', false, 'Jobs', 'Explore career and collaboration opportunities.'),
    ('members', 'الأعضاء', 'Members', 'FLEXIBLE', false, 'Members', 'Discover the members of the Syrian Soil Science Society.'),
    ('news', 'الأخبار', 'News', 'FLEXIBLE', false, 'News', 'Read the latest society news and announcements.'),
    ('newsletter', 'النشرة الإخبارية', 'Newsletter', 'FLEXIBLE', false, 'Newsletter', 'Subscribe for the latest updates from the society.'),
    ('president-message', 'رسالة الرئيس', 'President Message', 'FLEXIBLE', false, 'President Message', 'A message from the president of the Syrian Soil Science Society.'),
    ('publications', 'المنشورات', 'Publications', 'FLEXIBLE', false, 'Publications', 'Explore society publications and research output.'),
    ('search', 'البحث', 'Search', 'FLEXIBLE', false, 'Search', 'Search across news, publications, and events.'),
    ('sections', 'الأقسام', 'Sections', 'FLEXIBLE', false, 'Sections Library', 'Browse reusable public site sections.')
)
INSERT INTO pages (
  id,
  title_ar,
  title_en,
  slug,
  layout_type,
  is_published,
  is_homepage,
  author_id,
  meta_title,
  meta_description,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  p.title_ar,
  p.title_en,
  p.slug,
  p.layout_type,
  true,
  p.is_homepage,
  u.id,
  p.meta_title,
  p.meta_description,
  NOW(),
  NOW()
FROM managed_pages p
CROSS JOIN admin_user u
ON CONFLICT (slug) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  title_en = EXCLUDED.title_en,
  layout_type = EXCLUDED.layout_type,
  is_published = EXCLUDED.is_published,
  is_homepage = EXCLUDED.is_homepage,
  author_id = EXCLUDED.author_id,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- ========================================================================
-- 2. SEED CONTENT STRINGS
-- ========================================================================
INSERT INTO content_strings (
  id,
  string_key,
  value_en,
  value_ar,
  string_group,
  description
)
VALUES
  (gen_random_uuid(), 'about.hero.arabic_heading', 'من نحن', 'من نحن', 'about', 'About hero Arabic heading'),
  (gen_random_uuid(), 'about.hero.heading', 'About Us', 'عن الجمعية', 'about', 'About hero main heading'),
  (gen_random_uuid(), 'about.hero.description', 'Learn about our society, history, and commitment to soil science in Syria.', 'تعرف على جمعيتنا وتاريخنا والتزامنا بعلوم التربة في سوريا.', 'about', 'About hero description'),
  (gen_random_uuid(), 'about.overview.heading', 'Society Overview', 'نظرة عامة على الجمعية', 'about', 'About overview heading'),
  (gen_random_uuid(), 'about.overview.paragraph1', 'The Syrian Soil Science Society is a professional non-profit scientific organization dedicated to advancing soil science in Syria.', 'الجمعية السورية لعلوم التربة هي منظمة علمية مهنية غير ربحية مكرسة لتطوير علوم التربة في سوريا.', 'about', 'About overview paragraph 1'),
  (gen_random_uuid(), 'about.overview.paragraph2', 'The society brings together researchers, educators, students, and practitioners to exchange knowledge and promote sustainable soil management.', 'تجمع الجمعية الباحثين والمعلمين والطلاب والممارسين لتبادل المعرفة وتعزيز الإدارة المستدامة للتربة.', 'about', 'About overview paragraph 2'),
  (gen_random_uuid(), 'about.vision_mission.heading', 'Vision, Mission & Objectives', 'الرؤية والرسالة والأهداف', 'about', 'About vision and mission heading'),
  (gen_random_uuid(), 'about.org_chart.heading', 'Organizational Structure', 'الهيكل التنظيمي', 'about', 'About organizational chart heading'),
  (gen_random_uuid(), 'about.timeline.heading', 'Our Journey', 'رحلتنا', 'about', 'About timeline heading'),
  (gen_random_uuid(), 'about.documents.heading', 'Downloadable Documents', 'المستندات القابلة للتنزيل', 'about', 'About documents heading'),
  (gen_random_uuid(), 'about.gallery.heading', 'Photo Gallery', 'معرض الصور', 'about', 'About gallery heading'),

  (gen_random_uuid(), 'contact.hero.title', 'Contact Us', 'اتصل بنا', 'contact', 'Contact hero title'),
  (gen_random_uuid(), 'contact.form.title', 'Send us a message', 'أرسل لنا رسالة', 'contact', 'Contact form title'),
  (gen_random_uuid(), 'contact.form.name_placeholder', 'Your Name', 'اسمك', 'contact', 'Contact form name placeholder'),
  (gen_random_uuid(), 'contact.form.email_placeholder', 'Your Email', 'بريدك الإلكتروني', 'contact', 'Contact form email placeholder'),
  (gen_random_uuid(), 'contact.form.subject_placeholder', 'Subject', 'الموضوع', 'contact', 'Contact form subject placeholder'),
  (gen_random_uuid(), 'contact.form.message_placeholder', 'Your Message', 'رسالتك', 'contact', 'Contact form message placeholder'),
  (gen_random_uuid(), 'contact.form.submit', 'Send Message', 'إرسال الرسالة', 'contact', 'Contact form submit button'),

  (gen_random_uuid(), 'social.title', 'Follow Us', 'تابعنا', 'social', 'Social media section title'),
  (gen_random_uuid(), 'social.facebook_url', 'https://facebook.com/ssssy', 'https://facebook.com/ssssy', 'social', 'Social: Facebook URL'),
  (gen_random_uuid(), 'social.twitter_url', 'https://twitter.com/ssssy', 'https://twitter.com/ssssy', 'social', 'Social: Twitter/X URL'),
  (gen_random_uuid(), 'social.linkedin_url', 'https://linkedin.com/company/ssssy', 'https://linkedin.com/company/ssssy', 'social', 'Social: LinkedIn URL'),
  (gen_random_uuid(), 'social.youtube_url', 'https://youtube.com/@ssssy', 'https://youtube.com/@ssssy', 'social', 'Social: YouTube URL'),

  (gen_random_uuid(), 'board.hero.title', 'Board Members', 'أعضاء المجلس', 'board', 'Board hero title'),
  (gen_random_uuid(), 'board.hero.subtitle', 'Meet the leadership of the Syrian Soil Science Society.', 'تعرف على قيادة الجمعية السورية لعلوم التربة.', 'board', 'Board hero subtitle'),

  (gen_random_uuid(), 'events.hero.title', 'Events', 'الفعاليات', 'events', 'Events hero title'),
  (gen_random_uuid(), 'events.hero.subtitle', 'Explore conferences, workshops, seminars, and training opportunities.', 'استكشف المؤتمرات وورش العمل والندوات والبرامج التدريبية.', 'events', 'Events hero subtitle'),

  (gen_random_uuid(), 'jobs.hero.title', 'Jobs', 'الوظائف', 'jobs', 'Jobs hero title'),
  (gen_random_uuid(), 'jobs.hero.subtitle', 'Explore career opportunities at SSSSY and partner organizations.', 'استكشف الفرص الوظيفية في الجمعية والجهات الشريكة.', 'jobs', 'Jobs hero subtitle'),

  (gen_random_uuid(), 'members.hero.title', 'Members', 'الأعضاء', 'members', 'Members hero title'),
  (gen_random_uuid(), 'members.hero.subtitle', 'Browse the society member directory and public profiles.', 'تصفح دليل الأعضاء والملفات العامة.', 'members', 'Members hero subtitle'),

  (gen_random_uuid(), 'news.hero.title', 'News & Announcements', 'الأخبار والإعلانات', 'news', 'News hero title'),
  (gen_random_uuid(), 'news.hero.subtitle', 'Read the latest news, articles, and announcements from the society.', 'اقرأ آخر الأخبار والمقالات والإعلانات من الجمعية.', 'news', 'News hero subtitle'),

  (gen_random_uuid(), 'newsletter.hero.title', 'Stay Connected', 'ابق على تواصل', 'newsletter', 'Newsletter hero title'),
  (gen_random_uuid(), 'newsletter.hero.subtitle', 'Subscribe to receive news, events, and updates from the society.', 'اشترك لتصلك آخر الأخبار والفعاليات والتحديثات من الجمعية.', 'newsletter', 'Newsletter hero subtitle'),

  (gen_random_uuid(), 'president.hero.title', 'Message from the President', 'رسالة الرئيس', 'president', 'President hero title'),
  (gen_random_uuid(), 'president.hero.subtitle', 'A word from the society president about our mission and future direction.', 'كلمة من رئيس الجمعية حول رسالتنا وتوجهاتنا المستقبلية.', 'president', 'President hero subtitle'),

  (gen_random_uuid(), 'publications.hero.title', 'Publications', 'المنشورات', 'publications', 'Publications hero title'),
  (gen_random_uuid(), 'publications.hero.subtitle', 'Explore research papers, reports, and knowledge resources published by the society.', 'استكشف الأبحاث والتقارير والموارد المعرفية المنشورة من الجمعية.', 'publications', 'Publications hero subtitle'),

  (gen_random_uuid(), 'search.hero.title', 'Search', 'البحث', 'search', 'Search hero title'),
  (gen_random_uuid(), 'search.hero.subtitle', 'Search across articles, publications, and events.', 'ابحث في المقالات والمنشورات والفعاليات.', 'search', 'Search hero subtitle')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ========================================================================
-- 3. SEED PAGE SECTIONS
-- ========================================================================
-- Clean up duplicate managed page sections first, then update them in place, then insert missing rows.
WITH managed_page_sections AS (
  SELECT
    p.id AS page_id,
    seed.component_type,
    seed.config,
    seed.data,
    seed.styling,
    seed.sort_order,
    seed.visibility,
    seed.is_animated,
    seed.animation_type
  FROM pages p
  JOIN (
    VALUES
      ('about', 'about-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-overview-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-vision-mission-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-organizational-chart-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 30, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-timeline-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 40, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-documents-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 50, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-gallery-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 60, 'ALWAYS', false, NULL::varchar),

      ('board', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Board Members","subtitle":"Meet the leadership of the Syrian Soil Science Society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('contact', 'contact-hero-banner', '{}'::jsonb, '{"titleKey":"contact.hero.title"}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('contact', 'contact-form-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('contact', 'social-media-links-section', '{}'::jsonb, '{"facebookKey":"social.facebook_url","twitterKey":"social.twitter_url","linkedinKey":"social.linkedin_url","youtubeKey":"social.youtube_url"}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),

      ('events', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Events","subtitle":"Explore conferences, workshops, seminars, and training opportunities."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('events', 'events-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('jobs', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Jobs","subtitle":"Explore career opportunities at SSSSY and partner organizations."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('jobs', 'jobs-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('members', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Members","subtitle":"Browse the society member directory and public profiles."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('members', 'members-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('news', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"News & Announcements","subtitle":"Read the latest news, articles, and announcements from the society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('news', 'news-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('newsletter', 'newsletter-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('newsletter', 'newsletter', '{}'::jsonb, '{"title":"Stay Connected","content":"Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-16","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('president-message', 'president-message-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('president-message', 'president-message-content-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('publications', 'publications-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('publications', 'publications-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),

      ('search', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Search","subtitle":"Search across articles, publications, and events."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('search', 'search', '{"placeholder":"Search articles, publications, events..."}'::jsonb, '{"title":"Search the Website"}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-12","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar)
  ) AS seed(slug, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type)
    ON p.slug = seed.slug
),
ranked_duplicates AS (
  SELECT
    ps.id,
    ROW_NUMBER() OVER (
      PARTITION BY ps.page_id, ps.component_type
      ORDER BY ps.created_at NULLS LAST, ps.id
    ) AS rn
  FROM page_sections ps
  JOIN managed_page_sections m
    ON m.page_id = ps.page_id
   AND m.component_type = ps.component_type
)
DELETE FROM page_sections
WHERE id IN (
  SELECT id
  FROM ranked_duplicates
  WHERE rn > 1
);

WITH managed_page_sections AS (
  SELECT
    p.id AS page_id,
    seed.component_type,
    seed.config,
    seed.data,
    seed.styling,
    seed.sort_order,
    seed.visibility,
    seed.is_animated,
    seed.animation_type
  FROM pages p
  JOIN (
    VALUES
      ('about', 'about-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-overview-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-vision-mission-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-organizational-chart-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 30, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-timeline-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 40, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-documents-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 50, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-gallery-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 60, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-members-intro-grid', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-term-information-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 30, 'ALWAYS', false, NULL::varchar),
      ('contact', 'contact-hero-banner', '{}'::jsonb, '{"titleKey":"contact.hero.title"}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('contact', 'contact-form-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('contact', 'social-media-links-section', '{}'::jsonb, '{"facebookKey":"social.facebook_url","twitterKey":"social.twitter_url","linkedinKey":"social.linkedin_url","youtubeKey":"social.youtube_url"}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('events', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Events","subtitle":"Explore conferences, workshops, seminars, and training opportunities."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('events', 'events-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('jobs', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Jobs","subtitle":"Explore career opportunities at SSSSY and partner organizations."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('jobs', 'jobs-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('members', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Members","subtitle":"Browse the society member directory and public profiles."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('members', 'members-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('news', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"News & Announcements","subtitle":"Read the latest news, articles, and announcements from the society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('news', 'news-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('newsletter', 'newsletter-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('newsletter', 'newsletter', '{}'::jsonb, '{"title":"Stay Connected","content":"Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-16","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('president-message', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Message from the President","subtitle":"A word from the society president about our mission and future direction."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('president-message', 'text', '{}'::jsonb, '{"title":"Message from the President","content":"<p>The Syrian Soil Science Society remains committed to strengthening research, education, and professional collaboration in service of sustainable land management across Syria.</p><p>We welcome researchers, students, institutions, and practitioners to work with us in protecting soil resources and building a stronger scientific community.</p>"}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-16","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('publications', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Publications","subtitle":"Explore research papers, reports, and knowledge resources published by the society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('publications', 'publications-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('search', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Search","subtitle":"Search across articles, publications, and events."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('search', 'search', '{"placeholder":"Search articles, publications, events..."}'::jsonb, '{"title":"Search the Website"}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-12","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar)
  ) AS seed(slug, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type)
    ON p.slug = seed.slug
),
existing_managed AS (
  SELECT DISTINCT ON (ps.page_id, ps.component_type)
    ps.id,
    m.config,
    m.data,
    m.styling,
    m.sort_order,
    m.visibility,
    m.is_animated,
    m.animation_type
  FROM page_sections ps
  JOIN managed_page_sections m
    ON m.page_id = ps.page_id
   AND m.component_type = ps.component_type
  ORDER BY ps.page_id, ps.component_type, ps.created_at NULLS LAST, ps.id
)
UPDATE page_sections ps
SET
  config = e.config,
  data = e.data,
  styling = e.styling,
  sort_order = e.sort_order,
  visibility = e.visibility,
  is_animated = e.is_animated,
  animation_type = e.animation_type,
  updated_at = NOW()
FROM existing_managed e
WHERE ps.id = e.id;

WITH managed_page_sections AS (
  SELECT
    p.id AS page_id,
    seed.component_type,
    seed.config,
    seed.data,
    seed.styling,
    seed.sort_order,
    seed.visibility,
    seed.is_animated,
    seed.animation_type
  FROM pages p
  JOIN (
    VALUES
      ('about', 'about-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-overview-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-vision-mission-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-organizational-chart-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 30, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-timeline-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 40, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-documents-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 50, 'ALWAYS', false, NULL::varchar),
      ('about', 'about-gallery-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 60, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-members-intro-grid', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('board', 'board-term-information-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 30, 'ALWAYS', false, NULL::varchar),
      ('contact', 'contact-hero-banner', '{}'::jsonb, '{"titleKey":"contact.hero.title"}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('contact', 'contact-form-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('contact', 'social-media-links-section', '{}'::jsonb, '{"facebookKey":"social.facebook_url","twitterKey":"social.twitter_url","linkedinKey":"social.linkedin_url","youtubeKey":"social.youtube_url"}'::jsonb, '{}'::jsonb, 20, 'ALWAYS', false, NULL::varchar),
      ('events', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Events","subtitle":"Explore conferences, workshops, seminars, and training opportunities."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('events', 'events-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('jobs', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Jobs","subtitle":"Explore career opportunities at SSSSY and partner organizations."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('jobs', 'jobs-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('members', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Members","subtitle":"Browse the society member directory and public profiles."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('members', 'members-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('news', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"News & Announcements","subtitle":"Read the latest news, articles, and announcements from the society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('news', 'news-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('newsletter', 'newsletter-hero-banner', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('newsletter', 'newsletter', '{}'::jsonb, '{"title":"Stay Connected","content":"Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-16","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('president-message', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Message from the President","subtitle":"A word from the society president about our mission and future direction."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('president-message', 'text', '{}'::jsonb, '{"title":"Message from the President","content":"<p>The Syrian Soil Science Society remains committed to strengthening research, education, and professional collaboration in service of sustainable land management across Syria.</p><p>We welcome researchers, students, institutions, and practitioners to work with us in protecting soil resources and building a stronger scientific community.</p>"}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-16","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('publications', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Publications","subtitle":"Explore research papers, reports, and knowledge resources published by the society."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('publications', 'publications-list-section', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 10, 'ALWAYS', false, NULL::varchar),
      ('search', 'hero', '{"maxWidth":"max-w-5xl"}'::jsonb, '{"title":"Search","subtitle":"Search across articles, publications, and events."}'::jsonb, '{"backgroundColor":"bg-soil-dark","padding":"py-16","textColor":"text-white"}'::jsonb, 0, 'ALWAYS', false, NULL::varchar),
      ('search', 'search', '{"placeholder":"Search articles, publications, events..."}'::jsonb, '{"title":"Search the Website"}'::jsonb, '{"backgroundColor":"bg-white","padding":"py-12","textColor":"text-gray-900"}'::jsonb, 10, 'ALWAYS', false, NULL::varchar)
  ) AS seed(slug, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type)
    ON p.slug = seed.slug
)
INSERT INTO page_sections (
  id,
  page_id,
  component_type,
  config,
  data,
  styling,
  sort_order,
  visibility,
  is_animated,
  animation_type,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  m.page_id,
  m.component_type,
  m.config,
  m.data,
  m.styling,
  m.sort_order,
  m.visibility,
  m.is_animated,
  m.animation_type,
  NOW(),
  NOW()
FROM managed_page_sections m
WHERE NOT EXISTS (
  SELECT 1
  FROM page_sections ps
  WHERE ps.page_id = m.page_id
    AND ps.component_type = m.component_type
);

-- ========================================================================
-- 4. SEED HOMEPAGE SITE SECTIONS
-- ========================================================================
-- First, delete any homepage site sections not in our managed list
DELETE FROM site_sections
WHERE location = 'homepage'
AND slug NOT IN (
  'hero-banner',
  'our-focus-areas',
  'join-our-community',
  'latest-news-feed',
  'upcoming-events-feed',
  'stats-counter',
  'testimonials',
  'newsletter-signup',
  'contact-form'
);

INSERT INTO site_sections (
  id,
  name,
  slug,
  location,
  component_type,
  config,
  data,
  styling,
  sort_order,
  is_active,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Homepage Hero',
    'hero-banner',
    'homepage',
    'hero',
    '{"maxWidth":"max-w-4xl"}'::jsonb,
    '{"title":"Syrian Soil Science Society","subtitle":"Advancing soil science research, education, and sustainable land management in Syria.","buttonLabel":"Learn More","buttonUrl":"/about"}'::jsonb,
    '{"backgroundColor":"bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay","padding":"py-16 md:py-32","textColor":"text-white"}'::jsonb,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Our Focus Areas',
    'our-focus-areas',
    'homepage',
    'card-group',
    '{"columns":3}'::jsonb,
    '{"title":"Our Focus Areas","cards":[{"title":"Research","content":"Advancing soil science through cutting-edge research and field studies across Syria''s diverse agricultural regions."},{"title":"Education","content":"Providing training, workshops, and educational programs for soil scientists, students, and farmers."},{"title":"Sustainability","content":"Promoting sustainable land management practices to protect and enhance Syria''s soil resources for future generations."}]}'::jsonb,
    '{"backgroundColor":"bg-white","padding":"py-16 md:py-20","textColor":"text-gray-900"}'::jsonb,
    10,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Join Our Community',
    'join-our-community',
    'homepage',
    'cta',
    '{}'::jsonb,
    '{"title":"Join Our Community","content":"Become a member of the Syrian Soil Science Society and contribute to the future of soil science in Syria and beyond.","buttonLabel":"Become a Member","buttonUrl":"/members"}'::jsonb,
    '{"backgroundColor":"bg-soil-clay","padding":"py-16 md:py-20","textColor":"text-white"}'::jsonb,
    20,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Homepage Latest News',
    'latest-news-feed',
    'homepage',
    'latest-news-feed',
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    30,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Homepage Upcoming Events',
    'upcoming-events-feed',
    'homepage',
    'upcoming-events-feed',
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    40,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Homepage Stats',
    'stats-counter',
    'homepage',
    'stats',
    '{"maxWidth":"max-w-5xl"}'::jsonb,
    '{"title":"SSSSY by the Numbers","items":[{"value":"15+","title":"Years Established"},{"value":"500+","title":"Members"},{"value":"200+","title":"Publications"},{"value":"50+","title":"Events"}]}'::jsonb,
    '{"backgroundColor":"bg-gradient-to-r from-soil-dark to-soil-clay","padding":"py-16 md:py-20","textColor":"text-white"}'::jsonb,
    50,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Testimonials',
    'testimonials',
    'homepage',
    'testimonial',
    '{}'::jsonb,
    '{"title":"What Our Members Say","testimonials":[{"name":"Dr. Ahmad K.","role":"Soil Scientist","quote":"SSSSY has been instrumental in connecting soil scientists across Syria and advancing research in sustainable agriculture."},{"name":"Fatima M.","role":"Student Member","quote":"The workshops and educational programs provided by SSSSY have been invaluable to my academic and professional development."},{"name":"Prof. Omar S.","role":"Board Member","quote":"Working with SSSSY has allowed me to contribute to meaningful projects that make a real difference in our communities."}]}'::jsonb,
    '{"backgroundColor":"bg-soil-cream/30","padding":"py-16 md:py-20","textColor":"text-gray-900"}'::jsonb,
    60,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Homepage Newsletter',
    'newsletter-signup',
    'homepage',
    'newsletter',
    '{"maxWidth":"max-w-3xl"}'::jsonb,
    '{"title":"Stay Connected","content":"Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}'::jsonb,
    '{"backgroundColor":"bg-white","padding":"py-16 md:py-20","textColor":"text-gray-900"}'::jsonb,
    70,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Contact Form',
    'contact-form',
    'homepage',
    'contact-form',
    '{}'::jsonb,
    '{"title":"Get In Touch"}'::jsonb,
    '{"backgroundColor":"bg-white","padding":"py-16 md:py-20","textColor":"text-gray-900"}'::jsonb,
    80,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  component_type = EXCLUDED.component_type,
  config = EXCLUDED.config,
  data = EXCLUDED.data,
  styling = EXCLUDED.styling,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ========================================================================
-- 5. SEED MAIN NAVIGATION MENU
-- ========================================================================
INSERT INTO menus (id, name, location, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Navigation', 'header', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active;

DELETE FROM menu_items
WHERE menu_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO menu_items (
  id,
  menu_id,
  label_ar,
  label_en,
  url,
  target,
  sort_order,
  is_active
)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الرئيسية', 'Home', '/', '_self', 0, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'عن الجمعية', 'About', '/about', '_self', 1, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'رسالة الرئيس', 'President Message', '/president-message', '_self', 2, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'أعضاء المجلس', 'Board', '/board', '_self', 3, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الأخبار', 'News', '/news', '_self', 4, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'المنشورات', 'Publications', '/publications', '_self', 5, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الفعاليات', 'Events', '/events', '_self', 6, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الوظائف', 'Jobs', '/jobs', '_self', 7, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الأعضاء', 'Members', '/members', '_self', 8, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'النشرة الإخبارية', 'Newsletter', '/newsletter', '_self', 9, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'اتصل بنا', 'Contact', '/contact', '_self', 10, true);

-- ========================================================================
-- 6. ENSURE FOOTER LAYOUT EXISTS
-- ========================================================================
INSERT INTO site_sections (
  id,
  name,
  slug,
  location,
  component_type,
  config,
  data,
  styling,
  sort_order,
  is_active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Footer Layout',
  'footer-layout',
  'footer',
  'footer-layout',
  '{"columns":4}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  0,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  component_type = EXCLUDED.component_type,
  config = EXCLUDED.config,
  data = EXCLUDED.data,
  styling = EXCLUDED.styling,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

COMMIT;
