-- Shared notes: one collaborative note document per meeting.
--
-- Deliberately one row per meeting rather than per user. A single shared
-- document is what people actually want from meeting notes, and it avoids a
-- merge strategy entirely — the panel is last-write-wins.

CREATE TABLE meeting_notes (
    meeting_id UUID PRIMARY KEY REFERENCES meetings(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL DEFAULT '',
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
