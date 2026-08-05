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

## End-to-End Architecture & Code Explanation

### 1. The Controller (`UserProfileController.java`)
This acts as the public API surface for user-related actions.
- `@GetMapping("/me")` allows a logged-in user to fetch their own profile details. It extracts the `userId` directly from the authenticated JWT context so that a user cannot query another user's private data.
- `@PostMapping("/internal/provision")` is a protected internal route that is called exclusively by the `auth-service` immediately after a new user signs up. This creates the blank profile record in the database.

### 2. Business Logic (`UserProfileService.java`)
The core service layer.
- **Provisioning**: When a user registers, this service takes the user ID, first name, and last name, and persists a `UserProfile` entity to the PostgreSQL database.
- **Updates**: It allows users to update their avatar URL, bio, and preferences by patching the entity fields.

### 3. Data Access (`UserProfileRepository.java`)
- A simple Spring Data JPA interface extending `JpaRepository`.
- It executes the SQL commands to read, write, and update the `user_profile` table.

### 4. Internal Security (`InternalApiKeyFilter.java`)
- Because the `user-service` has specific endpoints that should *only* be called by other microservices (like provisioning a user), it uses an API key filter.
- Any request hitting `/api/users/internal/*` is intercepted by this filter. It checks for the `X-Internal-Key` header and strictly matches it against the value stored in Azure Key Vault.

### 5. Flyway Migrations (`V1__init.sql`)
- The `user_service` database schema is initialized by Flyway upon application boot. It creates the `user_profile` table ensuring consistency across deployments.
