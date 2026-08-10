package com.vaarta.notification.dto;

import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for requesting a meeting invitation email.
 */
@Data
public class SendInviteRequest {
    private String recipientEmail;
    private String meetingTitle;
    private String joinLink;
    private UUID meetingId;

    /** Meeting start. Null for instant meetings, which anchor to "now". */
    private ZonedDateTime scheduledStart;

    /** True when the meeting has been cancelled — sends an ICS CANCEL. */
    private boolean cancelled;
}
