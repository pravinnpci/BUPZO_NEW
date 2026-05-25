from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
import os

# Fix the import path
from .database import engine, SessionLocal
from .schemas import User, UserCreate, Product, ProductCreate, Token, OrderCreate, Order
from .crud import create_user, get_user_by_phone_number, get_products, get_product, create_product, get_wallet_balance, get_wallet_transactions, create_order
from .routers import auth, products, wallet
from .app.api import orders, payments

# Create tables
from . import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(wallet.router)
app.include_router(orders.router)
app.include_router(payments.router)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to BUPZO API"}

@app.get("/products/")
def read_products(skip: int = 0, limit: int = 100, category_id: UUID = None, seller_id: UUID = None,
                  is_combo: bool = None, price_min: Decimal = None, price_max: Decimal = None,
                  sort_by: str = None, db: Session = Depends(get_db)):
    filters = {}
    if category_id:
        filters['category_id'] = category_id
    if seller_id:
        filters['seller_id'] = seller_id
    if is_combo is not None:
        filters['is_combo'] = is_combo
    if price_min:
        filters['price_min'] = price_min
    if price_max:
        filters['price_max'] = price_max
    if sort_by:
        filters['sort_by'] = sort_by

    products = get_products(db, skip=skip, limit=limit, **filters)
    return products

@app.get("/products/{product_id}")
def read_product(product_id: UUID, db: Session = Depends(get_db)):
    product = get_product(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product