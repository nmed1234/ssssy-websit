CREATE TABLE IF NOT EXISTS content_strings (
    id UUID PRIMARY KEY,
    string_key VARCHAR(255) NOT NULL UNIQUE,
    value_en TEXT NOT NULL DEFAULT '',
    value_ar TEXT NOT NULL DEFAULT '',
    string_group VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_strings_group ON content_strings(string_group);
CREATE INDEX idx_content_strings_key ON content_strings(string_key);

-- Seed: navigation
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  (gen_random_uuid(), 'nav.home', 'Home', 'الرئيسية', 'navigation', 'Navigation: Home link'),
  (gen_random_uuid(), 'nav.about', 'About', 'من نحن', 'navigation', 'Navigation: About link'),
  (gen_random_uuid(), 'nav.news', 'News', 'الأخبار', 'navigation', 'Navigation: News link'),
  (gen_random_uuid(), 'nav.events', 'Events', 'الفعاليات', 'navigation', 'Navigation: Events link'),
  (gen_random_uuid(), 'nav.jobs', 'Jobs', 'الوظائف', 'navigation', 'Navigation: Jobs link'),
  (gen_random_uuid(), 'nav.contact', 'Contact', 'اتصل بنا', 'navigation', 'Navigation: Contact link'),
  (gen_random_uuid(), 'nav.publications', 'Publications', 'المنشورات', 'navigation', 'Navigation: Publications link'),
  (gen_random_uuid(), 'nav.membership', 'Membership', 'العضوية', 'navigation', 'Navigation: Membership link'),
  (gen_random_uuid(), 'nav.login', 'Login', 'تسجيل الدخول', 'navigation', 'Navigation: Login link');

-- Seed: footer
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  (gen_random_uuid(), 'footer.quick_links', 'Quick Links', 'روابط سريعة', 'footer', 'Footer: Quick Links heading'),
  (gen_random_uuid(), 'footer.contact_info', 'Contact Info', 'معلومات الاتصال', 'footer', 'Footer: Contact Info heading'),
  (gen_random_uuid(), 'footer.about_heading', 'About SSSSY', 'عن الجمعية', 'footer', 'Footer: About heading'),
  (gen_random_uuid(), 'footer.about_text', 'The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science and sustainable land management in Syria.', 'تكرس الجمعية السورية لعلوم التربة جهودها لتطوير علوم التربة والإدارة المستدامة للأراضي في سوريا.', 'footer', 'Footer: About description'),
  (gen_random_uuid(), 'footer.address', 'Damascus, Syria', 'دمشق، سوريا', 'footer', 'Footer: Address'),
  (gen_random_uuid(), 'footer.email', 'info@ssssy.org', 'info@ssssy.org', 'footer', 'Footer: Email'),
  (gen_random_uuid(), 'footer.phone', '+963 11 234 5678', '+963 11 234 5678', 'footer', 'Footer: Phone'),
  (gen_random_uuid(), 'footer.copyright', 'Syrian Soil Science Society (SSSSY). All rights reserved.', 'الجمعية السورية لعلوم التربة. جميع الحقوق محفوظة.', 'footer', 'Footer: Copyright text');

-- Seed: site
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  (gen_random_uuid(), 'site.name', 'SSSSY', 'الجمعية السورية لعلوم التربة', 'site', 'Site name'),
  (gen_random_uuid(), 'site.short_name', 'SSSSY', 'جمعية علوم التربة', 'site', 'Site short name / brand'),
  (gen_random_uuid(), 'site.description', 'Advancing soil science research, education, and sustainable land management in Syria.', 'تعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا.', 'site', 'Site description for SEO / JSON-LD');

-- Seed: general
INSERT INTO content_strings (id, string_key, value_en, value_ar, string_group, description) VALUES
  (gen_random_uuid(), 'general.read_more', 'Read More', 'اقرأ المزيد', 'general', 'General: Read more link'),
  (gen_random_uuid(), 'general.view_all', 'View All', 'عرض الكل', 'general', 'General: View all link'),
  (gen_random_uuid(), 'general.loading', 'Loading...', 'جار التحميل...', 'general', 'General: Loading text'),
  (gen_random_uuid(), 'general.error', 'Something went wrong', 'حدث خطأ ما', 'general', 'General: Error message'),
  (gen_random_uuid(), 'general.search', 'Search', 'بحث', 'general', 'General: Search label'),
  (gen_random_uuid(), 'general.no_results', 'No results found', 'لا توجد نتائج', 'general', 'General: No results');
