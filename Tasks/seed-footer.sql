-- Seed Footer Content Strings, Site Sections, and System Config
BEGIN;

-- Insert/Update Footer Content Strings
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  -- Footer Column 1: Site Info
  (gen_random_uuid(), 'footer.site_short_name', 'SSSSY', 'جمعية', 'footer', 'Footer site short name'),
  (gen_random_uuid(), 'footer.site_description', 'The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science and sustainable land management in Syria.', 'الجمعية السورية لعلوم التربة (SSSSY) مخصصة للنهوض بعلم التربة وإدارة الأراضي المستدامة في سوريا.', 'footer', 'Footer site description'),
  -- Footer Column 2: Quick Links
  (gen_random_uuid(), 'footer.quick_links_heading', 'Quick Links', 'روابط سريعة', 'footer', 'Footer quick links heading'),
  (gen_random_uuid(), 'footer.link_about', 'About', 'حول', 'footer', 'Footer about link'),
  (gen_random_uuid(), 'footer.link_news', 'News', 'أخبار', 'footer', 'Footer news link'),
  (gen_random_uuid(), 'footer.link_events', 'Events', 'فعاليات', 'footer', 'Footer events link'),
  (gen_random_uuid(), 'footer.link_publications', 'Publications', 'منشورات', 'footer', 'Footer publications link'),
  (gen_random_uuid(), 'footer.link_membership', 'Membership', 'عضوية', 'footer', 'Footer membership link'),
  (gen_random_uuid(), 'footer.link_contact', 'Contact', 'اتصل', 'footer', 'Footer contact link'),
  -- Footer Column 3: Contact Info
  (gen_random_uuid(), 'footer.contact_info_heading', 'Contact Info', 'معلومات الاتصال', 'footer', 'Footer contact info heading'),
  -- Footer Column 4: About Section
  (gen_random_uuid(), 'footer.about_heading', 'About SSSSY', 'حول الجمعية', 'footer', 'Footer about heading'),
  -- Footer Copyright
  (gen_random_uuid(), 'footer.copyright', 'Syrian Soil Science Society (SSSSY). All rights reserved.', 'الجمعية السورية لعلوم التربة (SSSSY). جميع الحقوق محفوظة.', 'footer', 'Footer copyright text'),
  -- Follow Us Section
  (gen_random_uuid(), 'follow_us.heading', 'Follow Us', 'تابعنا', 'follow_us', 'Follow us section heading')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert/Update System Config
INSERT INTO system_config (id, config_key, config_value, description, is_public) VALUES
  (gen_random_uuid(), 'contact.address', 'Damascus, Syria', 'Contact address', true),
  (gen_random_uuid(), 'contact.email', 'info@ssssy.org', 'Contact email', true),
  (gen_random_uuid(), 'contact.phone', '+963 11 234 5678', 'Contact phone', true),
  (gen_random_uuid(), 'social.facebook_url', '#', 'Facebook URL', true),
  (gen_random_uuid(), 'social.twitter_url', '#', 'Twitter/X URL', true),
  (gen_random_uuid(), 'social.linkedin_url', '#', 'LinkedIn URL', true),
  (gen_random_uuid(), 'social.youtube_url', '#', 'YouTube URL', true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  updated_at = NOW();

-- Insert Footer Site Sections (if not already present)
WITH existing_footer_layout AS (
    SELECT id FROM site_sections WHERE location = 'footer' AND component_type = 'footer-layout' LIMIT 1
)
INSERT INTO site_sections (id, name, slug, location, component_type, config, data, styling, sort_order, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Footer Layout',
    'footer-layout',
    'footer',
    'footer-layout',
    '{"columns": 4}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    0,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM existing_footer_layout);

COMMIT;
