package com.vaarta.notification.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SendReminderRequest {
    private String recipientEmail;
    private String meetingTitle;
    private String joinLink;
    private Integer startsInMinutes;
    private UUID meetingId;
}
