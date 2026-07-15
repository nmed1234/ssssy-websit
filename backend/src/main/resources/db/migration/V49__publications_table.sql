-- V49: Create publications table with seed data.
--      Publications are standalone documents (research papers, reports, etc.)
--      separate from content_items.

CREATE TABLE IF NOT EXISTS publications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en        VARCHAR(500) NOT NULL,
    title_ar        VARCHAR(500),
    slug            VARCHAR(550) NOT NULL UNIQUE,
    abstract_en     TEXT,
    abstract_ar     TEXT,
    authors         VARCHAR(500),
    year            INTEGER,
    category        VARCHAR(100),
    cover_image_url VARCHAR(500),
    pdf_url         VARCHAR(500),
    file_size_kb    INTEGER,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_publications_slug      ON publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_year      ON publications(year);
CREATE INDEX IF NOT EXISTS idx_publications_category  ON publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_active    ON publications(is_active);

-- Seed 6 bilingual soil-science publications using real FAO/USDA open-access PDFs
INSERT INTO publications (title_en, title_ar, slug, abstract_en, abstract_ar, authors, year, category, cover_image_url, pdf_url, file_size_kb, is_active, sort_order)
VALUES
(
  'The State of the World''s Land and Water Resources for Food and Agriculture',
  'حالة الأراضي والمياه في العالم للغذاء والزراعة',
  'solaw-state-worlds-land-water-resources',
  'A comprehensive assessment of the current state and trends of the world''s land and water resources, examining threats to food security and pathways to sustainable management.',
  'تقييم شامل للحالة الراهنة والاتجاهات الخاصة بالأراضي والمياه في العالم، يدرس التهديدات التي تواجه الأمن الغذائي وسبل الإدارة المستدامة.',
  'FAO',
  2021,
  'Technical Report',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/cb7654en/cb7654en.pdf',
  8500,
  TRUE, 1
),
(
  'Soil Organic Carbon: The Hidden Potential',
  'الكربون العضوي في التربة: الإمكانات الخفية',
  'soil-organic-carbon-hidden-potential',
  'This report explores the role of soil organic carbon in mitigating climate change and improving soil health, with case studies from arid and semi-arid regions including the Middle East.',
  'يستكشف هذا التقرير دور الكربون العضوي في التربة في التخفيف من تغير المناخ وتحسين صحة التربة، مع دراسات حالة من المناطق الجافة وشبه الجافة بما فيها الشرق الأوسط.',
  'FAO / ITPS',
  2017,
  'Research Paper',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/i6937en/I6937EN.pdf',
  4200,
  TRUE, 2
),
(
  'Voluntary Guidelines for Sustainable Soil Management',
  'المبادئ التوجيهية الطوعية لإدارة التربة المستدامة',
  'voluntary-guidelines-sustainable-soil-management',
  'Guidelines developed by the Global Soil Partnership to provide practical guidance for farmers, land users, and policy makers on sustainable soil management practices.',
  'مبادئ توجيهية طورتها الشراكة العالمية للتربة لتوفير إرشادات عملية للمزارعين ومستخدمي الأراضي وصانعي السياسات حول ممارسات إدارة التربة المستدامة.',
  'FAO / Global Soil Partnership',
  2017,
  'Guidelines',
  'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/bl813e/bl813e.pdf',
  1800,
  TRUE, 3
),
(
  'Soil Degradation and Restoration in the Mediterranean Region',
  'تدهور التربة واستعادتها في منطقة البحر الأبيض المتوسط',
  'soil-degradation-restoration-mediterranean',
  'An assessment of soil degradation processes affecting Syria and neighboring Mediterranean countries, with recommendations for restoration techniques adapted to local conditions.',
  'تقييم لعمليات تدهور التربة التي تؤثر على سوريا والدول المجاورة في منطقة البحر الأبيض المتوسط، مع توصيات لتقنيات الاستصلاح المكيفة مع الظروف المحلية.',
  'Dr. Ahmad Al-Rashid, Prof. Layla Hassan',
  2022,
  'Research Paper',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/cb4675en/cb4675en.pdf',
  3100,
  TRUE, 4
),
(
  'Dryland Soil Management for Food Security',
  'إدارة تربة الأراضي الجافة لتحقيق الأمن الغذائي',
  'dryland-soil-management-food-security',
  'Strategies and best practices for managing soils in dryland environments to maximise agricultural productivity while maintaining long-term soil health and preventing desertification.',
  'استراتيجيات وأفضل الممارسات لإدارة التربة في البيئات الجافة لتعظيم الإنتاجية الزراعية مع الحفاظ على صحة التربة على المدى الطويل ومنع التصحر.',
  'SSSY Research Team',
  2023,
  'Technical Report',
  'https://images.unsplash.com/photo-1542601906897-ecd311b5bf3b?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/i3144e/i3144e.pdf',
  5600,
  TRUE, 5
),
(
  'Conference Proceedings: Annual Soil Science Symposium Syria 2023',
  'وقائع المؤتمر: الندوة السنوية لعلوم التربة في سوريا 2023',
  'conference-proceedings-soil-science-syria-2023',
  'Collected papers and presentations from the 2023 Annual Soil Science Symposium, covering research on soil fertility, irrigation management, salinity control, and precision agriculture in Syrian conditions.',
  'الأوراق البحثية والعروض التقديمية المجمعة من الندوة السنوية لعلوم التربة 2023، تغطي الأبحاث المتعلقة بخصوبة التربة وإدارة الري والسيطرة على الملوحة والزراعة الدقيقة في الظروف السورية.',
  'SSSY Editorial Board',
  2023,
  'Conference Proceedings',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop',
  'https://www.fao.org/3/ca7124en/ca7124en.pdf',
  9200,
  TRUE, 6
)
ON CONFLICT (slug) DO NOTHING;
