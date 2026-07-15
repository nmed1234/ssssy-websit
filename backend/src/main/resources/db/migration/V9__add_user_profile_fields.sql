-- Add missing user profile fields per SRS PUB-02 and SEC-06
ALTER TABLE users
    ADD COLUMN institution VARCHAR(200),
    ADD COLUMN department VARCHAR(200),
    ADD COLUMN position VARCHAR(200),
    ADD COLUMN specialization VARCHAR(200),
    ADD COLUMN biography TEXT,
    ADD COLUMN address VARCHAR(500),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN country VARCHAR(100),
    ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN deleted_at TIMESTAMP;
