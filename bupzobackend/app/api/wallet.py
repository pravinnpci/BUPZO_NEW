from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from databases import Database
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Router
router = APIRouter()

# Models
class WalletTransactionBase(BaseModel):
    user_id: str
    amount: float
    transaction_type: str
    description: Optional[str] = None

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransaction(WalletTransactionBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True

class WalletBalance(BaseModel):
    user_id: str
    balance: float

# Utility functions
def get_db():
    return Database(os.getenv("DATABASE_URL"))

async def get_wallet_balance(db: Database, user_id: str):
    query = """
    SELECT wallet_balance
    FROM users
    WHERE id = :user_id
    """
    return await db.fetch_one(query=query, values={"user_id": user_id})

async def get_wallet_transactions(db: Database, user_id: str, limit: int = 100):
    query = """
    SELECT id, user_id, amount, transaction_type, description, created_at
    FROM wallet_transactions
    WHERE user_id = :user_id
    ORDER BY created_at DESC
    LIMIT :limit
    """
    return await db.fetch_all(query=query, values={"user_id": user_id, "limit": limit})

async def create_wallet_transaction(db: Database, transaction: WalletTransactionCreate):
    query = """
    INSERT INTO wallet_transactions
    (id, user_id, amount, transaction_type, description, created_at)
    VALUES
    (uuid_generate_v4(), :user_id, :amount, :transaction_type, :description, NOW())
    RETURNING id
    """
    values = transaction.dict()
    transaction_id = await db.fetch_val(query=query, values=values)
    return transaction_id

# Routes
@router.get("/balance", response_model=WalletBalance)
async def get_balance(
    user_id: str,
    db: Database = Depends(get_db)
):
    balance = await get_wallet_balance(db, user_id)
    if balance is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "balance": float(balance["wallet_balance"])}

@router.get("/transactions", response_model=List[WalletTransaction])
async def get_transactions(
    user_id: str,
    limit: int = 100,
    db: Database = Depends(get_db)
):
    return await get_wallet_transactions(db, user_id, limit)

@router.post("/transactions", response_model=WalletTransaction)
async def create_transaction(
    transaction: WalletTransactionCreate,
    db: Database = Depends(get_db)
):
    transaction_id = await create_wallet_transaction(db, transaction)

    # Update user's wallet balance
    query = """
    UPDATE users
    SET wallet_balance = wallet_balance + :amount
    WHERE id = :user_id
    RETURNING wallet_balance
    """
    await db.execute(query=query, values={"user_id": transaction.user_id, "amount": transaction.amount})

    return await get_wallet_transaction(db, transaction_id)

async def get_wallet_transaction(db: Database, transaction_id: str):
    query = """
    SELECT id, user_id, amount, transaction_type, description, created_at
    FROM wallet_transactions
    WHERE id = :transaction_id
    """
    return await db.fetch_one(query=query, values={"transaction_id": transaction_id})

@router.post("/add-referral-bonus")
async def add_referral_bonus(
    user_id: str,
    amount: float,
    db: Database = Depends(get_db)
):
    # Create transaction
    transaction = WalletTransactionCreate(
        user_id=user_id,
        amount=amount,
        transaction_type="REFERRAL",
        description="Referral bonus"
    )
    await create_wallet_transaction(db, transaction)

    # Update user's wallet balance
    query = """
    UPDATE users
    SET wallet_balance = wallet_balance + :amount
    WHERE id = :user_id
    RETURNING wallet_balance
    """
    await db.execute(query=query, values={"user_id": user_id, "amount": amount})

    return {"message": "Referral bonus added successfully", "amount": amount}

@router.post("/admin-adjustment")
async def admin_wallet_adjustment(
    user_id: str,
    amount: float,
    db: Database = Depends(get_db)
):
    # Create transaction
    transaction = WalletTransactionCreate(
        user_id=user_id,
        amount=amount,
        transaction_type="ADMIN_ADJUSTMENT",
        description="Admin wallet adjustment"
    )
    await create_wallet_transaction(db, transaction)

    # Update user's wallet balance
    query = """
    UPDATE users
    SET wallet_balance = wallet_balance + :amount
    WHERE id = :user_id
    RETURNING wallet_balance
    """
    await db.execute(query=query, values={"user_id": user_id, "amount": amount})

    return {"message": "Wallet adjusted successfully", "amount": amount}