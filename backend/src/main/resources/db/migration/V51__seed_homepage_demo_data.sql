-- V51: Seed realistic bilingual demo data for homepage sections.
--      Inserts 4 published NEWS articles and 4 upcoming events.
--      Uses ON CONFLICT (slug) DO NOTHING to be safe on re-run.
--      Requires at least one ADMIN (or SUPER_ADMIN) user to exist.
--      users.role_id is a FK to roles.id — no direct "role" column.

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Resolve the first admin user via the roles join
    SELECT u.id INTO admin_id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name IN ('ADMIN', 'SUPER_ADMIN')
    ORDER BY u.created_at
    LIMIT 1;

    -- Bail out gracefully if no admin user exists yet
    IF admin_id IS NULL THEN
        RAISE NOTICE 'V51: no ADMIN user found — skipping seed data';
        RETURN;
    END IF;

    -- ── NEWS ARTICLES (4 published) ──────────────────────────────────────

    INSERT INTO content_items (
        id, title_ar, title_en, slug, excerpt, content_type, status,
        author_id, is_featured, is_pinned, is_member_only, published_at,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(),
        'الجمعية تطلق مشروع تقييم التربة الوطني',
        'Society Launches National Soil Assessment Project',
        'society-launches-national-soil-assessment-project',
        'The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.',
        'NEWS', 'PUBLISHED', admin_id, TRUE, FALSE, FALSE,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'بحث جديد يكشف تأثير الجفاف على تربة وادي الفرات',
        'New Research Reveals Drought Impact on Euphrates Valley Soils',
        'new-research-drought-impact-euphrates-valley-soils',
        'A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.',
        'NEWS', 'PUBLISHED', admin_id, FALSE, FALSE, FALSE,
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'اتفاقية تعاون مع منظمة الأغذية والزراعة للأمم المتحدة',
        'SSSY Signs Cooperation Agreement with FAO',
        'sssy-signs-cooperation-agreement-fao',
        'The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.',
        'NEWS', 'PUBLISHED', admin_id, TRUE, FALSE, FALSE,
        CURRENT_TIMESTAMP - INTERVAL '14 days',
        CURRENT_TIMESTAMP - INTERVAL '14 days',
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'تكريم أعضاء الجمعية المتميزين في مجال أبحاث التربة',
        'SSSY Recognises Outstanding Members in Soil Research',
        'sssy-recognises-outstanding-members-soil-research',
        'At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.',
        'NEWS', 'PUBLISHED', admin_id, FALSE, FALSE, FALSE,
        CURRENT_TIMESTAMP - INTERVAL '21 days',
        CURRENT_TIMESTAMP - INTERVAL '21 days',
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (slug) DO NOTHING;

    -- ── UPCOMING EVENTS (4 published, future dates) ──────────────────────

    INSERT INTO events (
        id, title_ar, title_en, slug, description,
        event_date, end_date, location, event_type, organizer,
        is_published, status, contact_email, created_by, created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(),
        'ورشة عمل: تقنيات تحسين خصوبة التربة في المناطق الجافة',
        'Workshop: Soil Fertility Improvement Techniques in Dryland Areas',
        'workshop-soil-fertility-dryland-2025',
        'A practical hands-on workshop covering modern techniques for improving soil fertility in dryland agricultural zones, including cover cropping, biochar application, and micro-irrigation scheduling.',
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        CURRENT_TIMESTAMP + INTERVAL '31 days',
        'Damascus Agricultural Research Centre, Damascus',
        'Workshop',
        'Soil Science Society of Syria',
        TRUE, 'PUBLISHED', 'events@sssy.org',
        admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'المؤتمر السنوي الثامن عشر لعلوم التربة في سوريا',
        '18th Annual Syrian Soil Science Conference',
        'annual-syrian-soil-science-conference-18th-2025',
        'The flagship annual conference of the Soil Science Society of Syria brings together researchers, academics, and practitioners from across the country to present latest findings.',
        CURRENT_TIMESTAMP + INTERVAL '60 days',
        CURRENT_TIMESTAMP + INTERVAL '62 days',
        'University of Aleppo, Faculty of Agriculture, Aleppo',
        'Conference',
        'University of Aleppo & SSSY',
        TRUE, 'PUBLISHED', 'conference@sssy.org',
        admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'دورة تدريبية: تحليل التربة وتفسير النتائج المختبرية',
        'Training Course: Soil Analysis and Laboratory Results Interpretation',
        'training-soil-analysis-laboratory-interpretation-2025',
        'A five-day intensive training course for agronomists and soil scientists covering soil sampling methodologies, laboratory analysis procedures, and practical interpretation of soil test results.',
        CURRENT_TIMESTAMP + INTERVAL '90 days',
        CURRENT_TIMESTAMP + INTERVAL '95 days',
        'SSSY Training Centre, Homs',
        'Training',
        'Soil Science Society of Syria',
        TRUE, 'PUBLISHED', 'training@sssy.org',
        admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'ندوة إلكترونية: استخدام الاستشعار عن بعد في رصد التربة',
        'Webinar: Remote Sensing Applications for Soil Monitoring',
        'webinar-remote-sensing-soil-monitoring-2025',
        'An online seminar exploring the latest applications of satellite imagery and UAV-based remote sensing for soil health monitoring, erosion mapping, and precision agriculture in Syrian agricultural landscapes.',
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        'Online (Zoom)',
        'Seminar',
        'Soil Science Society of Syria',
        TRUE, 'PUBLISHED', 'events@sssy.org',
        admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;
