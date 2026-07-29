# Chat @-Command Agent

## Overview
The Chat @-Command Agent enables live meeting participants to request AI assistance directly within the meeting chat. When a participant sends a message starting with `@bot`, the AI processes the command and responds directly in the chat as a distinct sender.

## Execution Flow
1. **Frontend Interception**: The frontend React app listens to the LiveKit data channel (`lk-chat-topic`). If a user sends a message starting with `@bot`, it triggers an API call to `meeting-service`.
2. **Backend Proxy**: The `meeting-service` routes the command to this agent via `/agents/invoke`.
3. **Agent Logic**: This agent parses the command, invokes the `gpt-4o-mini` model, and returns a concise, friendly reply.
4. **LiveKit Injection**: The `meeting-service` uses the LiveKit Server SDK to broadcast the agent's reply back onto the `lk-chat-topic` Data Channel, making it visible to all participants simultaneously.

## Standard Compliance
This directory adheres to the "One Agent Module" standard:
- `__init__.py`: Module marker.
- `agent.py`: Contains the `run_chat_command()` logic.
- `prompts.py`: Defines the `CHAT_COMMAND_PROMPT`.
- `README.md`: This documentation.
