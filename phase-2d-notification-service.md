# Phase 2d — notification-service

> Prerequisite: `phase-2c-meeting-service.md` done. Build ONLY this in this session.

> **Before anything else: create branch `phase-2d-notification-service` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Goal
Handle transactional/app emails that are NOT auth-related (auth's own verification/reset emails stay inside `auth-service` — this is a deliberate separation of concerns: auth emails are security-critical and self-contained; notification emails are product features that will grow over time — invites, reminders, summaries).

## Tech
- Java 17 + Spring Boot 3 (kept consistent with the rest of the stack — simplest choice, no reason to introduce a different language for this)
- Resend API (same provider as auth-service, separate API usage/templates)
- No database needed yet — this service is stateless-ish (just a sender), unless you want a `notification_log` table for audit/debugging, which is worth adding since email delivery failures are hard to debug blind.

## Database Schema (optional but recommended, Flyway `V1__init_notifications.sql`)

```sql
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,        -- MEETING_INVITE, MEETING_REMINDER, MEETING_SUMMARY
    related_meeting_id UUID,
    status VARCHAR(50) NOT NULL,      -- SENT, FAILED
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Folder Structure

```
notification-service/
  src/main/java/com/vaarta/notification/
    NotificationServiceApplication.java
    controller/
      NotificationController.java   // internal-only endpoints, called by meeting-service
    service/
      NotificationService.java
      ResendEmailClient.java
      templates/
        MeetingInviteTemplate.java
        MeetingReminderTemplate.java
    repository/
      NotificationLogRepository.java
    model/NotificationLog.java, NotificationType.java
    dto/SendInviteRequest.java
  src/main/resources/
    application.yml
    db/migration/V1__init_notifications.sql
  Dockerfile
  .env.example
  pom.xml
```

## API Contract (internal service-to-service, not called by frontend directly)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/notifications/meeting-invite` | `{recipientEmail, meetingTitle, joinLink, meetingId}` | `200`/`202` |
| POST | `/api/notifications/meeting-reminder` | `{recipientEmail, meetingTitle, joinLink, startsInMinutes, meetingId}` | `200`/`202` |

Protect these with a simple shared internal API key header (`X-Internal-Key`) rather than full JWT validation, since only other backend services call this, never the frontend directly.

## Integration
- `meeting-service`, when a meeting is created with invited participants (if/when that UI exists) or a reminder is due, calls this service's endpoints.
- Keep this decoupled: `meeting-service` doesn't know HOW email gets sent, just that it POSTs to `notification-service`.

## Docker
```yaml
  notification-service:
    build: ./notification-service
    ports: ["8084:8080"]
    depends_on: [postgres]
    env_file: ./notification-service/.env
```

## External Setup Needed
```
RESEND_API_KEY=<can reuse the same Resend account as auth-service, different "from" address recommended, e.g. notifications@yourdomain.com vs auth@yourdomain.com>
INTERNAL_API_KEY=<shared secret between meeting-service and notification-service>
DB_URL=jdbc:postgresql://postgres:5432/notifications
DB_USER=postgres
DB_PASSWORD=postgres
```

## Definition of Done
- Calling the invite endpoint directly (e.g. via curl/Postman) sends a real email via Resend and logs it.
- `meeting-service` successfully triggers an invite email when a meeting is created (if invite UI exists) — otherwise this can be tested standalone and wired to the UI once that screen exists.

## Explicitly NOT in this session
- Admin dashboard, LiveKit, agents.
