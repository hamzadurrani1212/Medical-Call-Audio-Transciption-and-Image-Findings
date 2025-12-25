"""
MedAI - Medical Transcription & Analysis System
Configuration Module
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "MedAI Medical System"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cookie settings
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "medical_emr"
    POSTGRES_URL: str = ""
    
    # AI Services
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "openai"
    WHISPER_MODEL_SIZE: str = "base"
    
    # File limits
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_AUDIO_SIZE_MB: int = 25
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Directories
    REPORTS_DIR: str = "./reports"
    TEMP_DIR: str = "./temp_uploads"
    LOGS_DIR: str = "./logs"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Export settings instance
settings = get_settings()
