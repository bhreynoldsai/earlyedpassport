-- 0001_extensions.sql
-- Ticket T-0.2. Forward-only. Never edit an applied migration.

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- case-insensitive email
