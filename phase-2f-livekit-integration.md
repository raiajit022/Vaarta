# Phase 2f — LiveKit Integration (real video calls)

> Prerequisite: `phase-2c-meeting-service.md` done and confirmed. Build ONLY this in this session.

> **Before anything else: create branch `phase-2f-livekit-integration` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Goal
Turn meeting metadata (already working) into an actual multi-participant video call: real-time chat over LiveKit's data channel, mute/hand-raise state, room admin actions.

## Why LiveKit (reminder from the original plan)
LiveKit gives server-side access to audio/video tracks via its server SDK — this is what will make Phase 3's AI agents (transcription etc.) possible later. Raw peer-to-peer WebRTC does not allow this.

## Step 0 — Analyze Before Building

Before writing code: open the Meeting Room screen (if it exists yet from Figma exports) and identify any placeholder/mock video-tile UI already present, so real LiveKit components replace mock tiles rather than duplicating layout work. Also re-check `meeting-service`'s existing chat persistence endpoint (built in 2c) so the new data-channel chat sends to the same endpoint, not a new one. Summarize findings, then build.

## Tech
- LiveKit server, self-hosted via Docker (dev mode config, no TURN/cloud relay needed for local dev)
- `meeting-service` gains LiveKit server-SDK integration (Java server SDK) to mint access tokens and manage rooms
- Frontend: `@livekit/components-react` + `livekit-client`

## Docker Compose Addition
```yaml
  livekit:
    image: livekit/livekit-server:latest
    command: --dev
    ports:
      - "7880:7880"   # HTTP/WebSocket
      - "7881:7881"   # RTC TCP
      - "50000-50100:50000-50100/udp"
    environment:
      - LIVEKIT_KEYS=devkey:devsecret   # dev only — real secret in production env
```

## meeting-service Additions

```
meeting-service/
  src/main/java/com/vaarta/meeting/
    service/
      LiveKitTokenService.java   // mints room-join access tokens using LiveKit server SDK
    controller/
      LiveKitController.java     // GET /api/meetings/{id}/livekit-token
```

| Method | Path | Response |
|---|---|---|
| GET | `/api/meetings/{id}/livekit-token` | `{token, livekitUrl}` — used by frontend to join the LiveKit room |
| POST | `/api/meetings/{id}/remove-participant/{userId}` | host/admin only, removes a participant from the live room via server SDK |

- Room name convention: use the meeting's `id` (UUID) as the LiveKit room name directly — no separate mapping table needed.

## Frontend Wiring
- Meeting Room screen: on entering, calls `GET /api/meetings/{id}/livekit-token`, then connects using `livekit-client` with the returned token + URL.
- Chat: sent over LiveKit's data channel for real-time delivery; ALSO POSTed to `meeting-service`'s existing `/api/meetings/{id}/chat` endpoint (from Phase 2c) for persistence — both happen on send, not one instead of the other.
- Mute/hand-raise state: use LiveKit's data channel or track-mute APIs directly, no custom WebSocket needed.

## External Setup Needed
```
# meeting-service/.env additions
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
LIVEKIT_URL=ws://localhost:7880

# frontend .env additions
VITE_LIVEKIT_URL=ws://localhost:7880
```

## Definition of Done
- Two browser sessions can join the same meeting and see/hear each other.
- Chat sent in the call appears in real time for both participants AND is retrievable via the history endpoint afterward.
- Host can remove a participant from the room.

## Explicitly NOT in this session
- Any AI agent, transcription, or translation. This phase is strictly "make the call work," full stop. Phase 3 begins only after this is confirmed solid — per the original plan's own reasoning, since agents depend on this being stable.
