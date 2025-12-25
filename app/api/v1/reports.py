"""
MedAI - Medical Reports Routes
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from bson import ObjectId

from app.database import get_reports_collection
from app.schemas import SummaryInput
from app.core import get_current_user, check_database_connection, cleanup_expired_tokens
from app.services import generate_medical_summary, generate_report_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("")
async def create_report(
    input_data: SummaryInput,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Generate medical report from transcript"""
    reports = get_reports_collection()
    check_database_connection(reports)
    
    if not input_data.transcript.strip() or len(input_data.transcript.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Transcript too short for analysis"
        )
    
    # Generate summary
    summary = await generate_medical_summary(
        input_data.transcript,
        input_data.conversation_type
    )
    
    # Create report document
    report_dict = {
        "patient_id": input_data.patient_id,
        "present_complaints": summary["present_complaints"],
        "clinical_details": summary["clinical_details"],
        "physical_examination": summary["physical_examination"],
        "impression": summary["impression"],
        "management_plan": summary["management_plan"],
        "additional_notes": summary.get("additional_notes", ""),
        "transcript": input_data.transcript,
        "doctor_id": current_user["username"],
        "conversation_type": input_data.conversation_type,
        "created_at": datetime.utcnow()
    }
    
    result = await reports.insert_one(report_dict)
    report_id = str(result.inserted_id)
    
    # Generate PDF
    report_dict["_id"] = result.inserted_id
    pdf_path = generate_report_pdf(report_dict)
    
    # Background cleanup
    background_tasks.add_task(cleanup_expired_tokens)
    
    return {
        "success": True,
        "report_id": report_id,
        "summary": summary,
        "pdf_path": pdf_path,
        "message": "Medical report generated successfully"
    }


@router.get("")
async def get_reports(
    skip: int = 0,
    limit: int = 20,
    patient_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get medical reports list"""
    reports = get_reports_collection()
    check_database_connection(reports)
    
    query = {"doctor_id": current_user["username"]}
    if patient_id:
        query["patient_id"] = patient_id
    
    cursor = reports.find(query).sort("created_at", -1).skip(skip).limit(limit)
    report_list = await cursor.to_list(limit)
    total = await reports.count_documents(query)
    
    for r in report_list:
        r["_id"] = str(r["_id"])
        if r.get("created_at"):
            r["created_at"] = r["created_at"].isoformat()
    
    return {
        "reports": report_list,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific report"""
    reports = get_reports_collection()
    check_database_connection(reports)
    
    try:
        report = await reports.find_one({"_id": ObjectId(report_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report["_id"] = str(report["_id"])
    return report


@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a report"""
    reports = get_reports_collection()
    check_database_connection(reports)
    
    try:
        result = await reports.delete_one({"_id": ObjectId(report_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted successfully"}


@router.get("/{report_id}/pdf")
async def download_report_pdf(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download report as PDF"""
    reports = get_reports_collection()
    check_database_connection(reports)
    
    try:
        report = await reports.find_one({"_id": ObjectId(report_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    pdf_path = generate_report_pdf(report)
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"medical_report_{report_id}.pdf"
    )
