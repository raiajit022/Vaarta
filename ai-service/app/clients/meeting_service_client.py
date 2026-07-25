import requests
from ..config import settings
import logging

logger = logging.getLogger(__name__)

def fetch_meeting_chats(meeting_id: str) -> list:
    """Fetches chat messages for a meeting from the meeting-service."""
    url = f"{settings.meeting_service_url}/internal/meetings/{meeting_id}/chats"
    headers = {
        "X-Internal-Key": settings.internal_api_key
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch chats for meeting {meeting_id}: {e}")
        # Return empty list as fallback, though raising might be better in prod
        return []
