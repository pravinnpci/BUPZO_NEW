"""
BUPZO Auth Router
Handles OTP-based authentication and token generation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import OTPRequest, OTPVerify, TokenResponse
from typing import Optional
import uuid

router = APIRouter()

# Mock OTP storage (in-memory for demo purposes)
mock_otp_store = {}

# Mock OTP generation and verification
def generate_otp() -> str:
    """Generate a random 4-digit OTP"""
    return "1234"  # Fixed for demo purposes

@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(otp_request: OTPRequest, db: Session = Depends(get_db)):
    """
    Request an OTP for phone number authentication
    """
    # Generate and store OTP
    otp = generate_otp()
    mock_otp_store[otp_request.phone] = otp

    # Return success response
    return {"message": "OTP sent successfully", "phone": otp_request.phone}

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(otp_verify: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify OTP and generate access token
    """
    # Check if OTP exists and is valid
    if otp_verify.phone not in mock_otp_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not found"
        )

    if mock_otp_store[otp_verify.phone] != otp_verify.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    # Check if user exists, create if not
    user = db.query(User).filter(User.phone == otp_verify.phone).first()
    if not user:
        # Create a new user
        user = User(
            id=uuid.uuid4(),
            phone=otp_verify.phone,
            email=f"{otp_verify.phone}@example.com",
            is_premium=False,
            signup_platform="WEB",
            wallet_balance=0,
            privacy_accepted=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate token response
    token_response = TokenResponse(
        access_token="mock_token_for_demo",
        token_type="bearer",
        user_id=user.id,
        role="Customer" if not user.is_premium else "Premium Customer"
    )

    return token_response

@router.get("/user", status_code=status.HTTP_200_OK)
async def get_user(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get user details (for demo purposes)
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id": str(user.id),
        "phone": user.phone,
        "email": user.email,
        "is_premium": user.is_premium,
        "wallet_balance": user.wallet_balance
    }