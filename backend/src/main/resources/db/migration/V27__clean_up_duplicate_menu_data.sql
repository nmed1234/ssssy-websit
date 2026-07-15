-- Clean up duplicate menu data
-- Step 1: Find and delete duplicate menus (keeping the oldest one by created_at)
DELETE FROM menus
WHERE id NOT IN (
  SELECT DISTINCT ON (location) id
  FROM menus
  ORDER BY location, created_at ASC
);

-- Step 2: For each menu, find and delete duplicate menu items (keeping the oldest one by created_at per menu_id and sort_order)
DELETE FROM menu_items
WHERE id NOT IN (
  SELECT DISTINCT ON (menu_id, sort_order) id
  FROM menu_items
  ORDER BY menu_id, sort_order, created_at ASC
);

-- Step 3: Clean up duplicate site sections (keeping the oldest one by created_at per location and slug)
DELETE FROM site_sections
WHERE id NOT IN (
  SELECT DISTINCT ON (location, slug) id
  FROM site_sections
  ORDER BY location, slug, created_at ASC
);

-- Step 4: Clean up duplicate content strings (keeping the oldest one by created_at per string_key)
DELETE FROM content_strings
WHERE id NOT IN (
  SELECT DISTINCT ON (string_key) id
  FROM content_strings
  ORDER BY string_key, created_at ASC
);

-- Step 5: Clean up duplicate menu items with same label and menu_id
DELETE FROM menu_items mi
WHERE mi.id NOT IN (
    SELECT (array_agg(id ORDER BY created_at ASC))[1]
    FROM menu_items
    GROUP BY menu_id, label_en, label_ar
);
