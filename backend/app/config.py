import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adaptive Lending Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "app/adaptive-lending-firebase-adminsdk-fbsvc-3514e2cff2.json"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Model paths
    MODEL_PATH: str = "models/cnn_loan_default_model.keras"
    SCALER_PATH: str = "models/loan_default_scaler.pkl"
    
    class Config:
        case_sensitive = True

settings = Settings()