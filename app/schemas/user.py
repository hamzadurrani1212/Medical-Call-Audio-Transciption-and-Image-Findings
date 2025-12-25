"""
MedAI - Pydantic Schemas
User & Authentication Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(
        default="doctor",
        pattern="^(doctor|admin|staff|surgeon|specialist|resident|nurse)$"
    )


class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    username: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None
    is_active: bool = True


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: UserResponse


class TokenData(BaseModel):
    """Schema for token data"""
    username: Optional[str] = None
    token_type: Optional[str] = None
