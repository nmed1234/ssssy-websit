CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    layout_type VARCHAR(50) DEFAULT 'FLEXIBLE',
    is_published BOOLEAN DEFAULT FALSE,
    is_homepage BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    author_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    component_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    data JSONB NOT NULL DEFAULT '{}',
    styling JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    visibility VARCHAR(20) DEFAULT 'ALWAYS',
    is_animated BOOLEAN DEFAULT FALSE,
    animation_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published_homepage ON pages(is_published, is_homepage);
