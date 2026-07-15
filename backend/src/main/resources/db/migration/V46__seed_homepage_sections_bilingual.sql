-- V46: Replace homepage section seed data with fully bilingual config/data JSON
--      that matches the keys the React section components actually read.
--      Uses INSERT ... ON CONFLICT (slug) DO UPDATE so it is safe to re-run.

-- 1. Hero Banner
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Homepage Hero', 'hero-banner', 'hero', 'homepage',
  '{"titleEn":"Advancing Soil Science in Syria","titleAr":"\u062a\u0637\u0648\u064a\u0631 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627","subtitleAr":"\u062c\u0645\u0639\u064a\u0629 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629","descriptionEn":"Advancing soil science research, education, and sustainable land management in Syria","descriptionAr":"\u062a\u0639\u0632\u064a\u0632 \u0623\u0628\u062d\u0627\u062b \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0648\u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0648\u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0644\u0644\u0623\u0631\u0627\u0636\u064a \u0641\u064a \u0633\u0648\u0631\u064a\u0627","primaryButtonLabelEn":"Join Us","primaryButtonLabelAr":"\u0627\u0646\u0636\u0645 \u0625\u0644\u064a\u0646\u0627","primaryButtonUrl":"/members","secondaryButtonLabelEn":"Learn More","secondaryButtonLabelAr":"\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f","secondaryButtonUrl":"/about","backgroundImage":""}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, true, 1
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 2. Our Focus Areas
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Our Focus Areas', 'our-focus-areas', 'card-group', 'homepage',
  '{"titleEn":"Our Focus Areas","titleAr":"\u0645\u062c\u0627\u0644\u0627\u062a \u0627\u0647\u062a\u0645\u0627\u0645\u0646\u0627"}'::jsonb,
  '{"items":[{"titleEn":"Research","titleAr":"\u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0639\u0644\u0645\u064a","descriptionEn":"Advancing soil science through cutting-edge research and field studies across Syria''s diverse agricultural regions.","descriptionAr":"\u062a\u0639\u0632\u064a\u0632 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0627\u0644\u0623\u0628\u062d\u0627\u062b \u0627\u0644\u0645\u062a\u0637\u0648\u0631\u0629 \u0648\u0627\u0644\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0632\u0631\u0627\u0639\u064a\u0629 \u0627\u0644\u0645\u062a\u0646\u0648\u0639\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627."},{"titleEn":"Education","titleAr":"\u0627\u0644\u062a\u0639\u0644\u064a\u0645","descriptionEn":"Providing training, workshops, and educational programs for soil scientists, students, and farmers.","descriptionAr":"\u062a\u0648\u0641\u064a\u0631 \u0627\u0644\u062a\u062f\u0631\u064a\u0628 \u0648\u0648\u0631\u0634 \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u0628\u0631\u0627\u0645\u062c \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u064a\u0629 \u0644\u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u062a\u0631\u0628\u0629 \u0648\u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064a\u0646."},{"titleEn":"Sustainability","titleAr":"\u0627\u0644\u0627\u0633\u062a\u062f\u0627\u0645\u0629","descriptionEn":"Promoting sustainable land management practices to protect and enhance Syria''s soil resources for future generations.","descriptionAr":"\u062a\u0639\u0632\u064a\u0632 \u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0644\u0644\u0623\u0631\u0627\u0636\u064a \u0644\u062d\u0645\u0627\u064a\u0629 \u0645\u0648\u0627\u0631\u062f \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629 \u0648\u062a\u0637\u0648\u064a\u0631\u0647\u0627 \u0644\u0644\u0623\u062c\u064a\u0627\u0644 \u0627\u0644\u0642\u0627\u062f\u0645\u0629."}]}'::jsonb,
  '{}'::jsonb, true, 2
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 3. Join Our Community
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Join Our Community', 'join-our-community', 'cta', 'homepage',
  '{"titleEn":"Join Our Community","titleAr":"\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0645\u062c\u062a\u0645\u0639\u0646\u0627","subtitleEn":"Become a member of the Soil Science Society of Syria and contribute to the future of soil science in Syria and beyond.","subtitleAr":"\u0643\u0646 \u0639\u0636\u0648\u064b\u0627 \u0641\u064a \u062c\u0645\u0639\u064a\u0629 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629 \u0648\u0633\u0627\u0647\u0645 \u0641\u064a \u0645\u0633\u062a\u0642\u0628\u0644 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627 \u0648\u0645\u0627 \u0648\u0631\u0627\u0621\u0647\u0627.","buttonLabelEn":"Become a Member","buttonLabelAr":"\u0643\u0646 \u0639\u0636\u0648\u064b\u0627","buttonUrl":"/members"}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, true, 3
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 4. Statistics
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Statistics', 'statistics', 'stats', 'homepage',
  '{"titleEn":"SSSY by the Numbers","titleAr":"\u0627\u0644\u062c\u0645\u0639\u064a\u0629 \u0628\u0627\u0644\u0623\u0631\u0642\u0627\u0645"}'::jsonb,
  '{"items":[{"titleEn":"Years Established","titleAr":"\u0633\u0646\u0648\u0627\u062a \u0627\u0644\u062a\u0623\u0633\u064a\u0633","value":"15+"},{"titleEn":"Members","titleAr":"\u0627\u0644\u0623\u0639\u0636\u0627\u0621","value":"500+"},{"titleEn":"Publications","titleAr":"\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a","value":"200+"},{"titleEn":"Events","titleAr":"\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a","value":"50+"}]}'::jsonb,
  '{}'::jsonb, true, 4
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 5. Testimonials
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Testimonials', 'testimonials', 'testimonial', 'homepage',
  '{"titleEn":"What Our Members Say","titleAr":"\u0645\u0627\u0630\u0627 \u064a\u0642\u0648\u0644 \u0623\u0639\u0636\u0627\u0624\u0646\u0627"}'::jsonb,
  '{"items":[{"nameEn":"Dr. Ahmad Al-Khatib","nameAr":"\u062f. \u0623\u062d\u0645\u062f \u0627\u0644\u062e\u0637\u064a\u0628","roleEn":"Soil Scientist","roleAr":"\u0639\u0627\u0644\u0645 \u062a\u0631\u0628\u0629","quoteEn":"SSSY has been instrumental in connecting soil scientists across Syria and fostering meaningful collaboration.","quoteAr":"\u0623\u062f\u062a \u0627\u0644\u062c\u0645\u0639\u064a\u0629 \u062f\u0648\u0631\u064b\u0627 \u0645\u062d\u0648\u0631\u064a\u064b\u0627 \u0641\u064a \u0631\u0628\u0637 \u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627 \u0648\u062a\u0639\u0632\u064a\u0632 \u0627\u0644\u062a\u0639\u0627\u0648\u0646 \u0627\u0644\u062d\u0642\u064a\u0642\u064a \u0641\u064a\u0645\u0627 \u0628\u064a\u0646\u0647\u0645."},{"nameEn":"Prof. Layla Hassan","nameAr":"\u0623.\u062f. \u0644\u064a\u0644\u0649 \u062d\u0633\u0646","roleEn":"University of Damascus","roleAr":"\u062c\u0627\u0645\u0639\u0629 \u062f\u0645\u0634\u0642","quoteEn":"The society''s workshops and conferences have greatly advanced my research and teaching in soil science.","quoteAr":"\u0623\u0633\u0647\u0645\u062a \u0648\u0631\u0634 \u0639\u0645\u0644 \u0627\u0644\u062c\u0645\u0639\u064a\u0629 \u0648\u0645\u0624\u062a\u0645\u0631\u0627\u062a\u0647\u0627 \u0641\u064a \u062a\u0637\u0648\u064a\u0631 \u0623\u0628\u062d\u0627\u062b\u064a \u0648\u062a\u062f\u0631\u064a\u0633\u064a \u0641\u064a \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u062a\u0637\u0648\u0631\u064b\u0627 \u0645\u0644\u062d\u0648\u0638\u064b\u0627."},{"nameEn":"Eng. Omar Saleh","nameAr":"\u0645. \u0639\u0645\u0631 \u0635\u0627\u0644\u062d","roleEn":"Ministry of Agriculture","roleAr":"\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u0632\u0631\u0627\u0639\u0629","quoteEn":"Working with SSSY has helped us implement better soil conservation practices nationwide.","quoteAr":"\u0623\u0639\u0627\u0646\u062a\u0646\u0627 \u0627\u0644\u0634\u0631\u0627\u0643\u0629 \u0645\u0639 \u0627\u0644\u062c\u0645\u0639\u064a\u0629 \u0639\u0644\u0649 \u062a\u0637\u0628\u064a\u0642 \u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0623\u0641\u0636\u0644 \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u062a\u0631\u0628\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0637\u0646\u064a."}]}'::jsonb,
  '{}'::jsonb, true, 5
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 6. Newsletter Signup
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Newsletter Signup', 'newsletter-signup', 'newsletter', 'homepage',
  '{"titleEn":"Stay Connected","titleAr":"\u0627\u0628\u0642 \u0639\u0644\u0649 \u0627\u0637\u0644\u0627\u0639","subtitleEn":"Subscribe to our newsletter to receive the latest news, event announcements, and updates.","subtitleAr":"\u0627\u0634\u062a\u0631\u0643 \u0641\u064a \u0646\u0634\u0631\u062a\u0646\u0627 \u0627\u0644\u0625\u062e\u0628\u0627\u0631\u064a\u0629 \u0644\u0622\u062e\u0631 \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0648\u0627\u0644\u0623\u0628\u062d\u0627\u062b.","buttonLabelEn":"Subscribe","buttonLabelAr":"\u0627\u0634\u062a\u0631\u0643","placeholderTextEn":"Enter your email address","placeholderTextAr":"\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a"}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, true, 6
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- 7. Contact Form
INSERT INTO site_sections (name, slug, component_type, location, config, data, styling, is_active, sort_order)
VALUES (
  'Contact Form', 'contact-form', 'contact-form', 'homepage',
  '{"titleEn":"Get In Touch","titleAr":"\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627","submitLabelEn":"Send Message","submitLabelAr":"\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629"}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, true, 7
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, component_type=EXCLUDED.component_type, location=EXCLUDED.location,
  config=EXCLUDED.config, data=EXCLUDED.data, styling=EXCLUDED.styling,
  is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=CURRENT_TIMESTAMP;

-- Tag all homepage sections correctly
UPDATE site_sections SET location = 'homepage'
WHERE slug IN ('hero-banner','features-grid','cta-banner','stats-counter','testimonials',
               'newsletter-signup','contact-form','our-focus-areas','join-our-community','statistics');
