from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Any, Dict
from app.config import settings
from app.agents.summarizer import agent as summarizer_agent

router = APIRouter()

class AgentInvokeRequest(BaseModel):
    agentType: str
    meetingId: str
    payload: Optional[Dict[str, Any]] = None

def verify_internal_api_key(x_internal_key: str = Header(...)):
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid internal API key")

@router.post("/invoke")
async def invoke_agent(request: AgentInvokeRequest, _ = Depends(verify_internal_api_key)):
    agent_type = request.agentType.upper()
    
    if agent_type == "SUMMARIZER":
        result = await summarizer_agent.run_summarizer(request.meetingId)
        return result
    else:
        raise HTTPException(status_code=400, detail=f"Agent type {agent_type} not implemented yet")
