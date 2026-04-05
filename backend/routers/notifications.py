# backend/routers/notifications.py

from fastapi import APIRouter
from websocket.manager import manager
import uuid, json
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["Notifications"])

@router.post("/notify_hospital")
async def notify_hospital(body: dict):
    hospital_id = body.get("hospital_id")
    patient_data = body.get("patient_data", {})
    token = str(uuid.uuid4())[:8].upper()
    expires_at = (datetime.utcnow() + timedelta(minutes=20)).isoformat()
    message = {
        "type": "EMERGENCY_ALERT",
        "patient": patient_data,
        "condition": body.get("condition", "Unknown"),
        "severity": body.get("severity", "CRITICAL"),
        "priority_score": body.get("priority_score", 9.0),
        "eta_seconds": body.get("eta_seconds", 600),
        "token": token,
    }
    await manager.broadcast_to_hospital(hospital_id, json.dumps(message))
    return {"status": "notified", "token": token, "expires_at": expires_at}