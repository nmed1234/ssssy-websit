CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    slug VARCHAR(500) UNIQUE NOT NULL,
    cover_image_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    password_hash VARCHAR(255),
    is_password_protected BOOLEAN NOT NULL DEFAULT false,
    watermark_overrides JSONB,
    settings_overrides JSONB,
    view_count INTEGER NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    title_ar VARCHAR(500),
    title_en VARCHAR(500),
    description_ar TEXT,
    description_en TEXT,
    alt_text VARCHAR(500),
    before_media_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    hotspot_data JSONB,
    exif_data JSONB,
    color_palette JSONB,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    max_views INTEGER,
    current_views INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
    image_id UUID REFERENCES gallery_images(id) ON DELETE SET NULL,
    share_link_id UUID REFERENCES gallery_share_links(id) ON DELETE SET NULL,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('VIEW', 'DOWNLOAD', 'SHARE', 'PRINT')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    session_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_albums_slug ON gallery_albums(slug);
CREATE INDEX idx_gallery_albums_published ON gallery_albums(is_published, sort_order);
CREATE INDEX idx_gallery_images_album ON gallery_images(album_id, sort_order);
CREATE INDEX idx_gallery_share_links_token ON gallery_share_links(token);
CREATE INDEX idx_gallery_analytics_album ON gallery_analytics_events(album_id, event_type);
CREATE INDEX idx_gallery_analytics_created ON gallery_analytics_events(created_at);
