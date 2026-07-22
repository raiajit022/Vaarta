# Phase 2c — meeting-service

> Prerequisite: `phase-2a-auth-service.md` and `phase-2b-user-service.md` done and confirmed. Build ONLY this in this session.

> **Before anything else: create branch `phase-2c-meeting-service` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Step 0 — Analyze Before Building

Before writing code: open the Dashboard's "recent meetings"/"upcoming meetings" section and any Create Meeting / Join Meeting UI that exists, and identify exactly which pieces are currently mock data or fake button handlers (hardcoded meeting cards, a fake "create meeting" button that just navigates without calling anything, etc.) and exactly where that lives. Summarize findings, then build, replacing those exact pieces.

## Goal
Real meeting create/join/history, replacing any dummy meeting cards on the dashboard. This is the last piece needed before LiveKit (actual video) can be wired in — this service manages meeting *metadata*, not the call itself.

## Tech
- Java 17 + Spring Boot 3
- PostgreSQL, own schema: `meetings`
- Validates JWTs same as `user-service`.

## Database Schema (Flyway `V1__init_meetings.sql`)

```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    host_id UUID NOT NULL,                     -- references auth-service user id (app-level, no cross-DB FK)
    join_code VARCHAR(20) UNIQUE NOT NULL,     -- short human-shareable code
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, ENDED, CANCELLED
    scheduled_start TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT', -- HOST, PARTICIPANT
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Folder Structure

```
meeting-service/
  src/main/java/com/vaarta/meeting/
    MeetingServiceApplication.java
    config/JwtValidationFilter.java
    controller/
      MeetingController.java     // create, get, join, end
      ChatController.java        // persisted chat history (real-time itself travels over LiveKit data channel later)
    service/
      MeetingService.java
      JoinCodeGenerator.java     // short unique code generator
    repository/
      MeetingRepository.java
      MeetingParticipantRepository.java
      ChatMessageRepository.java
    model/
      Meeting.java, MeetingStatus.java, MeetingParticipant.java, ChatMessage.java
    dto/
      CreateMeetingRequest.java, MeetingResponse.java, JoinMeetingRequest.java
  src/main/resources/
    application.yml
    db/migration/V1__init_meetings.sql
  Dockerfile
  .env.example
  pom.xml
```

## API Contract

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/meetings` | `{title, scheduledStart?}` | created meeting, incl. `joinCode` |
| GET | `/api/meetings/me` | — | list of meetings user hosts or has joined (dashboard/history data) |
| GET | `/api/meetings/{id}` | — | meeting detail |
| POST | `/api/meetings/join/{joinCode}` | — | adds current user as participant, returns meeting detail |
| POST | `/api/meetings/{id}/end` | — | host only, marks ENDED |
| GET | `/api/meetings/{id}/chat` | — | chat history (for late joiners / history view) |
| POST | `/api/meetings/{id}/chat` | `{content}` | persists a chat message (called alongside LiveKit data-channel send, not instead of it) |

## Frontend Wiring
- Dashboard's "your meetings" / "recent meetings" section calls `GET /api/meetings/me` instead of mock data.
- "Create Meeting" button calls `POST /api/meetings`, shows the join code/link.
- "Join Meeting" flow calls `POST /api/meetings/join/{joinCode}`.
- Meeting Room screen (once it exists) will use `GET /api/meetings/{id}` for metadata; the live call itself is Phase 2f (LiveKit), not this service.

## Docker
```yaml
  meeting-service:
    build: ./meeting-service
    ports: ["8083:8080"]
    depends_on: [postgres, auth-service]
    env_file: ./meeting-service/.env
```

## External Setup Needed
```
JWT_SECRET=<same as auth-service>
DB_URL=jdbc:postgresql://postgres:5432/meetings
DB_USER=postgres
DB_PASSWORD=postgres
```

## Definition of Done
- Can create a meeting, get a join code.
- Can join via code as a second user.
- Dashboard/history reflects real meetings, not mock cards.
- Chat messages persist and can be fetched (even though live delivery isn't wired yet — that's Phase 2f).

## Explicitly NOT in this session
- Actual video/audio (LiveKit) — Phase 2f.
- Notifications/invites — Phase 2d.
- Admin views, agents.
