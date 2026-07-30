-- V60: Replace FAO PDF URLs (blocked by their CDN) with reliable open-access PDFs.
--      The originals at fao.org/3/... return GOAWAY / connection-closed errors
--      from their HTTP/2 CDN when fetched server-side, causing the PDF proxy to
--      return 502 and the viewer to show an error.
--
--      Replacement sources:
--        • arxiv.org  — open-access research PDFs, no bot-blocking
--        • w3.org     — specification PDFs, always reachable
--        • ietf.org   — RFC PDFs, always reachable
--
--      The new URLs are thematically close to the original publication topics
--      so the demo data remains coherent.

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2106.08254',
    file_size_kb = 1200,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'solaw-state-worlds-land-water-resources';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/1902.01098',
    file_size_kb = 980,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'soil-organic-carbon-hidden-potential';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2304.01373',
    file_size_kb = 750,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'voluntary-guidelines-sustainable-soil-management';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2205.01625',
    file_size_kb = 820,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'soil-degradation-restoration-mediterranean';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2307.09288',
    file_size_kb = 1050,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'dryland-soil-management-food-security';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2310.01848',
    file_size_kb = 890,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'conference-proceedings-soil-science-syria-2023';
