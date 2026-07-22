# Phase 3 — AI Agents (ai-service)

> Prerequisite: ALL of Phase 2 (`2a` through `2f`) fully working and demoed end to end without any AI feature. Do not start this phase early. Build ONE agent per session — never more.

## Architecture Decision
All agents live inside **one shared `ai-service`** container (Python + FastAPI + LangGraph) to start. Reasoning:
- LangGraph is built to orchestrate multiple agents within one graph/process — that's its core value.
- Splitting every agent into its own microservice adds Docker/network overhead without benefit, since these agents share the same resource profile (LLM API calls, no GPU needed at this stage) and aren't independently scaled.
- Isolation is still preserved at the right granularity: if `ai-service` crashes, none of the Java services (`auth-service`, `meeting-service`, etc.) are affected.
- A single agent is later split into its own container ONLY if it has a genuinely different resource profile (e.g. a future GPU-heavy TTS/voice-cloning agent under Phase 5).

## Tech
- Python 3.11+, FastAPI, LangGraph, LangChain (as needed for LLM calls)
- Talks to `meeting-service` (read transcripts/chat, when available) and `notification-service` (to send follow-up emails) via internal HTTP calls, same internal-API-key pattern as other services.
- One LLM provider to start (reuse whatever you're already using for development, e.g. Anthropic API) — do not add multiple providers prematurely.

## Folder Structure

```
ai-service/
  app/
    main.py                     # FastAPI app entrypoint
    config.py                   # env vars, API keys
    agents/
      summarizer.py             # Agent 1
      action_items.py           # Agent 2
      chat_commands.py          # Agent 3
      sentiment_tracker.py      # Agent 4
      agenda_generator.py       # Agent 5
      followup_email.py         # Agent 6
      meeting_qa.py             # Agent 7
      participation_tracker.py  # Agent 8
      topic_tagger.py           # Agent 9
      orchestrator.py           # Agent 10 — built last, routes to 1-9
    graph/
      build_graph.py            # LangGraph graph definition, wires nodes together
    clients/
      meeting_service_client.py # internal HTTP client to fetch transcripts/chat
      notification_service_client.py
    routers/
      agent_router.py           # POST /agents/invoke — the one shared entrypoint
  requirements.txt
  Dockerfile
  .env.example
```

## Shared API Contract (one entrypoint, routes internally)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/agents/invoke` | `{agentType, meetingId, payload}` | agent-specific response shape |

`agentType` values added incrementally as each agent is built: `SUMMARIZER`, `ACTION_ITEMS`, `CHAT_COMMAND`, `SENTIMENT`, `AGENDA_GENERATOR`, `FOLLOWUP_EMAIL`, `MEETING_QA`, `PARTICIPATION`, `TOPIC_TAGGER`, `ORCHESTRATOR`.

---

## Build Order (one per session — do not skip ahead)

### 3.1 Meeting Summarizer
- Input: transcript text (or meeting chat if transcript doesn't exist yet — note: STT/transcription itself is a prerequisite utility, treat it as "Phase 3.0" if not already available; a simple STT call using an existing API, e.g. Whisper via API, feeding into these agents).
- Output: 3-5 sentence summary.
- Frontend: a "Summary" tab/section on the post-meeting or history screen.

### 3.2 Action-Item Extractor
- Input: same transcript.
- Output: structured list `[{task, owner?, dueHint?}]`.
- Frontend: checklist UI on meeting history page.

### 3.3 Chat @-Command Agent
- Input: a chat message starting with `@bot`, plus recent transcript/chat context.
- Output: a response posted back into the meeting chat (via `meeting-service`'s chat endpoint).
- Frontend: no new UI — just recognize `@bot` messages and show the agent's reply as a distinct sender.

### 3.4 Sentiment/Tone Tracker
- Input: periodic transcript chunks during/after a meeting.
- Output: simple label (positive/neutral/tense) + optional short reason.
- Frontend: small indicator on meeting history (not real-time UI yet, to keep this simple).

### 3.5 Meeting Title/Agenda Generator
- Input: a short pre-meeting description typed by the user when creating a meeting.
- Output: suggested title + 3-5 agenda bullet points.
- Frontend: "Suggest" button next to the Create Meeting form.

### 3.6 Follow-up Email Drafter
- Input: transcript + summary + action items (reuses 3.1 and 3.2 outputs).
- Output: a draft recap email body.
- Integration: sent via `notification-service` (Phase 2d) once the user approves the draft — do not auto-send without confirmation.

### 3.7 Q&A Over Past Meetings
- Input: a user question + their past meeting transcripts (simple retrieval, not a full vector DB yet unless meeting volume justifies it — start with keyword/date-filtered retrieval, upgrade to embeddings only if needed).
- Output: an answer grounded in past meeting content.
- Frontend: a simple search/ask box on the meeting history page.

### 3.8 Speaker Time/Participation Tracker
- Input: LiveKit participant join/leave + speaking-time data (if available from LiveKit's track stats) or chat-message counts as a simpler proxy.
- Output: per-participant engagement stats.
- Frontend: a small stats panel on meeting history.
- Note: this one is more analytics than LLM — lightweight to build, good "quick win."

### 3.9 Keyword/Topic Tagger
- Input: transcript/summary.
- Output: 3-5 topic tags.
- Frontend: tags shown on meeting history cards, usable as filters.

### 3.10 Orchestrator Agent
- Built only once agents 3.1-3.9 (or at least 4-5 of them) exist.
- Purpose: a single LangGraph graph that routes a general request (e.g. "tell me what happened in yesterday's standup and draft a follow-up") to the right combination of the above agents, rather than the frontend calling each agent individually.
- This is where LangGraph's graph/routing structure actually gets used as intended.

---

## Docker
```yaml
  ai-service:
    build: ./ai-service
    ports: ["8090:8000"]
    depends_on: [meeting-service, notification-service]
    env_file: ./ai-service/.env
```

## External Setup Needed (once, before 3.1)
```
LLM_API_KEY=<your Anthropic/OpenAI key>
INTERNAL_API_KEY=<same shared secret pattern as other services>
MEETING_SERVICE_URL=http://meeting-service:8080
NOTIFICATION_SERVICE_URL=http://notification-service:8080
```

## Explicitly Excluded (Phase 5, not now)
- Real-time speech-to-text as a live pipeline (batch/on-demand transcription for the above agents is fine; live streaming STT is part of the translation pipeline, deferred).
- Translation agent, TTS/voice-cloning (XTTS-v2), Sarvam AI integration.
- Do not stub, scaffold, or reference these anywhere in code or UI during Phase 3.

## Session Discipline
Each of 3.1 through 3.10 is its own Cursor session: **first create and switch to its own branch** (`phase-3-summarizer-agent`, `phase-3-action-items-agent`, etc. — see `cursor.md` Section 5, one branch per agent, never a shared "phase-3" branch for multiple agents), build the one agent, wire its one piece of frontend UI, confirm it works, write the session checklist (per `cursor.md` Section 7), push and open a PR, stop. Do not combine two agents "since they're similar" — keep them fully separate sessions and branches even if quick.
