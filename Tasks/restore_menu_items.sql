-- Restore missing menu items
-- First, make sure the header menu exists
INSERT INTO menus (id, name, location, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Navigation', 'header', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Now insert the missing menu items
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'بحث', 'Search', '/search', '_self', 7, true
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE menu_id = '00000000-0000-0000-0000-000000000001' AND url = '/search'
);

INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'تسجيل الدخول', 'Login', '/auth/login', '_self', 8, true
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE menu_id = '00000000-0000-0000-0000-000000000001' AND url = '/auth/login'
);

INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'الأعضاء', 'Members', '/members', '_self', 9, true
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE menu_id = '00000000-0000-0000-0000-000000000001' AND url = '/members'
);
