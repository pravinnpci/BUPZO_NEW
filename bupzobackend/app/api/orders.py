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
class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: str

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    user_id: str
    seller_id: str
    total_amount: float
    currency: Optional[str] = "INR"
    exchange_rate: Optional[float] = 1.00
    status: Optional[str] = "PENDING"
    tracking_id: Optional[str] = None
    order_source: Optional[str] = "WEB"
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class OrderListItem(BaseModel):
    id: str
    user_id: str
    seller_id: str
    total_amount: float
    status: str
    created_at: datetime

# Utility functions
def get_db():
    return Database(os.getenv("DATABASE_URL"))

async def get_order(db: Database, order_id: str):
    query = """
    SELECT id, user_id, seller_id, total_amount, currency, exchange_rate,
           status, tracking_id, order_source, shipping_partner, payment_gateway,
           created_at, updated_at
    FROM orders
    WHERE id = :order_id
    """
    return await db.fetch_one(query=query, values={"order_id": order_id})

async def get_order_items(db: Database, order_id: str):
    query = """
    SELECT id, product_id, quantity, price
    FROM order_items
    WHERE order_id = :order_id
    """
    return await db.fetch_all(query=query, values={"order_id": order_id})

async def create_order(db: Database, order: OrderCreate):
    # Create order
    query = """
    INSERT INTO orders
    (id, user_id, seller_id, total_amount, currency, exchange_rate,
     status, tracking_id, order_source, shipping_partner, payment_gateway)
    VALUES
    (uuid_generate_v4(), :user_id, :seller_id, :total_amount, :currency,
     :exchange_rate, :status, :tracking_id, :order_source, :shipping_partner, :payment_gateway)
    RETURNING id
    """
    values = order.dict(exclude={"items"})
    order_id = await db.fetch_val(query=query, values=values)

    # Create order items
    for item in order.items:
        item_query = """
        INSERT INTO order_items
        (id, order_id, product_id, quantity, price)
        VALUES
        (uuid_generate_v4(), :order_id, :product_id, :quantity, :price)
        """
        await db.execute(item_query, values={
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price
        })

    return order_id

async def get_orders(
    db: Database,
    user_id: Optional[str] = None,
    seller_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
):
    query = """
    SELECT id, user_id, seller_id, total_amount, status, created_at
    FROM orders
    WHERE 1=1
    """
    values = {}

    if user_id:
        query += " AND user_id = :user_id"
        values["user_id"] = user_id

    if seller_id:
        query += " AND seller_id = :seller_id"
        values["seller_id"] = seller_id

    if status:
        query += " AND status = :status"
        values["status"] = status

    query += " ORDER BY created_at DESC LIMIT :limit"
    values["limit"] = limit

    return await db.fetch_all(query=query, values=values)

# Routes
@router.post("/", response_model=Order)
async def create_order_endpoint(
    order: OrderCreate,
    db: Database = Depends(get_db)
):
    order_id = await create_order(db, order)
    return await get_order(db, order_id)

@router.get("/", response_model=List[OrderListItem])
async def read_orders(
    user_id: Optional[str] = None,
    seller_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    db: Database = Depends(get_db)
):
    return await get_orders(db, user_id, seller_id, status, limit)

@router.get("/{order_id}", response_model=Order)
async def read_order(
    order_id: str,
    db: Database = Depends(get_db)
):
    order = await get_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/{order_id}/items", response_model=List[OrderItem])
async def read_order_items(
    order_id: str,
    db: Database = Depends(get_db)
):
    items = await get_order_items(db, order_id)
    if not items:
        raise HTTPException(status_code=404, detail="Order items not found")
    return items

@router.put("/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    order: OrderBase,
    db: Database = Depends(get_db)
):
    query = """
    UPDATE orders
    SET
        user_id = COALESCE(:user_id, user_id),
        seller_id = COALESCE(:seller_id, seller_id),
        total_amount = COALESCE(:total_amount, total_amount),
        currency = COALESCE(:currency, currency),
        exchange_rate = COALESCE(:exchange_rate, exchange_rate),
        status = COALESCE(:status, status),
        tracking_id = COALESCE(:tracking_id, tracking_id),
        order_source = COALESCE(:order_source, order_source),
        shipping_partner = COALESCE(:shipping_partner, shipping_partner),
        payment_gateway = COALESCE(:payment_gateway, payment_gateway),
        updated_at = NOW()
    WHERE id = :order_id
    RETURNING id
    """
    values = order.dict()
    values["order_id"] = order_id
    await db.execute(query=query, values=values)
    return await get_order(db, order_id)

@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    db: Database = Depends(get_db)
):
    query = """
    UPDATE orders
    SET status = 'CANCELLED', updated_at = NOW()
    WHERE id = :order_id
    RETURNING id
    """
    await db.execute(query=query, values={"order_id": order_id})
    return {"message": "Order cancelled successfully"}