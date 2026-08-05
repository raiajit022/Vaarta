# Meeting Service Architecture

This microservice is responsible for scheduling, managing, and tracking meetings, as well as the participants within them.

## Key Technologies
- **Spring Boot 3** (Web, Data JPA)
- **PostgreSQL** for data persistence
- **Flyway** for database migrations

## Folder Structure & File Explanations

### `/src/main/resources/`
- **`application.yml`**: Spring configuration for database, internal keys, notification service URLs, and the shared JWT secret.
- **`db/migration/V1__init_meetings.sql`**: Flyway script that creates the `meetings` table (to store meeting metadata like title and start time) and the `meeting_participants` table (to map which users are in which meeting).

### `/src/main/java/com/vaarta/meeting/`
- **`MeetingServiceApplication.java`**: The Spring Boot entry point. Configures a `RestClient.Builder` bean to make HTTP calls to the notification service.

### `/config/`
- **`JwtValidationFilter.java`**: Verifies JWT tokens on incoming frontend requests to authenticate the user creating or joining a meeting. Extracts the `userId` into the request attributes.
- **`WebConfig.java`**: Standard CORS configuration allowing the frontend (`localhost:5173`) to make API calls to this service.

### `/model/`
- **`Meeting.java`**: JPA Entity for the `meetings` table. Manages `id`, `hostId`, `title`, `joinCode`, `scheduledStart`, and `status`.
- **`MeetingParticipant.java`**: JPA Entity for `meeting_participants`. Keeps track of user roles (Host vs Guest) and join times.
- **`MeetingStatus.java`**: Enum mapping out states (SCHEDULED, LIVE, ENDED, CANCELLED).

### `/repository/`
- **`MeetingRepository.java`**: Queries meetings. Contains custom methods like `findByJoinCode(String joinCode)` to look up a meeting when a user types a code, and `findByHostIdOrParticipantUserId` to list all meetings relevant to a user on their dashboard.
- **`MeetingParticipantRepository.java`**: Queries participant relationships.

### `/dto/` (Data Transfer Objects)
- `CreateMeetingRequest` / `JoinMeetingRequest`: Defines JSON payload for requests. `CreateMeetingRequest` includes an optional list of `participantEmails`.
- `MeetingResponse`: Maps entity data to a format easily consumed by the React frontend.

### `/service/`
- **`MeetingService.java`**: Core business logic. 
  - `createMeeting()`: Generates a unique join code, persists the meeting, makes the creator the Host, and makes a non-blocking API call to `notification-service` to email any invited participants.
  - `joinMeeting()`: Validates a join code and adds a user to the `meeting_participants` table.
  - `getUserMeetings()`: Fetches the list of upcoming and past meetings.
- **`JoinCodeGenerator.java`**: Utility that creates readable, unique 9-character join codes (e.g., "abc-defg-hi").

### `/controller/`
- **`MeetingController.java`**: The REST API surface. Exposes endpoints to create, join, and list meetings, heavily relying on the `userId` injected by the JWT filter.

## Flow of Execution

Here is how data flows through the Meeting Service (e.g. when creating a meeting):

1. **Request Interception**: An HTTP request (e.g., `POST /api/meetings`) arrives from the frontend. `JwtValidationFilter.java` intercepts it, verifies the JWT signature, and extracts the `userId`.
2. **Controller Layer**: The request reaches `MeetingController.java`, which extracts the JSON body into a `CreateMeetingRequest` DTO and reads the `userId` from the HTTP request attributes.
3. **Service Layer**: The controller passes the data to `MeetingService.java`. The service:
   - Uses `JoinCodeGenerator.java` to create a unique code.
   - Instantiates a `Meeting` and makes the user the HOST by creating a `MeetingParticipant`.
4. **Database Interaction**: The `MeetingService` saves these entities to the PostgreSQL database via `MeetingRepository.java` and `MeetingParticipantRepository.java`.
5. **External Notification Call**: If `participantEmails` were provided in the request, `MeetingService` spins up an asynchronous thread using a `RestClient` to send an internal HTTP request to `notification-service:8080/api/notifications/meeting-invite`. It uses an `X-Internal-Key` header for authorization.
6. **Response**: A formatted `MeetingResponse` DTO is returned to the controller and sent back to the frontend.

## End-to-End Architecture & Code Explanation

### 1. The Controller (`MeetingController.java`)
This is the entry point for all HTTP requests coming from the frontend (via the ingress controller). 
- Methods like `@PostMapping` or `@GetMapping` handle API routing (e.g., creating a meeting, joining a meeting, inviting participants).
- It extracts the `userId` from the incoming JWT token (handled by Spring Security) to ensure actions are authorized.
- It then passes the data to the `MeetingService`.

### 2. The Business Logic (`MeetingService.java`)
This is where the core logic of the meeting application lives.
- **Meeting Creation**: It generates a unique join code and stores a new `Meeting` entity in the PostgreSQL database using `MeetingRepository`.
- **LiveKit Integration**: To facilitate live video/audio, it uses the LiveKit Java SDK to create a secure `AccessToken`. This token is passed to the frontend so the browser can connect directly to the WebRTC servers.
- **Microservice Communication**: It uses Spring's `RestClient` to communicate with the `notification-service` (for sending email invites) and the `ai-service` (for generating meeting recaps). These calls are authenticated using a shared `X-Internal-Key`.

### 3. Database & Entity Modeling
- Entities like `Meeting` and `MeetingParticipant` are JPA models. They define the database schema (e.g., foreign keys, timestamps).
- `Flyway` automatically manages the database migrations at startup, ensuring the SQL schema matches the Java entities.

### 4. Configuration & Security (`SecurityConfig.java`, `application.yml`)
- **JWT Validation**: The `SecurityConfig` enforces that all API requests contain a valid JWT token signed by the `auth-service`.
- **Azure Key Vault**: The `application.yml` is configured to use `spring-cloud-azure-starter-keyvault-secrets`. When running in Azure Container Apps, it uses the attached Managed Identity to fetch database passwords and API keys securely into memory, bypassing standard environment variables.
