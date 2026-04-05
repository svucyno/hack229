# backend/websocket/manager.py

from fastapi import WebSocket
from typing import dict

class ConnectionManager:
    def __init__(self):
        # hospital_id -> list of websocket connections
        self.hospital_connections: dict[str, list[WebSocket]] = {}
        # token -> list of websocket connections (for patient tracking)
        self.patient_connections: dict[str, list[WebSocket]] = {}

    async def connect_hospital(self, websocket: WebSocket, hospital_id: str):
        await websocket.accept()
        self.hospital_connections.setdefault(hospital_id, []).append(websocket)

    async def connect_patient(self, websocket: WebSocket, token: str):
        await websocket.accept()
        self.patient_connections.setdefault(token, []).append(websocket)

    def disconnect_hospital(self, websocket: WebSocket, hospital_id: str):
        conns = self.hospital_connections.get(hospital_id, [])
        if websocket in conns:
            conns.remove(websocket)

    def disconnect_patient(self, websocket: WebSocket, token: str):
        conns = self.patient_connections.get(token, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast_to_hospital(self, hospital_id: str, message: str):
        for ws in self.hospital_connections.get(hospital_id, []):
            try:
                await ws.send_text(message)
            except:
                pass

    async def broadcast_to_patient(self, token: str, message: str):
        for ws in self.patient_connections.get(token, []):
            try:
                await ws.send_text(message)
            except:
                pass

manager = ConnectionManager()