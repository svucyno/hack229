# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import symptoms, hospitals, notifications, tracking, patients, auth
from database import init_db

app = FastAPI(title="MediRush API", version="1.0.0")

# Allow React apps on ports 3000 and 3001 to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(symptoms.router)
app.include_router(hospitals.router)
app.include_router(notifications.router)
app.include_router(tracking.router)
app.include_router(patients.router)
app.include_router(auth.router)

# Health check endpoint — Docker uses this to verify backend is alive
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MediRush Backend"}

# Initialize database tables on startup
@app.on_event("startup")
async def startup():
    init_db()
# Add these to backend/main.py (after the existing routes)

from fastapi import WebSocket, WebSocketDisconnect
from websocket.manager import manager
import json

@app.websocket("/ws/hospital/{hospital_id}")
async def hospital_ws(websocket: WebSocket, hospital_id: str):
    await manager.connect_hospital(websocket, hospital_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "DOCTOR_ACCEPTED":
                token = msg.get("token")
                await manager.broadcast_to_patient(token, json.dumps(msg))
    except WebSocketDisconnect:
        manager.disconnect_hospital(websocket, hospital_id)

@app.websocket("/ws/patient/{token}")
async def patient_ws(websocket: WebSocket, token: str):
    await manager.connect_patient(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "LOCATION_UPDATE":
                hospital_id = msg.get("hospital_id")
                await manager.broadcast_to_hospital(hospital_id, json.dumps(msg))
    except WebSocketDisconnect:
        manager.disconnect_patient(websocket, token)