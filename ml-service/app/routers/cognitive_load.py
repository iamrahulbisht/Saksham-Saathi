from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.services.cognitive_load_service import detect_cognitive_load

router = APIRouter()

class CognitiveLoadRequest(BaseModel):
    student_id: str
    session_id: str
    signals: Dict[str, float]
    task_type: str

@router.post("/detect")
def detect_load(request: CognitiveLoadRequest):
    """
    Real-time endpoint for Cognitive Load Detection.
    Expected Response Time: < 50ms (network) + < 1ms (logic)
    """
    try:
        result = detect_cognitive_load(request.signals, request.task_type)
        return {
            **result,
            "student_id": request.student_id,
            "session_id": request.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
