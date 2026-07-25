import logging
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.clients.meeting_service_client import fetch_meeting_chats
from app.config import settings
from app.agents.summarizer.prompts import SUMMARIZER_PROMPT

# Configure module-level logger for standard observability
logger = logging.getLogger(__name__)

async def run_summarizer(meeting_id: str) -> dict:
    """
    Executes the Meeting Summarizer Agent workflow for a given meeting.
    
    This agent retrieves the chat history from the Meeting Service via an internal API call,
    formats the conversation, and leverages an OpenAI LLM (gpt-4o-mini) to generate a 
    concise, structured summary of the meeting.
    
    Args:
        meeting_id (str): The unique identifier of the meeting to summarize.
        
    Returns:
        dict: A dictionary containing the generated summary string under the key "summary".
              If no chats are found, a default fallback message is returned.
    """
    logger.info(f"Initiating Meeting Summarizer Agent for meeting_id: {meeting_id}")
    
    # Step 1: Fetch raw chat data from the meeting service backend
    # This call uses the internal service-to-service authentication key
    chats = fetch_meeting_chats(meeting_id)
    
    # Step 2: Handle edge case where no chats exist (e.g. silent meeting)
    if not chats:
        logger.info(f"No chats found for meeting_id: {meeting_id}. Aborting summarization.")
        return {"summary": "No chat messages found for this meeting to summarize."}
        
    # Step 3: Pre-process and format the raw chat JSON into a flat text transcript
    # We map 'senderId' and 'content' to construct a readable dialogue
    chat_text = "\n".join([f"User {chat.get('senderId', 'Unknown')}: {chat.get('content', '')}" for chat in chats])
    
    # Step 4: Initialize the OpenAI Language Model client
    # We use a low temperature (0.3) to ensure factual, deterministic summaries
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.3
    )
    
    # Step 5: Construct the Prompt Template using our predefined SUMMARIZER_PROMPT
    prompt = PromptTemplate(
        template=SUMMARIZER_PROMPT,
        input_variables=["chat_text"]
    )
    
    # Step 6: Create the LCEL (LangChain Expression Language) chain
    # The prompt formats the input, which is then piped into the LLM
    chain = prompt | llm
    
    # Step 7: Execute the chain asynchronously (or synchronously wrapped in async)
    logger.debug(f"Invoking LLM chain for meeting_id: {meeting_id}")
    response = chain.invoke({"chat_text": chat_text})
    summary = response.content
    
    logger.info(f"Successfully generated summary for meeting_id: {meeting_id}")
    
    # Return the structured payload expected by the meeting-service
    return {"summary": summary}
