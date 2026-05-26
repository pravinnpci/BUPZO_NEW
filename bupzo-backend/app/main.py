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

class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: int
    user_id: UUID

class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    user_id: UUID
    product_name: str
    product_price: float
    created_at: datetime

class WishlistItemCreate(BaseModel):
    product_id: UUID
    user_id: UUID

class WishlistItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    user_id: UUID
    product_name: str
    product_price: float
    created_at: datetime

class CheckoutCreate(BaseModel):
    user_id: UUID
    items: List[CartItemCreate]
    shipping_address: str
    city: str
    state: str
    zip_code: str
    phone: str
    total_amount: float

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
@app.get("/api/")
async def read_root():
    return {"status": "BUPZO Backend Live"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/users/", response_model=UserResponse)
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

@app.get("/api/users/", response_model=List[UserResponse])
async def read_users():
    query = """
    SELECT id, phone_number as phone, email, is_premium, signup_platform, wallet_balance, created_at
    FROM users
    """
    results = await execute_query(query)
    return results

@app.post("/api/products/", response_model=ProductResponse)
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

@app.get("/api/products/", response_model=List[ProductResponse])
async def read_products():
    query = """
    SELECT id, name, description, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, created_at
    FROM products
    """
    results = await execute_query(query)
    return results

# Cart Endpoints
@app.post("/api/cart/", response_model=CartItemResponse)
async def add_to_cart(item: CartItemCreate):
    query = """
    INSERT INTO cart_items
    (id, product_id, quantity, user_id, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, product_id, quantity, user_id, created_at
    """
    values = (
        uuid4(),
        item.product_id,
        item.quantity,
        item.user_id,
        datetime.now()
    )
    result = await execute_query_one(query, *values)

    # Fetch product details to include in response
    product_query = """
    SELECT name, price
    FROM products
    WHERE id = $1
    """
    product = await execute_query_one(product_query, item.product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    result_dict = result.copy()
    result_dict['product_name'] = product['name']
    result_dict['product_price'] = product['price']

    return result_dict

@app.get("/api/cart/{user_id}", response_model=List[CartItemResponse])
async def get_cart_items(user_id: UUID):
    query = """
    SELECT ci.id, ci.product_id, ci.quantity, ci.user_id, ci.created_at,
           p.name as product_name, p.price as product_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
    """
    results = await execute_query(query, user_id)
    return results

@app.delete("/api/cart/{item_id}")
async def remove_from_cart(item_id: UUID):
    query = "DELETE FROM cart_items WHERE id = $1"
    await execute_query_none(query, item_id)
    return {"message": "Item removed from cart"}

@app.put("/api/cart/{item_id}/quantity")
async def update_cart_item_quantity(item_id: UUID, quantity: int):
    query = "UPDATE cart_items SET quantity = $1 WHERE id = $2"
    await execute_query_none(query, quantity, item_id)
    return {"message": "Quantity updated"}

# Wishlist Endpoints
@app.post("/api/wishlist/", response_model=WishlistItemResponse)
async def add_to_wishlist(item: WishlistItemCreate):
    query = """
    INSERT INTO wishlist_items
    (id, product_id, user_id, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, product_id, user_id, created_at
    """
    values = (
        uuid4(),
        item.product_id,
        item.user_id,
        datetime.now()
    )
    result = await execute_query_one(query, *values)

    # Fetch product details to include in response
    product_query = """
    SELECT name, price
    FROM products
    WHERE id = $1
    """
    product = await execute_query_one(product_query, item.product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    result_dict = result.copy()
    result_dict['product_name'] = product['name']
    result_dict['product_price'] = product['price']

    return result_dict

@app.get("/wishlist/{user_id}", response_model=List[WishlistItemResponse])
async def get_wishlist_items(user_id: UUID):
    query = """
    SELECT wi.id, wi.product_id, wi.user_id, wi.created_at,
           p.name as product_name, p.price as product_price
    FROM wishlist_items wi
    JOIN products p ON wi.product_id = p.id
    WHERE wi.user_id = $1
    """
    results = await execute_query(query, user_id)
    return results

@app.delete("/api/wishlist/{item_id}")
async def remove_from_wishlist(item_id: UUID):
    query = "DELETE FROM wishlist_items WHERE id = $1"
    await execute_query_none(query, item_id)
    return {"message": "Item removed from wishlist"}

# Checkout Endpoints
@app.post("/api/checkout/", response_model=dict)
async def create_checkout(order: CheckoutCreate):
    # Create order
    order_id = uuid4()
    order_query = """
    INSERT INTO orders
    (id, user_id, total_amount, shipping_address, city, state, zip_code, phone, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
    RETURNING id
    """
    order_values = (
        order_id,
        order.user_id,
        order.total_amount,
        order.shipping_address,
        order.city,
        order.state,
        order.zip_code,
        order.phone,
        datetime.now()
    )
    await execute_query_none(order_query, *order_values)

    # Add order items
    for item in order.items:
        order_item_query = """
        INSERT INTO order_items
        (id, order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4, $5)
        """
        order_item_values = (
            uuid4(),
            order_id,
            item.product_id,
            item.quantity,
            item.quantity * (await get_product_price(item.product_id))
        )
        await execute_query_none(order_item_query, *order_item_values)

        # Update product stock
        update_stock_query = """
        UPDATE products
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2
        """
        await execute_query_none(update_stock_query, item.quantity, item.product_id)

    return {"message": "Order placed successfully", "order_id": order_id}

async def get_product_price(product_id: UUID):
    query = "SELECT price FROM products WHERE id = $1"
    result = await execute_query_one(query, product_id)
    return result['price']
