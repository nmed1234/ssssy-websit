-- V36: Seed 50+ system component presets for the Page Builder Preset Library
-- Each preset has a component_type, descriptive name (AR/EN), and example styling/data JSON.

INSERT INTO component_presets (name_en, name_ar, component_type, config_json, data_json, styling_json)
VALUES

-- ── HERO SECTIONS ────────────────────────────────────────────────────────────
('Hero Banner – Dark',      'بانر رئيسي – داكن',      'hero-banner',
  '{"layout":"centered","overlay":true}'::jsonb,
  '{"titleEn":"Welcome to SSSSY","titleAr":"مرحباً بكم في جمعية علوم التربة","subtitle":"Building tomorrow''s soil science","btnLabel":"Learn More","btnUrl":"/about"}'::jsonb,
  '{"bgType":"image","overlayColor":"#00000060","color":"#ffffff","textAlign":"center","minHeight":"600px","paddingTop":"120px","paddingBottom":"120px"}'::jsonb),

('Hero Banner – Split',     'بانر رئيسي – منقسم',     'hero-split',
  '{"layout":"split","imageRight":true}'::jsonb,
  '{"titleEn":"Advancing Soil Science","titleAr":"تطوير علوم التربة","subtitle":"Research • Education • Innovation","btnLabel":"Join Us","btnUrl":"/register"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#FFF8E1","color":"#3E2723","padding":"py-20"}'::jsonb),

('Hero – Video Background',  'بانر بخلفية فيديو',      'video-hero',
  '{"autoplay":true,"muted":true}'::jsonb,
  '{"titleEn":"The Future of Soil","btnLabel":"Explore Research","btnUrl":"/news"}'::jsonb,
  '{"bgType":"video","overlayColor":"#00000070","color":"#ffffff","textAlign":"center","minHeight":"500px"}'::jsonb),

-- ── FEATURES ─────────────────────────────────────────────────────────────────
('Features Grid – Icons',   'ميزات شبكية مع أيقونات',  'features-grid',
  '{"columns":3}'::jsonb,
  '{"titleEn":"Why Join SSSSY?","items":[{"icon":"Microscope","titleEn":"Research","descEn":"Access peer-reviewed research"},{"icon":"Users","titleEn":"Network","descEn":"Connect with 500+ members"},{"icon":"Award","titleEn":"Recognition","descEn":"Annual awards program"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16","textAlign":"center"}'::jsonb),

('Features List – Left',    'قائمة ميزات – يسار',       'features-list',
  '{"showNumbers":true}'::jsonb,
  '{"titleEn":"Our Key Programs","items":[{"titleEn":"Annual Conference","descEn":"The premier soil science event in Syria"},{"titleEn":"Research Grants","descEn":"Funding for innovative projects"},{"titleEn":"Training Workshops","descEn":"Skills for the modern agronomist"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-16"}'::jsonb),

-- ── CTA ──────────────────────────────────────────────────────────────────────
('CTA – Centered',          'دعوة للعمل – وسط',         'cta',
  '{"layout":"centered"}'::jsonb,
  '{"titleEn":"Ready to Contribute?","subtitle":"Join thousands of soil scientists shaping the future.","btnLabel":"Become a Member","btnUrl":"/register","btnSecondaryLabel":"Learn More","btnSecondaryUrl":"/about"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#3E2723","color":"#FFF8E1","textAlign":"center","paddingTop":"80px","paddingBottom":"80px"}'::jsonb),

('CTA – Banner Strip',      'شريط دعوة للعمل',          'cta-split',
  '{"layout":"split"}'::jsonb,
  '{"titleEn":"Subscribe to Our Newsletter","btnLabel":"Subscribe Now","btnUrl":"/newsletter"}'::jsonb,
  '{"bgType":"gradient","backgroundImage":"linear-gradient(90deg,#3E2723,#558B2F)","color":"#ffffff","paddingTop":"40px","paddingBottom":"40px"}'::jsonb),

-- ── STATS ─────────────────────────────────────────────────────────────────────
('Stats Counter',           'عداد الإحصائيات',          'stats',
  '{"animated":true}'::jsonb,
  '{"titleEn":"SSSSY in Numbers","items":[{"value":"500+","label":"Members"},{"value":"25","label":"Years"},{"value":"120","label":"Publications"},{"value":"48","label":"Events"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#3E2723","color":"#FFF8E1","textAlign":"center","padding":"py-16"}'::jsonb),

('Stats Grid Light',        'شبكة إحصائيات فاتحة',      'stats-grid',
  '{"columns":4}'::jsonb,
  '{"items":[{"value":"1000","label":"Hectares Studied"},{"value":"80%","label":"Members Active"},{"value":"30","label":"Partner Universities"},{"value":"15","label":"Countries"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","textAlign":"center","padding":"py-12"}'::jsonb),

-- ── GALLERY ──────────────────────────────────────────────────────────────────
('Gallery – Masonry',       'معرض صور – حجري',          'gallery-masonry',
  '{"columns":3,"lightbox":true}'::jsonb,
  '{"titleEn":"Our Events Gallery"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-12"}'::jsonb),

('Gallery – Slider',        'معرض صور – شريحة',          'gallery-slider',
  '{"autoplay":true,"interval":4000}'::jsonb,
  '{"titleEn":"Featured Photos"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#1a1a1a","color":"#ffffff","padding":"py-8"}'::jsonb),

-- ── TEAM / BOARD ─────────────────────────────────────────────────────────────
('Team Grid',               'شبكة الفريق',               'team',
  '{"columns":4,"showSocial":true}'::jsonb,
  '{"titleEn":"Meet the Board","subtitle":"Leading soil science professionals"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","textAlign":"center","padding":"py-16"}'::jsonb),

('Team Cards',              'بطاقات الفريق',             'team-grid',
  '{"style":"cards"}'::jsonb,
  '{"titleEn":"Our Executive Committee"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16"}'::jsonb),

-- ── TESTIMONIALS ─────────────────────────────────────────────────────────────
('Testimonials',            'شهادات الأعضاء',            'testimonials',
  '{"style":"cards","columns":3}'::jsonb,
  '{"titleEn":"What Our Members Say","items":[{"text":"SSSSY changed my career trajectory.","author":"Dr. Ahmad","role":"Researcher"},{"text":"Invaluable networking opportunities.","author":"Eng. Sara","role":"Agronomist"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#FFF8E1","padding":"py-16"}'::jsonb),

('Testimonials Slider',     'شهادات – شريحة',            'testimonials-slider',
  '{"autoplay":true}'::jsonb,
  '{"titleEn":"Member Testimonials"}'::jsonb,
  '{"bgType":"gradient","backgroundImage":"linear-gradient(135deg,#3E2723,#6D4C41)","color":"#FFF8E1","padding":"py-20"}'::jsonb),

-- ── FAQ ───────────────────────────────────────────────────────────────────────
('FAQ Accordion',           'أسئلة شائعة – أكورديون',    'faq',
  '{"openFirst":true}'::jsonb,
  '{"titleEn":"Frequently Asked Questions","items":[{"q":"How do I join SSSSY?","a":"Visit our membership page and complete the online application."},{"q":"What are the membership fees?","a":"Annual fees vary by member category. Check the membership page for current rates."}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-16","maxWidth":"800px"}'::jsonb),

-- ── PRICING ──────────────────────────────────────────────────────────────────
('Pricing Table',           'جدول الأسعار',              'pricing-table',
  '{"columns":3,"showToggle":true}'::jsonb,
  '{"titleEn":"Membership Plans","items":[{"name":"Student","price":"Free","features":["Journal access","Event discounts"]},{"name":"Regular","price":"$50/yr","features":["Full access","Voting rights","Certificate"]},{"name":"Institutional","price":"$200/yr","features":["10 accounts","API access","Priority support"]}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","textAlign":"center","padding":"py-16"}'::jsonb),

-- ── TIMELINE ─────────────────────────────────────────────────────────────────
('Timeline – Vertical',     'جدول زمني – رأسي',          'timeline',
  '{"layout":"vertical"}'::jsonb,
  '{"titleEn":"Our History","items":[{"year":"1999","titleEn":"Founded","descEn":"SSSSY established in Damascus"},{"year":"2005","titleEn":"First Conference","descEn":"100+ attendees"},{"year":"2015","titleEn":"Digital Launch","descEn":"Online membership portal"},{"year":"2024","titleEn":"New Website","descEn":"Modernised platform"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-16"}'::jsonb),

-- ── BLOG / NEWS ──────────────────────────────────────────────────────────────
('Blog Feed – Grid',        'أحدث المقالات – شبكة',      'blog-grid',
  '{"columns":3,"showExcerpt":true,"dataSource":"latest-articles"}'::jsonb,
  '{"titleEn":"Latest News & Research","btnLabel":"View All","btnUrl":"/news"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-16"}'::jsonb),

('News Ticker',             'شريط الأخبار',              'blog-feed',
  '{"style":"ticker","speed":"medium"}'::jsonb,
  '{"titleEn":"Recent Updates","dataSource":"latest-articles"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#3E2723","color":"#FFF8E1","paddingTop":"12px","paddingBottom":"12px"}'::jsonb),

-- ── EVENTS ────────────────────────────────────────────────────────────────────
('Events Grid',             'شبكة الفعاليات',            'events-grid',
  '{"columns":3,"dataSource":"upcoming-events","maxItems":6}'::jsonb,
  '{"titleEn":"Upcoming Events","btnLabel":"See All Events","btnUrl":"/events"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16"}'::jsonb),

('Events Calendar Strip',   'شريط تقويم الفعاليات',      'events-calendar',
  '{"style":"list","dataSource":"upcoming-events","maxItems":4}'::jsonb,
  '{"titleEn":"Next Events"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-12"}'::jsonb),

-- ── CONTACT ──────────────────────────────────────────────────────────────────
('Contact Form',            'نموذج التواصل',             'contact-form',
  '{"showPhone":true,"showSubject":true}'::jsonb,
  '{"titleEn":"Get in Touch","subtitle":"We respond within 24 hours."}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16"}'::jsonb),

('Contact Info Block',      'كتلة معلومات التواصل',      'contact-info',
  '{}'::jsonb,
  '{"titleEn":"Contact Information","address":"Damascus, Syria","phone":"+963 11 XXX XXXX","email":"info@ssssy.org.sy"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#3E2723","color":"#FFF8E1","padding":"py-16"}'::jsonb),

-- ── NEWSLETTER ───────────────────────────────────────────────────────────────
('Newsletter Signup',       'الاشتراك في النشرة',        'newsletter-signup',
  '{"showNameField":true}'::jsonb,
  '{"titleEn":"Stay Updated","subtitle":"Get the latest soil science news in your inbox.","btnLabel":"Subscribe"}'::jsonb,
  '{"bgType":"gradient","backgroundImage":"linear-gradient(135deg,#558B2F,#2E7D32)","color":"#ffffff","textAlign":"center","padding":"py-16"}'::jsonb),

-- ── RICH TEXT & CONTENT ──────────────────────────────────────────────────────
('Rich Text Block',         'كتلة نص منسق',              'rich-text',
  '{}'::jsonb,
  '{"titleEn":"About Our Mission","body":"<p>The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science research, education, and professional development.</p>"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","maxWidth":"820px","padding":"py-12"}'::jsonb),

('Two-Column Text',         'نص بعمودين',                 'image-text',
  '{"imageRight":false,"imageRatio":"50-50"}'::jsonb,
  '{"titleEn":"Our Vision","body":"<p>We envision a Syria with sustainable and productive soils.</p>","imageUrl":"/images/soil.jpg"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#FFF8E1","padding":"py-16"}'::jsonb),

-- ── MEDIA & LAYOUT ───────────────────────────────────────────────────────────
('Image Banner',            'لافتة صورة',                 'image',
  '{"contain":false}'::jsonb,
  '{"imageUrl":"/images/banner.jpg","altText":"SSSSY Banner"}'::jsonb,
  '{"bgType":"none","minHeight":"300px"}'::jsonb),

('Divider Line',            'خط فاصل',                    'divider',
  '{"style":"solid"}'::jsonb,
  '{}'::jsonb,
  '{"borderColor":"#e5e7eb","borderWidth":"1px","marginTop":"32px","marginBottom":"32px"}'::jsonb),

('Spacer – Small',          'مسافة – صغيرة',              'spacer',
  '{"height":"40px"}'::jsonb,
  '{}'::jsonb,
  '{"minHeight":"40px"}'::jsonb),

('Spacer – Large',          'مسافة – كبيرة',              'spacer',
  '{"height":"80px"}'::jsonb,
  '{}'::jsonb,
  '{"minHeight":"80px"}'::jsonb),

-- ── MAPS ─────────────────────────────────────────────────────────────────────
('Location Map',            'خريطة الموقع',               'map',
  '{"zoom":13,"provider":"osm"}'::jsonb,
  '{"titleEn":"Find Us","lat":"33.5138","lng":"36.2765","address":"Damascus, Syria"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-12"}'::jsonb),

-- ── ACCORDION & TABS ─────────────────────────────────────────────────────────
('Accordion',               'أكورديون',                   'accordion',
  '{"multiple":false}'::jsonb,
  '{"titleEn":"Expandable Content","items":[{"titleEn":"Section One","body":"Content for section one"},{"titleEn":"Section Two","body":"Content for section two"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-12","maxWidth":"860px"}'::jsonb),

('Tabs Panel',              'علامات التبويب',              'tabs',
  '{"style":"underline"}'::jsonb,
  '{"items":[{"titleEn":"Overview","body":"Overview content here"},{"titleEn":"Details","body":"Details content here"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-12"}'::jsonb),

-- ── CARDS ────────────────────────────────────────────────────────────────────
('Card Group – 3 Cols',     'مجموعة بطاقات – 3 أعمدة',   'card-group',
  '{"columns":3}'::jsonb,
  '{"titleEn":"Our Services","items":[{"titleEn":"Research","descEn":"Cutting-edge soil studies","icon":"Microscope"},{"titleEn":"Education","descEn":"Workshops and courses","icon":"BookOpen"},{"titleEn":"Networking","descEn":"Connect with peers","icon":"Users"}]}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16","textAlign":"center"}'::jsonb),

('Card – Single Feature',   'بطاقة ميزة فردية',           'card',
  '{"elevated":true}'::jsonb,
  '{"titleEn":"Research Grant Program","descEn":"Apply for funding for your soil science research project.","btnLabel":"Apply Now","btnUrl":"/jobs","imageUrl":"/images/research.jpg"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","borderRadius":"12px","boxShadow":"0 4px 20px rgba(0,0,0,0.08)","padding":"py-8"}'::jsonb),

-- ── SOCIAL / SHARE ───────────────────────────────────────────────────────────
('Social Media Links',      'روابط التواصل الاجتماعي',    'social-share',
  '{"style":"icons","size":"md"}'::jsonb,
  '{"facebook":"https://facebook.com/ssssy","twitter":"https://twitter.com/ssssy","linkedin":"https://linkedin.com/company/ssssy"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","textAlign":"center","paddingTop":"24px","paddingBottom":"24px"}'::jsonb),

-- ── SEARCH ───────────────────────────────────────────────────────────────────
('Search Bar',              'شريط البحث',                 'search',
  '{"placeholder":"Search articles, events, publications..."}'::jsonb,
  '{"titleEn":"Find What You Need"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","paddingTop":"40px","paddingBottom":"40px","maxWidth":"700px","textAlign":"center"}'::jsonb),

-- ── MEMBERS ──────────────────────────────────────────────────────────────────
('Members Directory',       'دليل الأعضاء',               'members-directory',
  '{"columns":4,"dataSource":"board-members","maxItems":8}'::jsonb,
  '{"titleEn":"Board of Directors","btnLabel":"View All Members","btnUrl":"/members"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#ffffff","padding":"py-16"}'::jsonb),

-- ── PUBLICATIONS ─────────────────────────────────────────────────────────────
('Publications List',       'قائمة المنشورات',            'publications-list',
  '{"style":"list","dataSource":"latest-articles","maxItems":5}'::jsonb,
  '{"titleEn":"Recent Publications","btnLabel":"Browse All","btnUrl":"/publications"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#f7f8fa","padding":"py-16"}'::jsonb),

-- ── ANNOUNCEMENT BANNER ──────────────────────────────────────────────────────
('Announcement Banner',     'لافتة إعلان',                 'banner',
  '{"closeable":true}'::jsonb,
  '{"message":"Annual conference registration is now open!","btnLabel":"Register","btnUrl":"/events"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#558B2F","color":"#ffffff","paddingTop":"12px","paddingBottom":"12px","textAlign":"center"}'::jsonb),

-- ── IFRAME / EMBED ───────────────────────────────────────────────────────────
('Video Embed',             'تضمين فيديو',                 'video-embed',
  '{"provider":"youtube","responsive":true}'::jsonb,
  '{"titleEn":"Introduction to SSSSY","videoUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ"}'::jsonb,
  '{"bgType":"solid","backgroundColor":"#000000","padding":"py-8","textAlign":"center"}'::jsonb)

ON CONFLICT DO NOTHING;
