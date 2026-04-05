"""routers/tracking.py — Location tracking stub (Phase 2 WebSocket)"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Tracking"])


class LocationUpdate(BaseModel):
    emergency_id: int
    lat: float
    lng: float


@router.post("/location_update")
def update_location(body: LocationUpdate):
    """
    Stub — real-time location push via WebSocket in Phase 2.
    """
    return {
        "success": True,
        "message": "Location received",
        "emergency_id": body.emergency_id,
        "lat": body.lat,
        "lng": body.lng,
    }
