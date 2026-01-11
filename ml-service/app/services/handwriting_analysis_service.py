import numpy as np
from typing import List, Dict, Any

def analyze_handwriting(strokes: List[Dict], language: str = 'en') -> Dict[str, Any]:
    """
    Input: [{"points": [{"x": 100, "y": 150, "time": 123}, ...]}, ...]
    """
    if not strokes:
        return {"error": "No stroke data provided"}
    
    # 1. Detect Reversals
    reversals = detect_reversals(strokes, language)
    
    # 2. Detect Spacing Issues
    spacing_issues = detect_spacing_issues(strokes)
    
    # 3. Smoothness
    smoothness_score = calculate_smoothness(strokes)
    
    # Scoring
    dyslexia_score = 0
    if reversals > 1:
        dyslexia_score += 50
    if spacing_issues > 2:
        dyslexia_score += 30
    if smoothness_score < 40:
        dyslexia_score += 20
        
    return {
        "reversal_count": reversals,
        "spacing_issues": spacing_issues,
        "smoothness_score": float(smoothness_score),
        "dyslexia_score": min(100, dyslexia_score),
        "indicators": {
            "mirror_writing": reversals > 1,
            "inconsistent_spacing": spacing_issues > 2,
            "poor_motor_control": smoothness_score < 40
        }
    }

def detect_reversals(strokes: List[Dict], language: str) -> int:
    reversals = 0
    for stroke in strokes:
        points = stroke.get('points', [])
        if len(points) < 5: continue
        
        # Heuristic: Check gross direction vs expected direction for specific letters
        # This requires knowing WHICH letter this stroke belongs to.
        # Simplified Check: Detect if stroke is drawn Right-to-Left where not heavily expected?
        x_start = points[0]['x']
        x_end = points[-1]['x']
        
        if x_end < x_start - 20: # Strong Leftward movement
             # Placeholder for complex 'b' vs 'd' logic which needs shape identification
             pass 
    return reversals

def detect_spacing_issues(strokes: List[Dict]) -> int:
    if len(strokes) < 2: return 0
    
    # Calculate horizontal gaps between consecutive strokes
    gaps = []
    for i in range(1, len(strokes)):
        # End of prev stroke
        prev_points = strokes[i-1].get('points', [])
        if not prev_points: continue
        prev_max_x = max(p['x'] for p in prev_points)
        
        # Start of curr stroke
        curr_points = strokes[i].get('points', [])
        if not curr_points: continue
        curr_min_x = min(p['x'] for p in curr_points)
        
        gap = curr_min_x - prev_max_x
        if gap > 0: gaps.append(gap)
        
    if not gaps: return 0
    
    mean_gap = np.mean(gaps)
    # Count gaps that vary > 50% from mean
    issues = sum(1 for g in gaps if abs(g - mean_gap) > mean_gap * 0.5)
    return issues

def calculate_smoothness(strokes: List[Dict]) -> float:
    # Check for jittery movement (high variance in angle changes)
    return 85.0 # Placeholder average
