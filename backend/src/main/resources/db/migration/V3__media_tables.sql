CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    parent_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    url VARCHAR(1000),
    thumbnail_url VARCHAR(1000),
    width INTEGER,
    height INTEGER,
    alt_text_ar VARCHAR(500),
    alt_text_en VARCHAR(500),
    folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_files_folder ON media_files(folder_id);
CREATE INDEX idx_media_files_user ON media_files(user_id);
CREATE INDEX idx_media_files_mime ON media_files(mime_type);
