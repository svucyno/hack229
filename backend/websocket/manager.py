"""websocket/manager.py — WebSocket connection manager (Phase 2)"""

from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections.
    Phase 2 will use this to push EMERGENCY_ALERT and DOCTOR_ACCEPTED events.
    """

    def __init__(self):
        # hospital_id → list of connected WebSocket clients (hospital dashboard)
        self.hospital_connections: Dict[int, List[WebSocket]] = {}
        # patient emergency_id → WebSocket (patient app)
        self.patient_connections: Dict[int, WebSocket] = {}

    async def connect_hospital(self, hospital_id: int, websocket: WebSocket):
        await websocket.accept()
        if hospital_id not in self.hospital_connections:
            self.hospital_connections[hospital_id] = []
        self.hospital_connections[hospital_id].append(websocket)

    async def connect_patient(self, emergency_id: int, websocket: WebSocket):
        await websocket.accept()
        self.patient_connections[emergency_id] = websocket

    def disconnect_hospital(self, hospital_id: int, websocket: WebSocket):
        if hospital_id in self.hospital_connections:
            self.hospital_connections[hospital_id].remove(websocket)

    def disconnect_patient(self, emergency_id: int):
        self.patient_connections.pop(emergency_id, None)

    async def broadcast_to_hospital(self, hospital_id: int, message: dict):
        import json
        connections = self.hospital_connections.get(hospital_id, [])
        disconnected = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            connections.remove(ws)

    async def send_to_patient(self, emergency_id: int, message: dict):
        import json
        ws = self.patient_connections.get(emergency_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                self.disconnect_patient(emergency_id)


# Singleton instance used across the app
manager = ConnectionManager()
