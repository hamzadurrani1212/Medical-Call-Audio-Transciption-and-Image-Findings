"""
MedAI - API v1 Router
Aggregates all API routes
"""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.reports import router as reports_router
from app.api.v1.images import router as images_router
from app.api.v1.transcription import router as transcription_router
from app.api.v1.analytics import router as analytics_router

# Main API router
api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(patients_router)
api_router.include_router(reports_router)
api_router.include_router(images_router)
api_router.include_router(analytics_router)

# Export transcription router separately (WebSocket)
ws_router = transcription_router
