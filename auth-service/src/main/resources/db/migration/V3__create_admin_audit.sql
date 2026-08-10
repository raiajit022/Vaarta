-- Audit trail for privileged admin actions.
--
-- Four endpoints across auth-service and meeting-service can disable an account
-- or force-end a live meeting, and nothing recorded who did it. This table is
-- the record.
--
-- Append-only by convention: there is no update or delete path anywhere in the
-- application. actor_email is denormalised deliberately so a row stays readable
-- even if that admin's account is later removed.

CREATE TABLE admin_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID         NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    action      VARCHAR(64)  NOT NULL,
    target_type VARCHAR(32)  NOT NULL,
    target_id   UUID         NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- The audit view is always "most recent first".
CREATE INDEX idx_admin_audit_created ON admin_audit (created_at DESC);
