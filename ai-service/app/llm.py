"""
Central LLM factory.

Every agent builds its model through get_llm() so the provider is configured in
exactly one place. Vaarta runs on Azure AI Foundry (Azure OpenAI); the plain
OpenAI path is kept as a fallback for local development without an Azure
subscription.

Which provider is used is decided by configuration, not by code changes:
  - AZURE_OPENAI_ENDPOINT set  -> Azure AI Foundry (AzureChatOpenAI)
  - otherwise                  -> api.openai.com (ChatOpenAI)
"""

from langchain_openai import AzureChatOpenAI, ChatOpenAI

from app.config import settings


def get_llm(temperature: float):
    """
    Return a chat model configured for the active provider.

    Args:
        temperature: Sampling temperature. Each agent picks its own — extraction
            agents run cold (0.1) so they do not invent facts, creative agents
            run warmer (0.7).

    Note on Azure: the `model` argument is a *deployment name*, not a model name.
    You choose the deployment name when you deploy the model in AI Foundry, so
    it is configuration rather than something hardcoded here.
    """
    if settings.azure_openai_endpoint:
        return AzureChatOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            azure_deployment=settings.azure_openai_deployment,
            api_version=settings.azure_openai_api_version,
            api_key=settings.azure_openai_api_key,
            temperature=temperature,
        )

    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
    )


def field(result, name: str):
    """
    Read one field from a `with_structured_output` result.

    Depending on the LangChain/provider combination this comes back either as a
    Pydantic model or as a plain dict. Older OpenAI responses gave a model;
    Azure returns a dict. Reading through this helper keeps the agents working
    on both rather than binding them to one provider's return shape.
    """
    if isinstance(result, dict):
        return result.get(name)
    return getattr(result, name)
