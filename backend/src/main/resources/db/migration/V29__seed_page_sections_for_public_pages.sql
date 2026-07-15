-- Seed additional content strings for public pages
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
(gen_random_uuid(), 'about.hero.title', 'About the Syrian Soil Science Society', 'عن الجمعية السورية لعلوم التربة', 'about', 'About page hero title'),
(gen_random_uuid(), 'about.overview.title', 'Overview', 'نظرة عامة', 'about', 'About page overview heading'),
(gen_random_uuid(), 'about.overview.text', 'The Syrian Soil Science Society (SSSSY) is a non-profit professional organization dedicated to advancing soil science research, education, and sustainable land management in Syria.', 'الجمعية السورية لعلوم التربة (ج.س.ع.ت) هي منظمة مهنية غير ربحية مكرسة لتعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا.', 'about', 'About page overview text'),
(gen_random_uuid(), 'publications.hero.title', 'Our Publications', 'منشوراتنا', 'publications', 'Publications page hero title'),
(gen_random_uuid(), 'publications.title', 'Publications', 'المنشورات', 'publications', 'Publications page main title'),
(gen_random_uuid(), 'contact.hero.title', 'Contact Us', 'اتصل بنا', 'contact', 'Contact page hero title'),
(gen_random_uuid(), 'contact.info.address', 'Address', 'العنوان', 'contact', 'Contact page address heading'),
(gen_random_uuid(), 'contact.info.email', 'Email', 'البريد الإلكتروني', 'contact', 'Contact page email heading'),
(gen_random_uuid(), 'contact.info.phone', 'Phone', 'الهاتف', 'contact', 'Contact page phone heading'),
(gen_random_uuid(), 'contact.form.title', 'Send us a message', 'أرسل لنا رسالة', 'contact', 'Contact form heading'),
(gen_random_uuid(), 'contact.form.name_placeholder', 'Your name', 'اسمك', 'contact', 'Contact form name placeholder'),
(gen_random_uuid(), 'contact.form.email_placeholder', 'Your email', 'بريدك الإلكتروني', 'contact', 'Contact form email placeholder'),
(gen_random_uuid(), 'contact.form.subject_placeholder', 'Subject', 'الموضوع', 'contact', 'Contact form subject placeholder'),
(gen_random_uuid(), 'contact.form.message_placeholder', 'Your message', 'رسالتك', 'contact', 'Contact form message placeholder'),
(gen_random_uuid(), 'contact.form.submit', 'Send Message', 'إرسال الرسالة', 'contact', 'Contact form submit button'),
(gen_random_uuid(), 'social.title', 'Follow Us', 'تابعنا', 'social', 'Social media heading')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Seed page sections for About page
-- First, check if the About page exists
WITH about_page AS (
  SELECT id FROM pages WHERE slug = 'about' LIMIT 1
)
-- Insert About hero banner
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'about-hero-banner',
  '{}'::jsonb,
  '{"titleKey": "about.hero.title"}'::jsonb,
  '{}'::jsonb,
  0,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM about_page
ON CONFLICT DO NOTHING;

WITH about_page AS (
  SELECT id FROM pages WHERE slug = 'about' LIMIT 1
)
-- Insert About overview section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'about-overview-section',
  '{}'::jsonb,
  '{"contentKey": "about.overview.text"}'::jsonb,
  '{}'::jsonb,
  10,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM about_page
ON CONFLICT DO NOTHING;

-- Seed page sections for Publications page
WITH publications_page AS (
  SELECT id FROM pages WHERE slug = 'publications' LIMIT 1
)
-- Insert Publications hero banner
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'publications-hero-banner',
  '{}'::jsonb,
  '{"titleKey": "publications.hero.title"}'::jsonb,
  '{}'::jsonb,
  0,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM publications_page
ON CONFLICT DO NOTHING;

WITH publications_page AS (
  SELECT id FROM pages WHERE slug = 'publications' LIMIT 1
)
-- Insert Publications list section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'publications-list-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  10,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM publications_page
ON CONFLICT DO NOTHING;

-- Seed page sections for Contact page
WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
-- Insert Contact hero banner
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'contact-hero-banner',
  '{}'::jsonb,
  '{"titleKey": "contact.hero.title"}'::jsonb,
  '{}'::jsonb,
  0,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM contact_page
ON CONFLICT DO NOTHING;

WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
-- Insert Contact form section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'contact-form-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  10,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM contact_page
ON CONFLICT DO NOTHING;

WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
-- Insert Contact info display section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'contact-info-display-section',
  '{}'::jsonb,
  '{"addressKey": "contact.address", "emailKey": "contact.email", "phoneKey": "contact.phone"}'::jsonb,
  '{}'::jsonb,
  20,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM contact_page
ON CONFLICT DO NOTHING;

WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
-- Insert Social media links section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'social-media-links-section',
  '{}'::jsonb,
  '{"facebookKey": "social.facebook_url", "twitterKey": "social.twitter_url", "linkedinKey": "social.linkedin_url", "youtubeKey": "social.youtube_url"}'::jsonb,
  '{}'::jsonb,
  30,
  'ALWAYS',
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM contact_page
ON CONFLICT DO NOTHING;
