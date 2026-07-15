-- V6__email_system.sql
-- Internal Email & Messaging System

-- Email Accounts (one per user)
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_address VARCHAR(320) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    quota_bytes BIGINT DEFAULT 1073741824,
    used_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_subject VARCHAR(500),
    auto_reply_body TEXT,
    auto_reply_starts_at TIMESTAMP,
    auto_reply_ends_at TIMESTAMP,
    forward_to VARCHAR(320),
    forward_keep_copy BOOLEAN DEFAULT TRUE,
    signature TEXT,
    imap_subscribed BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Folders (Inbox, Sent, Drafts, Trash, Spam, Archive + custom)
CREATE TABLE email_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES email_folders(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    folder_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    system_folder BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    imap_folder_name VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (account_id, name)
);

-- Email Messages
CREATE TABLE email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES email_folders(id),
    message_id VARCHAR(500),
    in_reply_to VARCHAR(500),
    references_header TEXT,
    thread_id UUID,
    sender_address VARCHAR(320) NOT NULL,
    sender_name VARCHAR(200),
    reply_to_address VARCHAR(320),
    reply_to_name VARCHAR(200),
    subject VARCHAR(998),
    body_text TEXT,
    body_html TEXT,
    preview_text VARCHAR(500),
    size_bytes INTEGER DEFAULT 0,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_count INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_send_at TIMESTAMP,
    actually_sent_at TIMESTAMP,
    imap_uid BIGINT,
    delivery_status VARCHAR(30) DEFAULT 'PENDING',
    bounce_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_messages_account_folder ON email_messages(account_id, folder_id);
CREATE INDEX idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX idx_email_messages_unread ON email_messages(account_id, folder_id) WHERE is_read = FALSE;
CREATE INDEX idx_email_messages_drafts ON email_messages(account_id) WHERE is_draft = TRUE;
CREATE INDEX idx_email_messages_fts ON email_messages USING GIN(to_tsvector('english', coalesce(subject,'') || ' ' || coalesce(body_text,'')));

-- Email Recipients
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) NOT NULL,
    address VARCHAR(320) NOT NULL,
    name VARCHAR(200),
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_recipients_message ON email_recipients(message_id);
CREATE INDEX idx_email_recipients_address ON email_recipients(address);

-- Email Attachments
CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    content_id VARCHAR(500),
    is_inline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_attachments_message ON email_attachments(message_id);

-- Email Contacts (personal address book)
CREATE TABLE email_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    company VARCHAR(200),
    position VARCHAR(200),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_id, email)
);
CREATE INDEX idx_email_contacts_owner ON email_contacts(owner_id);

-- Contact Groups
CREATE TABLE email_contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_id, name)
);

-- Contact Group Members
CREATE TABLE email_contact_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES email_contact_groups(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, contact_id)
);

-- Distribution Lists (admin-managed mailing lists)
CREATE TABLE email_distribution_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email_address VARCHAR(320) NOT NULL UNIQUE,
    description TEXT,
    list_type VARCHAR(50) NOT NULL DEFAULT 'DEPARTMENT',
    is_public BOOLEAN DEFAULT TRUE,
    allow_external BOOLEAN DEFAULT FALSE,
    moderator_id UUID REFERENCES users(id),
    requires_moderation BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribution List Members
CREATE TABLE email_distribution_list_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES email_distribution_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_moderator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (list_id, user_id)
);

-- Email Aliases
CREATE TABLE email_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    alias_address VARCHAR(320) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Rules (auto-filtering)
CREATE TABLE email_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    stop_processing BOOLEAN DEFAULT FALSE,
    match_all BOOLEAN DEFAULT TRUE,
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_rules_account ON email_rules(account_id);
