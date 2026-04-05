# backend/routers/tracking.py

from fastapi import APIRouter
from websocket.manager import manager
import json

router = APIRouter(prefix="/api", tags=["Tracking"])

@router.patch("/tracking/{token}")
async def update_location(token: str, body: dict):
    lat = body.get("lat")
    lng = body.get("lng")
    hospital_id = body.get("hospital_id")
    message = json.dumps({
        "type": "LOCATION_UPDATE",
        "lat": lat, "lng": lng, "token": token
    })
    if hospital_id:
        await manager.broadcast_to_hospital(hospital_id, message)
    return {"status": "updated"}