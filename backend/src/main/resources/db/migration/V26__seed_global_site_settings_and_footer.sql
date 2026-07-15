INSERT INTO system_config (id, config_key, config_value, config_group, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'site.logo_url', 'http://localhost:3000/logo.png', 'GLOBAL_SITE_SETTINGS', 'URL for the site logo', NOW(), NOW());

-- Update existing content_strings or insert new ones for global site settings
-- Using ON CONFLICT DO UPDATE to avoid errors if keys already exist from other migrations
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
(gen_random_uuid(), 'site.name', 'Syrian Soil Science Society', 'الجمعية السورية لعلوم التربة', 'site', 'Full name of the organization'),
(gen_random_uuid(), 'site.short_name', 'SSSSY', 'ج.س.ع.ت', 'site', 'Short name/acronym of the organization'),
(gen_random_uuid(), 'site.description', 'Advancing soil science research, education, and sustainable land management in Syria.', 'تعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا.', 'site', 'Brief description of the organization'),
(gen_random_uuid(), 'contact.address', 'Damascus, Syria', 'دمشق، سوريا', 'contact', 'Organization contact address'),
(gen_random_uuid(), 'contact.email', 'info@ssssy.org', 'info@ssssy.org', 'contact', 'Organization contact email'),
(gen_random_uuid(), 'contact.phone', '+963112345678', '+963112345678', 'contact', 'Organization contact phone number'),
(gen_random_uuid(), 'footer.copyright', 'Syrian Soil Science Society (SSSSY). All rights reserved.', 'الجمعية السورية لعلوم التربة (ج.س.ع.ت). جميع الحقوق محفوظة.', 'footer', 'Footer copyright text'),
(gen_random_uuid(), 'footer.quick_links', 'Quick Links', 'روابط سريعة', 'footer', 'Footer quick links heading'),
(gen_random_uuid(), 'footer.contact_info', 'Contact Info', 'معلومات الاتصال', 'footer', 'Footer contact info heading'),
(gen_random_uuid(), 'footer.about_heading', 'About SSSSY', 'عن ج.س.ع.ت', 'footer', 'Footer about section heading'),
(gen_random_uuid(), 'footer.about_text', 'The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science and sustainable land management in Syria.', 'الجمعية السورية لعلوم التربة (ج.س.ع.ت) مكرسة لتعزيز علوم التربة والإدارة المستدامة للأراضي في سوريا.', 'footer', 'Footer about section text')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Ensure social media URLs are present (V21 already seeds these, but for completeness and potential updates)
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
(gen_random_uuid(), 'social.facebook_url',  'https://facebook.com/ssssy',  'https://facebook.com/ssssy',  'social', 'Social: Facebook page URL'),
(gen_random_uuid(), 'social.twitter_url',   'https://twitter.com/ssssy',   'https://twitter.com/ssssy',   'social', 'Social: Twitter/X profile URL'),
(gen_random_uuid(), 'social.linkedin_url',  'https://linkedin.com/company/ssssy', 'https://linkedin.com/company/ssssy', 'social', 'Social: LinkedIn page URL'),
(gen_random_uuid(), 'social.youtube_url',   'https://youtube.com/@ssssy', 'https://youtube.com/@ssssy',   'social', 'Social: YouTube channel URL')
ON CONFLICT (string_key) DO UPDATE SET
  value_en = EXCLUDED.value_en,
  value_ar = EXCLUDED.value_ar,
  string_group = EXCLUDED.string_group,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Seed: Footer quick links menu (with ON CONFLICT to prevent duplicates)
INSERT INTO menus (id, name, location, is_active) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Footer Quick Links', 'footer-quick-links', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- First, clear any existing menu_items for this menu to avoid duplicates
DELETE FROM menu_items WHERE menu_id = '00000000-0000-0000-0000-000000000002';

-- Then insert the menu items
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'من نحن',         'About',        '/about',       '_self', 0, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'الأخبار',        'News',         '/news',        '_self', 1, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'الفعاليات',      'Events',       '/events',      '_self', 2, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'المنشورات',      'Publications', '/publications','_self', 3, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'الأعضاء',        'Members',      '/members',     '_self', 4, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'اتصل بنا',       'Contact',      '/contact',     '_self', 5, true);

-- Seed: Site sections for dynamic footer (with ON CONFLICT to prevent duplicates)
-- First, delete existing site sections for footer to avoid duplicates
DELETE FROM site_sections WHERE location = 'footer';

-- footer-about-text
INSERT INTO site_sections (id, name, slug, component_type, location, config, data, styling, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'Footer About Text', 'footer-about-text', 'rich-text-block', 'footer', '{}', '{"contentStringKey": "footer.about_text"}', '{}', true, 10, NOW(), NOW());

-- footer-contact-info
INSERT INTO site_sections (id, name, slug, component_type, location, config, data, styling, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'Footer Contact Info', 'footer-contact-info', 'contact-info-block', 'footer', '{}', '{"addressKey": "contact.address", "emailKey": "contact.email", "phoneKey": "contact.phone"}', '{}', true, 20, NOW(), NOW());

-- footer-social-links
INSERT INTO site_sections (id, name, slug, component_type, location, config, data, styling, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'Footer Social Links', 'footer-social-links', 'social-media-links', 'footer', '{}', '{"facebookKey": "social.facebook_url", "twitterKey": "social.twitter_url", "linkedinKey": "social.linkedin_url", "youtubeKey": "social.youtube_url"}', '{}', true, 30, NOW(), NOW());

-- footer-quick-links-menu
INSERT INTO site_sections (id, name, slug, component_type, location, config, data, styling, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'Footer Quick Links Menu', 'footer-quick-links-menu', 'dynamic-menu', 'footer', '{}', '{"menuId": "00000000-0000-0000-0000-000000000002", "headingStringKey": "footer.quick_links"}', '{}', true, 40, NOW(), NOW());

-- main-footer-layout
INSERT INTO site_sections (id, name, slug, component_type, location, config, data, styling, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'Main Footer Layout', 'main-footer-layout', 'footer-layout', 'footer', '{}', '
  {
    "columns": [
      { "type": "site-section", "slug": "footer-about-text" },
      { "type": "site-section", "slug": "footer-quick-links-menu" },
      { "type": "site-section", "slug": "footer-contact-info" },
      { "type": "site-section", "slug": "footer-social-links" }
    ]
  }
', '{}', true, 0, NOW(), NOW());
