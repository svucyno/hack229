# backend/routers/symptoms.py

from fastapi import APIRouter
from pydantic import BaseModel
from ai.triage import analyze

router = APIRouter(prefix="/api", tags=["Triage"])

class SymptomRequest(BaseModel):
    symptoms: list[str]
    vitals: dict = {"hr": 75, "spo2": 98}
    transcript: str = ""
    wpm: int = 130

@router.post("/analyze_symptoms")
def analyze_symptoms(req: SymptomRequest):
    result = analyze(
        symptoms=req.symptoms,
        hr=req.vitals.get("hr", 75),
        spo2=req.vitals.get("spo2", 98),
        transcript=req.transcript,
        wpm=req.wpm,
    )
    return result