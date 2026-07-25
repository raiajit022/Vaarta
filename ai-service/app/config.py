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
