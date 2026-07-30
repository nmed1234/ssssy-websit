-- =============================================================================
-- V71: Add empty "Photo Gallery" section to the About page at sort_order=70
--      (after Downloadable Documents at sort_order=60)
--
-- Gallery is intentionally empty — images will be added via admin panel.
-- Also clears layout_json so the page re-reads from page_sections.
-- Safe to re-run: stable UUID with ON CONFLICT DO UPDATE.
-- =============================================================================

DO $$
DECLARE
    about_id UUID;
BEGIN
    SELECT id INTO about_id FROM pages WHERE slug = 'about' LIMIT 1;

    IF about_id IS NULL THEN
        RAISE NOTICE 'V71: about page not found — skipping';
        RETURN;
    END IF;

    -- Force page to re-read from page_sections (not cached layout_json)
    UPDATE pages SET layout_json = NULL, updated_at = NOW() WHERE id = about_id;

    -- Ensure documents section is at 60
    UPDATE page_sections
    SET sort_order = 60, updated_at = NOW()
    WHERE page_id = about_id
      AND component_type = 'about-documents-section';

    -- Insert empty gallery section at sort_order=70
    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        'a0000071-0000-0000-0000-000000000001',
        about_id,
        'about-gallery-section',
        '{
            "layout": {
                "type": "masonry",
                "columns": { "mobile": 1, "tablet": 2, "desktop": 3, "wide": 4 },
                "gap": 16,
                "aspectRatio": "auto",
                "borderRadius": 8
            },
            "hoverEffects": {
                "effect": "zoom",
                "overlayColor": "dark",
                "overlayOpacity": 60,
                "showTitleOnHover": true,
                "showDescriptionOnHover": false
            }
        }'::jsonb,
        '{
            "heading":      "Photo Gallery",
            "headingAr":    "معرض الصور",
            "subheading":   "A glimpse into our events, conferences, and field activities.",
            "subheadingAr": "لمحة عن فعالياتنا ومؤتمراتنا وأنشطتنا الميدانية.",
            "images": []
        }'::jsonb,
        '{
            "backgroundColor": "bg-soil-sand/30",
            "padding": "py-16 md:py-20"
        }'::jsonb,
        70,
        'ALWAYS',
        true,
        'fade-in',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        data       = EXCLUDED.data,
        config     = EXCLUDED.config,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();

    RAISE NOTICE 'V71: Empty Photo Gallery section added to about page at sort_order=70.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'V71 error: %', SQLERRM;
END $$;
