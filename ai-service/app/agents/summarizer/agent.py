from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from ...clients.meeting_service_client import fetch_meeting_chats
from ...config import settings
from .prompts import SUMMARIZER_PROMPT
import logging

logger = logging.getLogger(__name__)

async def run_summarizer(meeting_id: str) -> dict:
    """
    Fetches the meeting chats, uses OpenAI to summarize them, 
    and returns the summary.
    """
    logger.info(f"Running summarizer for meeting {meeting_id}")
    
    chats = fetch_meeting_chats(meeting_id)
    
    if not chats:
        return {"summary": "No chat messages found for this meeting to summarize."}
        
    # Format the chat into a single text block
    chat_text = "\n".join([f"User {chat.get('senderId', 'Unknown')}: {chat.get('content', '')}" for chat in chats])
    
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.3
    )
    
    prompt = PromptTemplate(
        template=SUMMARIZER_PROMPT,
        input_variables=["chat_text"]
    )
    
    chain = prompt | llm
    
    response = chain.invoke({"chat_text": chat_text})
    summary = response.content
    
    logger.info(f"Generated summary for meeting {meeting_id}")
    return {"summary": summary}
