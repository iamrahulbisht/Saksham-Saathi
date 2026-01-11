import numpy as np
# from tensorflow import keras
import joblib
import pandas as pd
from typing import List, Dict, Any
from app.utils.model_loader import get_model
from datetime import datetime, timedelta

def predict_attention(attention_history: List[Dict[str, Any]], horizon_hours: int = 48) -> Dict[str, Any]:
    """
    Predict next `horizon_hours` of attention scores.
    """
    model = get_model('lstm_attention')
    
    # Fallback if model failed to load or is placeholder
    # In this prototype, we default to the heuristic simulation to ensure valid responses
    # real model inference would go here if trained .h5 existed
    
    try:
        # scaler = joblib.load('app/ml_models/lstm_scaler.pkl') # If exists
        
        # MOCKING INPUT CONSTRUCTION FOR ROBUSTNESS
        # In real-app, we would parse `attention_history` strictly
        
        # Get start date from last history item or default to now
        if attention_history and 'date' in attention_history[-1]:
             current_date = datetime.fromisoformat(attention_history[-1]['date'])
        else:
             current_date = datetime.now()
        
        predictions = []
        
        # Heuristic Logic
        base_score = 75 # Average
        for i in range(horizon_hours):
            next_time = current_date + timedelta(hours=i+1)
            hour = next_time.hour
            
            # Heuristic simulation of LSTM output
            pred_score = base_score
            # Morning peak
            if 9 <= hour <= 11: pred_score += 10
            # Afternoon dip
            if 14 <= hour <= 16: pred_score -= 15
            # Evening recovery/dip
            if hour >= 20: pred_score -= 10
            
            # Add some noise
            pred_score += (i % 3) * 2 
            
            predictions.append({
                "hour": next_time.isoformat(),
                "predicted_attention": round(max(0, min(100, pred_score)), 2),
                "confidence_interval": [pred_score-5, pred_score+5]
            })
            
        return {
            "predictions": predictions,
            "recommendations": generate_recommendations(predictions),
            "model_version": "lstm-v1 (simulated)"
        }

    except Exception as e:
        print(f"LSTM Prediction Error: {e}")
        return fallback_prediction(horizon_hours)

def generate_recommendations(predictions: List[Dict]) -> Dict:
    # Identify high/low blocks
    highs = [p['hour'] for p in predictions if p['predicted_attention'] > 80]
    lows = [p['hour'] for p in predictions if p['predicted_attention'] < 60]
    
    return {
        "optimal_schedule": {
            "best_times_for_math": highs[:3],
            "best_times_for_reading": highs[3:6],
            "avoid_challenging_tasks": lows[:3]
        },
        "recommended_break_interval": "20 minutes"
    }

def fallback_prediction(horizon: int) -> Dict:
    return {
        "predictions": [], 
        "error": "Model unavailable",
        "model_version": "fallback"
    }
