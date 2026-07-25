package com.vaarta.notification.dto;

import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object for requesting a meeting reminder email.
 */
@Data
public class SendReminderRequest {
    private String recipientEmail;
    private String meetingTitle;
    private String joinLink;
    private Integer startsInMinutes;
    private UUID meetingId;
}
