import time
from typing import Dict, Any, Optional

def detect_cognitive_load(signals: Dict[str, float], task_type: str) -> Dict[str, Any]:
    """
    Detect cognitive overload in <200ms using rule-based heuristics.
    Input: Signals dict (fixation, errors, latency, etc.)
    """
    start_time = time.time()
    
    # Extract features with defaults
    fixation_time = signals.get('fixation_time_avg_ms', 0)
    consecutive_errors = signals.get('consecutive_errors', 0)
    response_pause = signals.get('response_pause_ms', 0)
    backspace_count = signals.get('backspace_count', 0)
    mouse_hover = signals.get('mouse_hover_hesitation_ms', 0)
    
    overload_score = 0
    indicators = []
    
    # --- Decision Tree Logic ---
    
    # 1. Gaze: Prolonged fixation (>2.5s) suggests processing difficulty
    if fixation_time > 2500:
        overload_score += 30
        indicators.append("prolonged_fixation")
    elif fixation_time > 1500:
        overload_score += 15
        
    # 2. Performance: Frequent errors in succession
    if consecutive_errors >= 3:
        overload_score += 40
        indicators.append("error_pattern")
    
    # 3. Latency: Long pauses without interaction
    if response_pause > 8000:
        overload_score += 25
        indicators.append("long_pause")
        
    # 4. Input: Uncertainty (Backspacing)
    if backspace_count > 12:
        overload_score += 20
        indicators.append("uncertainty")
        
    # 5. Motor: Mouse hesitation
    if mouse_hover > 1500:
        overload_score += 15
        indicators.append("hesitation")
        
    # Determine Severity
    overload_detected = False
    severity = "mild"
    
    if overload_score >= 60:
        severity = "severe"
        overload_detected = True
    elif overload_score >= 35:
        severity = "moderate"
        overload_detected = True
        
    # Response Construction
    processing_time_ms = (time.time() - start_time) * 1000
    
    # Log warning if SLOW (Self-monitoring)
    if processing_time_ms > 200:
        print(f"WARNING: Cognitive Load detection too slow: {processing_time_ms}ms")
        
    return {
        "overload_detected": overload_detected,
        "severity": severity,
        "overload_score": overload_score,
        "indicators": indicators,
        "confidence": min(1.0, overload_score / 100.0),
        "processing_time_ms": round(processing_time_ms, 2),
        "intervention_suggested": get_intervention(severity) if overload_detected else None
    }

def get_intervention(severity: str) -> str:
    if severity == "severe": return "mandatory_break"
    if severity == "moderate": return "suggest_break"
    return "continue_with_monitoring"
