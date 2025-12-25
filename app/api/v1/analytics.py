"""
MedAI - Analytics Routes
"""
from datetime import datetime

from fastapi import APIRouter, Depends

from app.database import (
    get_users_collection,
    get_reports_collection,
    get_image_analyses_collection,
    Database
)
from app.core import get_current_user, check_database_connection
from app.services import manager, is_ai_available, is_vision_available, is_transcription_available

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get dashboard analytics"""
    reports = get_reports_collection()
    images = get_image_analyses_collection()
    check_database_connection(reports)
    
    # Get counts
    total_reports = await reports.count_documents({"doctor_id": current_user["username"]})
    total_images = await images.count_documents({})
    
    return {
        "total_reports": total_reports,
        "total_images": total_images,
        "username": current_user["username"]
    }


@router.get("/stats")
async def get_system_stats(current_user: dict = Depends(get_current_user)):
    """Get detailed system statistics"""
    users = get_users_collection()
    reports = get_reports_collection()
    images = get_image_analyses_collection()
    check_database_connection(users)
    
    # System stats
    total_users = await users.count_documents({})
    total_reports = await reports.count_documents({})
    total_images = await images.count_documents({})
    
    # User stats
    user_reports = await reports.count_documents({"doctor_id": current_user["username"]})
    
    # Recent activity
    recent = await reports.find(
        {"doctor_id": current_user["username"]}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    for r in recent:
        r["_id"] = str(r["_id"])
        if r.get("created_at"):
            r["created_at"] = r["created_at"].isoformat()
    
    return {
        "user_stats": {
            "total_reports": user_reports,
            "recent_activity": recent
        },
        "system_stats": {
            "total_users": total_users,
            "total_reports": total_reports,
            "total_images": total_images,
            "websocket_connections": manager.get_connection_stats()
        },
        "user_info": {
            "username": current_user["username"],
            "role": current_user.get("role", "doctor")
        }
    }


@router.get("/health")
async def health_check():
    """System health check"""
    db_status = "healthy" if Database.is_connected() else "unavailable"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "whisper": "healthy" if is_transcription_available() else "unavailable",
            "gemini_ai": "healthy" if is_ai_available() else "unavailable",
            "gemini_vision": "healthy" if is_vision_available() else "unavailable",
            "websocket": {
                "status": "healthy",
                "active_connections": len(manager.active_connections)
            }
        },
        "version": "3.0.0"
    }
