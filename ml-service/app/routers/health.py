from fastapi import APIRouter
from app.utils.model_loader import MODELS
import psutil
import time

router = APIRouter()

start_time = time.time()

@router.get("/health")
def health_check():
    """Check if ML service is healthy and models are loaded"""
    uptime = time.time() - start_time
    memory_info = psutil.virtual_memory()
    
    return {
        "status": "healthy",
        "uptime_seconds": int(uptime),
        "memory_usage_percent": memory_info.percent,
        "models_status": {
            "screening_rf": MODELS.get('screening_rf') is not None,
            "screening_mlp": MODELS.get('screening_mlp') is not None,
            "cognitive_load_tree": MODELS.get('cognitive_load_tree') is not None,
            "lstm_attention": MODELS.get('lstm_attention') is not None
        }
    }
