"""
MedAI - Pydantic Schemas
Patient Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    """Schema for creating a patient"""
    patient_id: str = Field(..., min_length=3, max_length=50)
    full_name: str
    date_of_birth: str
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    contact_info: Optional[str] = None
    medical_history: Optional[str] = None


class PatientUpdate(BaseModel):
    """Schema for updating a patient"""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    contact_info: Optional[str] = None
    medical_history: Optional[str] = None


class PatientResponse(BaseModel):
    """Schema for patient response"""
    patient_id: str
    full_name: str
    date_of_birth: str
    gender: str
    contact_info: Optional[str] = None
    medical_history: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
