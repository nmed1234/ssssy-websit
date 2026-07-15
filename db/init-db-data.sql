-- SQL Seed Data for Dynamic CMS Conversion
--
-- This script contains INSERT statements to migrate hardcoded content from
-- various frontend pages and menus into the database, making them editable
-- via the admin panel's Page Builder and Menu Management.
--
-- IMPORTANT:
-- 1. Before executing this script, ensure you have a running PostgreSQL database
--    and the backend application has already run its Flyway migrations to create
--    the necessary 'pages', 'page_sections', 'menus', and 'menu_items' tables.
-- 2. Execute these statements carefully. It's recommended to back up your database first.
-- -------------------------------------------------------------------------------------

-- Declare UUID variables for pages for easier referencing
DO $$
DECLARE
    about_us_page_id UUID := gen_random_uuid();
    board_page_id UUID := gen_random_uuid();
    contact_page_id UUID := gen_random_uuid();
    newsletter_page_id UUID := gen_random_uuid();
    president_message_page_id UUID := gen_random_uuid();
    publications_page_id UUID := gen_random_uuid();
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- From rules.md
    main_header_menu_id UUID := '00000000-0000-0000-0000-000000000001'; -- From V21__seed_header_menu_and_social.sql
BEGIN

-- =====================================================================================
-- PAGE: About Us
-- Slug: /about
-- =====================================================================================

-- Insert 'About Us' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    about_us_page_id,
    'من نحن',
    'About Us',
    'about',
    'FLEXIBLE',
    TRUE,
    FALSE,
    0,
    admin_user_id,
    'About Us - Syrian Soil Science Society',
    'Learn about the Syrian Soil Science Society, its vision, mission, and activities.',
    'About Us - SSSSY',
    'Discover the Syrian Soil Science Society: our history, mission, and commitment to sustainable soil management in Syria.',
    'http://localhost:3000/images/og-about.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-hero-banner',
    '{}'::jsonb,
    '{
        "titleAr": "من نحن",
        "titleEn": "About Us",
        "descriptionEn": "Learn about our society, our history, and our commitment to advancing soil science in Syria."
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-20 md:py-28",
        "overflow": "overflow-hidden",
        "animation": "animate-gradient"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: Overview Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-overview-section',
    '{}'::jsonb,
    '{
        "titleEn": "Society Overview",
        "paragraph1En": "The Syrian Soil Science Society (SSSSY) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria. Founded in 2008, the society brings together researchers, educators, students, and practitioners working in soil science and related environmental fields.",
        "paragraph2En": "SSSSY serves as a platform for knowledge exchange, scientific collaboration, and professional development. Through conferences, workshops, publications, and outreach programs, the society promotes sustainable soil management practices and advocates for policies that protect and enhance Syria''s soil resources.",
        "paragraph3En": "The society is committed to building capacity among young scientists, fostering interdisciplinary research, and raising public awareness about the critical role of soil in food security, environmental sustainability, and climate resilience. Over the past decade, SSSSY has grown into a respected institution both nationally and regionally, with a network of over 500 members across Syria and the Middle East."
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-4xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 3: Vision, Mission & Objectives Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-vision-mission-section',
    '{}'::jsonb,
    '{
        "titleEn": "Vision, Mission & Objectives",
        "descriptionEn": "Our guiding principles that shape every initiative and program we undertake.",
        "items": [
            {
                "icon": "Target",
                "titleEn": "Our Vision",
                "descEn": "To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably for the benefit of people and the environment.",
                "color": "from-forest to-forest-light"
            },
            {
                "icon": "Eye",
                "titleEn": "Our Mission",
                "descEn": "To advance soil science through research, education, and advocacy, promoting sustainable land use practices that enhance agricultural productivity, environmental quality, and human well-being.",
                "color": "from-soil-clay to-soil-dark"
            },
            {
                "icon": "List",
                "titleEn": "Our Objectives",
                "descEn": "1) Promote soil research and innovation. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies. 5) Build partnerships with national and international organizations.",
                "color": "from-forest-light to-forest"
            }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-soil-sand/30",
        "padding": "py-16 md:py-20"
    }'::jsonb,
    30,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 4: Organizational Chart Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-organizational-chart-section',
    '{}'::jsonb,
    '{
        "titleEn": "Organizational Structure",
        "paragraph1En": "The society is governed by a General Assembly comprising all active members, which elects a Board of Directors for a four-year term. The Board is responsible for setting strategic direction, overseeing operations, and managing the society''s finances and programs.",
        "paragraph2En": "The Board consists of a President, Vice President, Secretary, Treasurer, and several committee chairs representing key areas: Research & Publications, Education & Training, Events & Conferences, Membership & Outreach, and International Relations.",
        "paragraph3En": "Standing committees and working groups are formed as needed to address specific topics such as soil conservation, soil fertility, soil contamination, and remote sensing applications in soil science."
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-4xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    40,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 5: Timeline Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-timeline-section',
    '{}'::jsonb,
    '{
        "titleEn": "Our Journey",
        "descriptionEn": "Key milestones in the history of the Syrian Soil Science Society.",
        "milestones": [
            { "year": "2008", "titleEn": "Society Founded", "descEn": "SSSSY was established by a group of soil scientists and researchers." },
            { "year": "2012", "titleEn": "First Conference", "descEn": "The first national soil science conference was held in Damascus." },
            { "year": "2018", "titleEn": "Research Journal", "descEn": "Launched the Syrian Journal of Soil Science, a peer-reviewed publication." },
            { "year": "2024", "titleEn": "Digital Transformation", "descEn": "Migrated to a digital platform for publications, events, and member services." }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-soil-sand/30",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-4xl",
        "marginHorizontal": "mx-auto"
    }'::jsonb,
    50,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 6: Documents Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-documents-section',
    '{}'::jsonb,
    '{
        "titleEn": "Downloadable Documents",
        "documents": [
            { "nameEn": "SSSSY Bylaws (PDF)", "fileUrl": "/bylaws.pdf" },
            { "nameEn": "Annual Report 2024 (PDF)", "fileUrl": "/annual-report-2024.pdf" },
            { "nameEn": "Membership Form (PDF)", "fileUrl": "/membership-form.pdf" },
            { "nameEn": "Strategic Plan 2024-2028 (PDF)", "fileUrl": "/strategic-plan.pdf" }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-4xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    60,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 7: Gallery Section for About Us Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    about_us_page_id,
    'about-gallery-section',
    '{
        "layout": { "type": "masonry", "columns": { "mobile": 1, "tablet": 2, "desktop": 3, "wide": 4 }, "gap": 16, "aspectRatio": "auto", "maxImageHeight": null, "borderRadius": 8 },
        "hoverEffects": { "effect": "zoom", "overlayColor": "dark", "overlayOpacity": 60, "showTitleOnHover": true, "showDescriptionOnHover": false }
    }'::jsonb,
    '{
        "titleEn": "Photo Gallery",
        "descriptionEn": "A glimpse into our events, conferences, and field activities.",
        "images": [
            { "id": "1", "src": "https://placehold.co/800x600/6D4C41/FFF8E1?text=Annual+Conference+2024", "thumbnail": "https://placehold.co/200x150/6D4C41/FFF8E1?text=Conference", "alt": "Annual Conference 2024", "title": "Annual Conference 2024", "description": "The 6th annual soil science conference in Damascus", "width": 800, "height": 600 },
            { "id": "2", "src": "https://placehold.co/600x800/3E2723/FFF8E1?text=Field+Research+Trip", "thumbnail": "https://placehold.co/200x266/3E2723/FFF8E1?text=Field+Trip", "alt": "Field Research Trip", "title": "Field Research Trip", "description": "Soil sampling expedition to agricultural regions", "width": 600, "height": 800 },
            { "id": "3", "src": "https://placehold.co/800x800/558B2F/FFF8E1?text=Board+Meeting", "thumbnail": "https://placehold.co/200x200/558B2F/FFF8E1?text=Board", "alt": "Board Meeting", "title": "Board Meeting", "description": "Quarterly board of directors meeting", "width": 800, "height": 800 },
            { "id": "4", "src": "https://placehold.co/800x600/8D6E63/FFF8E1?text=Soil+Conservation+Workshop", "thumbnail": "https://placehold.co/200x150/8D6E63/FFF8E1?text=Workshop", "alt": "Workshop on Soil Conservation", "title": "Workshop on Soil Conservation", "description": "Hands-on training on sustainable soil practices", "width": 800, "height": 600 },
            { "id": "5", "src": "https://placehold.co/900x600/2E7D32/FFF8E1?text=Award+Ceremony", "thumbnail": "https://placehold.co/200x133/2E7D32/FFF8E1?text=Award", "alt": "Award Ceremony", "title": "Award Ceremony", "description": "Recognizing outstanding contributions to soil science", "width": 900, "height": 600 },
            { "id": "6", "src": "https://placehold.co/600x900/4E342E/FFF8E1?text=Laboratory+Session", "thumbnail": "https://placehold.co/200x300/4E342E/FFF8E1?text=Lab", "alt": "Laboratory Session", "title": "Laboratory Session", "description": "Soil analysis and testing demonstrations", "width": 600, "height": 900 },
            { "id": "7", "src": "https://placehold.co/800x800/BCAAA4/3E2723?text=Networking+Event", "thumbnail": "https://placehold.co/200x200/BCAAA4/3E2723?text=Networking", "alt": "Networking Event", "title": "Networking Event", "description": "Connecting researchers and practitioners", "width": 800, "height": 800 },
            { "id": "8", "src": "https://placehold.co/800x600/616161/FFF8E1?text=Environmental+Campaign", "thumbnail": "https://placehold.co/200x150/616161/FFF8E1?text=Campaign", "alt": "Environmental Campaign", "title": "Environmental Campaign", "description": "Community-led soil conservation initiative", "width": 800, "height": 600 }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-soil-sand/30",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-6xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    70,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- =====================================================================================
-- PAGE: Board of Directors
-- Slug: /board
-- =====================================================================================

-- Insert 'Board' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    board_page_id,
    'مجلس الإدارة',
    'Board of Directors',
    'board',
    'FLEXIBLE',
    TRUE,
    FALSE,
    10, -- Assuming a sort order
    admin_user_id,
    'Board of Directors - Syrian Soil Science Society',
    'Meet the leadership team guiding the Syrian Soil Science Society.',
    'Board of Directors - SSSSY',
    'Discover the leadership and vision of the Syrian Soil Science Society.',
    'http://localhost:3000/images/og-board.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for Board Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    board_page_id,
    'board-hero-banner',
    '{}'::jsonb,
    '{
        "titleAr": "مجلس الإدارة",
        "titleEn": "Board of Directors",
        "descriptionEn": "Meet the leadership team guiding the Syrian Soil Science Society"
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-20 md:py-28",
        "overflow": "overflow-hidden",
        "animation": "animate-gradient"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: Board Members Grid (Introductory Text)
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    board_page_id,
    'board-members-intro-grid',
    '{}'::jsonb,
    '{
        "titleEn": "Our Board Members",
        "paragraphEn": "The Board of Directors is elected by the General Assembly to serve a four-year term."
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-6xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2.1: Placeholder for Dynamic Board Members Grid
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    board_page_id,
    'board-members-grid',
    '{}'::jsonb,
    '{}'::jsonb, -- Data will be fetched by the frontend component
    '{
        "backgroundColor": "bg-white",
        "padding": "py-0"
    }'::jsonb,
    30,
    'ALWAYS',
    FALSE,
    NULL,
    NOW(),
    NOW()
);

-- Section 3: Board Term Information Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    board_page_id,
    'board-term-information-section',
    '{}'::jsonb,
    '{
        "titleEn": "Board Term Information",
        "paragraph1En": "The Board of Directors is elected by the General Assembly of the Syrian Soil Science Society for a renewable term of four years. Elections are held during the society''s annual general meeting, where all active members in good standing are eligible to vote.",
        "paragraph2En": "The current board term runs from January 2024 to December 2028. The board meets quarterly to review progress, discuss strategic initiatives, and oversee the implementation of the society''s programs and activities.",
        "paragraph3En": "For inquiries related to the Board of Directors, please contact the society''s secretariat at board@ssssy.org.",
        "termStartDate": "January 2024",
        "termEndDate": "December 2028",
        "contactEmail": "board@ssssy.org"
    }'::jsonb,
    '{
        "backgroundColor": "bg-soil-sand/30",
        "padding": "py-16 md:py-20",
        "maxWidth": "max-w-3xl",
        "marginHorizontal": "mx-auto",
        "textAlign": "text-center"
    }'::jsonb,
    40,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- =====================================================================================
-- PAGE: Contact Us
-- Slug: /contact
-- =====================================================================================

-- Insert 'Contact' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    contact_page_id,
    'اتصل بنا',
    'Contact Us',
    'contact',
    'FLEXIBLE',
    TRUE,
    FALSE,
    20, -- Assuming a sort order
    admin_user_id,
    'Contact Us - Syrian Soil Science Society',
    'Get in touch with the Syrian Soil Science Society.',
    'Contact Us - SSSSY',
    'Have a question, suggestion, or want to collaborate? We''d love to hear from you.',
    'http://localhost:3000/images/og-contact.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for Contact Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    contact_page_id,
    'contact-hero-banner',
    '{}'::jsonb,
    '{
        "titleAr": "اتصل بنا",
        "titleEn": "Contact Us",
        "descriptionEn": "Have a question, suggestion, or want to collaborate? We''d love to hear from you."
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-16 md:py-20",
        "overflow": "hidden"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: Contact Form Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    contact_page_id,
    'contact-form-section',
    '{}'::jsonb,
    '{
        "titleEn": "Send Us a Message"
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-12 md:py-16"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 3: Contact Information Display Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    contact_page_id,
    'contact-info-display-section',
    '{}'::jsonb,
    '{
        "titleEn": "Contact Information",
        "descriptionEn": "Get in touch with us through any of the channels below.",
        "infoItems": [
            { "icon": "MapPin", "titleEn": "Address", "contentEn": "Damascus, Syria" },
            { "icon": "Phone", "titleEn": "Phone", "contentEn": "+963 11 234 5678" },
            { "icon": "Mail", "titleEn": "Email", "contentEn": "info@ssssy.org.sy" },
            { "icon": "Clock", "titleEn": "Working Hours", "contentEn": "Sunday - Thursday, 9:00 AM - 5:00 PM" }
        ],
        "mapPlaceholderText": "Google Maps Placeholder"
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-0"
    }'::jsonb,
    30,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 4: Social Links Section (bottom of contact page)
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    contact_page_id,
    'social-media-links-section',
    '{}'::jsonb,
    '{
        "titleEn": "Follow Us",
        "links": [
            { "platform": "linkedin", "url": "https://linkedin.com/company/ssssy" },
            { "platform": "facebook", "url": "https://facebook.com/ssssy" },
            { "platform": "twitter", "url": "https://twitter.com/ssssy" },
            { "platform": "youtube", "url": "https://youtube.com/@ssssy" }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-soil-cream/30",
        "padding": "py-10",
        "borderTop": "border-t border-soil-sand/30"
    }'::jsonb,
    40,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- =====================================================================================
-- PAGE: Newsletter
-- Slug: /newsletter
-- =====================================================================================

-- Insert 'Newsletter' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    newsletter_page_id,
    'النشرة الإخبارية',
    'Newsletter',
    'newsletter',
    'FLEXIBLE',
    TRUE,
    FALSE,
    30, -- Assuming a sort order
    admin_user_id,
    'Newsletter - Syrian Soil Science Society',
    'Subscribe to the Syrian Soil Science Society Newsletter.',
    'Newsletter - SSSSY',
    'Stay updated with the latest news, events, and publications from SSSSY.',
    'http://localhost:3000/images/og-newsletter.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for Newsletter Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    newsletter_page_id,
    'newsletter-hero-banner',
    '{}'::jsonb,
    '{
        "titleEn": "Newsletter",
        "descriptionEn": "Stay connected with SSSSY"
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-16 md:py-20",
        "overflow": "hidden"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: Newsletter Subscription Form Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    newsletter_page_id,
    'newsletter-subscribe-form-section',
    '{}'::jsonb,
    '{
        "titleEn": "Subscribe to Our Newsletter",
        "descriptionEn": "Receive the latest news, event announcements, research updates, and exclusive content directly to your inbox."
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- =====================================================================================
-- PAGE: President's Message
-- Slug: /president-message
-- =====================================================================================

-- Insert 'President''s Message' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    president_message_page_id,
    'رسالة الرئيس',
    'President''s Message',
    'president-message',
    'FLEXIBLE',
    TRUE,
    FALSE,
    40, -- Assuming a sort order
    admin_user_id,
    'President''s Message - Syrian Soil Science Society',
    'Read the message from the President of the Syrian Soil Science Society.',
    'President''s Message - SSSSY',
    'Insights and vision from the President of the Syrian Soil Science Society.',
    'http://localhost:3000/images/og-president.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for President's Message Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    president_message_page_id,
    'president-message-hero-banner',
    '{}'::jsonb,
    '{
        "titleEn": "President''s Message",
        "descriptionEn": "Insights and Vision"
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-16 md:py-20",
        "overflow": "hidden"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: President's Message Content Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    president_message_page_id,
    'president-message-content-section',
    '{}'::jsonb,
    '{
        "presidentNameEn": "Prof. Dr. Jamal Al-Shami",
        "presidentTitleEn": "President, Syrian Soil Science Society",
        "imageUrl": "https://placehold.co/400x400/D7CCC8/3E2723?text=President",
        "imageAltEn": "President of Syrian Soil Science Society",
        "welcomeMessageEn": "Dear members, colleagues, and friends,",
        "paragraph1En": "It is with great honor and humility that I address you as the President of the Syrian Soil Science Society (SSSSY). Our society stands at a pivotal moment, facing both significant challenges and unparalleled opportunities in the field of soil science. The vital role of soil in sustaining life, ensuring food security, and mitigating climate change has never been more evident.",
        "paragraph2En": "In Syria, we are particularly aware of the pressures on our natural resources. Decades of drought, conflict, and unsustainable practices have taken a heavy toll on our precious soil ecosystems. It is our collective responsibility, as scientists and citizens, to work towards restoring and preserving this fundamental resource for future generations.",
        "paragraph3En": "SSSSY is committed to fostering a vibrant community of soil scientists, promoting cutting-edge research, and translating scientific knowledge into practical solutions. We aim to strengthen collaborations with national and international partners, enhance educational programs, and advocate for policies that prioritize sustainable soil management. Together, we can cultivate a healthier future for Syria.",
        "quoteEn": "The nation that destroys its soil destroys itself.",
        "quoteAuthorEn": "Franklin D. Roosevelt",
        "signatureTextEn": "Sincerely,",
        "socialLinks": [
            { "platform": "facebook", "url": "https://facebook.com/jamal-al-shami" },
            { "platform": "twitter", "url": "https://twitter.com/jamal-al-shami" },
            { "platform": "linkedin", "url": "https://linkedin.com/in/jamal-al-shami" }
        ]
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- =====================================================================================
-- PAGE: Publications
-- Slug: /publications
-- =====================================================================================

-- Insert 'Publications' page
INSERT INTO pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, sort_order, author_id, meta_title, meta_description, og_title, og_description, og_image_url, created_at, updated_at)
VALUES (
    publications_page_id,
    'المنشورات',
    'Publications',
    'publications',
    'FLEXIBLE',
    TRUE,
    FALSE,
    50, -- Assuming a sort order
    admin_user_id,
    'Publications - Syrian Soil Science Society',
    'Explore research papers, journals, and reports from the Syrian Soil Science Society.',
    'Publications - SSSSY',
    'Access the latest scientific publications and contribute to soil science knowledge.',
    'http://localhost:3000/images/og-publications.jpg',
    NOW(),
    NOW()
);

-- Section 1: Hero Banner for Publications Page
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    publications_page_id,
    'publications-hero-banner',
    '{}'::jsonb,
    '{
        "titleEn": "Publications",
        "titleAr": "المنشورات"
    }'::jsonb,
    '{
        "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay",
        "padding": "py-16 md:py-20",
        "overflow": "hidden"
    }'::jsonb,
    10,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);

-- Section 2: Dynamic Publications List with Filters Section
INSERT INTO page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    publications_page_id,
    'publications-list-section',
    '{}'::jsonb,
    '{
        "titleEn": "Our Latest Publications",
        "titleAr": "أحدث منشوراتنا",
        "descriptionEn": "Explore our comprehensive collection of research papers, journals, and reports.",
        "yearOptions": [2024, 2023, 2022, 2021, 2020, "Older"],
        "categoryOptions": ["All", "Journal", "Conference Proceeding", "Report", "Thesis", "Book Chapter"]
    }'::jsonb,
    '{
        "backgroundColor": "bg-white",
        "padding": "py-16 md:py-20"
    }'::jsonb,
    20,
    'ALWAYS',
    TRUE,
    'fade-in',
    NOW(),
    NOW()
);


-- =====================================================================================
-- MAIN HEADER MENU ITEMS
-- Menu ID: 00000000-0000-0000-0000-000000000001 (from V21__seed_header_menu_and_social.sql)
-- =====================================================================================

-- Add 'About Us' to Main Header Menu
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), main_header_menu_id, 'من نحن', 'About Us', '/about', '_self', 4, true); -- Sort order 4 after Publications

-- Add 'Members' to Main Header Menu
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), main_header_menu_id, 'الأعضاء', 'Members', '/members', '_self', 5, true);

-- Add 'Contact' to Main Header Menu
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), main_header_menu_id, 'اتصل بنا', 'Contact', '/contact', '_self', 6, true);

-- Add 'Search' to Main Header Menu
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), main_header_menu_id, 'بحث', 'Search', '/search', '_self', 7, true);

-- Add 'Login' to Main Header Menu
INSERT INTO menu_items (id, menu_id, label_ar, label_en, url, target, sort_order, is_active) VALUES
  (gen_random_uuid(), main_header_menu_id, 'تسجيل الدخول', 'Login', '/auth/login', '_self', 8, true);

END $$;