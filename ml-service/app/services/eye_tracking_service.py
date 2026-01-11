import numpy as np
from typing import List, Dict, Any

def analyze_eye_tracking(gaze_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Input: [{"x": 150, "y": 200, "timestamp": 1234567890, "word_index": 0}, ...]
    Output: {"fixation_count": 15, "regression_count": 5, "avg_fixation_duration_ms": 450, ...}
    """
    if not gaze_data or len(gaze_data) < 10:
        return {"error": "Insufficient gaze data"}
    
    # Extract coordinates and timestamps
    # Assuming timestamp is in ms or convert accordingly
    points = np.array([(d['x'], d['y'], d['timestamp']) for d in gaze_data])
    
    # 1. Calculate Fixations
    fixations = detect_fixations(points)
    
    # 2. Calculate Regressions
    regressions = detect_regressions(points)
    
    # 3. Calculate metrics
    avg_fixation_duration = np.mean([f['duration'] for f in fixations]) if fixations else 0
    
    # 4. Saccade velocity
    saccade_velocities = calculate_saccade_velocities(fixations)
    avg_saccade_velocity = np.mean(saccade_velocities) if saccade_velocities else 0
    
    # Dyslexia Scoring Rule
    dyslexia_score = 0
    if avg_fixation_duration > 500:  # Normal reader usually 200-250ms
        dyslexia_score += 30
    if regressions > 5:  # High regression count
        dyslexia_score += 40
    if avg_saccade_velocity < 3:
        dyslexia_score += 30
    
    return {
        "fixation_count": len(fixations),
        "regression_count": regressions,
        "avg_fixation_duration_ms": float(avg_fixation_duration),
        "avg_saccade_velocity": float(avg_saccade_velocity),
        "dyslexia_score": min(100, dyslexia_score),
        "indicators": {
            "prolonged_fixations": avg_fixation_duration > 500,
            "excessive_regressions": regressions > 5,
            "slow_reading": avg_saccade_velocity < 3
        }
    }

def detect_fixations(points: np.ndarray, radius: int = 30, min_duration: int = 100) -> List[Dict]:
    """Cluster points within radius (spatial) and min_duration (temporal) as fixations"""
    fixations = []
    current_cluster = []
    
    for _, point in enumerate(points):
        if not current_cluster:
            current_cluster.append(point)
            continue
        
        # Centroid of current cluster
        centroid = np.mean([p[:2] for p in current_cluster], axis=0)
        distance = np.linalg.norm(point[:2] - centroid)
        
        if distance < radius:
            current_cluster.append(point)
        else:
            # Check if duration meets threshold
            # time is at index 2
            duration = current_cluster[-1][2] - current_cluster[0][2]
            if duration >= min_duration:
                fixations.append({
                    "centroid": centroid.tolist(),
                    "duration": duration,
                    "point_count": len(current_cluster)
                })
            current_cluster = [point]
            
    return fixations

def detect_regressions(points: np.ndarray) -> int:
    """Count backward eye movements (Assuming Left-to-Right reading)"""
    regressions = 0
    # Simple check: x position moving left by threshold
    for i in range(1, len(points)):
        dx = points[i][0] - points[i-1][0]
        if dx < -50:  # Threshold for regression (not just jitter)
            regressions += 1
    return regressions

def calculate_saccade_velocities(fixations: List[Dict]) -> List[float]:
    velocities = []
    for i in range(1, len(fixations)):
        p1 = np.array(fixations[i-1]['centroid'])
        p2 = np.array(fixations[i]['centroid'])
        dist = np.linalg.norm(p2 - p1)
        # Time gap? Estimating based on next fixation start vs prev end
        # Simplified: assume a fixed interaction gap or utilize timestamps if available in fixations
        time_gap = 50 
        velocities.append(dist / time_gap)
    return velocities
