from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

@router.post("/initiate", response_model=dict)
def initiate_payment(
    order_id: UUID,
    amount: Decimal,
    gateway_name: str,
    db: Session = Depends(get_db)
):
    """
    Initiate a payment for an order.
    In a real implementation, this would create a payment request with the selected gateway.
    """
    # Check if order exists
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if order is already paid
    payment_log = db.query(models.PaymentLog).filter(
        models.PaymentLog.order_id == order_id
    ).first()
    if payment_log and payment_log.status == "SUCCESS":
        raise HTTPException(status_code=400, detail="Order already paid")

    # In a real implementation, this would create a payment request with the selected gateway
    # For now, we'll just simulate a successful payment

    # Create payment log
    payment_log = models.PaymentLog(
        id=UUID(),
        order_id=order_id,
        gateway_name=gateway_name,
        amount=amount,
        status="SUCCESS",  # Simulating success
        transaction_date=datetime.now(),
        gateway_transaction_id=f"TXN-{order_id}-{datetime.now().timestamp()}"
    )
    db.add(payment_log)

    # Update order status
    order.status = "PROCESSING"
    db.add(order)

    db.commit()

    return {
        "success": True,
        "message": f"Payment initiated successfully with {gateway_name}",
        "gateway_transaction_id": payment_log.gateway_transaction_id,
        "order_id": order_id
    }

@router.post("/webhook/{gateway_name}", response_model=dict)
def payment_webhook(
    gateway_name: str,
    db: Session = Depends(get_db)
):
    """
    Handle payment webhook from a payment gateway.
    In a real implementation, this would receive payment status updates.
    """
    # In a real implementation, this would:
    # 1. Verify the webhook signature
    # 2. Parse the payment status
    # 3. Update the order and payment log accordingly

    # For now, we'll simulate a successful payment update
    return {
        "success": True,
        "message": f"Payment webhook received from {gateway_name}",
        "status": "SUCCESS"
    }