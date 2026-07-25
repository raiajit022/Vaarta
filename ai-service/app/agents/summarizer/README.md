# Meeting Summarizer Agent

## Overview

The **Meeting Summarizer Agent** is an AI agent responsible for asynchronously generating concise, well-structured summaries of ended meetings based on their chat transcripts. 

It is designed as part of Phase 3.1 of the Vaarta AI-Agents initiative and lives entirely within the `ai-service`. The agent is invoked via a secured internal endpoint (protected by `X-Internal-Key`) and operates on the `langchain-openai` framework using the `gpt-4o-mini` LLM.

---

## Architecture & Workflow

### 1. Invocation
The agent is triggered via the main AI-Service router (`POST /agents/invoke`) when a request comes in with `agentType: "SUMMARIZER"`. It receives the unique `meetingId`.

### 2. Data Retrieval
The agent uses the `app.clients.meeting_service_client` to securely call the upstream `meeting-service`'s internal endpoint (`GET /internal/meetings/{id}/chats`). It retrieves the complete raw JSON chat transcript.

### 3. Pre-Processing
The agent parses the raw chat JSON and converts it into a continuous dialogue format (e.g. `User {senderId}: {content}`). This prepares the unstructured data into an optimized format for the LLM context window.

### 4. Prompt Engineering & LLM Execution
The agent leverages LangChain Expression Language (LCEL) to pipe the formatted text into a `PromptTemplate` defined in `prompts.py`. 
- **Model**: `gpt-4o-mini` (optimizes for speed and cost-effectiveness while retaining strong NLP capabilities).
- **Temperature**: `0.3` (forces deterministic, factual output, minimizing hallucination).

### 5. Response
The generated summary is extracted and wrapped into a standard JSON payload `{"summary": "..."}` which is returned back to the caller (the meeting service) to be persisted in the main database.

---

## File Structure

- **`agent.py`**: The core execution loop of the agent (fetch -> format -> LLM -> return).
- **`prompts.py`**: Contains the system prompts and prompt templates for LangChain. Separating this from logic allows easier fine-tuning of the prompt behavior.
- **`__init__.py`**: Marks the agent as a python module.

## Dependencies

- **LangChain Core (`langchain_core`)**: For the standard PromptTemplate schema.
- **LangChain OpenAI (`langchain_openai`)**: Standard wrapper around the OpenAI SDK to interact with GPT-4 models.

## Future Enhancements
- If the chat transcript exceeds the token limit of the model, a map-reduce summarization chain should be implemented to chunk and summarize pieces iteratively.
