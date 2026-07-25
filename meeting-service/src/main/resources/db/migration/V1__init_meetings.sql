CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    host_id UUID NOT NULL,                     -- references auth-service user id (app-level, no cross-DB FK)
    join_code VARCHAR(20) UNIQUE NOT NULL,     -- short human-shareable code
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, ENDED, CANCELLED
    scheduled_start TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT', -- HOST, PARTICIPANT
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
