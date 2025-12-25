"""
MedAI - Pydantic Schemas
Medical Report Schemas
"""
from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field


class SummaryInput(BaseModel):
    """Schema for transcript summarization input"""
    transcript: str = Field(..., min_length=10)
    patient_id: Optional[str] = None
    conversation_type: str = Field(
        default="consultation",
        pattern="^(consultation|followup|emergency|surgery)$"
    )


class MedicalReportCreate(BaseModel):
    """Schema for creating a medical report"""
    patient_id: Optional[str] = None
    present_complaints: str
    clinical_details: str
    physical_examination: str
    impression: str
    management_plan: str
    additional_notes: Optional[str] = None
    transcript: str
    conversation_type: str = "consultation"
    image_analysis: Optional[Dict] = None


class MedicalReportResponse(BaseModel):
    """Schema for medical report response"""
    id: str
    patient_id: Optional[str] = None
    present_complaints: str
    clinical_details: str
    physical_examination: str
    impression: str
    management_plan: str
    additional_notes: Optional[str] = None
    doctor_id: str
    conversation_type: str
    created_at: datetime
    image_analysis: Optional[Dict] = None


class ConversationSession(BaseModel):
    """Schema for conversation session"""
    session_id: str
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    doctor_id: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    transcript: str = ""
    status: str = Field(default="active", pattern="^(active|completed|archived)$")
