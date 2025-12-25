"""
MedAI - AI Service
Gemini AI Integration for Medical Analysis
"""
import logging
import json
import asyncio
from typing import Dict, Optional

from app.config import settings

logger = logging.getLogger("MedAI.AIService")

# Initialize Gemini
gemini_model = None
gemini_vision_model = None

try:
    import google.generativeai as genai
    
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
        
        generation_config = {
            "temperature": 0.1,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        gemini_model = genai.GenerativeModel(
            "gemini-pro",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        gemini_vision_model = genai.GenerativeModel(
            "gemini-pro-vision",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        logger.info("✅ Gemini AI configured successfully")
    else:
        logger.warning("⚠️ Gemini API key not configured")
        
except ImportError:
    logger.warning("⚠️ google-generativeai package not installed")
except Exception as e:
    logger.error(f"❌ Gemini AI configuration failed: {e}")


def is_ai_available() -> bool:
    """Check if AI service is available"""
    return gemini_model is not None


def is_vision_available() -> bool:
    """Check if Vision AI is available"""
    return gemini_vision_model is not None


async def generate_medical_summary(transcript: str, conversation_type: str = "consultation") -> Dict:
    """Generate structured medical summary from transcript"""
    if not gemini_model:
        return await basic_medical_parsing(transcript)
    
    try:
        prompt = f"""
        You are a medical transcription specialist analyzing a doctor-patient conversation.
        
        CONVERSATION TYPE: {conversation_type}
        TRANSCRIPT: {transcript}
        
        Extract and structure all medical information into this exact JSON format:
        {{
            "present_complaints": "Detailed description of patient's main symptoms",
            "clinical_details": "Relevant medical history, medications, allergies",
            "physical_examination": "Vital signs and examination findings",
            "impression": "Clinical assessment and differential diagnoses",
            "management_plan": "Treatments, medications with dosages, follow-up",
            "additional_notes": "Patient education and other notes"
        }}
        
        Return ONLY valid JSON, no additional text.
        """
        
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: gemini_model.generate_content(prompt)
        )
        
        response_text = response.text.strip()
        
        # Clean JSON response
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        try:
            summary = json.loads(response_text.strip())
            
            # Validate required fields
            required_fields = [
                "present_complaints", "clinical_details", "physical_examination",
                "impression", "management_plan", "additional_notes"
            ]
            
            for field in required_fields:
                if field not in summary or not summary[field]:
                    summary[field] = "Not documented"
            
            return summary
            
        except json.JSONDecodeError:
            logger.warning("JSON parsing failed, using basic parsing")
            return await basic_medical_parsing(transcript)
            
    except Exception as e:
        logger.error(f"AI summarization error: {e}")
        return await basic_medical_parsing(transcript)


async def basic_medical_parsing(transcript: str) -> Dict:
    """Fallback parsing when AI is unavailable"""
    transcript_lower = transcript.lower()
    
    complaints_keywords = {
        'pain': 'Pain complaint',
        'fever': 'Fever',
        'cough': 'Cough',
        'headache': 'Headache',
        'nausea': 'Nausea',
        'dizziness': 'Dizziness',
        'fatigue': 'Fatigue'
    }
    
    complaints = [desc for kw, desc in complaints_keywords.items() if kw in transcript_lower]
    
    return {
        "present_complaints": ", ".join(complaints) if complaints else "Symptoms discussed",
        "clinical_details": "Medical history from conversation",
        "physical_examination": "Examination documented",
        "impression": "Clinical assessment based on conversation",
        "management_plan": "Treatment plan discussed",
        "additional_notes": "Additional clinical notes"
    }
