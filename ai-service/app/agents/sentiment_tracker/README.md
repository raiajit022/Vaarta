# Sentiment/Tone Tracker Agent

## Overview
The Sentiment Tracker Agent analyzes the content of a meeting (via its chat/transcript) and categorizes its overall tone into one of three predefined labels: `POSITIVE`, `NEUTRAL`, or `TENSE`. It also generates a short reason explaining the categorization.

## Execution Flow
1. **Invocation**: The `meeting-service` triggers this agent via the `/agents/invoke` endpoint after a meeting has ended, typically on-demand from the meeting history page.
2. **Context Retrieval**: The agent fetches the meeting chats (or transcript) from the `meeting-service`.
3. **Structured Generation**: Using LangChain's structured output parser and Pydantic, the LLM processes the conversation and strictly adheres to the schema, guaranteeing a valid label and reason.
4. **Persistence**: The structured JSON response is returned to the `meeting-service`, which persists it into the `meetings` table in the database.

## Standard Compliance
This directory adheres to the "One Agent Module" standard:
- `__init__.py`: Module marker.
- `agent.py`: Contains the `run_sentiment_tracker()` logic and Pydantic schema.
- `prompts.py`: Defines the `SENTIMENT_PROMPT`.
- `README.md`: This documentation.
