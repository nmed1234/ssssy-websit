-- Set all pages to published
UPDATE pages SET is_published = TRUE WHERE is_published = FALSE;
