from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from decimal import Decimal

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/wallet",
    tags=["wallet"]
)

@router.get("/balance", response_model=Decimal)
def read_wallet_balance(user_id: UUID, db: Session = Depends(get_db)):
    balance = crud.get_wallet_balance(db, user_id=user_id)
    return balance

@router.get("/transactions", response_model=List[schemas.WalletTransaction])
def read_wallet_transactions(
    user_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    transactions = crud.get_wallet_transactions(db, user_id=user_id, skip=skip, limit=limit)
    return transactions