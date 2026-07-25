# Meeting Service Code Explanation

This document explains the flow and structure of the `meeting-service`.

## 1. Application Entry Point
- **`MeetingServiceApplication.java`**: The main Spring Boot application class. Starts the meeting microservice.

## 2. API Controllers (The Entry Points)
- **`MeetingController.java`**: Handles incoming HTTP requests for core meeting operations.
  - `POST /api/meetings`: Creates a new meeting and schedules it (if applicable).
  - `GET /api/meetings/{id}`: Retrieves details about a specific meeting.
  - `GET /api/meetings/join/{joinCode}`: Retrieves a meeting using its unique 6-digit join code.
- **`LiveKitController.java`**: Handles LiveKit-specific endpoints.
  - `GET /api/meetings/{id}/livekit-token`: Returns a minted JWT allowing the user to connect to the LiveKit WebRTC server.
  - `POST /api/meetings/{id}/remove-participant`: A host action to kick a participant from the LiveKit room.

## 3. Services (The Business Logic)
- **`MeetingService.java`**: Core business logic for meetings.
  - Creation: Generates a unique 6-digit join code, sets the host ID, and persists the `Meeting` to the database.
  - Retrieval: Looks up meetings and ensures they are still valid/active.
- **`LiveKitTokenService.java`**: Handles secure communication with the LiveKit server.
  - Token Minting: Uses the `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` to mint an access token containing permissions (e.g., can publish video/audio, can moderate if host).
  - Webhook/Server API integration: Uses LiveKit SDK to instruct the media server to disconnect a user.

## 4. Repositories (The Data Layer)
- **`MeetingRepository.java`**: An interface extending `JpaRepository`. Interacts with the `meetings` table in PostgreSQL to store and fetch meeting details (host ID, join code, title, start time, etc.).

## 5. Security Configuration
- **`SecurityConfig.java`**: Configures Spring Security for the meeting-service, enforcing that endpoints (like creating a meeting or fetching a LiveKit token) require a valid JWT representing an authenticated user.

## Summary of the Meeting Join Flow
1. A user enters a join code in the frontend, which calls `GET /api/meetings/join/{joinCode}` to validate it.
2. The `MeetingController` looks up the meeting and returns its ID.
3. The frontend then requests a WebRTC token by calling `GET /api/meetings/{id}/livekit-token`.
4. The `LiveKitController` verifies the user (via Spring Security JWT), and calls `LiveKitTokenService`.
5. `LiveKitTokenService` mints a secure token granting the user access to the specific room ID on the LiveKit server.
6. The frontend uses this token to connect to the LiveKit server and start streaming video!
