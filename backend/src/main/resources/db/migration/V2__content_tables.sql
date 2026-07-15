CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    excerpt TEXT,
    body JSONB,
    content_type VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    author_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    publisher_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    featured_image VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_member_only BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    archived_at TIMESTAMP,
    view_count BIGINT DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(255),
    og_image_url VARCHAR(500),
    og_title VARCHAR(200),
    og_description VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE content_tags (
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title_ar VARCHAR(500),
    title_en VARCHAR(500),
    excerpt TEXT,
    body JSONB,
    status VARCHAR(30),
    changed_by UUID NOT NULL REFERENCES users(id),
    change_summary VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (content_id, version)
);

CREATE INDEX idx_content_slug ON content_items(slug);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_type ON content_items(content_type);
CREATE INDEX idx_content_author ON content_items(author_id);
CREATE INDEX idx_content_category ON content_items(category_id);
CREATE INDEX idx_content_published ON content_items(published_at);
CREATE INDEX idx_content_fts ON content_items USING GIN(
    to_tsvector('simple', coalesce(title_ar,'') || ' ' || coalesce(title_en,'') || ' ' || coalesce(excerpt,''))
);
CREATE INDEX idx_content_versions_content ON content_versions(content_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
