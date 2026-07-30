-- V67: System config keys for event reminder defaults
INSERT INTO system_config (id, config_key, config_value, config_group, config_type, is_encrypted, description, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'event.reminder.default_offsets',          '24,1',                   'events', 'STRING',  FALSE, 'Comma-separated hours-before-event to auto-create reminders (e.g. 24,1)',                     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.reminder.post_event_hours',         '2',                      'events', 'STRING',  FALSE, 'Hours after event end to send post-event follow-up',                                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.reminder.email_subject_template',   'Reminder: {{eventTitle}}', 'events', 'STRING', FALSE, 'Default email subject template for event reminders',                                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.reminder.email_body_template',      'Dear {{name}},\n\nThis is a reminder for the event "{{eventTitle}}" on {{eventDate}} at {{location}}.\n\nView details: {{link}}\n\nBest regards,\nSSSSY Team', 'events', 'TEXT', FALSE, 'Default email body template', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.registration.confirmation_email_enabled', 'true',              'events', 'BOOLEAN', FALSE, 'Send confirmation email when a user registers for an event',                                 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.registration.waitlist_enabled',     'true',                   'events', 'BOOLEAN', FALSE, 'Allow waitlist registrations when an event is fully booked',                                 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'event.reminder.auto_create_on_publish',   'true',                   'events', 'BOOLEAN', FALSE, 'Automatically create default reminder rules when an event is published',                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;
