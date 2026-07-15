-- V50: Seed publications-carousel homepage section.
--      Sort order 6 (between Testimonials=5 and Newsletter).
--      Also shifts newsletter to 7 and contact-form to 8 per plan.

INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Publications Carousel',
  'publications-carousel',
  'publications-carousel',
  'homepage',
  '{
    "titleEn": "Publications",
    "titleAr": "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a",
    "viewMoreLabelEn": "View All Publications",
    "viewMoreLabelAr": "\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a",
    "viewMoreUrl": "/publications"
  }'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  TRUE,
  6
)
ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  component_type = EXCLUDED.component_type,
  location       = EXCLUDED.location,
  config         = EXCLUDED.config,
  data           = EXCLUDED.data,
  styling        = EXCLUDED.styling,
  is_active      = EXCLUDED.is_active,
  sort_order     = EXCLUDED.sort_order,
  updated_at     = CURRENT_TIMESTAMP;

-- Shift newsletter and contact-form to maintain correct order
UPDATE site_sections SET sort_order = 7, updated_at = CURRENT_TIMESTAMP WHERE slug = 'newsletter-signup';
UPDATE site_sections SET sort_order = 8, updated_at = CURRENT_TIMESTAMP WHERE slug = 'contact-form';
