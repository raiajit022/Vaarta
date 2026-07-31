package com.vaarta.notification.dto;

import lombok.Data;
import java.util.UUID;

/**
 * Data Transfer Object for requesting a meeting recap email.
 */
@Data
public class SendRecapRequest {
    private String recipientEmail;
    private String meetingTitle;
    private String htmlBody;
    private UUID meetingId;
}
