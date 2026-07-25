# Auth Service Code Explanation

This document explains the flow and structure of the `auth-service`.

## 1. Application Entry Point
- **`AuthServiceApplication.java`**: The main Spring Boot application class. Starts the auth microservice.

## 2. API Controllers (The Entry Points)
- **`AuthController.java`**: Handles incoming HTTP requests for authentication. 
  - `POST /api/auth/register`: Registers a new user.
  - `POST /api/auth/login`: Authenticates user credentials and returns a JWT token.
  - `GET /api/auth/profile`: Retrieves the authenticated user's profile using the JWT.

## 3. Services (The Business Logic)
- **`AuthService.java`**: Contains the core logic for registration and login.
  - Registration flow: Validates user data, hashes the password (using `PasswordEncoder`), and saves the new user via `UserRepository`.
  - Login flow: Compares the provided password with the hashed password in the database. If correct, generates a JWT token using `JwtUtil`.
- **`JwtUtil.java`**: Handles the generation, parsing, and validation of JSON Web Tokens (JWT). Uses the `JWT_SECRET` environment variable to securely sign the tokens.
- **`CustomUserDetailsService.java`**: Integrates with Spring Security to load user-specific data during authentication.

## 4. Repositories (The Data Layer)
- **`UserRepository.java`**: An interface extending `JpaRepository`. Handles database interactions for the `User` entity (e.g., finding a user by email, saving a user to Postgres).

## 5. Security Configuration
- **`SecurityConfig.java`**: Configures Spring Security. 
  - Disables CSRF for REST APIs.
  - Defines public endpoints (like `/api/auth/login` and `/api/auth/register`) and secures the rest.
  - Adds the `JwtAuthenticationFilter` to the security chain to intercept and validate JWTs on incoming requests.
- **`JwtAuthenticationFilter.java`**: Extracts the JWT from the `Authorization` header, validates it using `JwtUtil`, and sets the authentication context for the current request.

## Summary of the Login Flow
1. A user sends a `POST /api/auth/login` request with their email and password.
2. The `AuthController` receives the request and calls `AuthService.login(email, password)`.
3. `AuthService` queries the database via `UserRepository` to find the user by email.
4. It verifies the password using the `PasswordEncoder`.
5. If the password is correct, `AuthService` asks `JwtUtil` to generate a JWT.
6. The JWT is returned in the HTTP response to the client.
