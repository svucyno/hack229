# backend/database.py

from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/medirush.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Patient table
class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    sex = Column(String)
    blood_type = Column(String)
    allergies = Column(Text)           # comma-separated
    chronic_conditions = Column(Text)
    current_medications = Column(Text)
    vitals_history = Column(Text)      # JSON string
    visit_history = Column(Text)       # JSON string

# Hospital table
class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    phone = Column(String)
    type = Column(String)
    specializations = Column(Text)     # JSON string
    beds_total = Column(Integer)
    beds_occupied = Column(Integer)
    emergency_bay = Column(Boolean, default=True)
    icu_beds = Column(Integer)
    rating = Column(Float)

# Emergency table
class Emergency(Base):
    __tablename__ = "emergencies"
    id = Column(String, primary_key=True)
    patient_id = Column(String)
    hospital_id = Column(String)
    token = Column(String)
    severity = Column(String)
    priority_score = Column(Float)
    symptoms = Column(Text)
    suspected_condition = Column(String)
    status = Column(String, default="active")
    created_at = Column(String)
    resolved_at = Column(String)

# Staff table
class HospitalStaff(Base):
    __tablename__ = "hospital_staff"
    id = Column(String, primary_key=True)
    hospital_id = Column(String)
    name = Column(String)
    role = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()