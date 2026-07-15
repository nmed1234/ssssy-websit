-- Seed: Header navigation menu (with ON CONFLICT to prevent duplicates)
INSERT INTO menus (id, name, location, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Navigation', 'header', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active;

-- First, delete existing menu_items for header menu to avoid duplicates
DELETE FROM menu_items WHERE menu_id = '00000000-0000-0000-0000-000000000001';

-- Seed: Header menu items
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الرئيسية',      'Home',         '/',            '_self', 0, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'من نحن',         'About',        '/about',       '_self', 1, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الأخبار',        'News',         '/news',        '_self', 2, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'المنشورات',      'Publications', '/publications','_self', 3, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الفعاليات',      'Events',       '/events',      '_self', 4, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الوظائف',        'Jobs',         '/jobs',        '_self', 5, true),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'اتصل بنا',       'Contact',      '/contact',     '_self', 6, true);

-- Seed: Social media URL content strings
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  (gen_random_uuid(), 'social.facebook_url',  'https://facebook.com/ssssy',  'https://facebook.com/ssssy',  'social', 'Social: Facebook page URL'),
  (gen_random_uuid(), 'social.twitter_url',   'https://twitter.com/ssssy',   'https://twitter.com/ssssy',   'social', 'Social: Twitter/X profile URL'),
  (gen_random_uuid(), 'social.linkedin_url',  'https://linkedin.com/company/ssssy', 'https://linkedin.com/company/ssssy', 'social', 'Social: LinkedIn page URL'),
  (gen_random_uuid(), 'social.youtube_url',   'https://youtube.com/@ssssy', 'https://youtube.com/@ssssy',   'social', 'Social: YouTube channel URL');
