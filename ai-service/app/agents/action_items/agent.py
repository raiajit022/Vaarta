import logging
import json
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.clients.meeting_service_client import fetch_meeting_chats
from app.config import settings
from app.agents.action_items.prompts import ACTION_ITEMS_PROMPT

# Configure module-level logger
logger = logging.getLogger(__name__)

class ActionItem(BaseModel):
    task: str = Field(description="A clear, concise description of the task.")
    owner: Optional[str] = Field(description="The person responsible for the task, if mentioned.", default=None)
    dueHint: Optional[str] = Field(description="Any hint or mention of a deadline.", default=None)

class ActionItemList(BaseModel):
    items: List[ActionItem] = Field(description="List of extracted action items.")

async def run_action_items_extractor(meeting_id: str) -> dict:
    """
    Executes the Action Items Extractor Agent workflow for a given meeting.
    
    This agent retrieves the chat history from the Meeting Service via an internal API call,
    formats the conversation, and leverages an OpenAI LLM (gpt-4o-mini) to extract
    structured action items.
    
    Args:
        meeting_id (str): The unique identifier of the meeting to analyze.
        
    Returns:
        dict: A dictionary containing the generated action items array as a JSON string under the key "actionItems".
    """
    logger.info(f"Initiating Action Items Extractor Agent for meeting_id: {meeting_id}")
    
    # Step 1: Fetch raw chat data from the meeting service backend
    chats = fetch_meeting_chats(meeting_id)
    
    if not chats:
        logger.info(f"No chats found for meeting_id: {meeting_id}. Returning empty list.")
        return {"actionItems": "[]"}
        
    # Step 2: Pre-process and format the raw chat JSON into a flat text transcript
    chat_text = "\\n".join([f"User {chat.get('senderId', 'Unknown')}: {chat.get('content', '')}" for chat in chats])
    
    # Step 3: Initialize the OpenAI Language Model client
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.1
    )
    
    # Step 4: Use LangChain's structured output to force Pydantic schema
    structured_llm = llm.with_structured_output(ActionItemList)
    
    # Step 5: Construct the Prompt Template
    prompt = PromptTemplate(
        template=ACTION_ITEMS_PROMPT,
        input_variables=["chat_text"]
    )
    
    # Step 6: Create the LCEL chain
    chain = prompt | structured_llm
    
    # Step 7: Execute the chain
    logger.debug(f"Invoking LLM chain for meeting_id: {meeting_id}")
    response: ActionItemList = chain.invoke({"chat_text": chat_text})
    
    logger.info(f"Successfully extracted {len(response.items)} action items for meeting_id: {meeting_id}")
    
    # We return stringified JSON as agreed in the architecture plan
    action_items_json = json.dumps([item.dict() for item in response.items])
    
    return {"actionItems": action_items_json}
