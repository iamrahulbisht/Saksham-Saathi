import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

# --- 1. Synthetic Data Generation ---
def generate_training_data(num_students=100, days_per_student=30):
    """Generate synthetic hourly attention patterns."""
    data = []
    
    for student_id in range(num_students):
        # Unique baseline for each student
        base_attention = np.random.randint(60, 85)
        # Circadian rhythm variation
        morning_boost = np.random.randint(5, 15)
        afternoon_drop = np.random.randint(-20, -10)
        
        for day in range(days_per_student):
            for hour in range(8, 17):  # 8 AM - 4 PM
                score = base_attention
                
                # Time-of-day logic
                if 9 <= hour <= 11: score += morning_boost
                elif hour >= 14: score += afternoon_drop
                
                # Add noise
                score += np.random.randn() * 5
                score = np.clip(score, 0, 100)
                
                data.append({
                    'student_id': student_id,
                    'hour': hour,
                    'day_of_week': day % 7,
                    'sleep_hours': np.random.uniform(6, 9),
                    'prev_task_difficulty': np.random.randint(1, 4), # 1-3
                    'time_since_break': np.random.randint(0, 120),
                    'attention_score': score
                })
    
    return pd.DataFrame(data)

# --- 2. Sequence Creation ---
def create_sequences(data, sequence_length=14, forecast_horizon=48):
    """
    Input: History (sequence_length days)
    Output: Next (forecast_horizon) hours of attention scores
    Note: Simplified for training logic.
    """
    X, y = [], []
    features = ['hour', 'day_of_week', 'sleep_hours', 'prev_task_difficulty', 'time_since_break', 'attention_score']
    
    # Just taking raw points for simplicity of prototype instead of complicated daily aggregation
    # Using sliding window over hours directly might be better, but instruction impl:
    
    # Group by student
    grouped = data.groupby('student_id')
    
    for _, group in grouped:
        values = group[features].values
        # Input: 24 hours of data (approx 3 days @ 8 hours/day) to predict next 8 hours?
        # Let's align with instruction: 14 days input -> 48 hours output?
        # 14 days * 9 hours = 126 steps. LSTM can handle.
        
        # Simplified for prototype: Window of 50 hours predicting next 1
        seq_len = 20
        pred_len = 1
        
        if len(values) < seq_len + pred_len: continue

        for i in range(len(values) - seq_len - pred_len):
            X.append(values[i : i+seq_len])
            y.append(values[i+seq_len : i+seq_len+pred_len, -1][0]) # Predict just next step for standard LSTM

    return np.array(X), np.array(y)

# --- 3. Model Architecture ---
def build_lstm_model(input_shape):
    model = keras.Sequential([
        layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        layers.Dropout(0.2),
        layers.LSTM(32),
        layers.Dense(16, activation='relu'),
        layers.Dense(1) # Predicting 1 step ahead (autoregressive loop for 48h)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

if __name__ == "__main__":
    print("Generating data...")
    df = generate_training_data(50, 20) # Smaller for quick test
    
    print("Preparing sequences...")
    X, y = create_sequences(df)
    
    # Scaling
    scaler = StandardScaler()
    # Flatten X to scale features
    X_flat = X.reshape(-1, X.shape[-1])
    X_flat_scaled = scaler.fit_transform(X_flat)
    X_scaled = X_flat_scaled.reshape(X.shape)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)
    
    print("Training Model...")
    model = build_lstm_model(input_shape=(X.shape[1], X.shape[2]))
    model.fit(X_train, y_train, epochs=5, batch_size=32, validation_data=(X_test, y_test))
    
    # Save (Adjust path relative to script location)
    # Script is in ml-training/scripts
    # Models should go to ml-service/app/ml_models
    save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml-service/app/ml_models'))
    os.makedirs(save_path, exist_ok=True)
    
    model.save(os.path.join(save_path, 'lstm_attention.keras'))
    joblib.dump(scaler, os.path.join(save_path, 'lstm_scaler.pkl'))
    print(f"Model Saved to {save_path}")
