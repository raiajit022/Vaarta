package com.vaarta.notification.service;

import com.vaarta.notification.dto.SendInviteRequest;
import com.vaarta.notification.dto.SendReminderRequest;
import com.vaarta.notification.model.NotificationLog;
import com.vaarta.notification.model.NotificationType;
import com.vaarta.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final RestClient.Builder restClientBuilder;
    private final NotificationLogRepository repository;

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-address}")
    private String fromAddress;

    public void sendMeetingInvite(SendInviteRequest request) {
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                  <h1 style="font-size: 22px; font-weight: 600; color: #1c1917; margin-bottom: 8px;">You're invited to a Vaarta meeting</h1>
                  <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
                  You have been invited to join the meeting: <strong>%s</strong>.</p>
                  <a href="%s"
                     style="display: inline-block; margin: 24px 0; padding: 10px 20px; background: #059669;
                            color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    Join Meeting
                  </a>
                </div>
                """.formatted(request.getMeetingTitle(), request.getJoinLink());

        sendEmail(request.getRecipientEmail(), "Invitation: " + request.getMeetingTitle(), html, NotificationType.MEETING_INVITE, request.getMeetingId());
    }

    public void sendMeetingReminder(SendReminderRequest request) {
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                  <h1 style="font-size: 22px; font-weight: 600; color: #1c1917; margin-bottom: 8px;">Meeting Reminder</h1>
                  <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
                  Your meeting <strong>%s</strong> is starting in %d minutes.</p>
                  <a href="%s"
                     style="display: inline-block; margin: 24px 0; padding: 10px 20px; background: #059669;
                            color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    Join Meeting
                  </a>
                </div>
                """.formatted(request.getMeetingTitle(), request.getStartsInMinutes(), request.getJoinLink());

        sendEmail(request.getRecipientEmail(), "Reminder: " + request.getMeetingTitle(), html, NotificationType.MEETING_REMINDER, request.getMeetingId());
    }

    private void sendEmail(String to, String subject, String html, NotificationType type, java.util.UUID meetingId) {
        NotificationLog logEntry = new NotificationLog();
        logEntry.setRecipientEmail(to);
        logEntry.setType(type);
        logEntry.setRelatedMeetingId(meetingId);

        Map<String, Object> body = Map.of(
                "from", fromAddress,
                "to", new String[]{to},
                "subject", subject,
                "html", html
        );

        try {
            restClientBuilder.build()
                    .post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Email sent to {}: {}", to, subject);
            logEntry.setStatus("SENT");
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            logEntry.setStatus("FAILED");
            logEntry.setErrorMessage(e.getMessage());
        }

        repository.save(logEntry);
    }
}
