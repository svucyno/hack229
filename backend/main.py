"""
main.py — MediRush FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
from routers import symptoms, hospitals, patients, notifications, tracking

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
