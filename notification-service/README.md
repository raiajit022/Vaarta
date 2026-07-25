# Notification Service Architecture

This microservice acts as a centralized notification hub. Currently, it handles formatting and dispatching transactional emails (like meeting invites and reminders).

## Key Technologies
- **Spring Boot 3** (Web, Data JPA)
- **PostgreSQL** for data persistence
- **Flyway** for database migrations
- **Resend REST API** for sending emails

## Folder Structure & File Explanations

### `/src/main/resources/`
- **`application.yml`**: Spring configuration including the database URL, the `RESEND_API_KEY`, and the `INTERNAL_API_KEY`.
- **`db/migration/V1__init_notifications.sql`**: Flyway script that creates the `notification_log` table.

### `/src/main/java/com/vaarta/notification/`
- **`NotificationServiceApplication.java`**: The Spring Boot entry point. Instantiates a `RestClient.Builder` bean to make HTTP calls to external APIs like Resend.

### `/config/`
- **`InternalApiKeyFilter.java`**: A security filter that blocks all traffic to the `/api/notifications/*` endpoints unless the request includes a valid `X-Internal-Key` header. Because this service sends emails on behalf of the system, it doesn't use user-level JWTs, but rather trusts other backend services (like `meeting-service`) via this shared internal key.

### `/model/`
- **`NotificationLog.java`**: A JPA Entity that represents a record of every notification sent. Stores the recipient's email, the type of notification (invite/reminder), the related meeting ID, the timestamp, and whether it succeeded (`SENT`) or failed (`FAILED`).
- **`NotificationType.java`**: An enum defining the available types of notifications (`MEETING_INVITE`, `MEETING_REMINDER`, `MEETING_SUMMARY`).

### `/repository/`
- **`NotificationLogRepository.java`**: Spring Data JPA interface to save and query notification logs in PostgreSQL.

### `/dto/` (Data Transfer Objects)
- **`SendInviteRequest.java`**: Defines the JSON body required to send a meeting invite (expects recipient email, meeting title, join link, and meeting ID).
- **`SendReminderRequest.java`**: Defines the JSON body required to send a meeting reminder.

### `/service/`
- **`NotificationService.java`**: The core logic. 
  - Exposes `sendMeetingInvite()` and `sendMeetingReminder()` methods.
  - Generates polished, responsive HTML templates for the emails.
  - Makes a POST request to the `https://api.resend.com/emails` endpoint to dispatch the email.
  - Catches any network errors from Resend and logs the result (Success or Failure) into the `NotificationLogRepository`.

### `/controller/`
- **`NotificationController.java`**: The REST API endpoints that other internal microservices call to trigger notifications.
  - `POST /api/notifications/meeting-invite`
  - `POST /api/notifications/meeting-reminder`

## Flow of Execution

Here is how data flows through the Notification Service:

1. **Internal Trigger**: Another microservice (e.g. `meeting-service`) makes an HTTP POST request to `/api/notifications/meeting-invite` providing a `SendInviteRequest` body and an `X-Internal-Key` header.
2. **Security Interception**: `InternalApiKeyFilter.java` intercepts the request. It compares the `X-Internal-Key` header to the configured `app.internal-api-key`. If it matches, the request is allowed through; otherwise, it returns a 401 Unauthorized.
3. **Controller Layer**: The request reaches `NotificationController.java`, mapping the JSON body into a DTO.
4. **Service Layer**: The controller passes the DTO to `NotificationService.java`. The service:
   - Uses Java text blocks to inject the meeting details into a responsive HTML email template.
   - Prepares a JSON payload for the Resend API (`https://api.resend.com/emails`).
5. **External API Call & Persistence**: 
   - `NotificationService` executes the HTTP request to Resend using a `RestClient`.
   - It captures the success or failure of this external call.
   - It creates a `NotificationLog` entity recording the attempt and uses `NotificationLogRepository.java` to persist this log to PostgreSQL.
6. **Response**: A 202 Accepted HTTP response is returned to the calling microservice.
