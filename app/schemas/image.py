"""
MedAI - Pydantic Schemas
Image Analysis Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ImageAnalysisRequest(BaseModel):
    """Schema for image analysis request"""
    patient_id: Optional[str] = None
    image_type: str = Field(..., pattern="^(CT|MRI|XRAY|USG|X-RAY|ULTRASOUND)$")
    clinical_context: Optional[str] = None


class ImageAnalysisResult(BaseModel):
    """Schema for image analysis result"""
    image_id: str
    patient_id: Optional[str] = None
    image_type: str
    findings: str
    diagnosis: str
    severity: str = Field(..., pattern="^(Normal|Mild|Moderate|Severe|Critical)$")
    recommendations: str
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    clinical_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ImageAnalysisResponse(BaseModel):
    """Schema for image analysis API response"""
    success: bool
    analysis_id: str
    analysis: dict
    metadata: dict
    message: str
