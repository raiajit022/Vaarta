CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,        -- MEETING_INVITE, MEETING_REMINDER, MEETING_SUMMARY
    related_meeting_id UUID,
    status VARCHAR(50) NOT NULL,      -- SENT, FAILED
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
