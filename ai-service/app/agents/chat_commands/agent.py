import logging
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.config import settings
from app.agents.chat_commands.prompts import CHAT_COMMAND_PROMPT

logger = logging.getLogger(__name__)

async def run_chat_command(meeting_id: str, user_command: str) -> dict:
    """
    Executes the Chat Command Agent workflow.
    
    This agent takes a live chat message starting with '@bot' and generates a 
    helpful response to be injected back into the active meeting chat.
    
    Args:
        meeting_id (str): The unique identifier of the meeting.
        user_command (str): The raw text of the user's chat message.
        
    Returns:
        dict: A dictionary containing the generated response under the key "reply".
    """
    logger.info(f"Initiating Chat Command Agent for meeting_id: {meeting_id}")
    
    # Strip the '@bot' prefix if it exists to clean up the command for the LLM
    if user_command.lower().startswith("@bot"):
        user_command = user_command[4:].strip()
        
    if not user_command:
        return {"reply": "Hi! How can I help you?"}
        
    # Initialize the OpenAI Language Model client
    # We use a standard temperature (0.7) for conversational responses
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.7
    )
    
    prompt = PromptTemplate(
        template=CHAT_COMMAND_PROMPT,
        input_variables=["user_command"]
    )
    
    chain = prompt | llm
    
    logger.debug(f"Invoking LLM chain for Chat Command Agent")
    response = chain.invoke({"user_command": user_command})
    reply = response.content.strip()
    
    logger.info(f"Successfully generated chat response for meeting_id: {meeting_id}")
    
    return {"reply": reply}
