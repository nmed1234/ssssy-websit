-- =============================================================================
-- V69: Restore "Vision, Mission & Objectives" section to the About page
--      with the exact same data that was shown in the original site.
--
-- Inserts one page_section of type 'about-vision-mission-section' at
-- sort_order 25 (between overview=20 and decree=30).
-- Safe to re-run: uses ON CONFLICT DO NOTHING on a stable UUID.
-- =============================================================================

DO $$
DECLARE
    about_id UUID;
BEGIN
    SELECT id INTO about_id FROM pages WHERE slug = 'about' LIMIT 1;

    IF about_id IS NULL THEN
        RAISE NOTICE 'V69: about page not found — skipping';
        RETURN;
    END IF;

    -- Clear any previously-saved layout_json so the page re-reads from sections
    UPDATE pages SET layout_json = NULL, updated_at = NOW() WHERE id = about_id;

    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        'a0000069-0000-0000-0000-000000000001',
        about_id,
        'about-vision-mission-section',
        '{}'::jsonb,
        '{
            "heading":     "Vision, Mission & Objectives",
            "headingAr":   "الرؤية والرسالة والأهداف",
            "subheading":  "Our guiding principles that shape every initiative and program we undertake.",
            "subheadingAr":"مبادئنا التوجيهية التي تشكّل كل مبادرة وبرنامج نضطلع به.",
            "panels": [
                {
                    "icon": "Target",
                    "titleEn":   "Our Vision",
                    "titleAr":   "رؤيتنا",
                    "contentEn": "To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.",
                    "contentAr": "أن نكون السلطة العلمية الرائدة في علوم التربة في سوريا والمنطقة، ونُعزز مستقبلاً تُدار فيه التربة باستدامة.",
                    "gradientClass": "from-forest to-forest-light"
                },
                {
                    "icon": "Eye",
                    "titleEn":   "Our Mission",
                    "titleAr":   "رسالتنا",
                    "contentEn": "To advance soil science through research, education, and advocacy, promoting sustainable land use practices.",
                    "contentAr": "تعزيز علوم التربة من خلال البحث والتعليم والمناصرة، وتعزيز ممارسات الاستخدام المستدام للأراضي.",
                    "gradientClass": "from-soil-clay to-soil-dark"
                },
                {
                    "icon": "List",
                    "titleEn":   "Our Objectives",
                    "titleAr":   "أهدافنا",
                    "contentEn": "Promote research, facilitate knowledge exchange, support education and training, advocate for soil-friendly policies.",
                    "contentAr": "تعزيز البحث وتسهيل تبادل المعرفة ودعم التعليم والتدريب والمناصرة من أجل سياسات صديقة للتربة.",
                    "gradientClass": "from-forest-light to-forest"
                }
            ]
        }'::jsonb,
        '{
            "backgroundColor": "bg-soil-sand/30",
            "padding": "py-16 md:py-20"
        }'::jsonb,
        25,
        'ALWAYS',
        true,
        'fade-in',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        data       = EXCLUDED.data,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();

    RAISE NOTICE 'V69: Vision/Mission/Objectives section restored on about page.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'V69 error: %', SQLERRM;
END $$;
