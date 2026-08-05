# Auth Service Architecture

This microservice handles user identity, authentication, JWT issuance, and email-based verifications. It acts as the central gatekeeper for the Vaarta platform.

## Key Technologies
- **Spring Boot 3** (Web, Data JPA, Security)
- **PostgreSQL** for data persistence
- **Flyway** for database migrations
- **io.jsonwebtoken (JJWT)** for JWT token generation and validation
- **Resend API** for sending verification and password reset emails

## Folder Structure & File Explanations

### `/src/main/resources/`
- **`application.yml`**: Spring Boot configuration containing database URLs, JWT secrets, and external service URLs.
- **`db/migration/V1__init_schema.sql`**: Flyway script that creates the initial `users` and `email_verifications` tables when the application starts.

### `/src/main/java/com/vaarta/auth/`
- **`AuthServiceApplication.java`**: The Spring Boot entry point.

### `/config/`
- **`SecurityConfig.java`**: Configures Spring Security. It disables CSRF, forces a stateless session, explicitly exposes public endpoints (like `/api/auth/register`, `/api/auth/login`), and secures others. 
- **`JwtAuthFilter.java`**: A custom Spring Web Filter that intercepts incoming HTTP requests. It extracts the `Authorization: Bearer <token>` header, validates the JWT, and constructs a `UsernamePasswordAuthenticationToken` to let Spring Security know the user is authenticated.
- **`JwtUtil.java`**: A utility class dedicated to creating JWTs, extracting claims (like the `userId`), and validating token signatures against the `JWT_SECRET`.

### `/model/`
- **`User.java`**: JPA Entity mapping to the `users` table. Contains fields like email, hashed password, name, and an `isEmailVerified` flag.
- **`EmailVerificationToken.java`**: JPA Entity mapping to `email_verifications`. Stores the unique token sent to users upon registration and its expiration date.

### `/repository/`
- **`UserRepository.java`**: Spring Data JPA interface for querying the `users` table (e.g. `findByEmail`).
- **`EmailVerificationTokenRepository.java`**: JPA interface for managing verification tokens.

### `/dto/` (Data Transfer Objects)
- Classes like `RegisterRequest`, `LoginRequest`, `AuthResponse`, and `VerifyEmailRequest`. These define the JSON structures expected in request bodies and returned in API responses.

### `/service/`
- **`AuthService.java`**: The core business logic. 
  - `register()`: Hashes the password, creates a user, generates a token, and emails them.
  - `login()`: Validates credentials and generates a JWT.
  - `verifyEmail()`: Validates a token and marks a user as verified.
  - Also manages calls to `user-service` over HTTP (with an internal API key) to provision a user profile after registration.
- **`EmailService.java`**: Contains logic to build HTML email templates and dispatch them to the user via the Resend REST API.

### `/controller/`
- **`AuthController.java`**: Exposes the REST API endpoints (`/api/auth/*`). It receives HTTP requests, maps JSON to DTOs, calls the `AuthService`, and returns the appropriate HTTP status codes (200 OK, 201 Created, 401 Unauthorized, etc).

## Flow of Execution

Here is how data flows through the Auth Service:

1. **Request Interception**: An HTTP request arrives from the frontend and is intercepted by `SecurityConfig.java`. If the endpoint requires authentication (like `/api/auth/me`), it passes through `JwtAuthFilter.java` which verifies the token using `JwtUtil.java`.
2. **Controller Layer**: The request reaches `AuthController.java`. The controller converts the raw JSON body into a DTO (e.g., `RegisterRequest`).
3. **Service Layer**: The controller passes the DTO to `AuthService.java`. This is where the core business logic executes (e.g., hashing the password with BCrypt).
4. **Database Interaction**: The `AuthService` uses `UserRepository.java` to persist the new `User` to the PostgreSQL database.
5. **Side Effects & External Calls**: 
   - If registering, `AuthService` makes an internal HTTP call to `user-service` to provision a blank profile.
   - It also calls `EmailService.java` to dispatch a verification email via the Resend API.
6. **Response**: The `AuthService` returns an `AuthResponse` containing the JWT back to the controller, which sends a 200 OK HTTP response to the frontend.

## End-to-End Architecture & Code Explanation

### 1. Security Configuration (`SecurityConfig.java`)
This file configures Spring Security. 
- It disables CSRF and session management since the application relies entirely on stateless JWTs. 
- It explicitly allows public unauthenticated access to paths like `/api/auth/login` and `/api/auth/register`, while requiring authentication for all other routes.
- It registers the `JwtAuthenticationFilter`, which intercepts all secured requests to validate the token.

### 2. Authentication Logic (`AuthService.java`)
This is the core business logic component.
- **Login**: It checks the provided email against the `auth_user` table using `AuthUserRepository`. If found, it uses `PasswordEncoder` (BCrypt) to verify the password. Upon success, it calls `JwtService` to generate an access token.
- **Registration**: It validates that the email doesn't already exist. It securely hashes the new user's password, saves the credentials to `AuthUser`, and simultaneously makes an internal HTTP call via `RestClient` to `user-service` to provision the detailed profile in the `user_profile` table.
- **Email Verification**: When a user registers, it securely generates an OTP, stores it in memory or database, and sends an email via `notification-service` to verify their identity.

### 3. JWT Handling (`JwtService.java`)
- This file leverages the `io.jsonwebtoken` (JJWT) library.
- It generates tokens with an issuer, expiration time, and subject (usually the UUID of the user).
- It verifies incoming tokens from the Authorization header by checking the signature using the `JWT_SECRET` injected from Azure Key Vault.

### 4. Database & Secrets (`application.yml`)
- Flyway is enabled to manage schema versioning (e.g., `V1__init.sql`).
- The secrets such as `DB-PASSWORD` and `JWT-SECRET` are seamlessly retrieved from Azure Key Vault via the `spring-cloud-azure` integration utilizing the Azure Managed Identity assigned to the container app environment.
