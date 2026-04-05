"""routers/hospitals.py — GET /hospitals, GET /hospitals/{id}, POST /recommend"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db, Hospital
from ai.recommender import recommend

router = APIRouter(prefix="/api", tags=["Hospitals"])


class RecommendRequest(BaseModel):
    lat:                float
    lng:                float
    condition:          str
    severity:           str
    required_specialty: Optional[str] = "General Medicine"


@router.get("/hospitals")
def get_all_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    return [
        {
            "id":             h.id,
            "name":           h.name,
            "address":        h.address,
            "city":           h.city,
            "state":          h.state,
            "lat":            h.lat,
            "lng":            h.lng,
            "phone":          h.phone,
            "type":           h.type,
            "specializations": h.specializations_list,
            "beds_total":     h.beds_total,
            "beds_occupied":  h.beds_occupied,
            "beds_available": h.beds_available,
            "emergency_bay":  h.emergency_bay,
            "icu_beds":       h.icu_beds,
            "rating":         h.rating,
        }
        for h in hospitals
    ]


@router.get("/hospitals/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {
        "id":             h.id,
        "name":           h.name,
        "address":        h.address,
        "city":           h.city,
        "state":          h.state,
        "lat":            h.lat,
        "lng":            h.lng,
        "phone":          h.phone,
        "type":           h.type,
        "specializations": h.specializations_list,
        "beds_total":     h.beds_total,
        "beds_occupied":  h.beds_occupied,
        "beds_available": h.beds_available,
        "emergency_bay":  h.emergency_bay,
        "icu_beds":       h.icu_beds,
        "rating":         h.rating,
    }


@router.post("/recommend")
async def recommend_hospitals(body: RecommendRequest, db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).filter(Hospital.emergency_bay == True).all()
    if not hospitals:
        raise HTTPException(status_code=404, detail="No hospitals with emergency bay found")

    results = await recommend(
        patient_lat=body.lat,
        patient_lng=body.lng,
        condition=body.condition,
        severity=body.severity,
        required_specialty=body.required_specialty,
        hospitals=hospitals,
    )
    return {"hospitals": results, "total": len(results)}
