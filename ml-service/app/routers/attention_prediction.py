from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.lstm_service import predict_attention

router = APIRouter()

class AttentionRequest(BaseModel):
    student_id: str
    attention_history: List[Dict[str, Any]] # Flexible dict
    prediction_horizon_hours: int = 48

@router.post("/predict")
def predict_endpoint(req: AttentionRequest):
    """
    Predict 48-hour attention forecast.
    """
    try:
        result = predict_attention(req.attention_history, req.prediction_horizon_hours)
        return {
            "student_id": req.student_id,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
