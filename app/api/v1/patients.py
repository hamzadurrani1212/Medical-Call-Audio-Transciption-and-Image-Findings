"""
MedAI - Patient Management Routes
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_patients_collection
from app.schemas import PatientCreate, PatientUpdate
from app.core import get_current_user, check_database_connection

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("")
async def create_patient(
    patient: PatientCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new patient record"""
    patients = get_patients_collection()
    check_database_connection(patients)
    
    # Check if patient exists
    existing = await patients.find_one({"patient_id": patient.patient_id})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Patient ID already exists"
        )
    
    patient_dict = patient.dict()
    patient_dict.update({
        "created_by": current_user["username"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = await patients.insert_one(patient_dict)
    
    return {
        "message": "Patient created successfully",
        "patient_id": patient.patient_id,
        "record_id": str(result.inserted_id)
    }


@router.get("")
async def get_patients(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get patient list with optional search"""
    patients = get_patients_collection()
    check_database_connection(patients)
    
    query = {}
    if search:
        query["$or"] = [
            {"patient_id": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = patients.find(query).sort("created_at", -1).skip(skip).limit(limit)
    patient_list = await cursor.to_list(limit)
    total = await patients.count_documents(query)
    
    for p in patient_list:
        p["_id"] = str(p["_id"])
    
    return {
        "patients": patient_list,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific patient by ID"""
    patients = get_patients_collection()
    check_database_connection(patients)
    
    patient = await patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient["_id"] = str(patient["_id"])
    return patient


@router.put("/{patient_id}")
async def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a patient record"""
    patients = get_patients_collection()
    check_database_connection(patients)
    
    update_dict = {k: v for k, v in patient_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await patients.update_one(
        {"patient_id": patient_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"message": "Patient updated successfully"}


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a patient record"""
    patients = get_patients_collection()
    check_database_connection(patients)
    
    result = await patients.delete_one({"patient_id": patient_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"message": "Patient deleted successfully"}
