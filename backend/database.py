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

from passlib.context import CryptContext
import json

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def init_db():
    Base.metadata.create_all(bind=engine)
    seed_data()

def seed_data():
    db = SessionLocal()
    try:
        # Seed Hospitals if empty
        if db.query(Hospital).count() == 0:
            hospitals = [
                Hospital(id="h1", name="Apollo Hospitals Tirupati", city="Tirupati", lat=13.6213, lng=79.4091, phone="0877-2266666", type="Private", beds_total=200, beds_occupied=178, specializations=json.dumps(["Cardiology","Neurology","Trauma"]), rating=4.8),
                Hospital(id="h2", name="SVIMS", city="Tirupati", lat=13.6372, lng=79.4200, phone="0877-2287777", type="Government", beds_total=850, beds_occupied=805, specializations=json.dumps(["Neurology","Cardiology","Oncology"]), rating=4.5),
                Hospital(id="h3", name="Ruia Government Hospital", city="Tirupati", lat=13.6356, lng=79.4105, phone="0877-2286666", type="Government", beds_total=400, beds_occupied=370, specializations=json.dumps(["General Medicine","Trauma"]), rating=4.2),
            ]
            db.add_all(hospitals)
            db.commit()
        
        # Seed Staff if empty
        if db.query(HospitalStaff).count() == 0:
            staff = HospitalStaff(
                id="s1", hospital_id="h1", name="Dr. Ramesh Kumar",
                role="Emergency Head", email="admin@hospital.com",
                password_hash=pwd_context.hash("admin123")
            )
            db.add(staff)
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()