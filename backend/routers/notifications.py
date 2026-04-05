from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Emergency, Hospital

# Import manager from websocket logic we just added
from websocket.manager import manager

router = APIRouter(prefix="/api", tags=["Notifications"])


class NotifyRequest(BaseModel):
    emergency_id: Optional[int] = None
    hospital_id:  int
    token:        str
    patient_name: Optional[str] = "Anonymous"
    patient_age:  Optional[int] = 30
    severity:     str
    condition:    str
    priority_score: Optional[float] = 5.0
    eta_seconds:  Optional[int] = 600

@router.post("/notify_hospital")
async def notify_hospital(body: NotifyRequest, db: Session = Depends(get_db)):
    """
    Updates the emergency record with selected hospital and broadcasts to WS.
    """
    hospital = db.query(Hospital).filter(Hospital.id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if body.emergency_id:
        emergency = db.query(Emergency).filter(Emergency.id == body.emergency_id).first()
        if emergency:
            emergency.hospital_id = body.hospital_id
            emergency.status = "ACTIVE"
            db.commit()

    # Push EMERGENCY_ALERT via WebSocket to the hospital's channel
    alert_msg = {
        "type": "EMERGENCY_ALERT",
        "patient": {"name": body.patient_name, "age": body.patient_age},
        "condition": body.condition,
        "severity": body.severity,
        "priority_score": body.priority_score,
        "eta_seconds": body.eta_seconds,
        "token": body.token,
        "timestamp": "Just now" # simplified for UI
    }
    
    await manager.broadcast_to_hospital(body.hospital_id, alert_msg)

    return {
        "status":       "notified",
        "token":        body.token,
    }

class AcceptCaseRequest(BaseModel):
    token: str
    hospital_id: int
    doctor_name: str
    message: Optional[str] = "We are ready. Come to Emergency Bay 2."

@router.post("/accept_case")
async def accept_case(body: AcceptCaseRequest, db: Session = Depends(get_db)):
    """
    Hospital acknowledges case, reduce bed count, push WS to patient.
    """
    hospital = db.query(Hospital).filter(Hospital.id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    emergency = db.query(Emergency).filter(Emergency.token == body.token).first()
    if emergency:
        emergency.status = "ACCEPTED"
        # Deduct a bed
        if hospital.beds_occupied < hospital.beds_total:
            hospital.beds_occupied += 1
        db.commit()
        
    accept_msg = {
        "type": "DOCTOR_ACCEPTED", 
        "doctor_name": body.doctor_name,
        "hospital_name": hospital.name,
        "message": body.message
    }
    
    await manager.send_to_patient(body.token, accept_msg)
    
    return {"status": "accepted"}
