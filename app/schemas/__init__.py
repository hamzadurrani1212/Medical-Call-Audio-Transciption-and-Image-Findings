"""
MedAI - Schemas Package
"""
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenData
)
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse
)
from app.schemas.report import (
    SummaryInput,
    MedicalReportCreate,
    MedicalReportResponse,
    ConversationSession
)
from app.schemas.image import (
    ImageAnalysisRequest,
    ImageAnalysisResult,
    ImageAnalysisResponse
)

__all__ = [
    # User schemas
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "TokenData",
    # Patient schemas
    "PatientCreate",
    "PatientUpdate",
    "PatientResponse",
    # Report schemas
    "SummaryInput",
    "MedicalReportCreate",
    "MedicalReportResponse",
    "ConversationSession",
    # Image schemas
    "ImageAnalysisRequest",
    "ImageAnalysisResult",
    "ImageAnalysisResponse",
]
