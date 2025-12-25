"""
MedAI - Transcription Service
Whisper Audio Transcription
"""
import os
import logging
import tempfile
from typing import Optional

from app.config import settings

logger = logging.getLogger("MedAI.Transcription")

# Whisper model - loaded on demand
_whisper_model = None


def load_whisper_model():
    """Load Whisper model"""
    global _whisper_model
    
    if _whisper_model is not None:
        return _whisper_model
    
    try:
        import whisper
        logger.info(f"Loading Whisper model ({settings.WHISPER_MODEL_SIZE})...")
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
        logger.info("✅ Whisper model loaded successfully")
        return _whisper_model
    except Exception as e:
        logger.error(f"❌ Failed to load Whisper model: {e}")
        return None


def get_whisper_model():
    """Get Whisper model instance"""
    global _whisper_model
    return _whisper_model


def is_transcription_available() -> bool:
    """Check if transcription service is available"""
    return _whisper_model is not None


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio bytes to text"""
    model = get_whisper_model()
    
    if not model:
        return "Whisper model not loaded"
    
    try:
        # Validate audio data
        if len(audio_bytes) == 0:
            return "Empty audio data"
        
        if len(audio_bytes) > settings.max_audio_size:
            return "Audio file too large"
        
        # Write to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        try:
            # Transcribe
            result = model.transcribe(
                tmp_path,
                fp16=False,
                language='en'
            )
            
            transcribed_text = result.get("text", "").strip()
            logger.info(f"Transcription completed: {len(transcribed_text)} characters")
            
            return transcribed_text
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return f"Transcription failed: {str(e)}"
