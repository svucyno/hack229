import os
import json
from datetime import datetime

from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey
)
from sqlalchemy.orm import sessionmaker, relationship

# Use compatible Base class
try:
    from sqlalchemy.orm import DeclarativeBase
    class Base(DeclarativeBase):
        pass
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medirush.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─────────────────────────────────────────
#  Models
# ─────────────────────────────────────────

class Patient(Base):
    __tablename__ = "patients"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(120), nullable=True)
    age                 = Column(Integer, nullable=True)
    sex                 = Column(String(10), nullable=True)
    blood_type          = Column(String(5), nullable=True)
    allergies           = Column(Text, default="[]")
    chronic_conditions  = Column(Text, default="[]")
    current_medications = Column(Text, default="[]")
    vitals_history      = Column(Text, default="[]")
    visit_history       = Column(Text, default="[]")

    emergencies = relationship("Emergency", back_populates="patient")


class Hospital(Base):
    __tablename__ = "hospitals"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(200), nullable=False)
    address         = Column(String(500), nullable=True)
    city            = Column(String(100), nullable=True)
    state           = Column(String(100), nullable=True)
    lat             = Column(Float, nullable=False)
    lng             = Column(Float, nullable=False)
    phone           = Column(String(30), nullable=True)
    type            = Column(String(50), nullable=True)
    specializations = Column(Text, default="[]")
    beds_total      = Column(Integer, default=100)
    beds_occupied   = Column(Integer, default=50)
    emergency_bay   = Column(Boolean, default=True)
    icu_beds        = Column(Integer, default=10)
    rating          = Column(Float, default=4.0)

    emergencies = relationship("Emergency", back_populates="hospital")
    staff       = relationship("HospitalStaff", back_populates="hospital")

    @property
    def beds_available(self):
        return self.beds_total - self.beds_occupied

    @property
    def specializations_list(self):
        try:
            return json.loads(self.specializations)
        except Exception:
            return []


class Emergency(Base):
    __tablename__ = "emergencies"

    id                  = Column(Integer, primary_key=True, index=True)
    patient_id          = Column(Integer, ForeignKey("patients.id"), nullable=True)
    hospital_id         = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    token               = Column(String(20), unique=True, nullable=False)
    severity            = Column(String(20), nullable=False)
    priority_score      = Column(Float, nullable=False)
    symptoms            = Column(Text, default="[]")
    suspected_condition = Column(String(200), nullable=True)
    status              = Column(String(30), default="PENDING")
    created_at          = Column(DateTime, default=datetime.utcnow)
    resolved_at         = Column(DateTime, nullable=True)

    patient  = relationship("Patient",  back_populates="emergencies")
    hospital = relationship("Hospital", back_populates="emergencies")


class HospitalStaff(Base):
    __tablename__ = "hospital_staff"

    id            = Column(Integer, primary_key=True, index=True)
    hospital_id   = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    name          = Column(String(120), nullable=False)
    role          = Column(String(60), nullable=True)
    email         = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)

    hospital = relationship("Hospital", back_populates="staff")


# ─────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
