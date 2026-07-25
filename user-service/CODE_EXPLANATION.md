# User Service Code Explanation

This document explains the flow and structure of the `user-service`.

## 1. Application Entry Point
- **`UserServiceApplication.java`**: The main Spring Boot application class. Starts the user microservice.

## 2. API Controllers (The Entry Points)
- **`UserController.java`**: Handles incoming HTTP requests related to user profiles.
  - `GET /api/users/{id}`: Retrieves a user's profile information by ID.
  - `PUT /api/users/{id}`: Updates a user's profile information (e.g., name, avatar, timezone).
  - `GET /api/users`: Allows admins or internal services to list users.

## 3. Services (The Business Logic)
- **`UserService.java`**: Contains the core logic for retrieving and modifying user profiles.
  - Profile Retrieval: Fetches a user from the database and returns a sanitized DTO (Data Transfer Object) so sensitive fields (like password hashes) aren't exposed.
  - Profile Updating: Handles merging incoming changes (from the controller) with the existing user record in the database.

## 4. Repositories (The Data Layer)
- **`UserRepository.java`**: An interface extending `JpaRepository`. Interacts with the shared `users` database table to perform CRUD operations on user records.

## 5. Security Configuration
- **`SecurityConfig.java`**: Configures Spring Security for the user-service.
  - Uses a shared `JwtAuthenticationFilter` (similar to the auth-service) to ensure that incoming requests are authenticated and the user is who they claim to be.
  - Restricts endpoint access (e.g., only the user themselves can update their profile, or an Admin).

## Summary of the Profile Update Flow
1. A user sends a `PUT /api/users/{id}` request with their updated information (e.g., a new timezone).
2. The `JwtAuthenticationFilter` intercepts the request, validates the JWT, and extracts the user's ID to ensure they are authorized.
3. The `UserController` receives the request and calls `UserService.updateUserProfile(id, updateRequest)`.
4. `UserService` fetches the existing user via `UserRepository`.
5. It applies the requested changes and saves the updated entity back to the database.
6. The updated profile data is returned to the client in the HTTP response.
