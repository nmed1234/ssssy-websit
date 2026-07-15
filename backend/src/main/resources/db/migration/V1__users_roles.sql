CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name_ar VARCHAR(100),
    display_name_en VARCHAR(100),
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Seed default roles
INSERT INTO roles (name, display_name_ar, display_name_en, hierarchy_level, is_system) VALUES
('SUPER_ADMIN', 'مدير النظام', 'Super Admin', 100, TRUE),
('ADMIN', 'مدير', 'Admin', 80, TRUE),
('PUBLISHER', 'ناشر', 'Publisher', 60, TRUE),
('REVIEWER', 'مراجع', 'Reviewer', 40, TRUE),
('EDITOR', 'محرر', 'Editor', 30, TRUE),
('MEMBER', 'عضو', 'Member', 10, TRUE),
('VISITOR', 'زائر', 'Visitor', 0, TRUE);

-- Seed base permissions
INSERT INTO permissions (name, display_name, category, description) VALUES
('users:read', 'Read Users', 'Users', 'View user list and profiles'),
('users:create', 'Create Users', 'Users', 'Create new users'),
('users:update', 'Update Users', 'Users', 'Update existing users'),
('users:delete', 'Delete Users', 'Users', 'Delete users'),
('roles:read', 'Read Roles', 'Roles', 'View roles and permissions'),
('roles:create', 'Create Roles', 'Roles', 'Create new roles'),
('roles:update', 'Update Roles', 'Roles', 'Update existing roles'),
('roles:delete', 'Delete Roles', 'Roles', 'Delete roles'),
('content:read', 'Read Content', 'Content', 'View content items'),
('content:create', 'Create Content', 'Content', 'Create new content'),
('content:update', 'Update Content', 'Content', 'Update existing content'),
('content:delete', 'Delete Content', 'Content', 'Delete content'),
('content:publish', 'Publish Content', 'Content', 'Publish content items'),
('content:review', 'Review Content', 'Content', 'Review and approve content'),
('media:read', 'Read Media', 'Media', 'View media library'),
('media:upload', 'Upload Media', 'Media', 'Upload files'),
('media:delete', 'Delete Media', 'Media', 'Delete files'),
('pages:read', 'Read Pages', 'Pages', 'View pages'),
('pages:create', 'Create Pages', 'Pages', 'Create new pages'),
('pages:update', 'Update Pages', 'Pages', 'Update existing pages'),
('pages:delete', 'Delete Pages', 'Pages', 'Delete pages'),
('settings:read', 'Read Settings', 'Settings', 'View system settings'),
('settings:update', 'Update Settings', 'Settings', 'Update system settings'),
('audit:read', 'Read Audit Logs', 'Audit', 'View audit logs'),
('users:manage-roles', 'Manage User Roles', 'Users', 'Assign roles to users');

-- Assign permissions to roles
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- ADMIN gets all permissions except delete system roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN'
AND p.name NOT IN ('roles:delete', 'audit:read');

-- PUBLISHER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'PUBLISHER'
AND p.name IN ('content:read', 'content:create', 'content:update', 'content:delete', 'content:publish', 'content:review', 'media:read', 'media:upload', 'pages:read', 'pages:create', 'pages:update');

-- REVIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'REVIEWER'
AND p.name IN ('content:read', 'content:review', 'media:read');

-- EDITOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'EDITOR'
AND p.name IN ('content:read', 'content:create', 'content:update', 'media:read', 'media:upload');

-- MEMBER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'MEMBER'
AND p.name IN ('content:read', 'media:read');

-- VISITOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'VISITOR'
AND p.name IN ('content:read');

-- Create default super admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name_en, last_name_en, role_id, is_active, is_email_verified)
SELECT 'admin', 'admin@ssssy.org.sy',
'$2a$10$yV7UTAfe5DuI/Wu4SL0Lc.R9gdC53X1jT38idZjrvjGzxxnC0H2Bq',
'Super', 'Admin', id, TRUE, TRUE
FROM roles WHERE name = 'SUPER_ADMIN';
