# Phase 2b — user-service

> Prerequisite: `phase-2a-auth-service.md` fully done and confirmed. Read `cursor.md` for overall context. Build ONLY this in this session.

> **Before anything else: create branch `phase-2b-user-service` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Step 0 — Analyze Before Building

Before writing code: open the Dashboard component(s) and any Settings/Profile screen that exists, and identify exactly which pieces of displayed data are still mock (display name, avatar, organization, timezone, any profile-edit form) and exactly where that mock data currently lives. Also confirm how `auth-service` (built in 2a) currently returns user identity via `/api/auth/me`, so `user-service` extends that identity rather than duplicating it. Summarize findings, then build.

## Goal
Real profile/user data replacing dashboard's remaining dummy data (avatar, display name, org, preferences, meeting stats placeholders).

## Tech
- Java 17 + Spring Boot 3
- PostgreSQL, own schema: `users`
- Trusts JWTs issued by `auth-service` — validates them locally (shared `JWT_SECRET` via env, or a shared public key if you move to asymmetric signing later) rather than calling `auth-service` on every request.

## Database Schema (Flyway `V1__init_users.sql`)

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,                  -- same as auth-service's users.id, not a new identity
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    organization VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Note: `user_profiles.id` mirrors the `id` from `auth-service`'s `users` table — created via an event or a direct call right after registration (see Integration below). No foreign key across databases (different DBs/schemas) — this is handled at the application level, which is normal and expected in a microservice architecture.

## Folder Structure

```
user-service/
  src/main/java/com/vaarta/user/
    UserServiceApplication.java
    config/
      JwtValidationFilter.java     // validates incoming Bearer tokens, extracts user id/role
    controller/
      UserProfileController.java   // GET/PUT /api/users/me
    service/
      UserProfileService.java
    repository/
      UserProfileRepository.java
    model/
      UserProfile.java
    dto/
      UserProfileResponse.java
      UpdateProfileRequest.java
  src/main/resources/
    application.yml
    db/migration/V1__init_users.sql
  Dockerfile
  .env.example
  pom.xml
```

## API Contract

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/users/me` | (Bearer token) | `{id, displayName, avatarUrl, organization, timezone}` |
| PUT | `/api/users/me` | `{displayName?, avatarUrl?, organization?, timezone?}` | updated profile |

## Integration: how a profile row gets created
Simplest approach for now (avoids building a message queue prematurely): when `auth-service` successfully registers a user, it makes a synchronous internal HTTP call to `user-service`'s `POST /api/users/internal/init` (an unauthenticated-but-network-restricted internal endpoint, or protected with a shared internal API key) to create the initial profile row with a default display name derived from the email. This is a pragmatic first version — a proper event bus (e.g. via Redis pub/sub or RabbitMQ) can replace this later if service count grows, but is NOT needed yet.

## Frontend Wiring
- Dashboard header/profile widget now calls `GET /api/users/me` instead of hardcoded name/avatar.
- Add a basic "Edit Profile" action if the Settings screen exists yet (if not, skip — don't build UI ahead of the screen existing).

## Docker
Same pattern as `auth-service` — own Dockerfile, own `.env`, added to `docker-compose.yml`:
```yaml
  user-service:
    build: ./user-service
    ports: ["8082:8080"]
    depends_on: [postgres, auth-service]
    env_file: ./user-service/.env
```

## External Setup Needed
```
JWT_SECRET=<same value as auth-service, so tokens validate correctly>
DB_URL=jdbc:postgresql://postgres:5432/users
DB_USER=postgres
DB_PASSWORD=postgres
AUTH_SERVICE_INTERNAL_KEY=<shared secret for the internal init call>
```

## Definition of Done
- New registrations automatically get a `user_profiles` row.
- Dashboard shows real display name/avatar/org from this service.
- Profile is editable and persists.

## Explicitly NOT in this session
- `meeting-service`, `notification-service`, admin routes, agents.
