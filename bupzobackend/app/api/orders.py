from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db)
):
    # Check if user exists
    user = crud.get_user(db, user_id=order.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if seller exists
    seller = crud.get_user(db, user_id=order.seller_id)
    if not seller or not hasattr(seller, 'seller'):
        raise HTTPException(status_code=404, detail="Seller not found")

    # Check inventory for each product
    total_amount = Decimal('0.00')
    order_items = []

    for item in order.order_items:
        product = crud.get_product(db, product_id=item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {product.name}")

        # Calculate total amount
        total_amount += item.price * item.quantity

        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price
        })

    # Check if total amount matches order total_amount
    if abs(total_amount - order.total_amount) > Decimal('0.01'):
        raise HTTPException(status_code=400, detail="Order total amount does not match calculated amount")

    # Create order
    db_order = schemas.Order(
        id=UUID(),
        user_id=order.user_id,
        seller_id=order.seller_id,
        total_amount=order.total_amount,
        status="PENDING",
        tracking_id=None,
        order_source=order.order_source,
        shipping_partner=None,
        payment_gateway=order.payment_gateway,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        order_items=[]
    )

    # Create order in database
    db_order = crud.create_order(db, order=db_order, order_items=order_items)

    # Update product stock quantities
    for item in order_items:
        product = crud.get_product(db, product_id=item["product_id"])
        if product:
            product.stock_quantity -= item["quantity"]
            db.add(product)

    return db_order

def create_order_in_db(db: Session, order: schemas.Order, order_items: List[dict]):
    # Create order
    db_order = models.Order(
        id=order.id,
        user_id=order.user_id,
        seller_id=order.seller_id,
        total_amount=order.total_amount,
        status=order.status,
        tracking_id=order.tracking_id,
        order_source=order.order_source,
        shipping_partner=order.shipping_partner,
        payment_gateway=order.payment_gateway,
        created_at=order.created_at,
        updated_at=order.updated_at
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create order items
    for item in order_items:
        db_order_item = models.OrderItem(
            id=UUID(),
            order_id=db_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"],
            created_at=datetime.now()
        )
        db.add(db_order_item)

    db.commit()
    return db_order