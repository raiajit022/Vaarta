-- =============================================================================
-- V2__add_disabled_column.sql
-- Adds disabled column for admin functionality
-- =============================================================================

ALTER TABLE users ADD COLUMN disabled BOOLEAN NOT NULL DEFAULT FALSE;
