-- Phase 1: CMS Event Bus audit log table
CREATE TABLE IF NOT EXISTS cms_event_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL,
    event_type  VARCHAR(100) NOT NULL,
    actor_id    UUID,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_event_log_event_type ON cms_event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_cms_event_log_actor_id   ON cms_event_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_cms_event_log_occurred_at ON cms_event_log(occurred_at DESC);

-- Phase 2: Dynamic Form Engine tables
CREATE TABLE IF NOT EXISTS cms_forms (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    title_ar            VARCHAR(255),
    slug                VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    schema_json         JSONB        NOT NULL DEFAULT '[]'::jsonb,
    submit_label_en     VARCHAR(100) DEFAULT 'Submit',
    submit_label_ar     VARCHAR(100) DEFAULT 'إرسال',
    success_message_en  TEXT,
    success_message_ar  TEXT,
    redirect_url        VARCHAR(500),
    notification_emails TEXT,
    requires_auth       BOOLEAN      NOT NULL DEFAULT false,
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_forms_slug     ON cms_forms(slug);
CREATE INDEX IF NOT EXISTS idx_cms_forms_active   ON cms_forms(is_active);

CREATE TABLE IF NOT EXISTS cms_form_submissions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id          UUID         NOT NULL REFERENCES cms_forms(id) ON DELETE CASCADE,
    user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    data             JSONB        NOT NULL DEFAULT '{}'::jsonb,
    submitter_name   VARCHAR(255),
    submitter_email  VARCHAR(255),
    ip_address       VARCHAR(45),
    user_agent       TEXT,
    status           VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    admin_notes      TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_form_id  ON cms_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_user_id  ON cms_form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_status   ON cms_form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_created  ON cms_form_submissions(created_at DESC);

-- GIN index for full-text search on submission data
CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_data_gin ON cms_form_submissions USING GIN(data);
