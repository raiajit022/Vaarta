import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Azure AI Foundry (Azure OpenAI) — the primary provider ──────────────
    # If azure_openai_endpoint is set, get_llm() routes every agent through
    # Azure. Leave it blank to fall back to api.openai.com for local dev.
    azure_openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    azure_openai_api_key: str = os.getenv("AZURE_OPENAI_API_KEY", "")
    # The name YOU gave the deployment in AI Foundry, not the model name.
    azure_openai_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5.4-mini")
    azure_openai_api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")

    # ── Direct OpenAI — local fallback only ────────────────────────────────
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ── Service-to-service ─────────────────────────────────────────────────
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "")
    meeting_service_url: str = os.getenv("MEETING_SERVICE_URL", "http://meeting-service:8080")
    notification_service_url: str = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification-service:8080")

    class Config:
        env_file = ".env"


settings = Settings()

# ── Azure Key Vault override ───────────────────────────────────────────────
# In Azure the container has a managed identity, so it can read Key Vault with
# no stored credential. Locally AZURE_CLIENT_ID is unset and the .env values
# above are used instead — one code path, two environments.
client_id = os.getenv("AZURE_CLIENT_ID")
if client_id:
    try:
        from azure.identity import ManagedIdentityCredential
        # pyrefly: ignore [missing-import]
        from azure.keyvault.secrets import SecretClient

        vault_url = os.getenv(
            "AZURE_KEY_VAULT_URL", "https://vaarta-vault-prod.vault.azure.net/"
        )
        print(f"Connecting to Azure Key Vault at {vault_url} with Managed Identity...")
        credential = ManagedIdentityCredential(client_id=client_id)
        client = SecretClient(vault_url=vault_url, credential=credential)

        def _try_secret(name: str) -> str | None:
            """Read one secret, tolerating its absence during the migration."""
            try:
                return client.get_secret(name).value
            except Exception:
                return None

        azure_key = _try_secret("AZURE-OPENAI-API-KEY")
        if azure_key:
            settings.azure_openai_api_key = azure_key

        azure_endpoint = _try_secret("AZURE-OPENAI-ENDPOINT")
        if azure_endpoint:
            settings.azure_openai_endpoint = azure_endpoint

        openai_key = _try_secret("OPENAI-API-KEY")
        if openai_key:
            settings.openai_api_key = openai_key

        settings.internal_api_key = client.get_secret("INTERNAL-API-KEY").value
        print("Successfully loaded secrets from Azure Key Vault")
    except Exception as e:
        print(f"Failed to load from Key Vault: {e}")

# Fail fast rather than starting with no usable provider — otherwise every
# agent call fails later with an auth error that blames the model provider.
if not settings.azure_openai_endpoint and not settings.openai_api_key:
    print(
        "WARNING: no LLM provider configured. Set AZURE_OPENAI_ENDPOINT + "
        "AZURE_OPENAI_API_KEY (Azure AI Foundry), or OPENAI_API_KEY."
    )
