from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import agent_router
from app.config import settings

app = FastAPI(title="Vaarta AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router.router, prefix="/agents", tags=["Agents"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}
