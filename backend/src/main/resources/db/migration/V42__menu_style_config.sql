-- V42: Add style configuration columns to menus table
-- Supports dropdown templates, animation styles, default style flag, and freeform JSON config

ALTER TABLE menus
  ADD COLUMN menu_template    VARCHAR(50)  DEFAULT 'classic',
  ADD COLUMN dropdown_style   VARCHAR(50)  DEFAULT 'slide',
  ADD COLUMN is_default_style BOOLEAN      DEFAULT FALSE,
  ADD COLUMN style_config     JSONB;
