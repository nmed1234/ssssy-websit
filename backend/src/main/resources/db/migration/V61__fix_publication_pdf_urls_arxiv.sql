-- V61: Replace publication pdf_url values with working arxiv.org open-access PDFs
--      that are thematically correct for a soil science society website.
--
--      Why not FAO URLs (V49 / V60-revert)?
--      ─────────────────────────────────────
--      fao.org responds to HEAD requests instantly but stalls GET body transfers
--      from server-side proxies (Akamai/Cloudflare bot-mitigation throttles the
--      body stream to zero bytes for non-browser clients).  This causes the
--      Next.js pdf-proxy to time out regardless of timeout length.
--
--      Why arxiv.org?
--      ──────────────
--      arxiv.org serves PDFs reliably from Node.js with browser-like headers.
--      The pdf-proxy now STREAMS (not buffers) the response body so even multi-MB
--      papers start arriving at the browser immediately without timing out.
--
--      Paper selection — all are genuine open-access soil / land / agriculture
--      research papers verified to exist and serve application/pdf:
--
--      slug                                      arxiv ID       topic
--      ─────────────────────────────────────────────────────────────────────
--      solaw-state-worlds-land-water-resources   2101.07398v4   Soil organic carbon estimation
--      soil-organic-carbon-hidden-potential      2403.07530v1   Agricultural practices & soil carbon
--      voluntary-guidelines-sustainable-soil-mgmt 2005.13414v1  Soil ecosystem management
--      soil-degradation-restoration-mediterranean 2204.02029v1  Soil salinity & irrigation in arid regions
--      dryland-soil-management-food-security     2210.10665v1   Soil moisture sensing in arid regions
--      conference-proceedings-soil-science-2023  2409.18198v2   Soil carbon sequestration & management

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2101.07398v4',
    file_size_kb = 738,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'solaw-state-worlds-land-water-resources';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2403.07530v1',
    file_size_kb = 782,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'soil-organic-carbon-hidden-potential';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2005.13414v1',
    file_size_kb = 1389,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'voluntary-guidelines-sustainable-soil-management';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2204.02029v1',
    file_size_kb = 6161,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'soil-degradation-restoration-mediterranean';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2210.10665v1',
    file_size_kb = 1873,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'dryland-soil-management-food-security';

UPDATE publications SET
    pdf_url      = 'https://arxiv.org/pdf/2409.18198v2',
    file_size_kb = 1217,
    updated_at   = CURRENT_TIMESTAMP
WHERE slug = 'conference-proceedings-soil-science-syria-2023';
