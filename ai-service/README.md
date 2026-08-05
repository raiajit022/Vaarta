# AI Service

This service provides the artificial intelligence capabilities for the Vaarta meeting application. It is built using Python, FastAPI, and integrates directly with the OpenAI API.

## End-to-End Architecture & Code Explanation

### 1. The Fast API Application (`app/main.py`)
The `main.py` file sets up the FastAPI server. It defines the root endpoint and includes the routers that handle specific capabilities.
- `FastAPI()` initializes the app.
- We configure CORS middleware to allow the frontend to communicate with it.
- `app.include_router(summary.router)` mounts the API endpoints defined in the summary module.

### 2. Configuration & Secrets (`app/config.py`)
This file is responsible for managing environment variables.
- We define a `Settings` class using `pydantic` that reads variables like `OPENAI_API_KEY`.
- **Azure Key Vault Integration**: The bottom half of this file securely retrieves production secrets. It reads `AZURE_CLIENT_ID` to authenticate a `ManagedIdentityCredential`. It then fetches `OPENAI-API-KEY` from the Key Vault without storing it in plaintext anywhere in the infrastructure.

### 3. AI Summary Generation (`app/routers/summary.py`)
This route is called by the `meeting-service` when a meeting ends.
- `@router.post("/generate")` listens for incoming HTTP POST requests containing meeting transcripts.
- It validates the internal API key to ensure only authorized Vaarta microservices can call it.
- It uses the `openai` Python SDK (`AsyncOpenAI`) to send the meeting transcript to the GPT model.
- The model prompt strictly formats the output into an HTML recap summarizing key decisions, action items, and context.
- Once the AI responds, the summary is returned to the `meeting-service` and subsequently emailed to participants via the `notification-service`.
