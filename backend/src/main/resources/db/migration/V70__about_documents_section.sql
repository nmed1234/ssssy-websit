-- =============================================================================
-- V70: Add "Downloadable Documents" section to the About page
--
-- Inserts about-documents-section at sort_order=60 with all real attached files:
--   1. النظام الداخلي (Bylaws PDF)
--   2. وثيقة التأسيس (Founding Decree image)
--   3. ختم الجمعية (Society Seal image)
--   4. شعار الجمعية (Society Logo Display image)
--
-- Also clears layout_json so the page re-reads from page_sections.
-- Safe to re-run: stable UUID with ON CONFLICT DO UPDATE.
-- =============================================================================

DO $$
DECLARE
    about_id UUID;
BEGIN
    SELECT id INTO about_id FROM pages WHERE slug = 'about' LIMIT 1;

    IF about_id IS NULL THEN
        RAISE NOTICE 'V70: about page not found — skipping';
        RETURN;
    END IF;

    -- Force page to re-read from page_sections (not cached layout_json)
    UPDATE pages SET layout_json = NULL, updated_at = NOW() WHERE id = about_id;

    INSERT INTO page_sections (
        id, page_id, component_type, config, data, styling,
        sort_order, visibility, is_animated, animation_type,
        created_at, updated_at
    ) VALUES (
        'a0000070-0000-0000-0000-000000000001',
        about_id,
        'about-documents-section',
        '{}'::jsonb,
        '{
            "heading":    "Downloadable Documents",
            "headingAr":  "الوثائق القابلة للتنزيل",
            "documents": [
                {
                    "labelEn":  "SSSS Bylaws (Internal Regulations)",
                    "labelAr":  "النظام الداخلي لجمعية علوم التربة السورية",
                    "fileType": "PDF",
                    "url":      "/documents/bylaws.pdf"
                },
                {
                    "labelEn":  "Founding Decree — No. 1054.7",
                    "labelAr":  "وثيقة التأسيس الرسمية — القرار رقم 1054.7",
                    "fileType": "JPG",
                    "url":      "/documents/founding-decree.jpg"
                },
                {
                    "labelEn":  "Official Society Seal",
                    "labelAr":  "الختم الرسمي للجمعية",
                    "fileType": "JPG",
                    "url":      "/documents/society-seal.jpg"
                },
                {
                    "labelEn":  "Society Logo (Official Display)",
                    "labelAr":  "شعار الجمعية الرسمي",
                    "fileType": "JPG",
                    "url":      "/documents/society-logo-display.jpg"
                }
            ]
        }'::jsonb,
        '{
            "backgroundColor": "bg-white",
            "padding": "py-16 md:py-20"
        }'::jsonb,
        60,
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

    RAISE NOTICE 'V70: Downloadable Documents section added to about page with 4 real files.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'V70 error: %', SQLERRM;
END $$;
