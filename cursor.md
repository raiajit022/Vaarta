# Vaarta — Master Build Plan (cursor.md)

> This is the master roadmap for building Vaarta solo. It exists to keep Cursor (or any AI coding assistant) working on ONE thing at a time, in order, without batching multiple phases into one session.
>
> **Golden rule for every Cursor session:** Read the relevant phase file. Build ONLY what that file describes. Stop and report back before moving to the next phase. Do not jump ahead even if it seems "quick."
>
> **Golden rule #2 — branching is automatic, not optional.** Before writing any code for a phase, Cursor must create and switch to a new feature branch itself (see Section 5 for the exact commands and naming convention). Never commit or build directly on `main`. This applies to every single phase file, no exceptions, and Cursor should do it without being asked each time — it's a standing instruction, not a per-session request.

---

## 0. Project Snapshot (as of this plan)

- **Project**: Vaarta — enterprise-grade AI-native web conferencing platform.
- **Status**: Frontend has Landing page, Login, Registration (currently dummy auth), and Dashboard built (React 18 + TS + Vite + Tailwind + shadcn, emerald/stone design system). Backend not started.
- **Owner**: Solo execution by Ajit Rai. No team, no parallel tracks — one phase, one service, one agent at a time.
- **Repo**: https://github.com/raiajit022/Vaarta

---

## 1. Core Principles (do not violate these)

1. **Microservices, isolated by design.** Every backend capability is its own Docker container with its own responsibility. A failure in one service must never take down another. No shared in-process coupling between services — only HTTP/REST (or a message queue later, if genuinely needed).
2. **One service at a time.** Build, test, and confirm a service works standalone AND wired to the frontend before starting the next one.
3. **One agent at a time.** Same rule applies to AI agents once we reach Phase 3 — never build multiple agents in one session.
4. **Clean code, commented to industry standard.** Every service should read like something a new engineer could onboard onto in an afternoon — clear naming, docstrings/JavaDoc where appropriate, no magic numbers, no unexplained config.
5. **No real-time translation yet.** Deliberately excluded from all current scope (frontend, backend, agents). It re-enters scope only when explicitly reintroduced later.
6. **Local-first infra.** Docker Compose is the infrastructure for now. Cloud (GCP) is a later migration, not a current dependency.
7. **Checkpoint discipline.** Every session ends with: what was built, how to verify it runs, what's next. Do not silently carry unfinished work into assumptions for the next session.
8. **Analyze before building — every phase, no exceptions.** Before writing any new code for a phase, Cursor must first open and read whatever existing code that phase touches (frontend dummy logic, a previously built service, existing mock data, etc.), summarize what it found, and only then start building — replacing the exact identified dummy/mock pieces rather than guessing at file locations or duplicating existing scaffolding. Each phase file's "Step 0" section spells out exactly what to look at for that phase.

---

## 2. Tech Stack Reference

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite, Tailwind CSS, shadcn/ui, Zustand (client state), React Query (server state), react-router-dom |
| Backend services | Java 17 + Spring Boot 3 |
| Database | PostgreSQL, UUID primary keys, Flyway migrations only (no Hibernate auto-DDL) |
| Auth | Custom Spring Boot `auth-service` — JWT-based, own email verification via Resend (NOT Keycloak) |
| Email | Resend (SMTP/API) — used by `auth-service` and `notification-service` |
| Real-time media | LiveKit (self-hosted via Docker, dev mode) — chosen because AI agents need server-side audio track access |
| AI agents | Python + FastAPI + LangGraph, one shared `ai-service` container to start |
| Infra (current) | Docker Compose — Postgres, Redis, LiveKit, and each microservice |
| Infra (future) | GCP (reduced from originally-planned 3-4 accounts to 1, possibly 2) — see Section 6 |

---

## 3. Build Order (Phases)

### Phase 1 — Frontend Foundation (mostly done)
- [x] Design system, Login screen
- [x] Landing page
- [x] Registration screen (dummy auth)
- [x] Dashboard (dummy data)
- [ ] Remaining screens (Meeting Room, Settings, History, Admin views) — generated and wired in as they come, following the existing Figma Make → integrate → route workflow.

**Definition of done**: All planned screens exist as routed pages in one React project, fully click-through navigable, consistent design system. AI/translation features do NOT appear anywhere in the UI yet.

---

### Phase 2 — Backend Foundation (current focus)

Built one service at a time, each wired to the frontend before moving to the next. See individual phase files for full detail on each.

1. **`auth-service`** → see `phase-2a-auth-service.md`
   Replaces dummy login/registration with real JWT-based auth, email verification via Resend.
2. **`user-service`** → see `phase-2b-user-service.md`
   Replaces dummy dashboard data with real user/profile data.
3. **`meeting-service`** → see `phase-2c-meeting-service.md`
   Create/join/history for meetings.
4. **`notification-service`** → see `phase-2d-notification-service.md`
   Meeting invites and transactional emails via Resend (separate concern from auth emails).
5. **Admin-protected routes** → see `phase-2e-admin-dashboard.md`
   Role-based access on existing frontend + backend, not a separate microservice yet.
6. **LiveKit integration** → see `phase-2f-livekit-integration.md`
   Real multi-participant video calls, chat over LiveKit data channel (persisted via REST for history).

**Definition of done**: A user can register (real email verification), log in, see real profile/dashboard data, create or join a meeting, have a real video call with chat, and an admin can access protected admin views. No AI features yet.

---

### Phase 3 — AI Agent Integration (strictly after Phase 2 is fully working)

One shared `ai-service` (Python/FastAPI + LangGraph) housing multiple agent "nodes." Built and integrated ONE agent at a time, in this order:

1. Meeting summarizer
2. Action-item extractor
3. Chat @-command agent
4. Sentiment/tone tracker
5. Meeting title/agenda generator
6. Follow-up email drafter (feeds into `notification-service`)
7. Q&A over past meetings (simple RAG over stored transcripts)
8. Speaker time/participation tracker
9. Keyword/topic tagger
10. Orchestrator agent (built once 3-4 of the above exist, to actually route between them)

Transcription (STT) is the shared prerequisite underneath all of these — not itself counted as one of the 10, since it's infrastructure the agents consume rather than a standalone feature.

**Explicitly excluded from this phase**: real-time translation, voice synthesis/cloning (TTS/XTTS-v2), Sarvam AI integration. These return only when the user explicitly reintroduces them — see Phase 5.

See `phase-3-ai-agents.md` for full detail, one agent per session.

---

### Phase 4 — Data & MLOps (deferred)

- Once Phase 3 produces real transcript/meeting data, build the analytics/MLOps layer on Azure Databricks (Medallion architecture, as originally scoped).
- Not detailed until Phase 3 is producing real data. Do not pre-build this.

---

### Phase 5 — Real-Time Translation (deferred, future)

- STT → translation → TTS/voice-cloning pipeline (Sarvam AI, XTTS-v2).
- Only begins when explicitly reintroduced by the user. Do not scaffold, stub, or reference this anywhere in Phases 1-4.
- When reintroduced, this is likely where a dedicated GPU-backed container/service split from the shared `ai-service` becomes worthwhile (see Section 6).

---

## 4. Docker Compose Structure (grows incrementally)

Start minimal, add one service at a time as each phase begins — do not pre-declare all services in Compose before they're built.

```yaml
# docker-compose.yml (grows over phases — do not add sections for services not yet built)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_MULTIPLE_DATABASES: auth,users,meetings   # one logical DB per service, isolated by schema/db name
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  auth-service:
    build: ./auth-service
    ports: ["8081:8080"]
    depends_on: [postgres]
    env_file: ./auth-service/.env

  # user-service, meeting-service, notification-service, livekit, ai-service
  # added here in later phases, each with its own build context and .env

volumes:
  pgdata:
```

Each service:
- Has its own `Dockerfile`.
- Has its own `.env` (never committed — `.env.example` committed instead).
- Owns its own DB schema/database (logical separation even if sharing one Postgres instance for now).
- Exposes a `/health` (or `/actuator/health` for Spring Boot) endpoint for basic liveness checks.

---

## 5. GitHub Workflow (solo discipline)

**This section is instructions FOR CURSOR TO EXECUTE, not just guidelines to read.**

At the start of every phase, before writing any code, Cursor must run:

```bash
git checkout main
git pull origin main
git checkout -b <branch-name>   # see naming convention below
```

Branch naming — one branch per phase file, matching its name exactly:
- `phase-2a-auth-service`
- `phase-2b-user-service`
- `phase-2c-meeting-service`
- `phase-2d-notification-service`
- `phase-2e-admin-dashboard`
- `phase-2f-livekit-integration`
- `phase-3-<agent-name>` (e.g. `phase-3-summarizer-agent`, `phase-3-action-items-agent`) — one branch per agent, not one branch for all of Phase 3

During the session, Cursor commits normally to this branch (small, meaningful commits — not one giant commit at the end).

At the end of the session, once the phase's "Definition of Done" is met and you've verified it yourself:
```bash
git push -u origin <branch-name>
```
Then open a PR on GitHub (`gh pr create` if the GitHub CLI is available, otherwise Cursor should tell you the branch is pushed and ready for you to open the PR manually). You review and merge it yourself — Cursor should NOT merge to `main` automatically, even solo. That final review step is your own checkpoint before the next phase branches off an updated `main`.

- No direct pushes to `main`, ever — enforced by branch protection on GitHub (set this up once, manually, in repo settings — Cursor can't do this part for you).
- Commit messages and PR descriptions are the project's real documentation trail — write them as if explaining to someone else.
- GitHub Projects board tracks phase-by-phase and service-by-service progress.

---

## 6. Cloud Notes (forward-looking only — not active work yet)

Current infra is 100% local Docker Compose. This section exists so cloud decisions aren't made in a vacuum later.

- **Reduced from the original 3-4 cloud accounts (3x GCP + Azure, team-era plan) down to:**
  - **1 GCP project**: hosts all Java microservices (`auth-service`, `user-service`, `meeting-service`, `notification-service`), Postgres (Cloud SQL), Redis, and LiveKit (GKE or Compute Engine). This is the "core app" cloud footprint.
  - **Possible 2nd GCP project (later, only if needed)**: isolates `ai-service`, specifically if/when Phase 5 (translation/voice-cloning) requires GPU instances — keeps GPU billing and scaling separate from core app infra.
  - **Azure Databricks**: enters the picture only at Phase 4, as a managed service (not container deployment), so it doesn't compete with the GCP-reduction goal.
- **Do not start cloud migration work until Phase 2 is fully working locally.** This section is a reference for the eventual dedicated cloud-planning session, not a current task.

---

## 7. Session Checklist (use at the end of every Cursor session)

- [ ] What was built this session (list files/services touched)
- [ ] How to verify it runs (exact commands: `docker compose up <service>`, test endpoints, etc.)
- [ ] What's explicitly NOT done yet / what's next
- [ ] Any "External Setup Needed" (e.g. Resend API key, `.env` values) called out clearly
