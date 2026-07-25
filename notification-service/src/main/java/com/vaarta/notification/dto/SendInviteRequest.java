package com.vaarta.notification.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SendInviteRequest {
    private String recipientEmail;
    private String meetingTitle;
    private String joinLink;
    private UUID meetingId;
}
