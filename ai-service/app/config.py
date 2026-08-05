import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "")
    meeting_service_url: str = os.getenv("MEETING_SERVICE_URL", "http://meeting-service:8080")
    notification_service_url: str = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification-service:8080")
    
    class Config:
        env_file = ".env"

settings = Settings()

# Azure Key Vault Override
client_id = os.getenv("AZURE_CLIENT_ID")
if client_id:
    try:
        from azure.identity import ManagedIdentityCredential
        from azure.keyvault.secrets import SecretClient
        
        vault_url = "https://vaarta-vault-prod.vault.azure.net/"
        print(f"Connecting to Azure Key Vault at {vault_url} with Managed Identity...")
        credential = ManagedIdentityCredential(client_id=client_id)
        client = SecretClient(vault_url=vault_url, credential=credential)
        
        settings.openai_api_key = client.get_secret("OPENAI-API-KEY").value
        settings.internal_api_key = client.get_secret("INTERNAL-API-KEY").value
        print("Successfully loaded secrets from Azure Key Vault")
    except Exception as e:
        print(f"Failed to load from Key Vault: {e}")
