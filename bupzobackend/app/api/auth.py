from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from uuid import UUID
import os
import json
from typing import Dict, Any

from .. import schemas, crud
from ..database import get_db
from ..schemas import Token, UserCreate, UserInDB
from ..crud import get_user_by_phone_number, create_user

# Firebase Admin SDK placeholder
# In a real implementation, this would be:
# from firebase_admin import auth, credentials, messaging
# from firebase_admin.exceptions import FirebaseError

# Mock Firebase Admin SDK for development
class MockFirebaseAuth:
    def __init__(self):
        self.verification_codes = {}

    def verify_phone_number(self, phone_number: str, code: str) -> bool:
        """Mock verification of phone number OTP"""
        if phone_number in self.verification_codes:
            return self.verification_codes[phone_number] == code
        return False

    def generate_verification_code(self, phone_number: str) -> str:
        """Generate a mock verification code"""
        code = '123456'  # Default code for testing
        self.verification_codes[phone_number] = code
        return code

    def send_verification_code(self, phone_number: str) -> Dict[str, Any]:
        """Mock sending verification code (in a real app, this would send SMS)"""
        code = self.generate_verification_code(phone_number)
        return {
            "success": True,
            "sessionInfo": {
                "recaptchaToken": "mock_token",
                "phoneNumber": phone_number
            },
            "verificationId": f"verification_id_{phone_number}"
        }

# Initialize mock Firebase Auth
firebase_auth = MockFirebaseAuth()

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class TokenData(BaseModel):
    phone_number: Optional[str] = None
    user_id: Optional[UUID] = None

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(db: Session, phone_number: str):
    return get_user_by_phone_number(db, phone_number)

def authenticate_user(db: Session, phone_number: str, password: str = None):
    user = get_user(db, phone_number)
    if not user:
        return False
    if password and not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=Token)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = get_user(db, user.phone_number)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Create new user
    db_user = create_user(db, user)

    # Generate and send OTP (mock implementation)
    otp_response = firebase_auth.send_verification_code(user.phone_number)

    # Create access token
    access_token = create_access_token(
        data={"phone_number": user.phone_number, "user_id": str(db_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(db_user.id),
        "otp_sent": True,
        "otp_response": otp_response
    }

@router.post("/login", response_model=Token)
def login_for_access_token(
    request: Request,
    phone_number: str = None,
    code: str = None,
    db: Session = Depends(get_db)
):
    # In a real implementation, we would verify the OTP from Firebase
    # For now, we'll use a mock verification
    if not firebase_auth.verify_phone_number(phone_number, code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or OTP"
        )

    # Check if user exists, if not create one
    user = get_user(db, phone_number)
    if not user:
        # Create a new user with just the phone number
        user = UserCreate(
            phone_number=phone_number,
            email=None,
            full_name=None,
            is_premium=False,
            signup_platform="WEB",
            privacy_policy_accepted=True,
            marketing_consent=True
        )
        user = create_user(db, user)

    # Create access token
    access_token = create_access_token(
        data={"phone_number": phone_number, "user_id": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id)
    }

@router.post("/webauthn/register")
def webauthn_register(
    request: Request,
    db: Session = Depends(get_db)
):
    # Placeholder for WebAuthn registration
    # In a real implementation, this would:
    # 1. Generate a new credential
    # 2. Store the credential in the database
    # 3. Return a challenge for the client to complete registration
    return {
        "success": True,
        "message": "WebAuthn registration endpoint",
        "challenge": "mock_challenge_123"
    }

@router.post("/webauthn/login")
def webauthn_login(
    request: Request,
    db: Session = Depends(get_db)
):
    # Placeholder for WebAuthn login
    # In a real implementation, this would:
    # 1. Verify the credential
    # 2. Return a JWT token if verification succeeds
    return {
        "success": True,
        "message": "WebAuthn login endpoint",
        "access_token": "mock_jwt_token_123"
    }

@router.get("/profile", response_model=UserInDB)
def read_users_profile(
    request: Request,
    db: Session = Depends(get_db)
):
    # Get the token from the request
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )

    # In a real implementation, we would decode the JWT token
    # For now, we'll use a mock user
    user_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04"  # Default user ID for testing

    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/profile")
def update_users_profile(
    request: Request,
    user_update: UserCreate,
    db: Session = Depends(get_db)
):
    # Placeholder for updating user profile
    # In a real implementation, this would:
    # 1. Get the user from the JWT token
    # 2. Update the user's profile with the provided data
    # 3. Return the updated user
    return {
        "success": True,
        "message": "User profile updated",
        "user": {
            "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
            "phone_number": user_update.phone_number,
            "full_name": user_update.full_name,
            "email": user_update.email
        }
    }