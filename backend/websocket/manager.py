from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # /ws/hospital/{hospital_id} -> list of websockets (dashboard instances)
        self.active_hospitals: Dict[int, List[WebSocket]] = {}
        
        # /ws/tracking/{token} -> list of websockets (dashboard map layers exploring this token)
        self.active_trackers: Dict[str, List[WebSocket]] = {}
        
        # /ws/patient/{token} -> WebSocket (the single patient app instance waiting for DOCTOR_ACCEPTED)
        self.active_patients: Dict[str, WebSocket] = {}

    # Hospital Channel
    async def connect_hospital(self, websocket: WebSocket, hospital_id: int):
        await websocket.accept()
        if hospital_id not in self.active_hospitals:
            self.active_hospitals[hospital_id] = []
        self.active_hospitals[hospital_id].append(websocket)

    def disconnect_hospital(self, websocket: WebSocket, hospital_id: int):
        if hospital_id in self.active_hospitals:
            if websocket in self.active_hospitals[hospital_id]:
                self.active_hospitals[hospital_id].remove(websocket)

    async def broadcast_to_hospital(self, hospital_id: int, message: dict):
        connections = self.active_hospitals.get(hospital_id, [])
        dead_connections = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(ws)
        for dead in dead_connections:
            self.disconnect_hospital(dead, hospital_id)

    # Tracking Channel (Location Updates)
    async def connect_tracking(self, websocket: WebSocket, token: str):
        await websocket.accept()
        if token not in self.active_trackers:
            self.active_trackers[token] = []
        self.active_trackers[token].append(websocket)

    def disconnect_tracking(self, websocket: WebSocket, token: str):
        if token in self.active_trackers:
            if websocket in self.active_trackers[token]:
                self.active_trackers[token].remove(websocket)

    async def broadcast_to_tracking(self, token: str, message: dict):
        connections = self.active_trackers.get(token, [])
        dead_connections = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(ws)
        for dead in dead_connections:
            self.disconnect_tracking(dead, token)

    # Patient Channel (Confirmation)
    async def connect_patient(self, websocket: WebSocket, token: str):
        await websocket.accept()
        self.active_patients[token] = websocket

    def disconnect_patient(self, token: str):
        self.active_patients.pop(token, None)

    async def send_to_patient(self, token: str, message: dict):
        ws = self.active_patients.get(token)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                self.disconnect_patient(token)

manager = ConnectionManager()
