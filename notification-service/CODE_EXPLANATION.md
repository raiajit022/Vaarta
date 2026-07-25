# Notification Service Code Explanation

This document explains the flow and structure of the `notification-service`.

## 1. Application Entry Point
- **`NotificationServiceApplication.java`**: The main Spring Boot application class. Starts the notification microservice.

## 2. API Controllers (The Entry Points)
- **`InternalNotificationController.java`**: Handles incoming HTTP requests from other internal microservices (like the `meeting-service` or `auth-service`).
  - `POST /api/internal/notifications/send`: Triggers a new notification to be sent.

## 3. Services (The Business Logic)
- **`NotificationService.java`**: Core business logic for processing notifications.
  - Logging: Saves a record of the notification payload (recipient, type, message) to the database using `NotificationLogRepository`.
  - Email/Push: Currently structured to simulate or dispatch external emails. If wired to an SMTP server, it uses `JavaMailSender` to send the notification out.

## 4. Repositories (The Data Layer)
- **`NotificationLogRepository.java`**: An interface extending `JpaRepository`. Interacts with the `notifications` table in PostgreSQL to keep an audit trail of every notification sent.

## 5. Security Configuration
- **`InternalSecurityConfig.java`**: Configures Spring Security for internal communication.
  - Unlike the other services that use JWTs, the notification-service is strictly internal. 
  - It uses an API key (`INTERNAL_API_KEY`) passed in the headers by other services.
  - A custom `ApiKeyFilter` intercepts the request, checks the header, and rejects unauthorized external access.

## Summary of the Notification Flow
1. A user creates a new meeting in the `meeting-service`.
2. The `meeting-service` (acting as a client) makes an HTTP POST request to `notification-service` (`/api/internal/notifications/send`), passing the `INTERNAL_API_KEY` header.
3. The `ApiKeyFilter` in `notification-service` intercepts the request, validates the API key, and lets it through.
4. The `InternalNotificationController` receives the payload (e.g., "Meeting Scheduled for 3 PM") and passes it to `NotificationService`.
5. `NotificationService` saves a `NotificationLog` to the database for auditing purposes.
6. (Optional) `NotificationService` dispatches the email via SMTP.
7. It returns a success response to the `meeting-service`.
