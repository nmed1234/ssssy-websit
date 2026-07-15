-- V47: Remove legacy homepage sections seeded by V22 that are now superseded
--      by the bilingual equivalents seeded by V46.
--
--  Legacy slug        componentType  Replaced by
--  ─────────────────  ─────────────  ──────────────────
--  features-grid      card-group     our-focus-areas
--  cta-banner         cta            join-our-community
--  stats-counter      stats          statistics
--
-- The V46 sections (and the unchanged ones: hero-banner, testimonials,
-- newsletter-signup, contact-form) are kept as-is.

DELETE FROM site_sections
WHERE slug IN ('features-grid', 'cta-banner', 'stats-counter');
