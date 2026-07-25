# Action-Item Extractor Agent

## Overview

The **Action-Item Extractor Agent** is an AI agent responsible for asynchronously extracting actionable tasks, task owners, and deadlines from completed meetings based on their chat transcripts.

It is designed as part of Phase 3.2 of the Vaarta AI-Agents initiative and lives entirely within the `ai-service`. The agent is invoked via a secured internal endpoint (protected by `X-Internal-Key`) and operates on the `langchain-openai` framework using the `gpt-4o-mini` LLM.

---

## Architecture & Workflow

### 1. Invocation
The agent is triggered via the main AI-Service router (`POST /agents/invoke`) when a request comes in with `agentType: "ACTION_ITEMS"`. It receives the unique `meetingId`.

### 2. Data Retrieval
The agent uses the `app.clients.meeting_service_client` to securely call the upstream `meeting-service`'s internal endpoint (`GET /internal/meetings/{id}/chats`). It retrieves the complete raw JSON chat transcript.

### 3. Pre-Processing
The agent parses the raw chat JSON and converts it into a continuous dialogue format.

### 4. Prompt Engineering & Structured Output
The agent leverages LangChain Expression Language (LCEL) and Pydantic schemas via `.with_structured_output()` to force the LLM into returning a strictly typed JSON array of action items.
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.1` (forces deterministic extraction).

### 5. Response
The extracted list is serialized into a stringified JSON payload `{"actionItems": "[...]"}` which is returned back to the caller (the meeting service) to be persisted in the main database's `action_items` text column.

---

## File Structure

- **`agent.py`**: The core execution loop of the agent (fetch -> format -> LLM -> return).
- **`prompts.py`**: Contains the system prompts guiding the LLM.
- **`__init__.py`**: Marks the agent as a python module.
