"""
MedAI - Services Package
"""
from app.services.ai_service import (
    is_ai_available,
    is_vision_available,
    generate_medical_summary
)
from app.services.transcription_service import (
    load_whisper_model,
    get_whisper_model,
    is_transcription_available,
    transcribe_audio
)
from app.services.image_service import (
    analyze_medical_image
)
from app.services.pdf_service import (
    generate_report_pdf
)
from app.services.websocket_manager import (
    ConnectionManager,
    manager
)

__all__ = [
    # AI Service
    "is_ai_available",
    "is_vision_available",
    "generate_medical_summary",
    # Transcription
    "load_whisper_model",
    "get_whisper_model",
    "is_transcription_available",
    "transcribe_audio",
    # Image Analysis
    "analyze_medical_image",
    # PDF
    "generate_report_pdf",
    # WebSocket
    "ConnectionManager",
    "manager",
]
