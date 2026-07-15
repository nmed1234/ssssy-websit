CREATE TABLE site_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE,
    component_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    data JSONB NOT NULL DEFAULT '{}',
    styling JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_sections_active ON site_sections(is_active);
CREATE INDEX idx_site_sections_component_type ON site_sections(component_type);
CREATE INDEX idx_site_sections_slug ON site_sections(slug);

-- Seed: Hero Banner
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Hero Banner', 'hero-banner', 'hero',
  '{"maxWidth": "max-w-4xl"}',
  '{"title": "Welcome to the Syrian Soil Science Society", "subtitle": "Advancing soil science research, education, and sustainable land management for a greener Syria", "buttonLabel": "Learn More", "buttonUrl": "/about", "backgroundImage": ""}',
  '{"backgroundColor": "bg-soil-dark", "padding": "py-24", "textColor": "text-white"}',
  true, 1);

-- Seed: Features Grid
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Features Grid', 'features-grid', 'card-group',
  '{"columns": 3, "maxWidth": "max-w-6xl"}',
  '{"title": "Our Focus Areas", "items": [{"title": "Research", "content": "Advancing soil science through cutting-edge research and field studies across Syria\u2019s diverse agricultural regions."}, {"title": "Education", "content": "Providing training, workshops, and educational programs for soil scientists, students, and farmers."}, {"title": "Sustainability", "content": "Promoting sustainable land management practices for long-term environmental health and food security."}]}',
  '{"backgroundColor": "bg-white", "padding": "py-16", "textColor": "text-gray-900"}',
  true, 2);

-- Seed: Call to Action
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Call to Action', 'cta-banner', 'cta',
  '{"maxWidth": "max-w-4xl"}',
  '{"title": "Join Our Community", "content": "Become a member of the Syrian Soil Science Society and contribute to the future of soil science in Syria and beyond.", "buttonLabel": "Become a Member", "buttonUrl": "/members"}',
  '{"backgroundColor": "bg-soil-clay", "padding": "py-16", "textColor": "text-white"}',
  true, 3);

-- Seed: Statistics Counter
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Statistics Counter', 'stats-counter', 'stats',
  '{"maxWidth": "max-w-4xl"}',
  '{"title": "Our Impact", "items": [{"value": "500+", "title": "Members"}, {"value": "50+", "title": "Research Papers"}, {"value": "30+", "title": "Events Hosted"}, {"value": "15+", "title": "Years of Service"}]}',
  '{"backgroundColor": "bg-gray-50", "padding": "py-16", "textColor": "text-gray-900"}',
  true, 4);

-- Seed: Testimonials
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Testimonials', 'testimonials', 'testimonial',
  '{"maxWidth": "max-w-6xl"}',
  '{"title": "What Our Members Say", "items": [{"name": "Dr. Ahmad Al-Khatib", "role": "Soil Scientist", "content": "SSSSY has been instrumental in connecting soil scientists across Syria and fostering meaningful collaboration."}, {"name": "Prof. Layla Hassan", "role": "University of Damascus", "content": "The society\u2019s workshops and conferences have greatly advanced my research and teaching in soil science."}, {"name": "Eng. Omar Saleh", "role": "Ministry of Agriculture", "content": "Working with SSSSY has helped us implement better soil conservation practices nationwide."}]}',
  '{"backgroundColor": "bg-white", "padding": "py-16", "textColor": "text-gray-900"}',
  true, 5);

-- Seed: Newsletter Signup
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Newsletter Signup', 'newsletter-signup', 'newsletter',
  '{"maxWidth": "max-w-3xl"}',
  '{"title": "Stay Updated", "content": "Subscribe to our newsletter for the latest news, events, and research from SSSSY."}',
  '{"backgroundColor": "bg-soil-dark", "padding": "py-16", "textColor": "text-white"}',
  true, 6);

-- Seed: Contact Form
INSERT INTO site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order) VALUES
(gen_random_uuid(), 'Contact Form', 'contact-form', 'contact-form',
  '{"maxWidth": "max-w-2xl"}',
  '{"title": "Get In Touch", "content": "Have questions or want to get involved? We\u2019d love to hear from you."}',
  '{"backgroundColor": "bg-white", "padding": "py-16", "textColor": "text-gray-900"}',
  true, 7);
