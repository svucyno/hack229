"""routers/notifications.py — Hospital notification endpoint (stub, WebSocket in Phase 2)"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Emergency, Hospital

router = APIRouter(prefix="/api", tags=["Notifications"])


class NotifyRequest(BaseModel):
    emergency_id: Optional[int] = None
    hospital_id:  int
    token:        str
    patient_name: Optional[str] = "Anonymous"
    severity:     str
    condition:    str


@router.post("/notify_hospital")
def notify_hospital(body: NotifyRequest, db: Session = Depends(get_db)):
    """
    Updates the emergency record with selected hospital.
    WebSocket push to hospital dashboard will be added in Phase 2.
    """
    hospital = db.query(Hospital).filter(Hospital.id == body.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if body.emergency_id:
        emergency = db.query(Emergency).filter(Emergency.id == body.emergency_id).first()
        if emergency:
            emergency.hospital_id = body.hospital_id
            emergency.status = "HOSPITAL_NOTIFIED"
            db.commit()

    return {
        "success":      True,
        "message":      f"Hospital {hospital.name} has been notified.",
        "hospital_name": hospital.name,
        "hospital_phone": hospital.phone,
        "token":        body.token,
    }
