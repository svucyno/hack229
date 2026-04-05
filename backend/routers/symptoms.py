"""routers/symptoms.py — POST /analyze_symptoms"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ai.triage import analyze

router = APIRouter(prefix="/api", tags=["Triage"])


class VitalsInput(BaseModel):
    hr: Optional[float] = None    # heart rate BPM
    spo2: Optional[float] = None  # SpO2 %


class SymptomsRequest(BaseModel):
    symptoms:   List[str]       = []
    vitals:     Optional[VitalsInput] = None
    transcript: Optional[str]   = None
    wpm:        Optional[float] = None   # words per minute (voice stress proxy)


@router.post("/analyze_symptoms")
async def analyze_symptoms(body: SymptomsRequest):
    hr   = body.vitals.hr   if body.vitals else None
    spo2 = body.vitals.spo2 if body.vitals else None

    result = analyze(
        symptoms=body.symptoms,
        hr=hr,
        spo2=spo2,
        wpm=body.wpm,
    )
    return result
