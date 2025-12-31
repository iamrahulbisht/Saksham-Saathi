
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import uvicorn
import os
from dotenv import load_dotenv
import httpx
from datetime import datetime, timedelta
import random

load_dotenv()

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc)},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "mindmap-ai-ml"}

class GazePoint(BaseModel):
    x: float
    y: float
    timestamp: float

class ReadingGazeData(BaseModel):
    gaze_points: List[GazePoint]
    screen_width: int
    screen_height: int
    text_bbox: Optional[dict] = None

class ReadingAnalysisResponse(BaseModel):
    fixation_count: int
    saccade_count: int
    regression_count: int
    average_fixation_duration: float
    reading_speed_score: float
    risk_flags: List[str]
    dyslexia_risk_score: float

@app.post("/predict/cognitive-load")
def predict_cognitive_load(data: dict):
    
    metrics = data.get("metrics", data)
    
    
    risk_score = 0.0
    severity = "none"
    overload_detected = False
    intervention = None

    
    fixation_time = metrics.get("fixationTimeAvgMs", 0)
    if fixation_time > 2000:
        risk_score += 0.4
    elif fixation_time > 800:
        risk_score += 0.2

    
    errors = metrics.get("consecutiveErrors", 0)
    if errors >= 3:
        risk_score += 0.3

    
    pause = metrics.get("responsePauseMs", 0)
    if pause > 5000: 
        risk_score += 0.5 
    
    
    hesitation = metrics.get("mouseHoverHesitationMs", 0)
    if hesitation > 2000:
        risk_score += 0.1

    
    risk_score = min(risk_score, 1.0)

    
    if risk_score > 0.6:
        overload_detected = True
        severity = "severe"
        intervention = "break_suggested"
    elif risk_score > 0.2: 
        overload_detected = True
        severity = "moderate"
        intervention = "easier_version_offered" 
    else:
        severity = "low"

    return {
        "overload_detected": overload_detected,
        "risk_score": float(risk_score),
        "severity": severity,
        "intervention": intervention
    }

@app.post("/predict/reading-patterns", response_model=ReadingAnalysisResponse)
def analyze_reading_patterns(data: ReadingGazeData):
    """
    Analyze eye-tracking data to detect reading patterns and potential dyslexia markers.
    """
    points = data.gaze_points
    if not points:
        raise HTTPException(status_code=400, detail="No gaze points provided")

    
    coords = np.array([[p.x, p.y] for p in points])
    timestamps = np.array([p.timestamp for p in points])

    
    
    fixations = []
    current_fixation = [coords[0]]
    if len(points) > 1:
        for i in range(1, len(coords)):
            dist = np.linalg.norm(coords[i] - coords[i-1])
            if dist < 30: 
                current_fixation.append(coords[i])
            else:
                if len(current_fixation) > 5: 
                    fixations.append(current_fixation)
                current_fixation = [coords[i]]
        if len(current_fixation) > 5:
            fixations.append(current_fixation)
    
    fixation_count = len(fixations)
    
    
    saccade_count = max(0, fixation_count - 1)

    
    
    regression_count = 0
    if len(fixations) > 1:
        fixation_centroids = [np.mean(f, axis=0) for f in fixations]
        for i in range(1, len(fixation_centroids)):
            
            
            dx = fixation_centroids[i][0] - fixation_centroids[i-1][0]
            dy = abs(fixation_centroids[i][1] - fixation_centroids[i-1][1])
            
            if dx < -50 and dy < 100: 
                regression_count += 1

    
    avg_fixation_duration = 0 
    if fixation_count > 0:
        
        total_points_in_fixations = sum(len(f) for f in fixations)
        total_duration = timestamps[-1] - timestamps[0]
        avg_fixation_duration = (total_duration / len(points)) * (total_points_in_fixations / fixation_count)

    
    risk_flags = []
    dyslexia_score = 0.1

    
    if fixation_count > 10 and (regression_count / fixation_count) > 0.2:
        risk_flags.append("high_regression_rate")
        dyslexia_score += 0.3

    
    
    
    if avg_fixation_duration > 300: 
        risk_flags.append("slow_oculomotor_processing")
        dyslexia_score += 0.2

    return {
        "fixation_count": fixation_count,
        "saccade_count": saccade_count,
        "regression_count": regression_count,
        "average_fixation_duration": float(avg_fixation_duration),
        "reading_speed_score": 0.7, 
        "risk_flags": risk_flags,
        "dyslexia_risk_score": min(0.95, dyslexia_score)
    }


class SpeechFluencyResponse(BaseModel):
    fluency_score: float
    words_per_minute: float
    pause_count: int
    transcription: Optional[str] = None
    confidence: float

class SpeechAnalysisRequest(BaseModel):
    audio_url: str

@app.post("/predict/speech-fluency", response_model=SpeechFluencyResponse)
async def predict_speech_fluency(request: SpeechAnalysisRequest):
    
    try:
        
        print(f"Received request to analyze audio at: {request.audio_url}")
        
        async with httpx.AsyncClient() as client:
            try:
                
                resp = await client.head(request.audio_url)
                if resp.status_code != 200:
                    print(f"Warning: Audio URL returned {resp.status_code}")
            except Exception as e:
                print(f"Connectivity check failed: {e}")

        
        return SpeechFluencyResponse(
            fluency_score=0.85,
            words_per_minute=120.5,
            pause_count=4,
            transcription="The quick brown fox jumps over the lazy dog.",
            confidence=0.92
        )
    except Exception as e:
        print(f"Speech analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ScreeningRequest(BaseModel):
    age: int
    gender: str
    games_data: dict 

class ScreeningResponse(BaseModel):
    risk_score: float 
    risk_level: str 
    flagged_areas: List[str]
    confidence: float

@app.post("/predict/screening", response_model=ScreeningResponse)
async def predict_screening_risk(request: ScreeningRequest):
    try:
        
        games = request.games_data
        
        flags = []
        risk_accum = 0.0
        
        
        if 'game1' in games:
            g1 = games['game1']
            if g1.get('dyslexia_risk_score', 0) > 0.6:
                flags.append("Reading Pattern Irregularities")
                risk_accum += 0.35
        
        
        if 'game2' in games:
            g2 = games['game2']
            if g2.get('fluency_score', 1.0) < 0.6: 
                flags.append("Low Speech Fluency")
                risk_accum += 0.25

        
        if 'game3' in games:
            
            risk_accum += 0.05 

        
        if 'game4' in games:
            g4 = games['game4']
            score = g4.get('score', 1.0)
            if score < 0.5:
                flags.append("Pattern Recognition Difficulty")
                risk_accum += 0.15

        
        if 'game5' in games:
             g5 = games['game5']
             avg_ms = g5.get('averageMs', 300)
             if avg_ms > 800: 
                 flags.append("Slow Processing Speed")
                 risk_accum += 0.1
        
        
        final_risk = min(0.98, risk_accum + 0.1) 
        
        level = "Low"
        if final_risk > 0.4: level = "Moderate"
        if final_risk > 0.7: level = "High"

        return ScreeningResponse(
            risk_score=round(final_risk, 2),
            risk_level=level,
            flagged_areas=flags,
            confidence=0.85
        )

    except Exception as e:
        print(f"Screening analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))




import joblib
import pandas as pd
import numpy as np


model_path = "attention_model.pkl"
rf_model = None
if os.path.exists(model_path):
    print(f"Loading trained attention model from {model_path}")
    rf_model = joblib.load(model_path)
else:
    print(f"Warning: {model_path} not found. Using simulation fallback.")

class AttentionRequest(BaseModel):
    student_id: str
    recent_load_events: List[dict] = []
    assessment_scores: List[dict] = []

@app.post("/predict/attention")
async def predict_attention(request: AttentionRequest):
    predictions = []
    
    
    current_time = datetime.now()
    
    
    
    start_score = 80
    if len(request.recent_load_events) > 5:
        start_score = 60
        
    prev_score = start_score
    
    
    id_hash = sum(ord(c) for c in request.student_id)
    night_owl = id_hash % 2 == 0
    
    for i in range(48):
        future_time = current_time + timedelta(hours=i)
        hour = future_time.hour
        
        
        
        fatigue = (hour / 24) * 20
        
        if rf_model:
            
            input_df = pd.DataFrame([{
                'hour': hour, 
                'prev_score': prev_score, 
                'fatigue_factor': fatigue
            }])
            predicted_score = float(rf_model.predict(input_df)[0])
        else:
            
             base = 50 + 30 * np.exp(-((hour - 10)**2) / 8) - 20 * np.exp(-((hour - 14)**2) / 4)
             predicted_score = base - fatigue
        
        
        if night_owl:
             if hour > 18: predicted_score += 15
             if hour < 8: predicted_score -= 10
        else: 
             if hour < 10: predicted_score += 10
             if hour > 20: predicted_score -= 15
             
        
        noise = random.randint(-5, 5)
        final_score = max(0, min(100, predicted_score + noise))
        
        predictions.append({
            "hour_offset": i,
            "timestamp": future_time.isoformat(),
            "focus_score": int(final_score),
            "is_peak": final_score > 75
        })
        
        
        prev_score = final_score

    return {
        "student_id": request.student_id,
        "horizon_hours": 48,
        "predictions": predictions,
        "model_version": "rf-v1-trained" if rf_model else "simulation-fallback"
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
