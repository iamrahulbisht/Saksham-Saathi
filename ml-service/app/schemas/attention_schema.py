from pydantic import BaseModel

class AttentionRequest(BaseModel):
    history: list[float]

class AttentionResponse(BaseModel):
    predicted_attention: float
