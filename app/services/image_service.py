"""
MedAI - Image Analysis Service
Medical Image Analysis with Gemini Vision
"""
import io
import logging
import asyncio
from typing import Dict, Optional
from PIL import Image as PILImage

from app.config import settings
from app.services.ai_service import gemini_vision_model

logger = logging.getLogger("MedAI.ImageAnalysis")


# Medical image analysis prompts
IMAGE_PROMPTS = {
    "CT": """As a board-certified radiologist, analyze this CT scan:

CLINICAL CONTEXT: {context}

Provide structured report:
1. TECHNIQUE: Imaging protocol
2. FINDINGS: Systematic description by region
3. IMPRESSION: Key findings synthesis
4. DIAGNOSIS: Most likely diagnosis
5. SEVERITY: (Normal/Mild/Moderate/Severe/Critical)
6. RECOMMENDATIONS: Next steps""",

    "MRI": """As a neuroradiology specialist, analyze this MRI:

CLINICAL CONTEXT: {context}

Structured MRI Report:
1. TECHNIQUE: Sequences acquired
2. FINDINGS: Signal abnormalities
3. IMPRESSION: Clinical significance
4. DIAGNOSIS: Primary diagnosis
5. SEVERITY: Impact assessment
6. RECOMMENDATIONS: Further evaluation""",

    "XRAY": """As a diagnostic radiologist, analyze this X-Ray:

CLINICAL CONTEXT: {context}

Standard X-Ray Report:
1. TECHNIQUE: Views and positioning
2. FINDINGS: Bones, joints, soft tissues
3. IMPRESSION: Clinical correlation
4. DIAGNOSIS: Radiographic diagnosis
5. SEVERITY: Abnormality severity
6. RECOMMENDATIONS: Additional imaging"""
}


async def analyze_medical_image(
    image_data: bytes,
    image_type: str,
    clinical_context: Optional[str] = None
) -> Dict:
    """Analyze medical image using Gemini Vision"""
    
    if not gemini_vision_model:
        return {
            "findings": "AI model not configured",
            "diagnosis": "Not available",
            "severity": "Unknown",
            "recommendations": "Please configure Gemini Vision API",
            "confidence_score": 0.0
        }
    
    try:
        # Validate image size
        if len(image_data) > settings.max_image_size:
            raise ValueError(f"Image exceeds {settings.MAX_IMAGE_SIZE_MB}MB limit")
        
        # Open image
        image = PILImage.open(io.BytesIO(image_data))
        
        # Get appropriate prompt
        prompt_template = IMAGE_PROMPTS.get(
            image_type.upper(),
            """Analyze this medical image:
            CLINICAL CONTEXT: {context}
            Provide: findings, diagnosis, severity, recommendations"""
        )
        
        prompt = prompt_template.format(context=clinical_context or "Not provided")
        
        # Generate analysis
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: gemini_vision_model.generate_content([prompt, image])
        )
        
        analysis_text = response.text
        return parse_image_analysis(analysis_text, image_type)
        
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return {
            "findings": f"Analysis error: {str(e)}",
            "diagnosis": "Analysis failed",
            "severity": "Unknown",
            "recommendations": "Please retry or consult radiologist",
            "confidence_score": 0.0,
            "error": str(e)
        }


def parse_image_analysis(analysis_text: str, image_type: str) -> Dict:
    """Parse AI analysis response into structured format"""
    lines = analysis_text.split('\n')
    
    sections = {
        'findings': [],
        'impression': [],
        'diagnosis': "Not specified",
        'severity': "Moderate",
        'recommendations': []
    }
    
    current_section = None
    severity_levels = {'critical', 'severe', 'moderate', 'mild', 'normal'}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        line_lower = line.lower()
        
        # Detect sections
        if 'finding' in line_lower or 'observation' in line_lower:
            current_section = 'findings'
        elif 'impression' in line_lower or 'conclusion' in line_lower:
            current_section = 'impression'
        elif 'diagnosis' in line_lower:
            current_section = 'diagnosis'
        elif 'recommendation' in line_lower:
            current_section = 'recommendations'
        
        # Extract severity
        for sev in severity_levels:
            if sev in line_lower:
                sections['severity'] = sev.capitalize()
                break
        
        # Add content
        if current_section in ['findings', 'impression', 'recommendations']:
            sections[current_section].append(line)
        elif current_section == 'diagnosis' and line:
            sections['diagnosis'] = line
    
    # Calculate confidence score
    analysis_length = len(analysis_text)
    confidence = min(0.95, analysis_length / 2000 * 0.5 + 0.3)
    
    return {
        "findings": "\n".join(sections['findings']) or "No significant findings",
        "impression": "\n".join(sections['impression']) or "Clinical impression pending",
        "diagnosis": sections['diagnosis'],
        "severity": sections['severity'],
        "recommendations": "\n".join(sections['recommendations']) or "Routine follow-up",
        "confidence_score": round(confidence, 2),
        "full_analysis": analysis_text
    }
