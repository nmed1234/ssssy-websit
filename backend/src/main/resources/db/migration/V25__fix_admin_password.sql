-- Fix admin password to match "admin123"
-- The original V1 migration had an incorrect bcrypt hash
UPDATE users SET password_hash = '$2a$10$yV7UTAfe5DuI/Wu4SL0Lc.R9gdC53X1jT38idZjrvjGzxxnC0H2Bq'
WHERE username = 'admin';
