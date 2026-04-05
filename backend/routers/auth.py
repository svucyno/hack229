from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, HospitalStaff
from pydantic import BaseModel
import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "medirush-dev-secret-key-2024")
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str
    password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=480)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    staff = db.query(HospitalStaff).filter(HospitalStaff.email == req.email).first()
    if not staff:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(req.password, staff.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(
        data={"sub": staff.email, "hospital_id": staff.hospital_id, "role": staff.role}
    )
    return {"access_token": access_token, "token_type": "bearer", "hospital_id": staff.hospital_id}
