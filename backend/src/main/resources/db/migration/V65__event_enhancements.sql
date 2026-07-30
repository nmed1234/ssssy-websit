-- V65: Event Management Enhancements
-- Phase 1: events table additions (Phase 5 fields)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_featured       BOOLEAN       DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS display_order     INTEGER       DEFAULT 0,
    ADD COLUMN IF NOT EXISTS og_image          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS meta_title        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS meta_description  TEXT,
    ADD COLUMN IF NOT EXISTS registration_form_schema JSONB,
    ADD COLUMN IF NOT EXISTS cancelled_at      TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add missing Phase-1 columns (added in V13 but not in original V5)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS address              VARCHAR(500),
    ADD COLUMN IF NOT EXISTS latitude             DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude            DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS is_online            BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS online_url           VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS max_participants     INTEGER,
    ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP,
    ADD COLUMN IF NOT EXISTS status               VARCHAR(50) DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS contact_email        VARCHAR(320);

-- Phase 2: event_registrations enhancements
ALTER TABLE event_registrations
    ADD COLUMN IF NOT EXISTS checked_in_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS check_in_notes    TEXT,
    ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

-- Ensure the status column already exists (it does from V8) but extend allowed values
-- (no constraint enforcement — we use application-level validation)

CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
