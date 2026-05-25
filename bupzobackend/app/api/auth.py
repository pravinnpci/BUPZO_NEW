from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Annotated, Optional
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from .. import schemas, crud
from ..database import get_db
from ..schemas import UserCreate, User, Token, UserInDB
from ..models import User as UserModel

# JWT Configuration
SECRET_KEY = "your-secret-key-here"  # In production, use a proper secret key from environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
        token_data = schemas.TokenData(phone_number=phone_number)
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_phone_number(db, phone_number=token_data.phone_number)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user with this phone number already exists
    db_user = crud.get_user_by_phone_number(db, phone_number=user.phone_number)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Create new user
    created_user = crud.create_user(db, user=user)
    return created_user

@router.post("/login", response_model=Token)
def login_user(
    phone_number: str = Body(...),
    db: Session = Depends(get_db)
):
    # In a real implementation, this would verify an OTP sent to the phone number
    # For now, we'll just check if the user exists and create a token
    user = crud.get_user_by_phone_number(db, phone_number=phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not registered"
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_number, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/webauthn/register", response_model=dict)
def register_webauthn(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    # Placeholder for WebAuthn registration
    # In a real implementation, this would:
    # 1. Generate a new credential
    # 2. Store the credential in the database
    # 3. Return a challenge for the client to complete the registration
    return {
        "status": "success",
        "message": f"WebAuthn registration initiated for user {user_id}",
        "next_step": "Complete WebAuthn registration in the frontend"
    }

@router.post("/webauthn/login", response_model=Token)
def login_webauthn(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    # Placeholder for WebAuthn login
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_number, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=User)
def read_users_profile(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user

@router.put("/profile", response_model=User)
def update_users_profile(
    user_update: UserCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    # In a real implementation, this would update the user's profile
    # For now, we'll just return the current user
    return current_user