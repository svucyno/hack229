"""routers/patients.py — POST /generate_token, GET /patient/{id}"""

import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import get_db, Patient, Emergency
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter(prefix="/api", tags=["Patients"])


def generate_emergency_token() -> str:
    """Generate UUID4[:8].upper() format e.g. A3F9-72XK"""
    raw = uuid.uuid4().hex[:8].upper()
    return f"{raw[:4]}-{raw[4:]}"


class TokenRequest(BaseModel):
    patient_name: Optional[str] = None
    severity:     Optional[str] = "MODERATE"
    symptoms:     Optional[list] = []
    condition:    Optional[str] = "Unknown"
    priority_score: Optional[float] = 5.0
    hospital_id:  Optional[int] = None


@router.post("/generate_token")
def generate_token(body: TokenRequest, db: Session = Depends(get_db)):
    token      = generate_emergency_token()
    expires_at = datetime.utcnow() + timedelta(minutes=20)

    # Create anonymous patient if no patient_id
    patient = Patient(
        name=body.patient_name or "Anonymous",
        allergies="[]",
        chronic_conditions="[]",
        current_medications="[]",
        vitals_history="[]",
        visit_history="[]",
    )
    db.add(patient)
    db.flush()

    import json
    emergency = Emergency(
        patient_id=patient.id,
        hospital_id=body.hospital_id,
        token=token,
        severity=body.severity,
        priority_score=body.priority_score,
        symptoms=json.dumps(body.symptoms),
        suspected_condition=body.condition,
        status="PENDING",
    )
    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    return {
        "token":      token,
        "expires_at": expires_at.isoformat() + "Z",
        "emergency_id": emergency.id,
        "patient_id":   patient.id,
        "message":    "Show this token at hospital reception",
    }


@router.get("/patient/{patient_id}")
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "id":                 p.id,
        "name":               p.name,
        "age":                p.age,
        "sex":                p.sex,
        "blood_type":         p.blood_type,
        "allergies":          p.allergies,
        "chronic_conditions": p.chronic_conditions,
        "current_medications":p.current_medications,
    }

@router.post("/patient/{patient_id}/share_records")
def share_records(patient_id: int, db: Session = Depends(get_db)):
    """Stub for sharing medical records with a hospital."""
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
@router.get("/drug_info")
async def get_drug_info(name: str):
    """
    Fetches real labeling data from the U.S. FDA database.
    """
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.fda.gov/drug/label.json",
                params={"search": f'openfda.generic_name:"{name}"', "limit": 1},
                timeout=5.0
            )
            
            if resp.status_code == 404:
                return {"error": "Drug information not available."}
            
            resp.raise_for_status()
            data = resp.json()
            
            if not data.get("results") or len(data["results"]) == 0:
                return {"error": "Drug information not available."}
                
            result = data["results"][0]
            
            return {
                "indications_and_usage": result.get("indications_and_usage", ["No purpose specified."])[0],
                "warnings": result.get("warnings", ["No boxed warnings."])[0] if "warnings" in result else None,
                "adverse_reactions": result.get("adverse_reactions", ["No side effects listed."])[0] if "adverse_reactions" in result else None
            }
            
    except httpx.RequestError:
        return {"error": "Failed to connect to FDA database."}
    except Exception as e:
        return {"error": "Drug information not available."}
