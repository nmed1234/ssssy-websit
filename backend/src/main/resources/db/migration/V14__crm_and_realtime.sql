-- Phase 7: CRM and Real-time Features

-- CRM Contacts table for managing stakeholder relationships
CREATE TABLE crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(500),
  position VARCHAR(500),
  contact_type VARCHAR(50) DEFAULT 'GENERAL', -- GENERAL, MEMBER, BOARD, SPONSOR, PARTNER, VISITOR
  relationship_level VARCHAR(50) DEFAULT 'casual', -- casual, known, close, partner, strategic
  notes TEXT,
  source VARCHAR(100), -- referral, event, website, etc.
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_contact_at TIMESTAMP,
  next_followup_at TIMESTAMP,
  tags TEXT[], -- PostgreSQL array column for tagging
  preferences TEXT, -- JSON field for communication preferences
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_contact_type ON crm_contacts(contact_type);
CREATE INDEX idx_crm_contacts_is_active ON crm_contacts(is_active);

-- Real-time comment events for WebSocket notifications
CREATE TABLE comment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- CREATED, UPDATED, APPROVED, DELETED, REPLIED
  event_data TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- COMMENT, THREAD
  entity_id UUID NOT NULL,
  initiated_by UUID NOT NULL REFERENCES users(id),
  recipients TEXT[] DEFAULT '{}',
  is_processed BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comment_events_processed ON comment_events(is_processed);
CREATE INDEX idx_comment_events_created_at ON comment_events(created_at);
CREATE INDEX idx_comment_events_recipients ON comment_events USING gin(recipients);