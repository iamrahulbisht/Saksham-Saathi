from pydantic import BaseModel

class CognitiveLoadRequest(BaseModel):
    session_id: str
    metrics: dict

class CognitiveLoadResponse(BaseModel):
    is_overloaded: bool
    confidence: float
