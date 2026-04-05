# backend/routers/hospitals.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Hospital
import json, math, os, httpx

router = APIRouter(prefix="/api", tags=["Hospitals"])

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def get_eta(plat, plng, hlat, hlng):
    # Real Google Directions API call
    if GOOGLE_KEY:
        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={plat},{plng}&destination={hlat},{hlng}&mode=driving&key={GOOGLE_KEY}"
        try:
            r = httpx.get(url, timeout=5)
            data = r.json()
            if data["routes"]:
                leg = data["routes"][0]["legs"][0]
                return leg["duration"]["value"], leg["distance"]["value"] / 1000
        except:
            pass
    # Fallback: estimate from straight-line distance
    km = haversine_km(plat, plng, hlat, hlng)
    return int(km / 0.5 * 60), round(km, 2)

@router.get("/hospitals")
def list_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    result = []
    for h in hospitals:
        result.append({
            "id": h.id, "name": h.name, "city": h.city,
            "lat": h.lat, "lng": h.lng, "phone": h.phone,
            "type": h.type, "beds_total": h.beds_total,
            "beds_available": h.beds_total - h.beds_occupied,
            "specializations": json.loads(h.specializations or "[]"),
            "emergency_bay": h.emergency_bay, "rating": h.rating,
        })
    return result

@router.post("/recommend")
def recommend_hospitals(body: dict, db: Session = Depends(get_db)):
    lat = body.get("lat", 13.6288)
    lng = body.get("lng", 79.4192)
    condition = body.get("condition", "")
    hospitals = db.query(Hospital).all()
    scored = []
    for h in hospitals:
        specs = json.loads(h.specializations or "[]")
        eta_sec, dist_km = get_eta(lat, lng, h.lat, h.lng)
        distance_score = max(0, 1 - dist_km / 20)
        specialty_score = 1.0 if any(s.lower() in condition.lower() for s in specs) else 0.3
        avail = (h.beds_total - h.beds_occupied) / max(h.beds_total, 1)
        composite = distance_score * 0.30 + specialty_score * 0.45 + avail * 0.25
        scored.append({
            "id": h.id, "name": h.name, "phone": h.phone, "type": h.type,
            "specializations": specs, "beds_available": h.beds_total - h.beds_occupied,
            "beds_total": h.beds_total, "emergency_bay": h.emergency_bay,
            "lat": h.lat, "lng": h.lng,
            "eta_seconds": eta_sec, "distance_km": round(dist_km, 1),
            "composite_score": round(composite, 3),
        })
    scored.sort(key=lambda x: x["composite_score"], reverse=True)
    return scored[:3]