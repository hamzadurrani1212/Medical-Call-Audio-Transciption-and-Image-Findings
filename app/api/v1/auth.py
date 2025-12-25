"""
MedAI - Authentication Routes
"""
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm

from app.config import settings
from app.database import get_users_collection, Database
from app.schemas import UserCreate, UserResponse
from app.core import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
    save_refresh_token,
    revoke_refresh_token,
    get_refresh_token_record,
    check_database_connection
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register_user(user: UserCreate):
    """Register a new user"""
    users = get_users_collection()
    check_database_connection(users)
    
    # Check if user exists
    existing = await users.find_one({"username": user.username})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create user
    user_dict = {
        "username": user.username,
        "password": get_password_hash(user.password),
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.utcnow(),
        "last_login": None,
        "is_active": True
    }
    
    result = await users.insert_one(user_dict)
    
    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id),
        "username": user.username,
        "role": user.role
    }


@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    users = get_users_collection()
    check_database_connection(users)
    
    user = await users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is deactivated"
        )
    
    # Update last login
    await users.update_one(
        {"username": form_data.username},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token()
    
    refresh_expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await save_refresh_token(refresh_token, user["username"], refresh_expires)
    
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_EXPIRY_MINUTES * 60,
        "user_info": {
            "username": user["username"],
            "full_name": user.get("full_name", ""),
            "role": user.get("role", "doctor")
        }
    }
    
    resp = Response(
        content=json.dumps(response_data),
        media_type="application/json"
    )
    
    resp.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/api",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return resp


@router.post("/refresh-token")
async def refresh_token_endpoint(
    response: Response,
    refresh_token: Optional[str] = Cookie(None)
):
    """Refresh access token"""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    record = await get_refresh_token_record(refresh_token)
    if not record:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    if record.get("expires_at") and record["expires_at"] < datetime.utcnow():
        await revoke_refresh_token(refresh_token)
        raise HTTPException(status_code=401, detail="Refresh token expired")
    
    username = record["username"]
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": username})
    new_refresh_token = create_refresh_token()
    
    new_expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await save_refresh_token(new_refresh_token, username, new_expires)
    await revoke_refresh_token(refresh_token)
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/api",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_EXPIRY_MINUTES * 60
    }


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    current_user: dict = Depends(get_current_user)
):
    """Logout and revoke tokens"""
    if refresh_token:
        await revoke_refresh_token(refresh_token)
    
    response.delete_cookie("refresh_token", path="/api")
    
    return {"message": "Successfully logged out"}
