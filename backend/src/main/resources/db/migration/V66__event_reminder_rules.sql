-- V66: Event Reminder Rules table
CREATE TABLE event_reminder_rules (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id          UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rule_type         VARCHAR(30) NOT NULL DEFAULT 'BEFORE_EVENT',
    -- rule_type values: BEFORE_EVENT | AFTER_EVENT | CUSTOM_DATE
    offset_hours      INTEGER     NOT NULL DEFAULT 24,
    fire_at           TIMESTAMP   NOT NULL,
    subject_template  TEXT        NOT NULL,
    body_template     TEXT        NOT NULL,
    send_email        BOOLEAN     DEFAULT TRUE,
    send_in_app       BOOLEAN     DEFAULT TRUE,
    is_fired          BOOLEAN     DEFAULT FALSE,
    fired_at          TIMESTAMP,
    recipients_count  INTEGER,
    created_at        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminder_rules_event      ON event_reminder_rules(event_id);
CREATE INDEX idx_reminder_rules_fire_at    ON event_reminder_rules(fire_at);
CREATE INDEX idx_reminder_rules_is_fired   ON event_reminder_rules(is_fired);
-- Partial index for efficient scheduler queries
CREATE INDEX idx_reminder_rules_pending    ON event_reminder_rules(fire_at)
    WHERE is_fired = FALSE;
