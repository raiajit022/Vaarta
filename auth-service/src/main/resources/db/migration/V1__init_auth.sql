-- =============================================================================
-- V1__init_auth.sql
-- Flyway baseline migration for the auth schema.
--
-- Tables:
--   users                       — core identity record
--   email_verification_tokens   — one-time link tokens for email confirmation
--   password_reset_tokens       — one-time link tokens for password reset
--   refresh_tokens              — long-lived JWT refresh tokens (revokable)
-- =============================================================================

-- Ensure we have pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) UNIQUE NOT NULL,
    full_name      VARCHAR(255),
    password_hash  VARCHAR(255) NOT NULL,
    email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    role           VARCHAR(50)  NOT NULL DEFAULT 'USER',   -- USER | ADMIN
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- ---------------------------------------------------------------------------
-- email_verification_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE email_verification_tokens (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_evt_token   ON email_verification_tokens (token);
CREATE INDEX idx_evt_user_id ON email_verification_tokens (user_id);

-- ---------------------------------------------------------------------------
-- password_reset_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_prt_token   ON password_reset_tokens (token);
CREATE INDEX idx_prt_user_id ON password_reset_tokens (user_id);

-- ---------------------------------------------------------------------------
-- refresh_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_rt_token   ON refresh_tokens (token);
CREATE INDEX idx_rt_user_id ON refresh_tokens (user_id);
