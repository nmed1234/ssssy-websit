-- Seed Contact Page Content Strings and Page Sections
BEGIN;

-- Step 1: Insert/Update Content Strings
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  -- Hero Banner
  (gen_random_uuid(), 'contact.hero.title', 'Contact Us', 'اتصل بنا', 'contact', 'Contact page hero title'),
  -- Contact Form Section
  (gen_random_uuid(), 'contact.form.title', 'Send Us a Message', 'أرسل لنا رسالة', 'contact', 'Contact form heading'),
  (gen_random_uuid(), 'contact.form.namePlaceholder', 'Your name', 'اسمك', 'contact', 'Name input placeholder'),
  (gen_random_uuid(), 'contact.form.emailPlaceholder', 'Your email', 'بريدك الإلكتروني', 'contact', 'Email input placeholder'),
  (gen_random_uuid(), 'contact.form.subjectPlaceholder', 'Subject', 'الموضوع', 'contact', 'Subject input placeholder'),
  (gen_random_uuid(), 'contact.form.messagePlaceholder', 'Write your message here...', 'اكتب رسالتك هنا...', 'contact', 'Message textarea placeholder'),
  (gen_random_uuid(), 'contact.form.submit', 'Send Message', 'إرسال الرسالة', 'contact', 'Submit button text'),
  -- Success/Error Messages
  (gen_random_uuid(), 'contact.success.title', 'Message Sent!', 'تم إرسال الرسالة!', 'contact', 'Success message title'),
  (gen_random_uuid(), 'contact.success.text', 'Thank you for reaching out. We will get back to you as soon as possible.', 'شكرًا لتواصلك معنا. سنعود إليك في أقرب وقت ممكن.', 'contact', 'Success message text'),
  (gen_random_uuid(), 'contact.success.another', 'Send Another Message', 'إرسال رسالة أخرى', 'contact', 'Send another message button'),
  -- Contact Info Section
  (gen_random_uuid(), 'contact.info.title', 'Contact Information', 'معلومات الاتصال', 'contact', 'Contact info section heading'),
  (gen_random_uuid(), 'contact.info.description', 'Get in touch with us through any of the channels below.', 'تواصل معنا من خلال أي من القنوات أدناه.', 'contact', 'Contact info description'),
  (gen_random_uuid(), 'contact.info.addressLabel', 'Address', 'العنوان', 'contact', 'Address label'),
  (gen_random_uuid(), 'contact.info.phoneLabel', 'Phone', 'الهاتف', 'contact', 'Phone label'),
  (gen_random_uuid(), 'contact.info.emailLabel', 'Email', 'البريد الإلكتروني', 'contact', 'Email label'),
  (gen_random_uuid(), 'contact.info.workingHoursLabel', 'Working Hours', 'ساعات العمل', 'contact', 'Working hours label'),
  (gen_random_uuid(), 'contact.address', 'Damascus, Syria', 'دمشق، سوريا', 'contact', 'Address value'),
  (gen_random_uuid(), 'contact.phone', '+963 11 234 5678', '+963 11 234 5678', 'contact', 'Phone number'),
  (gen_random_uuid(), 'contact.email', 'info@ssssy.org', 'info@ssssy.org', 'contact', 'Email address'),
  (gen_random_uuid(), 'contact.workingHours', 'Sunday - Thursday, 9:00 AM - 5:00 PM', 'الأحد - الخميس، 9:00 صباحًا - 5:00 مساءً', 'contact', 'Working hours'),
  (gen_random_uuid(), 'contact.map.placeholder', 'Google Maps Placeholder', 'مكان خريطة جوجل', 'contact', 'Map placeholder text'),
  -- Social Links Section
  (gen_random_uuid(), 'social.title', 'Follow Us', 'تابعنا', 'social', 'Social media section heading'),
  -- Settings for social URLs
  (gen_random_uuid(), 'social.facebookUrl', 'https://facebook.com/ssssy', 'https://facebook.com/ssssy', 'social', 'Facebook profile URL'),
  (gen_random_uuid(), 'social.twitterUrl', 'https://twitter.com/ssssy', 'https://twitter.com/ssssy', 'social', 'Twitter/X profile URL'),
  (gen_random_uuid(), 'social.linkedinUrl', 'https://linkedin.com/company/ssssy', 'https://linkedin.com/company/ssssy', 'social', 'LinkedIn company URL'),
  (gen_random_uuid(), 'social.youtubeUrl', 'https://youtube.com/@ssssy', 'https://youtube.com/@ssssy', 'social', 'YouTube channel URL')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Step 2: Insert/Update System Settings for social URLs and contact info (if not already present)
INSERT INTO system_config (id, config_key, config_value, description, is_public)
SELECT gen_random_uuid(), key, val, descr, true
FROM (VALUES
  ('contact.address', 'Damascus, Syria', 'Physical address'),
  ('contact.phone', '+963 11 234 5678', 'Phone number'),
  ('contact.email', 'info@ssssy.org', 'Email address'),
  ('social.facebookUrl', 'https://facebook.com/ssssy', 'Facebook URL'),
  ('social.twitterUrl', 'https://twitter.com/ssssy', 'Twitter/X URL'),
  ('social.linkedinUrl', 'https://linkedin.com/company/ssssy', 'LinkedIn URL'),
  ('social.youtubeUrl', 'https://youtube.com/@ssssy', 'YouTube URL')
) AS settings (key, val, descr)
WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE config_key = key);

-- Step 3: Get the Contact page ID
WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
-- Step 4: Delete existing sections for Contact page to avoid duplicates
DELETE FROM page_sections
WHERE page_id IN (SELECT id FROM contact_page);

-- Step 5: Insert new sections
WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact' LIMIT 1
)
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  cp.id,
  'contact-hero-banner',
  '{}'::jsonb,
  '{"titleKey":"contact.hero.title"}'::jsonb,
  '{}'::jsonb,
  0,
  'ALWAYS',
  false,
  null,
  NOW(),
  NOW()
FROM contact_page cp

UNION ALL

SELECT
  gen_random_uuid(),
  cp.id,
  'contact-form-section',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  10,
  'ALWAYS',
  false,
  null,
  NOW(),
  NOW()
FROM contact_page cp

UNION ALL

SELECT
  gen_random_uuid(),
  cp.id,
  'contact-info-display-section',
  '{}'::jsonb,
  '{"addressKey":"contact.address","emailKey":"contact.email","phoneKey":"contact.phone"}'::jsonb,
  '{}'::jsonb,
  20,
  'ALWAYS',
  false,
  null,
  NOW(),
  NOW()
FROM contact_page cp

UNION ALL

SELECT
  gen_random_uuid(),
  cp.id,
  'social-media-links-section',
  '{}'::jsonb,
  '{"facebookKey":"social.facebookUrl","twitterKey":"social.twitterUrl","linkedinKey":"social.linkedinUrl","youtubeKey":"social.youtubeUrl"}'::jsonb,
  '{}'::jsonb,
  30,
  'ALWAYS',
  false,
  null,
  NOW(),
  NOW()
FROM contact_page cp;

COMMIT;
