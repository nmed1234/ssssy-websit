-- V38: Add layout_json column to pages table
-- This stores the full nested block tree for the new page builder.
-- The old page_sections table is kept for backwards compatibility.
-- New pages write to layout_json only; old pages are migrated on first edit.

ALTER TABLE pages ADD COLUMN IF NOT EXISTS layout_json TEXT;

COMMENT ON COLUMN pages.layout_json IS
  'Full page block tree as a JSON document {"version":"1","blocks":[...]}. '
  'When present, the page builder reads/writes this column. '
  'Legacy pages still served via page_sections until migrated.';
