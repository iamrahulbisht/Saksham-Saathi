from app.schemas.screening_schema import ScreeningRequest

class ScreeningService:
    def predict(self, data: ScreeningRequest):
        # Logic to aggregate sub-models
        return {"risk_score": 0.45, "flags": ["normal"]}

screening_service = ScreeningService()
