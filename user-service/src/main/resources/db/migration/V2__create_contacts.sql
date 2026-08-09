-- Creates the table backing the Contact entity (com.vaarta.user.entity.Contact).
--
-- This migration was never written when the Contacts feature was added, so the
-- table did not exist in any environment. Hibernate runs with ddl-auto:validate,
-- so user-service failed to start with "Schema-validation: missing table
-- [contacts]" the first time it cold-started after that entity was introduced.
--
-- Column names follow Spring Boot's default CamelCaseToUnderscoresNamingStrategy,
-- which maps the entity's userId/contactEmail/contactName fields onto
-- user_id/contact_email/contact_name.

CREATE TABLE contacts (
    id            UUID PRIMARY KEY,
    user_id       UUID         NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_name  VARCHAR(255)
);

-- Contacts are always looked up by owner.
CREATE INDEX idx_contacts_user_id ON contacts (user_id);

-- A user should not be able to add the same address twice. ContactController
-- relies on this to keep the directory clean.
CREATE UNIQUE INDEX uq_contacts_user_email ON contacts (user_id, contact_email);
