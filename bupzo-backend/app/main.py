from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncpg
from dotenv import load_dotenv
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from uuid import UUID, uuid4

load_dotenv()

app = FastAPI(title="BUPZO Core API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003", "http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db")

# Initialize asyncpg connection pool
pool = None

async def init_db_pool():
    global pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=1,
        max_size=10,
        command_timeout=30,
        server_settings={"application_name": "bupzo_backend"}
    )

@app.on_event("startup")
async def startup_event():
    await init_db_pool()

@app.on_event("shutdown")
async def shutdown_event():
    if pool:
        await pool.close()

# Pydantic Models for Request/Response
class UserCreate(BaseModel):
    phone: str
    email: Optional[EmailStr] = None
    is_premium: bool = False
    signup_platform: str
    referred_by: Optional[UUID] = None
    privacy_accepted: bool = False
    marketing_consent: bool = True

class UserResponse(BaseModel):
    id: UUID
    phone: str
    email: Optional[EmailStr] = None
    is_premium: bool
    signup_platform: str
    wallet_balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: UUID
    price: float
    weight_grams: int = 500
    image_url: Optional[str] = None
    is_combo: bool = False
    stock_quantity: int = 0
    seller_id: UUID

class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    category_id: UUID
    price: float
    weight_grams: int
    image_url: Optional[str] = None
    is_combo: bool
    stock_quantity: int
    seller_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Helper functions
async def execute_query(query: str, *args):
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def execute_query_one(query: str, *args):
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def execute_query_val(query: str, *args):
    async with pool.acquire() as conn:
        return await conn.fetch_val(query, *args)

async def execute_query_none(query: str, *args):
    async with pool.acquire() as conn:
        await conn.execute(query, *args)

# API Endpoints
@app.get("/")
async def read_root():
    return {"status": "BUPZO Backend Live"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    query = """
    INSERT INTO users
    (id, phone_number, email, is_premium, signup_platform, referred_by, privacy_policy_accepted, marketing_consent)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, phone_number, email, is_premium, signup_platform, wallet_balance, created_at
    """
    values = (
        uuid4(),
        user.phone,
        user.email,
        user.is_premium,
        user.signup_platform,
        user.referred_by,
        user.privacy_accepted,
        user.marketing_consent
    )
    result = await execute_query_one(query, *values)
    return result

@app.get("/users/", response_model=List[UserResponse])
async def read_users():
    query = """
    SELECT id, phone_number as phone, email, is_premium, signup_platform, wallet_balance, created_at
    FROM users
    """
    results = await execute_query(query)
    return results

@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    query = """
    INSERT INTO products
    (id, name, description, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, description, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, created_at
    """
    values = (
        uuid4(),
        product.name,
        product.description,
        product.category_id,
        product.price,
        product.weight_grams,
        product.image_url,
        product.is_combo,
        product.stock_quantity,
        product.seller_id
    )
    result = await execute_query_one(query, *values)
    return result

@app.get("/products/", response_model=List[ProductResponse])
async def read_products():
    query = """
    SELECT id, name, description, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, created_at
    FROM products
    """
    results = await execute_query(query)
    return results