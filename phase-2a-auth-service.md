# Phase 2a — auth-service

> Read `cursor.md` first for overall context. This file is the ONLY thing to build in this session. Do not start `user-service` or anything else until this is fully working and confirmed.

> **Before anything else: create branch `phase-2a-auth-service` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Step 0 — Analyze Before Building (do this first, every time)

Before writing any backend code, actually read the existing frontend project on disk:

1. Find and open the Login screen component, the Registration screen component, and the Dashboard component/route.
2. Identify exactly:
   - What fields the Login form collects (email/password field names, validation rules already in place).
   - What fields the Registration form collects.
   - What "dummy" logic currently simulates auth — a hardcoded check, a mock API call, a fake token in local state/Zustand, a hardcoded redirect to `/dashboard`, etc. Note the exact file(s) and function(s) responsible.
   - What dummy/mock user data the Dashboard currently reads (hardcoded name, avatar, email, stats) and exactly where that mock data lives (a mock JSON file, inline constants, a fake Zustand store, etc.).
   - Any existing auth-related state management (Zustand store, context, etc.) already scaffolded, even if currently fake — reuse its shape where reasonable rather than replacing it wholesale.
3. Write a short summary (as a comment block or a `NOTES.md` in the session) of what you found: "Login currently does X, Dashboard currently reads mock data from Y, auth state currently lives in Z." Confirm this matches expectations before touching any code.
4. Only after this analysis is done, proceed to build `auth-service` below, and wire it in by replacing the exact dummy pieces identified in step 3 — not by guessing at file locations.

This same "analyze first" step applies to every phase file in this project, not just this one — see the note added to `cursor.md`.

## Goal
Replace the frontend's dummy login/registration with a real, working authentication microservice: register, verify email, log in, refresh token, forgot/reset password.

## Why this is first
Every other service depends on knowing who the logged-in user is. Get this right once, reuse the JWT everywhere else.

## Tech
- Java 17 + Spring Boot 3
- Spring Security + JJWT (or Spring's built-in JWT support) for token issuance/validation
- PostgreSQL (own schema: `auth`), Flyway for migrations
- BCrypt for password hashing
- Resend for verification/reset emails
- Runs in its own Docker container, own `.env`

## Database Schema (Flyway migration `V1__init_auth.sql`)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',  -- USER or ADMIN
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Folder Structure

```
auth-service/
  src/main/java/com/vaarta/auth/
    AuthServiceApplication.java
    config/
      SecurityConfig.java        // Spring Security filter chain, CORS, public vs protected endpoints
      JwtConfig.java              // JWT secret, expiry, issuer config from application.yml
    controller/
      AuthController.java         // POST /register, /login, /refresh, /verify-email, /forgot-password, /reset-password
    service/
      AuthService.java             // core business logic
      TokenService.java            // JWT create/validate/refresh
      EmailVerificationService.java
      PasswordResetService.java
    repository/
      UserRepository.java
      EmailVerificationTokenRepository.java
      PasswordResetTokenRepository.java
      RefreshTokenRepository.java
    model/
      User.java
      Role.java (enum: USER, ADMIN)
    dto/
      RegisterRequest.java / RegisterResponse.java
      LoginRequest.java / LoginResponse.java
      RefreshRequest.java
      ForgotPasswordRequest.java
      ResetPasswordRequest.java
    exception/
      GlobalExceptionHandler.java  // consistent error JSON shape across all endpoints
  src/main/resources/
    application.yml
    db/migration/V1__init_auth.sql
  Dockerfile
  .env.example
  pom.xml
```

## API Contract (what the frontend will call)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password}` | `201`, sends verification email, no auto-login |
| GET | `/api/auth/verify-email?token=...` | — | `200` marks user verified |
| POST | `/api/auth/login` | `{email, password}` | `{accessToken, refreshToken, user: {id, email, role}}` |
| POST | `/api/auth/refresh` | `{refreshToken}` | `{accessToken, refreshToken}` |
| POST | `/api/auth/forgot-password` | `{email}` | `200`, sends reset email (always 200 even if email not found — no user enumeration) |
| POST | `/api/auth/reset-password` | `{token, newPassword}` | `200` |
| GET | `/api/auth/me` | (Bearer token) | `{id, email, role, emailVerified}` |

## Email Integration (Resend)
- Verification email: link to `FRONTEND_URL/verify-email?token=...`
- Reset email: link to `FRONTEND_URL/reset-password?token=...`
- Keep email templates in a small `EmailTemplates.java` or plain HTML string constants — do not over-engineer a templating engine yet.

## Frontend Wiring (this session's integration target)
- Replace dummy login form submit handler with real call to `POST /api/auth/login`.
- Store `accessToken` in memory (Zustand store), `refreshToken` in httpOnly-cookie-equivalent (or secure storage — decide based on current frontend auth store setup).
- Replace dummy registration submit with real call to `POST /api/auth/register`, show "check your email" state.
- Dashboard's user data (name/email shown in header, etc.) now comes from `GET /api/auth/me` instead of hardcoded mock.
- Add a basic Axios/fetch interceptor that attaches `Authorization: Bearer <token>` and handles 401 → refresh flow.

## Docker
```dockerfile
# auth-service/Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Add to `docker-compose.yml`:
```yaml
  auth-service:
    build: ./auth-service
    ports: ["8081:8080"]
    depends_on: [postgres]
    env_file: ./auth-service/.env
```

## External Setup Needed (outside the editor)
- Create a Resend account, get an API key.
- Add to `auth-service/.env`:
  ```
  RESEND_API_KEY=your_key_here
  JWT_SECRET=a_long_random_string
  FRONTEND_URL=http://localhost:5173
  DB_URL=jdbc:postgresql://postgres:5432/auth
  DB_USER=postgres
  DB_PASSWORD=postgres
  ```

## Definition of Done
- `docker compose up auth-service postgres` runs cleanly.
- Can register a new user, receive a real verification email, click the link, and the account becomes verified.
- Can log in with verified credentials and get a valid JWT.
- Frontend's Login and Registration screens use this service instead of dummy logic.
- Dashboard shows the real logged-in user's email/name (not mock data).
- Forgot/reset password flow works end to end.

## Explicitly NOT in this session
- `user-service`, `meeting-service`, anything else.
- Admin role UI (the `role` column exists in the schema now so we don't need a later migration, but no admin-specific endpoints/UI yet).
- Anything related to AI agents or translation.
