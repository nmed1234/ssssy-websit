-- Seed default workflow definitions for articles, events, and pages
INSERT INTO workflows (id, content_type, name_ar, name_en, description, is_active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ARTICLE', 'سير العمل الافتراضي للمقالات', 'Default Article Workflow', 'سير عمل قياسي للمقالات: مسودة → مراجعة → موافقة → نشر', true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'EVENT', 'سير العمل الافتراضي للفعاليات', 'Default Event Workflow', 'سير عمل قياسي للفعاليات: مسودة → مراجعة → موافقة → نشر', true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'PAGE', 'سير العمل الافتراضي للصفحات', 'Default Page Workflow', 'سير عمل قياسي للصفحات: مسودة → مراجعة → موافقة → نشر', true);

-- Insert default workflow states for ARTICLE workflow
INSERT INTO workflow_states (workflow_id, name, label_ar, label_en, color, is_initial, is_final, sort_order)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'DRAFT', 'مسودة', 'Draft', '#6B7280', true, false, 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'REVIEW', 'قيد المراجعة', 'In Review', '#F59E0B', false, false, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'APPROVED', 'موافق عليه', 'Approved', '#10B981', false, false, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PUBLISHED', 'منشور', 'Published', '#059669', false, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ARCHIVED', 'مؤرشف', 'Archived', '#9CA3AF', false, true, 4);

-- Insert default workflow states for EVENT workflow
INSERT INTO workflow_states (workflow_id, name, label_ar, label_en, color, is_initial, is_final, sort_order)
VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'DRAFT', 'مسودة', 'Draft', '#6B7280', true, false, 0),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'REVIEW', 'قيد المراجعة', 'In Review', '#F59E0B', false, false, 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'APPROVED', 'موافق عليه', 'Approved', '#10B981', false, false, 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'PUBLISHED', 'منشور', 'Published', '#059669', false, true, 3),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ARCHIVED', 'مؤرشف', 'Archived', '#9CA3AF', false, true, 4);

-- Insert default workflow states for PAGE workflow
INSERT INTO workflow_states (workflow_id, name, label_ar, label_en, color, is_initial, is_final, sort_order)
VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'DRAFT', 'مسودة', 'Draft', '#6B7280', true, false, 0),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'REVIEW', 'قيد المراجعة', 'In Review', '#F59E0B', false, false, 1),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'APPROVED', 'موافق عليه', 'Approved', '#10B981', false, false, 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'PUBLISHED', 'منشور', 'Published', '#059669', false, true, 3),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'ARCHIVED', 'مؤرشف', 'Archived', '#9CA3AF', false, true, 4);

-- Insert transitions for ARTICLE workflow: DRAFT -> REVIEW
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ds.id, rs.id, 'تقديم للمراجعة', '["EDITOR", "PUBLISHER"]'::jsonb, false, 0
FROM workflow_states ds, workflow_states rs
WHERE ds.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND ds.name = 'DRAFT'
  AND rs.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND rs.name = 'REVIEW';

-- ARTICLE: REVIEW -> APPROVED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fs.id, ts.id, 'موافقة', '["ADMIN", "PUBLISHER"]'::jsonb, false, 1
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND fs.name = 'REVIEW'
  AND ts.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND ts.name = 'APPROVED';

-- ARTICLE: REVIEW -> DRAFT (revision requested)
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fs.id, ts.id, 'طلب تعديل', '["ADMIN", "EDITOR", "PUBLISHER"]'::jsonb, true, 2
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND fs.name = 'REVIEW'
  AND ts.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND ts.name = 'DRAFT';

-- ARTICLE: APPROVED -> PUBLISHED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fs.id, ts.id, 'نشر', '["ADMIN", "PUBLISHER"]'::jsonb, false, 3
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND fs.name = 'APPROVED'
  AND ts.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND ts.name = 'PUBLISHED';

-- ARTICLE: PUBLISHED -> ARCHIVED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fs.id, ts.id, 'أرشفة', '["ADMIN"]'::jsonb, true, 4
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND fs.name = 'PUBLISHED'
  AND ts.workflow_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND ts.name = 'ARCHIVED';

-- Events: DRAFT -> REVIEW
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  ds.id, rs.id, 'تقديم للمراجعة', '["EDITOR", "PUBLISHER"]'::jsonb, false, 0
FROM workflow_states ds, workflow_states rs
WHERE ds.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND ds.name = 'DRAFT'
  AND rs.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND rs.name = 'REVIEW';

-- Events: REVIEW -> APPROVED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  fs.id, ts.id, 'موافقة', '["ADMIN", "PUBLISHER"]'::jsonb, false, 1
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND fs.name = 'REVIEW'
  AND ts.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND ts.name = 'APPROVED';

-- Events: APPROVED -> PUBLISHED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  fs.id, ts.id, 'نشر', '["ADMIN", "PUBLISHER"]'::jsonb, false, 2
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND fs.name = 'APPROVED'
  AND ts.workflow_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' AND ts.name = 'PUBLISHED';

-- Pages: DRAFT -> REVIEW
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  ds.id, rs.id, 'تقديم للمراجعة', '["EDITOR", "PUBLISHER"]'::jsonb, false, 0
FROM workflow_states ds, workflow_states rs
WHERE ds.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND ds.name = 'DRAFT'
  AND rs.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND rs.name = 'REVIEW';

-- Pages: REVIEW -> APPROVED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  fs.id, ts.id, 'موافقة', '["ADMIN", "PUBLISHER"]'::jsonb, false, 1
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND fs.name = 'REVIEW'
  AND ts.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND ts.name = 'APPROVED';

-- Pages: APPROVED -> PUBLISHED
INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, sort_order)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  fs.id, ts.id, 'نشر', '["ADMIN", "PUBLISHER"]'::jsonb, false, 2
FROM workflow_states fs, workflow_states ts
WHERE fs.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND fs.name = 'APPROVED'
  AND ts.workflow_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012' AND ts.name = 'PUBLISHED';

-- Default component templates for page builder (layout, content, media, interactive)
INSERT INTO component_templates (id, name, category, component_type, thumbnail_url, default_config, is_system, sort_order)
VALUES
  ('d4e5f6a7-b8c9-0123-defa-123456789abc', 'Basic Container', 'layout', 'container', NULL, '{"tag": "div", "className": "container mx-auto px-4", "styles": {"maxWidth": "1200px"}}'::jsonb, true, 0),
  ('e5f6a7b8-c9d0-1234-efab-234567890bcd', 'Two Column Grid', 'layout', 'grid', NULL, '{"columns": 2, "gap": "1rem", "breakpoint": "md"}'::jsonb, true, 1),
  ('f6a7b8c9-d0e1-2345-fabc-3456789012cd', 'Hero Title', 'content', 'title', NULL, '{"level": "h1", "align": "center", "className": "text-4xl font-bold"}'::jsonb, true, 2),
  ('a7b8c9d0-e1f2-3456-abcd-4567890123de', 'Text Paragraph', 'content', 'paragraph', NULL, '{"className": "text-base leading-relaxed"}'::jsonb, true, 3),
  ('b8c9d0e1-f2a3-4567-bcde-5678901234ef', 'Image', 'content', 'image', NULL, '{"objectFit": "cover", "borderRadius": "0.5rem"}'::jsonb, true, 4),
  ('c9d0e1f2-a3b4-5678-cdef-6789012345f0', 'Image Gallery', 'media', 'gallery', NULL, '{"columns": 3, "gap": "1rem", "aspectRatio": "4/3"}'::jsonb, true, 5),
  ('d0e1f2a3-b4c5-6789-defa-7890123456a1', 'Button', 'interactive', 'button', NULL, '{"variant": "primary", "size": "md", "className": "bg-soil-clay text-white px-6 py-2 rounded-lg"}'::jsonb, true, 6),
  ('e1f2a3b4-c5d6-7890-efab-8901234567b2', 'Card', 'interactive', 'card', NULL, '{"rounded": "lg", "shadow": "md", "padding": "1.5rem"}'::jsonb, true, 7),
  ('f2a3b4c5-d6e7-8901-fabc-9012345678c3', 'Carousel', 'media', 'carousel', NULL, '{"autoplay": true, "interval": 5000, "showDots": true}'::jsonb, true, 8),
  ('a3b4c5d6-e7f8-9012-abcd-0123456789d4', 'Video', 'media', 'video', NULL, '{"controls": true, "autoplay": false, "loop": false}'::jsonb, true, 9);

-- Default system configuration values
INSERT INTO system_config (config_key, config_value, description, is_public)
VALUES
  ('site_name_en', 'Soil Science Society of Syria', 'English site name', true),
  ('site_name_ar', 'الجمعية السورية لعلم التربة', 'Arabic site name', true),
  ('site_description', 'Official website of the Soil Science Society of Syria', 'Site description', true),
  ('contact_email', 'info@ssssy.org', 'Primary contact email', true),
  ('contact_phone', '+963-11-XXX-XXXX', 'Primary contact phone', true),
  ('address_en', 'Damascus, Syria', 'English address', true),
  ('address_ar', 'دمشق، سوريا', 'Arabic address', true),
  ('social_facebook', 'https://facebook.com/ssssy', 'Facebook page URL', true),
  ('social_twitter', 'https://twitter.com/ssssy', 'Twitter/X profile URL', true),
  ('social_linkedin', 'https://linkedin.com/company/ssssy', 'LinkedIn page URL', true),
  ('maintenance_mode', 'false', 'Enable maintenance mode', false),
  ('allow_registration', 'true', 'Allow user registration', false),
  ('newsletter_enabled', 'true', 'Enable newsletter subscription', false),
  ('comments_moderation', 'pre', 'Comment moderation: pre, post, or none', false),
  ('default_language', 'en', 'Default site language', true);

-- Create admin_notifications table if not exists
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  body TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'INFO',
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
