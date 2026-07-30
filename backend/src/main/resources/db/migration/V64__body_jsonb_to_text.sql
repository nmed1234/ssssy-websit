-- V64: Convert body columns from JSONB to TEXT
--
-- The `body` field holds raw HTML produced by the rich-text editor, not a JSON
-- document. JSONB rejects a plain VARCHAR/TEXT INSERT unless the value is
-- valid JSON, which causes the Hibernate batch error:
--   "column body is of type jsonb but expression is of type character varying"
--
-- Fix: change the column type to TEXT (which Hibernate maps correctly for a
-- plain Java String) while preserving all existing data.

ALTER TABLE content_items
    ALTER COLUMN body TYPE TEXT USING body::text;

ALTER TABLE content_versions
    ALTER COLUMN body TYPE TEXT USING body::text;
