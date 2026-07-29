import logging
from typing import List
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.config import settings
from app.agents.agenda_generator.prompts import AGENDA_PROMPT

logger = logging.getLogger(__name__)

class AgendaResponse(BaseModel):
    title: str = Field(description="A catchy, professional title for the meeting.")
    agenda: List[str] = Field(description="Exactly 3 to 5 concise and actionable agenda bullet points.")

async def run_agenda_generator(description: str) -> dict:
    """
    Executes the Agenda Generator Agent workflow.
    
    This agent takes a short user description of an upcoming meeting and generates
    a structured title and agenda using an OpenAI LLM.
    
    Args:
        description (str): A brief description of what the meeting is about.
        
    Returns:
        dict: A dictionary containing the structured title and agenda list.
    """
    logger.info(f"Initiating Agenda Generator Agent for description length: {len(description)}")
    
    if not description or len(description.strip()) == 0:
        logger.info("Empty description provided. Returning default response.")
        return {"title": "Quick Sync", "agenda": ["Introductions", "Main Discussion", "Next Steps"]}
        
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0.7
    )
    
    structured_llm = llm.with_structured_output(AgendaResponse)
    
    prompt = PromptTemplate(
        template=AGENDA_PROMPT,
        input_variables=["description"]
    )
    
    chain = prompt | structured_llm
    
    logger.debug(f"Invoking structured LLM chain for agenda generation")
    response: AgendaResponse = chain.invoke({"description": description})
    
    logger.info(f"Successfully generated title and agenda")
    
    return {
        "title": response.title,
        "agenda": response.agenda
    }
