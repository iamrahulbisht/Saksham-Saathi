from pydantic import BaseModel

class ScreeningRequest(BaseModel):
    student_id: str
    assessment_data: dict

class ScreeningResponse(BaseModel):
    risk_score: float
    flags: list[str]
