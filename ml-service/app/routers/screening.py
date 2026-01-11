from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.eye_tracking_service import analyze_eye_tracking
from app.services.handwriting_analysis_service import analyze_handwriting
import time

router = APIRouter()

class ScreeningRequest(BaseModel):
    student_id: str
    assessment_id: str
    language: str
    games_data: List[Dict[str, Any]]

@router.post("/predict")
def predict_screening(request: ScreeningRequest):
    """Predict Dyslexia/ADHD/ASD risk based on 5 games data"""
    start_time = time.time()
    
    try:
        dyslexia_score = 0
        adhd_score = 0
        asd_score = 0
        features = {}
        
        for game in request.games_data:
            num = game.get('game_number')
            
            # Game 1: Eye Tracking
            if num == 1 and 'eye_tracking_data' in game:
                res = analyze_eye_tracking(game['eye_tracking_data'])
                features['eye_tracking'] = res
                dyslexia_score += res.get('dyslexia_score', 0) * 0.3
                
            # Game 2: Speech
            if num == 2:
                # Placeholder
                dyslexia_score += 10 
            
            # Game 3: Handwriting
            if num == 3 and 'handwriting_strokes' in game:
                # Expecting structure from AssessmentGame3 where strokes might be nested
                # Flatten or pass correct structure
                strokes = game['handwriting_strokes'] 
                # If strokes is List of Tasks, need to iterate. Assuming flat list for now or adapt service.
                res = analyze_handwriting(strokes, request.language)
                features['handwriting'] = res
                dyslexia_score += res.get('dyslexia_score', 0) * 0.4
                
            # Game 4: Pattern (ADHD)
            if num == 4 and 'response_data' in game:
                acc = game['response_data'].get('accuracy', 1)
                if acc < 0.6:
                    adhd_score += 30
                    
            # Game 5: Response Time (ADHD)
            if num == 5 and 'response_data' in game:
                var = game['response_data'].get('variability', 0)
                if var > 200:
                    adhd_score += 50
                    
        # Final scores
        return {
            "student_id": request.student_id,
            "dyslexia_risk": min(100, round(dyslexia_score, 2)),
            "adhd_risk": min(100, round(adhd_score, 2)),
            "asd_risk": min(100, round(asd_score, 2)),
            "features": features,
            "processing_time_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
