from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import screening, cognitive_load, attention_prediction, health
from app.utils.model_loader import load_all_models
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Saksham Saathi ML Service",
    description="AI/ML microservice for neurodevelopmental screening",
    version="1.0.0"
)

# CORS (allow Node.js backend interaction)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models at startup (singleton pattern)
@app.on_event("startup")
async def startup_event():
    logger.info("Loading ML models...")
    load_all_models()
    logger.info("ML models loaded successfully (or placeholders active)")

# Include routers
app.include_router(health.router, prefix="/api/ml", tags=["Health"])
app.include_router(screening.router, prefix="/api/ml/screening", tags=["Screening"])
app.include_router(cognitive_load.router, prefix="/api/ml/cognitive-load", tags=["Cognitive Load"])
app.include_router(attention_prediction.router, prefix="/api/ml/attention", tags=["Attention Prediction"])

@app.get("/")
def root():
    return {"message": "Saksham Saathi ML Service is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
