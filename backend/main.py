"""
main.py — MediRush FastAPI Application Entry Point
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
from routers import symptoms, hospitals, patients, notifications, tracking, auth
from websocket.manager import manager

app = FastAPI(
    title="MediRush API",
    description="AI-powered emergency healthcare response system",
    version="1.0.0",
)

# ─────────────────────────────────────────
#  CORS — allow patient-app and dashboard
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
#  Routers
# ─────────────────────────────────────────
app.include_router(symptoms.router)
app.include_router(hospitals.router)
app.include_router(patients.router)
app.include_router(notifications.router)
app.include_router(tracking.router)
app.include_router(auth.router)

# ─────────────────────────────────────────
#  WebSockets
# ─────────────────────────────────────────
@app.websocket("/ws/hospital/{hospital_id}")
async def websocket_hospital(websocket: WebSocket, hospital_id: int):
    await manager.connect_hospital(websocket, hospital_id)
    try:
        while True:
            # We don't expect messages from the hospital dashboard currently, just keeping connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_hospital(websocket, hospital_id)

@app.websocket("/ws/tracking/{token}")
async def websocket_tracking(websocket: WebSocket, token: str):
    await manager.connect_tracking(websocket, token)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_tracking(websocket, token)

@app.websocket("/ws/patient/{token}")
async def websocket_patient(websocket: WebSocket, token: str):
    await manager.connect_patient(websocket, token)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_patient(token)


# ─────────────────────────────────────────
#  Startup: init DB and seed
# ─────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        from data.seed_hospitals import seed
        seed(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "service": "MediRush API",
        "version": "1.0.0",
        "status":  "running",
        "docs":    "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
