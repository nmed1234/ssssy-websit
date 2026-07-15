CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    label_ar VARCHAR(200) NOT NULL,
    label_en VARCHAR(200),
    url VARCHAR(500),
    target VARCHAR(20) DEFAULT '_self',
    icon VARCHAR(100),
    page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL UNIQUE,
    name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

CREATE TABLE board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    position_ar VARCHAR(200) NOT NULL,
    position_en VARCHAR(200),
    term_start DATE,
    term_end DATE,
    bio TEXT,
    photo_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) DEFAULT 'REGULAR',
    membership_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(255),
    research_interests TEXT,
    education TEXT,
    publications_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    joined_at DATE,
    membership_expires_at DATE,
    orcid_id VARCHAR(50),
    google_scholar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    og_title VARCHAR(200),
    og_description VARCHAR(500),
    og_image_url VARCHAR(500),
    canonical_url VARCHAR(500),
    robots VARCHAR(100) DEFAULT 'index, follow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id)
);

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(200) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_group VARCHAR(100) DEFAULT 'GENERAL',
    config_type VARCHAR(50) DEFAULT 'STRING',
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    description VARCHAR(500),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_scheduled_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE email_quota_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    used_bytes_before BIGINT NOT NULL,
    used_bytes_after BIGINT NOT NULL,
    change_bytes BIGINT NOT NULL,
    operation VARCHAR(50) NOT NULL,
    message_id UUID REFERENCES email_messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_menu_items_menu_id ON menu_items(menu_id);
CREATE INDEX idx_board_members_is_active ON board_members(is_active);
CREATE INDEX idx_member_profiles_is_public ON member_profiles(is_public);
CREATE INDEX idx_seo_metadata_entity ON seo_metadata(entity_type, entity_id);
CREATE INDEX idx_email_scheduled_sends_status ON email_scheduled_sends(status, scheduled_at);
CREATE INDEX idx_email_quota_logs_account_id ON email_quota_logs(account_id);
