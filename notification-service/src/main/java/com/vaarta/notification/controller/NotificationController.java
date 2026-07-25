package com.vaarta.notification.controller;

import com.vaarta.notification.dto.SendInviteRequest;
import com.vaarta.notification.dto.SendReminderRequest;
import com.vaarta.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/meeting-invite")
    public ResponseEntity<Void> sendMeetingInvite(@RequestBody SendInviteRequest request) {
        notificationService.sendMeetingInvite(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/meeting-reminder")
    public ResponseEntity<Void> sendMeetingReminder(@RequestBody SendReminderRequest request) {
        notificationService.sendMeetingReminder(request);
        return ResponseEntity.accepted().build();
    }
}
