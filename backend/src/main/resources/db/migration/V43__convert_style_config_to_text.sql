-- V43: Convert style_config column from jsonb to text
-- Required because Hibernate's default String mapping does not support jsonb without
-- the hypersistence-utils or hibernate-types dependency.
-- TEXT stores JSON strings identically and is fully compatible with the Java String field.

ALTER TABLE menus
  ALTER COLUMN style_config TYPE TEXT USING style_config::text;
