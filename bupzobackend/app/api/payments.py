from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from databases import Database
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Router
router = APIRouter()

# Models
class PaymentLogBase(BaseModel):
    order_id: str
    gateway_name: str
    amount: float
    status: str
    gateway_transaction_id: Optional[str] = None

class PaymentLogCreate(PaymentLogBase):
    pass

class PaymentLog(PaymentLogBase):
    id: str
    transaction_date: datetime

    class Config:
        orm_mode = True

# Utility functions
def get_db():
    return Database(os.getenv("DATABASE_URL"))

async def get_payment_log(db: Database, payment_id: str):
    query = """
    SELECT id, order_id, gateway_name, amount, status, transaction_date, gateway_transaction_id
    FROM payment_logs
    WHERE id = :payment_id
    """
    return await db.fetch_one(query=query, values={"payment_id": payment_id})

async def create_payment_log(db: Database, payment: PaymentLogCreate):
    query = """
    INSERT INTO payment_logs
    (id, order_id, gateway_name, amount, status, transaction_date, gateway_transaction_id)
    VALUES
    (uuid_generate_v4(), :order_id, :gateway_name, :amount, :status, NOW(), :gateway_transaction_id)
    RETURNING id
    """
    values = payment.dict()
    payment_id = await db.fetch_val(query=query, values=values)
    return payment_id

# Routes
@router.post("/", response_model=PaymentLog)
async def create_payment(
    payment: PaymentLogCreate,
    db: Database = Depends(get_db)
):
    payment_id = await create_payment_log(db, payment)
    return await get_payment_log(db, payment_id)

@router.get("/{payment_id}", response_model=PaymentLog)
async def read_payment(
    payment_id: str,
    db: Database = Depends(get_db)
):
    payment = await get_payment_log(db, payment_id)
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment log not found")
    return payment

@router.post("/webhook")
async def payment_webhook(
    gateway_name: str,
    order_id: str,
    status: str,
    amount: float,
    transaction_id: Optional[str] = None,
    db: Database = Depends(get_db)
):
    # Create or update payment log
    payment = PaymentLogCreate(
        order_id=order_id,
        gateway_name=gateway_name,
        amount=amount,
        status=status,
        gateway_transaction_id=transaction_id
    )

    # Check if payment log already exists
    query = """
    SELECT id FROM payment_logs
    WHERE order_id = :order_id AND gateway_name = :gateway_name
    """
    existing_payment = await db.fetch_one(query=query, values={
        "order_id": order_id,
        "gateway_name": gateway_name
    })

    if existing_payment:
        # Update existing payment log
        update_query = """
        UPDATE payment_logs
        SET status = :status, gateway_transaction_id = :gateway_transaction_id
        WHERE id = :payment_id
        RETURNING id
        """
        await db.execute(update_query, values={
            "status": status,
            "gateway_transaction_id": transaction_id,
            "payment_id": existing_payment["id"]
        })
    else:
        # Create new payment log
        await create_payment_log(db, payment)

    return {"message": f"Payment {status} processed successfully"}