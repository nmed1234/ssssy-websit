-- Phase 5 gaps: events extra columns, event_registrations, contact_submissions extra columns

ALTER TABLE events ADD COLUMN address VARCHAR(500);
ALTER TABLE events ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN online_url VARCHAR(1000);
ALTER TABLE events ADD COLUMN max_participants INTEGER;
ALTER TABLE events ADD COLUMN registration_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE events ADD COLUMN contact_email VARCHAR(320);

ALTER TABLE contact_submissions ADD COLUMN phone VARCHAR(50);
ALTER TABLE contact_submissions ADD COLUMN read_by UUID REFERENCES users(id);
ALTER TABLE contact_submissions ADD COLUMN replied_at TIMESTAMP;

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(500),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'CONFIRMED',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
