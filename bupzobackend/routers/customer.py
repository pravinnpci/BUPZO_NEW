"""
BUPZO Customer Router
Handles customer-specific endpoints for orders and tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Order, OrderItem, ShippingLog
from schemas import OrderResponse, TrackingResponse
from datetime import datetime

router = APIRouter()

@router.get("/orders", status_code=status.HTTP_200_OK, response_model=List[OrderResponse])
async def get_customer_orders(user_id: str, db: Session = Depends(get_db)):
    """
    Get all orders for a customer
    """
    # Get customer user
    customer = db.query(User).filter(User.id == user_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Get all orders for this customer
    orders = db.query(Order).filter(Order.user_id == user_id).all()

    # Prepare order responses with items
    order_responses = []
    for order in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items = [{
            "name": item.product.name,
            "quantity": item.quantity,
            "price": float(item.price_at_purchase)
        } for item in order_items]

        order_responses.append({
            "id": str(order.id),
            "date": order.created_at.strftime("%Y-%m-%d"),
            "status": order.status,
            "items": items,
            "total": float(order.total_amount)
        })

    return order_responses

@router.get("/tracking", status_code=status.HTTP_200_OK, response_model=List[TrackingResponse])
async def get_order_tracking(user_id: str, db: Session = Depends(get_db)):
    """
    Get tracking information for customer orders
    """
    # Get customer user
    customer = db.query(User).filter(User.id == user_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Get all orders for this customer
    orders = db.query(Order).filter(Order.user_id == user_id).all()

    # Prepare tracking responses
    tracking_responses = []
    for order in orders:
        # Get the latest shipping log for this order
        shipping_log = db.query(ShippingLog).filter(ShippingLog.order_id == order.id).order_by(ShippingLog.created_at.desc()).first()

        if shipping_log:
            tracking_responses.append({
                "id": f"TRK-{order.id[:4]}{len(tracking_responses) + 1}",
                "orderId": str(order.id),
                "status": shipping_log.status,
                "location": shipping_log.partner if shipping_log.partner else "Unknown",
                "eta": shipping_log.status == "Delivered" ? f"Delivered on {order.created_at.strftime('%Y-%m-%d')}" : f"Expected on {datetime.now().strftime('%Y-%m-%d')}"
            })

    # If no shipping logs, create mock tracking for each order
    if not tracking_responses and orders:
        for order in orders:
            tracking_responses.append({
                "id": f"TRK-{order.id[:4]}{len(tracking_responses) + 1}",
                "orderId": str(order.id),
                "status": "Processing",
                "location": "Warehouse",
                "eta": f"Expected on {datetime.now().strftime('%Y-%m-%d')}"
            })

    return tracking_responses