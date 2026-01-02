"""
MedAI - Image Analysis Routes
"""
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from bson import ObjectId

from app.config import settings
from app.database import get_image_analyses_collection
from app.core import get_current_user, check_database_connection
from app.services import analyze_medical_image, generate_report_pdf

router = APIRouter(prefix="/images", tags=["Image Analysis"])

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.dcm', '.tiff', '.bmp'}
VALID_IMAGE_TYPES = {'CT', 'MRI', 'XRAY', 'USG', 'X-RAY', 'ULTRASOUND'}


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    image_type: str = Form(...),
    patient_id: Optional[str] = Form(None),
    clinical_context: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Analyze a medical image"""
    analyses = get_image_analyses_collection()
    check_database_connection(analyses)
    
    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate image type
    if image_type.upper() not in VALID_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type. Use: {', '.join(VALID_IMAGE_TYPES)}"
        )
    
    # Read image data
    image_data = await file.read()
    
    # Validate size
    if len(image_data) > settings.max_image_size:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Max: {settings.MAX_IMAGE_SIZE_MB}MB"
        )
    
    # Analyze image
    analysis_result = await analyze_medical_image(
        image_data,
        image_type,
        clinical_context
    )
    
    # Save analysis record
    analysis_doc = {
        "image_id": str(uuid.uuid4()),
        "patient_id": patient_id,
        "image_type": image_type.upper(),
        "findings": analysis_result["findings"],
        "diagnosis": analysis_result["diagnosis"],
        "severity": analysis_result["severity"],
        "recommendations": analysis_result["recommendations"],
        "confidence_score": analysis_result.get("confidence_score"),
        "clinical_notes": clinical_context,
        "analyzed_by": current_user["username"],
        "created_at": datetime.utcnow()
    }
    
    await analyses.insert_one(analysis_doc)
    
    return {
        "success": True,
        "analysis_id": analysis_doc["image_id"],
        "analysis": analysis_result,
        "metadata": {
            "image_type": image_type,
            "file_size": len(image_data),
            "confidence": analysis_result.get("confidence_score"),
            "timestamp": datetime.utcnow().isoformat()
        },
        "message": f"{image_type} image analyzed successfully"
    }


@router.get("")
async def get_analyses(
    skip: int = 0,
    limit: int = 20,
    patient_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get image analyses list"""
    analyses = get_image_analyses_collection()
    check_database_connection(analyses)
    
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    
    cursor = analyses.find(query).sort("created_at", -1).skip(skip).limit(limit)
    analysis_list = await cursor.to_list(limit)
    total = await analyses.count_documents(query)
    
    for a in analysis_list:
        a["_id"] = str(a["_id"])
        if a.get("created_at"):
            a["created_at"] = a["created_at"].isoformat()
    
    return {
        "analyses": analysis_list,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific analysis"""
    analyses = get_image_analyses_collection()
    check_database_connection(analyses)
    
    analysis = await analyses.find_one({"image_id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis["_id"] = str(analysis["_id"])
    return analysis


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an analysis"""
    analyses = get_image_analyses_collection()
    check_database_connection(analyses)
    
    result = await analyses.delete_one({"image_id": analysis_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"message": "Analysis deleted successfully"}


@router.get("/{analysis_id}/pdf")
async def download_analysis_pdf(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download image analysis as PDF"""
    analyses = get_image_analyses_collection()
    check_database_connection(analyses)
    
    analysis = await analyses.find_one({"image_id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    # Wrap in report structure for PDF generator
    report_dict = {
        "_id": analysis["_id"],
        "patient_id": analysis.get("patient_id", "Unknown"),
        "doctor_id": analysis.get("analyzed_by", "AI System"),
        "conversation_type": "imaging",
        "created_at": analysis.get("created_at", datetime.utcnow()),
        "image_analysis": {
            "image_type": analysis.get("image_type", "Medical Image"),
            "findings": analysis.get("findings", ""),
            "diagnosis": analysis.get("diagnosis", ""),
            "recommendations": analysis.get("recommendations", ""),
            "severity": analysis.get("severity", "")
        },
        # Standard fields needed for PDF template to not crash
        "present_complaints": f"{analysis.get('image_type', 'Image')} Analysis",
        "clinical_details": analysis.get("clinical_notes", "No clinical notes provided"),
        "physical_examination": "Analysis based on medical imaging",
        "impression": analysis.get("diagnosis", "See findings"),
        "management_plan": analysis.get("recommendations", "See recommendations"),
        "additional_notes": f"Confidence Score: {analysis.get('confidence_score', 'N/A')}"
    }
    
    pdf_path = generate_report_pdf(report_dict)
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"medical_report_{analysis_id}.pdf"
    )
