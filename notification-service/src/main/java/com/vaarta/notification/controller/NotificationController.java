package com.vaarta.notification.controller;

import com.vaarta.notification.dto.SendInviteRequest;
import com.vaarta.notification.dto.SendReminderRequest;
import com.vaarta.notification.dto.SendRecapRequest;
import com.vaarta.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal REST controller for handling email notifications.
 *
 * <p>All endpoints are secured by the {@link com.vaarta.notification.config.InternalApiKeyFilter},
 * ensuring they can only be called by other microservices (like meeting-service) within the cluster,
 * not by end-users.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Sends an email invitation to a participant for a newly created meeting.
     *
     * @param request details including recipient email, meeting title, and join link.
     * @return HTTP 202 Accepted.
     */
    @PostMapping("/meeting-invite")
    public ResponseEntity<Void> sendMeetingInvite(@RequestBody SendInviteRequest request) {
        notificationService.sendMeetingInvite(request);
        return ResponseEntity.accepted().build();
    }

    /**
     * Sends a reminder email for an upcoming scheduled meeting.
     *
     * @param request details including recipient email, meeting title, and join link.
     * @return HTTP 202 Accepted.
     */
    @PostMapping("/meeting-reminder")
    public ResponseEntity<Void> sendMeetingReminder(@RequestBody SendReminderRequest request) {
        notificationService.sendMeetingReminder(request);
        return ResponseEntity.accepted().build();
    }

    /**
     * Sends a post-meeting recap/summary email to a participant.
     *
     * @param request details including recipient email, meeting title, and generated HTML body.
     * @return HTTP 202 Accepted.
     */
    @PostMapping("/meeting-recap")
    public ResponseEntity<Void> sendMeetingRecap(@RequestBody SendRecapRequest request) {
        notificationService.sendMeetingRecap(request);
        return ResponseEntity.accepted().build();
    }
}
