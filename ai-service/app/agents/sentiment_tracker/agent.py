import logging
from typing import Literal
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.clients.meeting_service_client import fetch_meeting_chats
from app.config import settings
from app.agents.sentiment_tracker.prompts import SENTIMENT_PROMPT

logger = logging.getLogger(__name__)

class SentimentResponse(BaseModel):
    label: Literal["POSITIVE", "NEUTRAL", "TENSE"] = Field(description="The overall sentiment of the meeting.")
    reason: str = Field(description="A short 1-2 sentence reason explaining the chosen sentiment.")

async def run_sentiment_tracker(meeting_id: str) -> dict:
    """
    Executes the Sentiment Tracker Agent workflow for a given meeting.
    
    This agent retrieves the chat history from the Meeting Service via an internal API call,
    formats the conversation, and leverages an OpenAI LLM to generate a structured 
    sentiment classification (POSITIVE, NEUTRAL, or TENSE) along with a short reason.
    
    Args:
        meeting_id (str): The unique identifier of the meeting to analyze.
        
    Returns:
        dict: A dictionary containing the structured sentiment response.
    """
    logger.info(f"Initiating Sentiment Tracker Agent for meeting_id: {meeting_id}")
    
    chats = fetch_meeting_chats(meeting_id)
    
    if not chats:
        logger.info(f"No chats found for meeting_id: {meeting_id}. Aborting sentiment analysis.")
        return {"sentimentLabel": "NEUTRAL", "sentimentReason": "No chat messages found for this meeting to analyze."}
        
    chat_text = "\n".join([f"User {chat.get('senderId', 'Unknown')}: {chat.get('content', '')}" for chat in chats])
    
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.2
    )
    
    # Use with_structured_output to enforce the Pydantic schema
    structured_llm = llm.with_structured_output(SentimentResponse)
    
    prompt = PromptTemplate(
        template=SENTIMENT_PROMPT,
        input_variables=["chat_text"]
    )
    
    chain = prompt | structured_llm
    
    logger.debug(f"Invoking structured LLM chain for meeting_id: {meeting_id}")
    response: SentimentResponse = chain.invoke({"chat_text": chat_text})
    
    logger.info(f"Successfully generated sentiment for meeting_id: {meeting_id}")
    
    return {
        "sentimentLabel": response.label,
        "sentimentReason": response.reason
    }
