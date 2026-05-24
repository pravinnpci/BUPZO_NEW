from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

router = APIRouter(prefix="/api/orders", tags=["orders"])

# Database setup for local PostgreSQL
DATABASE_URL = "postgresql://postgres:postgres@bupzo-db-1:5432/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define Order models
class DBOrder(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, nullable=False)
    order_date = Column(String, default=datetime.now().isoformat())  # Using String for simplicity
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(String, default=datetime.now().isoformat())  # Using String for simplicity
    updated_at = Column(String, default=datetime.now().isoformat())  # Using String for simplicity

class DBOrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_order = Column(Float, nullable=False)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItem]
    total_amount: float

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    order_date: datetime
    total_amount: float
    status: str
    created_at: datetime
    updated_at: datetime

@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: SessionLocal = Depends(get_db)):
    """Create a new order with order items"""
    try:
        # Create the order
        db_order = DBOrder(
            customer_id=order.customer_id,
            total_amount=order.total_amount,
            status="Pending"
            # order_date, created_at, updated_at will use defaults
        )

        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        order_id = db_order.id

        # Create order items
        for item in order.items:
            db_item = DBOrderItem(
                order_id=order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_order=item.price
            )
            db.add(db_item)

        db.commit()

        return {
            "id": db_order.id,
            "customer_id": db_order.customer_id,
            "order_date": datetime.now(),  # Use current time
            "total_amount": float(db_order.total_amount),
            "status": db_order.status,
            "created_at": datetime.now(),  # Use current time
            "updated_at": datetime.now()   # Use current time
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
async def get_customer_orders(customer_id: int, db: SessionLocal = Depends(get_db)):
    """Get all orders for a specific customer"""
    try:
        orders = db.query(DBOrder).filter(DBOrder.customer_id == customer_id).all()

        return [{
            "id": o.id,
            "customer_id": o.customer_id,
            "order_date": datetime.now(),  # Use current time
            "total_amount": float(o.total_amount),
            "status": o.status,
            "created_at": datetime.now(),  # Use current time
            "updated_at": datetime.now()   # Use current time
        } for o in orders]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: SessionLocal = Depends(get_db)):
    """Get a specific order by ID"""
    try:
        order = db.query(DBOrder).filter(DBOrder.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        return {
            "id": order.id,
            "customer_id": order.customer_id,
            "order_date": datetime.now(),  # Use current time
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": datetime.now(),  # Use current time
            "updated_at": datetime.now()   # Use current time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{order_id}/status")
async def update_order_status(order_id: int, status: str, db: SessionLocal = Depends(get_db)):
    """Update order status"""
    try:
        valid_statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")

        order = db.query(DBOrder).filter(DBOrder.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order.status = status
        # updated_at will be handled by default

        db.commit()
        db.refresh(order)

        return {"success": True, "new_status": status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}/items")
async def get_order_items(order_id: int, db: SessionLocal = Depends(get_db)):
    """Get all items for a specific order"""
    try:
        items = db.query(DBOrderItem).filter(DBOrderItem.order_id == order_id).all()

        return [{
            "id": item.id,
            "order_id": item.order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_order": float(item.price_at_order)
        } for item in items]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))