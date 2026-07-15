CREATE TABLE media_thumbnails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    thumbnail_path VARCHAR(1000) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_thumbnails_file ON media_thumbnails(media_file_id);
