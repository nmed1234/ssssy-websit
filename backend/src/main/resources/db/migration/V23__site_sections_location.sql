ALTER TABLE site_sections ADD COLUMN location VARCHAR(50) DEFAULT 'general';

-- Tag seeded sections as homepage sections
UPDATE site_sections SET location = 'homepage' WHERE slug IN (
  'hero-banner', 'features-grid', 'cta-banner', 'stats-counter',
  'testimonials', 'newsletter-signup', 'contact-form'
);

CREATE INDEX idx_site_sections_location ON site_sections(location);
