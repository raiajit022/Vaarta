# User Service Architecture

This microservice handles extended user profile information and preferences. It is isolated from the core authentication concerns.

## Key Technologies
- **Spring Boot 3** (Web, Data JPA, Validation)
- **PostgreSQL** for data persistence
- **Flyway** for database migrations

## Folder Structure & File Explanations

### `/src/main/resources/`
- **`application.yml`**: Spring configuration for database, server port, etc.
- **`db/migration/V1__init_user_service.sql`**: Flyway script that creates the `profiles` table to store extra data beyond the basic auth credentials.

### `/src/main/java/com/vaarta/user/`
- **`UserServiceApplication.java`**: The Spring Boot entry point.

### `/config/`
- **`JwtValidationFilter.java`**: A simple OncePerRequestFilter that parses the JWT token sent from the frontend. Unlike `auth-service`, this service does not use full Spring Security. It merely verifies the token signature using the shared `JWT_SECRET`, extracts the `userId` claim, and places it into the HTTP request attributes for the controller to use.
- **`InternalApiKeyFilter.java`**: Protects internal endpoints. Specifically, `auth-service` calls `user-service` to provision a profile when a user registers. It authenticates this request using an `X-Internal-Key` header instead of a JWT.

### `/model/`
- **`UserProfile.java`**: JPA Entity mapping to the `profiles` table. Contains fields for user IDs, bios, avatars, and UI preferences (e.g. dark mode, notification settings).

### `/repository/`
- **`UserProfileRepository.java`**: Spring Data JPA interface for querying profiles by `userId`.

### `/dto/` (Data Transfer Objects)
- `CreateProfileRequest`: The payload `auth-service` sends when a user registers.
- `UpdateProfileRequest` / `UserProfileResponse`: Payloads for the frontend to view and update settings.

### `/service/`
- **`UserService.java`**: Contains business logic to fetch a profile, update fields, or instantiate a default profile for a brand new user.

### `/controller/`
- **`InternalUserController.java`**: Endpoints secured by the internal API key. Exposes `POST /api/internal/users` for profile provisioning.
- **`UserProfileController.java`**: Endpoints secured by JWT. Exposes `GET /api/users/me` and `PUT /api/users/me` allowing end-users to manage their own profiles from the frontend.

## Flow of Execution

Here is how data flows through the User Service:

1. **Request Interception**: 
   - If the frontend makes a request (e.g., `GET /api/users/me`), it is intercepted by `JwtValidationFilter.java`. The filter extracts the `userId` from the JWT and passes it downstream.
   - If `auth-service` makes a request (e.g., `POST /api/internal/users`), it is intercepted by `InternalApiKeyFilter.java` which verifies the `X-Internal-Key` header.
2. **Controller Layer**: The request reaches `UserProfileController.java` or `InternalUserController.java` depending on the route.
3. **Service Layer**: The controller passes the request to `UserService.java` to perform the necessary logic (e.g., fetching a profile or creating a new default one).
4. **Database Interaction**: `UserService` queries `UserProfileRepository.java` to read or write the `UserProfile` in the PostgreSQL database.
5. **Response**: A formatted `UserProfileResponse` DTO is returned back up the chain and sent to the client as a JSON response.
