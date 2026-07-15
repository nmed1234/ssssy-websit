CREATE TABLE workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID NOT NULL REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_logs_content ON workflow_logs(content_id);
CREATE INDEX idx_workflow_logs_actor ON workflow_logs(actor_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    link VARCHAR(1000),
    reference_id UUID,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    workflow_email BOOLEAN DEFAULT TRUE,
    workflow_inapp BOOLEAN DEFAULT TRUE,
    email_received_email BOOLEAN DEFAULT TRUE,
    email_received_inapp BOOLEAN DEFAULT TRUE,
    system_announcement_email BOOLEAN DEFAULT TRUE,
    system_announcement_inapp BOOLEAN DEFAULT TRUE,
    comment_email BOOLEAN DEFAULT FALSE,
    comment_inapp BOOLEAN DEFAULT TRUE,
    event_reminder_email BOOLEAN DEFAULT TRUE,
    event_reminder_inapp BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
