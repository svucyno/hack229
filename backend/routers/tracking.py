from fastapi import APIRouter
from pydantic import BaseModel
from websocket.manager import manager

router = APIRouter(prefix="/api", tags=["Tracking"])

class LocationUpdate(BaseModel):
    token: str
    lat: float
    lng: float

@router.patch("/tracking/{token}")
async def update_tracking(token: str, body: LocationUpdate):
    """
    Update patient location and broadcast to WebSocket.
    """
    # In a full app, we'd update the DB. For Phase 2, broadcasting is sufficient.
    
    update_msg = {
        "type": "LOCATION_UPDATE",
        "token": body.token,
        "lat": body.lat,
        "lng": body.lng
    }
    
    await manager.broadcast_to_tracking(token, update_msg)
    
    return {"status": "updated", "lat": body.lat, "lng": body.lng}
