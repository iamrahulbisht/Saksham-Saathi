import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Saksham Saathi ML Service"
    MODEL_PATH: str = "app/ml_models"
    
    class Config:
        env_file = ".env"

settings = Settings()
