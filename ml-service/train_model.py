import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import random
import os





def generate_synthetic_data(num_samples=10000):
    print(f"Generating {num_samples} samples of synthetic data...")
    data = []
    
    for _ in range(num_samples):
        
        peak_hour = np.random.normal(10, 2) 
        dip_hour = np.random.normal(14, 1.5) 
        base_energy = np.random.randint(60, 90) 
        
        prev_score = base_energy 
        
        for hour in range(24):
            
            
            
            fatigue = (hour / 24) * 20 
            
            
            
            morning_component = 30 * np.exp(-((hour - peak_hour)**2) / 8)
            dip_component = -20 * np.exp(-((hour - dip_hour)**2) / 4)
            evening_recovery = 10 * np.exp(-((hour - 18)**2) / 6) if hour > 14 else 0
            
            ideal_score = base_energy + morning_component + dip_component + evening_recovery - fatigue
            
            
            noise = np.random.normal(0, 5)
            target_score = np.clip(ideal_score + noise, 0, 100)
            
            
            data.append({
                "hour": hour,
                "prev_score": prev_score, 
                "fatigue_factor": fatigue,
                "target_focus_score": target_score
            })
            
            prev_score = target_score

    return pd.DataFrame(data)


def train_model():
    df = generate_synthetic_data(10000)
    
    X = df[['hour', 'prev_score', 'fatigue_factor']]
    y = df['target_focus_score']
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    score = model.score(X, y)
    print(f"Model R^2 Score (on synthetic data): {score:.4f}")
    
    
    model_path = "attention_model.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
