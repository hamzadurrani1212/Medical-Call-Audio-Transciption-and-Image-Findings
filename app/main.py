"""
MedAI - Medical Transcription & Analysis System
Main Application Entry Point
"""
import os
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Database, create_indexes, get_users_collection
from app.core import get_password_hash
from app.api import api_router, ws_router
from app.services import load_whisper_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('medical_emr.log')
    ]
)
logger = logging.getLogger("MedAI")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting MedAI Medical System...")
    
    # Connect to database
    await Database.connect()
    
    # Create indexes
    await create_indexes()
    
    # Create default user if needed
    await create_default_user()
    
    # Load Whisper model
    load_whisper_model()
    
    # Ensure directories exist
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    os.makedirs(settings.LOGS_DIR, exist_ok=True)
    
    logger.info("MedAI startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down MedAI...")
    await Database.disconnect()
    logger.info("Shutdown complete")


async def create_default_user():
    """Create default admin user if not exists"""
    users = get_users_collection()
    if users is None:
        return
    
    default_user = await users.find_one({"username": "doctor"})
    if not default_user:
        await users.insert_one({
            "username": "doctor",
            "password": get_password_hash("doctor123"),
            "full_name": "Default Doctor",
            "role": "doctor",
            "created_at": datetime.utcnow(),
            "is_active": True
        })
        logger.info("Default user created: doctor/doctor123")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered medical transcription and analysis platform",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)
app.include_router(ws_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "status": "MedAI Medical System Running",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "Real-time audio transcription with Whisper",
            "AI-powered medical summarization with Gemini",
            "CT/MRI/X-Ray/USG image analysis",
            "Professional PDF report generation",
            "WebSocket real-time communication",
            "JWT authentication with refresh tokens",
            "Patient record management"
        ],
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Legacy API routes (backward compatibility)
@app.get("/api/health")
async def health():
    """Legacy health check redirect"""
    from app.api.v1.analytics import health_check
    return await health_check()


@app.get("/api/analytics")
async def analytics(request: Request):
    """Legacy analytics endpoint"""
    # Forward to new endpoint
    from app.api.v1.analytics import get_analytics
    from app.core import get_current_user, oauth2_scheme
    
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        try:
            user = await get_current_user(token)
            return await get_analytics(user)
        except:
            pass
    
    return {"error": "Authentication required"}


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": 500,
            "message": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Mount frontend if exists
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "Frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")
    logger.info("Frontend mounted at /app")
