import logging
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.clients.meeting_service_client import fetch_meeting_chats
from app.config import settings
from app.agents.followup_email.prompts import FOLLOWUP_EMAIL_PROMPT
import json

logger = logging.getLogger(__name__)

async def run_followup_email(meeting_id: str, payload: dict) -> dict:
    """
    Drafts a professional follow-up email based on the meeting's summary, action items, sentiment, and chat history.
    """
    logger.info(f"Initiating Follow-up Email Agent for meeting_id: {meeting_id}")
    
    # 1. Fetch raw chat data
    chats = fetch_meeting_chats(meeting_id)
    chat_text = "\n".join([f"User {chat.get('senderId', 'Unknown')}: {chat.get('content', '')}" for chat in chats])
    if not chat_text:
        chat_text = "No chat messages found."
        
    # 2. Extract payload inputs
    title = payload.get("title", "Vaarta Meeting")
    summary = payload.get("summary", "No summary available.")
    action_items = payload.get("actionItems", "No action items.")
    sentiment = payload.get("sentiment", "Neutral")
    
    # Format action items if they are JSON
    try:
        parsed_items = json.loads(action_items)
        if isinstance(parsed_items, list):
            formatted_items = ""
            for item in parsed_items:
                task = item.get("task", "")
                owner = item.get("owner", "")
                due = item.get("dueHint", "")
                owner_str = f" (Owner: {owner})" if owner else ""
                due_str = f" [Due: {due}]" if due else ""
                formatted_items += f"- {task}{owner_str}{due_str}\n"
            action_items = formatted_items if formatted_items else "No action items."
    except Exception:
        pass # keep as string
        
    # 3. LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.4
    )
    
    prompt = PromptTemplate(
        template=FOLLOWUP_EMAIL_PROMPT,
        input_variables=["title", "sentiment", "summary", "action_items", "chat_text"]
    )
    
    chain = prompt | llm
    
    logger.debug(f"Invoking LLM chain for meeting_id: {meeting_id}")
    response = chain.invoke({
        "title": title,
        "sentiment": sentiment,
        "summary": summary,
        "action_items": action_items,
        "chat_text": chat_text
    })
    
    email_html = response.content.strip()
    if email_html.startswith("```html"):
        email_html = email_html[7:]
    if email_html.endswith("```"):
        email_html = email_html[:-3]
        
    return {"emailHtml": email_html.strip()}
