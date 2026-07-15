-- Debug: show current state of pages
SELECT id, title_ar, title_en, slug, is_published, is_homepage FROM pages;

-- Update all pages to set is_published = TRUE
UPDATE pages SET is_published = TRUE;

-- Verify the update
SELECT id, title_ar, title_en, slug, is_published, is_homepage FROM pages;
