# Meeting Title/Agenda Generator Agent

## Overview
The Agenda Generator Agent helps users quickly schedule meaningful meetings by dynamically generating a professional title and a structured list of 3-5 agenda bullet points based on a short description provided by the user.

## Execution Flow
1. **Invocation**: The frontend triggers this before the meeting is even created. When a user clicks "Suggest" on the meeting creation modal, it sends a description to `meeting-service` (`POST /api/meetings/suggest-agenda`), which forwards the payload to `/agents/invoke`.
2. **Context Retrieval**: The agent takes the user's `description` string from the payload.
3. **Structured Generation**: Using LangChain's structured output parser and Pydantic, the LLM processes the description and strictly returns a `title` and a list of `agenda` points.
4. **Usage**: The JSON response is proxied back to the frontend to automatically populate the title and agenda input fields, saving the user time.

## Standard Compliance
This directory adheres to the "One Agent Module" standard:
- `__init__.py`: Module marker.
- `agent.py`: Contains the `run_agenda_generator()` logic and Pydantic schema.
- `prompts.py`: Defines the `AGENDA_PROMPT`.
- `README.md`: This documentation.
