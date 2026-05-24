"""
BUPZO Wallet Router
Handles wallet balance and transaction operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, WalletTransaction
from schemas import WalletTransactionCreate, WalletTransactionResponse

router = APIRouter()

@router.get("/balance", status_code=status.HTTP_200_OK)
async def get_wallet_balance(user_id: str, db: Session = Depends(get_db)):
    """
    Get user's wallet balance
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"wallet_balance": user.wallet_balance}

@router.post("/transactions", status_code=status.HTTP_201_CREATED, response_model=WalletTransactionResponse)
async def create_transaction(transaction: WalletTransactionCreate, db: Session = Depends(get_db)):
    """
    Create a new wallet transaction
    """
    db_transaction = WalletTransaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Update user's wallet balance
    user = db.query(User).filter(User.id == transaction.user_id).first()
    if user:
        user.wallet_balance += transaction.amount
        db.commit()
        db.refresh(user)

    return db_transaction

@router.get("/transactions", status_code=status.HTTP_200_OK, response_model=List[WalletTransactionResponse])
async def get_transactions(user_id: str, db: Session = Depends(get_db)):
    """
    Get all wallet transactions for a user
    """
    transactions = db.query(WalletTransaction).filter(WalletTransaction.user_id == user_id).all()
    return transactions

@router.get("/transactions/{transaction_id}", status_code=status.HTTP_200_OK, response_model=WalletTransactionResponse)
async def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """
    Get a specific wallet transaction
    """
    transaction = db.query(WalletTransaction).filter(WalletTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction