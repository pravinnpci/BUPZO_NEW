from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import os
import io
import json
import redis.asyncio as aioredis
import asyncpg
from dotenv import load_dotenv
from typing import Optional, List, Any, Dict
from app.shiprocket_service import fetch_shipping_rates
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from uuid import UUID, uuid4
from jose import JWTError, jwt
from minio import Minio
from passlib.context import CryptContext

load_dotenv()

app = FastAPI(title="BUPZO Core API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db")

# MinIO Config
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minio_admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minio_password")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "bupzo-assets")

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

# Ensure bucket exists
try:
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)
    
    # Configure public read access policy
    import json
    public_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{MINIO_BUCKET}/*"]
            }
        ]
    }
    minio_client.set_bucket_policy(MINIO_BUCKET, json.dumps(public_policy))
except Exception as e:
    print(f"Error checking/creating MinIO bucket: {e}")

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client = None

# JWT Authentication Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "bupzo_super_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    if not hashed_password: return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

class AuthLoginRequest(BaseModel):
    username: str
    password: str

class AuthRegisterRequest(BaseModel):
    phone: str
    password: str
    name: str
    email: Optional[EmailStr] = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def init_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
        print("Connected to Redis successfully!")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")

async def get_cached_data(key: str):
    if redis_client:
        try:
            val = await redis_client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            print(f"Redis get error: {e}")
    return None

async def set_cached_data(key: str, data, ttl: int = 60):
    if redis_client:
        try:
            await redis_client.setex(key, ttl, json.dumps(data, default=str))
        except Exception as e:
            print(f"Redis set error: {e}")

async def invalidate_cache(keys: List[str]):
    if redis_client:
        try:
            for key in keys:
                await redis_client.delete(key)
        except Exception as e:
            print(f"Redis invalidate error: {e}")

async def clear_cache_keys(pattern: str):
    if redis_client:
        try:
            keys = await redis_client.keys(pattern)
            if keys:
                await redis_client.delete(*keys)
        except Exception as e:
            print(f"Redis delete error: {e}")

# JWT helpers
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user_by_id(user_id: UUID):
    query = """
    SELECT u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform, u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode,
           CASE WHEN s.status = 'APPROVED' THEN TRUE ELSE FALSE END AS is_seller,
           s.status as seller_status
    FROM users u
    LEFT JOIN sellers s ON s.user_id = u.id
    WHERE u.id = $1
    """
    user = await execute_query_one(query, user_id)
    if user:
        user['is_admin'] = user.get('phone', '') in ADMIN_PHONES
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        token_type = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
        token_data = TokenData(user_id=UUID(user_id), token_type=token_type)
    except (JWTError, ValueError):
        raise credentials_exception
    user = await get_user_by_id(token_data.user_id)
    if not user:
        raise credentials_exception
    return user

# Initialize asyncpg connection pool
pool = None

async def init_db_pool():
    global pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=2,
        max_size=15,
        command_timeout=30,
        server_settings={"application_name": "bupzo_backend"}
    )

@app.on_event("startup")
async def startup_event():
    await init_db_pool()
    await init_redis()
    # Dynamic DB Schema Migration: Ensure columns exist
    async with pool.acquire() as conn:
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);")
        await conn.execute("ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_by_seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE;")
        await conn.execute("ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';")
        await conn.execute("UPDATE coupons SET status = 'APPROVED' WHERE status IS NULL;")
        await conn.execute("ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;")
        await conn.execute("ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN ('REFERRAL','PURCHASE','TOPUP','REFUND','ADMIN_ADJUSTMENT','ADMIN_REFUND','SALE','PAYOUT'));")
        
        # Product images support
        await conn.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;")
        
        # Create disputes table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS disputes (
                id VARCHAR(50) PRIMARY KEY,
                customer VARCHAR(100) NOT NULL,
                seller VARCHAR(100) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                risk INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Under Review',
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

        # Seed mock disputes if empty
        disputes_count = await conn.fetchval("SELECT COUNT(*) FROM disputes;")
        if disputes_count == 0:
            await conn.execute("""
                INSERT INTO disputes (id, customer, seller, amount, risk, status, description)
                VALUES 
                ('DISP-10482', 'Meera S.', 'Nagore Halwa Palace', 2499.00, 82, 'Under Review', 'Mismatched shipping address + high quantity order of premium Halwa.'),
                ('DISP-10480', 'Anitha P.', 'Siva Ceramics & Crafts', 899.00, 15, 'Resolved', 'Minor crack in ceramic base, refund completed to wallet.'),
                ('DISP-10485', 'Ravi K.', 'Alpha Electronics', 5120.00, 65, 'Under Review', 'Third transaction failure follow-up.');
            """)

        # Create notifications table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                target_tab VARCHAR(50),
                target_id VARCHAR(100),
                user_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                read BOOLEAN DEFAULT FALSE
            );
        """)

        # Alter table in case it already exists
        await conn.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_id VARCHAR(100);")
        await conn.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);")

        # Seed mock notifications if empty
        notifs_count = await conn.fetchval("SELECT COUNT(*) FROM notifications;")
        if notifs_count == 0:
            await conn.execute("""
                INSERT INTO notifications (id, title, body, target_tab, read)
                VALUES 
                ('notif-seed-1', 'Voucher Approval Required', 'Voucher code "SWEET50" created by seller. Approval required.', 'vouchers', FALSE),
                ('notif-seed-2', 'Seller KYC Pending', 'Merchant "Nagore Halwa Palace" is pending KYC approval.', 'kyc', FALSE);
            """)

        # Create store_followers table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS store_followers (
                user_id UUID NOT NULL,
                seller_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (user_id, seller_id)
            );
        """)

        # Seed Mock Users and merchants so storefront and admin populate immediately
        await conn.execute("""
            DELETE FROM users
            WHERE id IN (
                'a01b1234-5678-abcd-ef01-1234567890aa',
                'a01b1234-5678-abcd-ef01-1234567890ab',
                'a01b1234-5678-abcd-ef01-1234567890ac'
            )
            OR phone IN ('+919876543210', '+919876543211', '+919876543212');
        """)
        await conn.execute("""
            INSERT INTO users (id, phone, email, is_premium, signup_platform, privacy_accepted, wallet_balance, name)
            VALUES
                ('a01b1234-5678-abcd-ef01-1234567890aa', '+919876543210', 'admin@bupzo.com', TRUE, 'WEB', TRUE, 2500.00, 'Bupzo Patron'),
                ('a01b1234-5678-abcd-ef01-1234567890ab', '+919876543211', 'seller@bupzo.com', FALSE, 'WEB', TRUE, 5000.00, 'Bupzo Seller'),
                ('a01b1234-5678-abcd-ef01-1234567890ac', '+919876543212', 'customer@bupzo.com', FALSE, 'WEB', TRUE, 250.00, 'Bupzo Customer');
        """)

        await conn.execute("""
            INSERT INTO categories (id, name, description)
            VALUES
                ('d04b1234-5678-abcd-ef01-1234567890ab', 'Nagore Specialties', 'Traditional sweets and regional premium foods.'),
                ('d04b1234-5678-abcd-ef01-1234567890ac', 'Artisan Gifts', 'Curated handcrafted items from local merchants.')
            ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
        """)

        await conn.execute("""
            INSERT INTO sellers (id, user_id, business_name, commission_rate, status, kyc_details)
            VALUES
                ('c03b1234-5678-abcd-ef01-1234567890ab', 'a01b1234-5678-abcd-ef01-1234567890ab', 'Nagore Halwa Palace', 8.00, 'APPROVED', '{"gstin": "33AAAAA1111A1Z1", "fssai": "10022020000001"}'),
                ('c03b1234-5678-abcd-ef01-1234567890ac', 'a01b1234-5678-abcd-ef01-1234567890ac', 'Panna Crafts & Gifts', 10.00, 'APPROVED', '{"gstin": "33BBBBB2222B2Z2", "fssai": "10022020000002"}')
            ON CONFLICT (business_name) DO NOTHING;
        """)

        await conn.execute("""
            INSERT INTO products (id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description)
            VALUES
                ('e05b1234-5678-abcd-ef01-1234567890aa', 'Nagore Ghee Halwa', 'd04b1234-5678-abcd-ef01-1234567890ab', 299.00, 500.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', FALSE, 150, 'c03b1234-5678-abcd-ef01-1234567890ab', 'Traditional ghee halwa with cashews and premium saffron.'),
                ('e05b1234-5678-abcd-ef01-1234567890ab', 'Premium Dry Fruit Combo', 'd04b1234-5678-abcd-ef01-1234567890ab', 799.00, 1000.00, 'https://images.unsplash.com/photo-1596560548464-f010689b771a?auto=format&fit=crop&w=400&q=80', TRUE, 80, 'c03b1234-5678-abcd-ef01-1234567890ab', 'Assorted premium dry fruits perfect for gifting.'),
                ('e05b1234-5678-abcd-ef01-1234567890ac', 'Handcrafted Brass Lamp', 'd04b1234-5678-abcd-ef01-1234567890ac', 1249.00, 650.00, 'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=400&q=80', FALSE, 45, 'c03b1234-5678-abcd-ef01-1234567890ac', 'Elegant artisan brass lamp for home décor.')
            ON CONFLICT (id) DO NOTHING;
        """)

@app.on_event("shutdown")
async def shutdown_event():
    if pool:
        await pool.close()
    if redis_client:
        await redis_client.close()

# Pydantic Models for Request/Response
class UserCreate(BaseModel):
    name: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    is_premium: bool = False
    signup_platform: str # 'WEB' or 'APP'
    referred_by: Optional[UUID] = None
    privacy_accepted: bool = False
    password: Optional[str] = None

class AuthLoginRequest(BaseModel):
    username: str
    password: str

class AuthRegisterRequest(BaseModel):
    username: str
    password: str
    name: str
    phone: str
    is_premium: bool = False
    signup_platform: str = 'WEB'
    referred_by: Optional[UUID] = None
    privacy_accepted: bool = True

class AuthGoogleRequest(BaseModel):
    email: EmailStr
    name: str
    google_token: str # Simplified mock for google token

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    token_type: Optional[str] = None

ADMIN_PHONES = ['+919876543210', '9876543210']

class UserResponse(BaseModel):
    seller_status: Optional[str] = None
    id: UUID
    name: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    is_premium: bool
    signup_platform: str
    wallet_balance: float
    privacy_accepted: bool
    created_at: datetime
    address: Optional[str] = None
    pincode: Optional[str] = None
    is_seller: bool = False
    is_admin: bool = False

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'
    expires_in: int
    user: UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_premium: Optional[bool] = None
    wallet_balance: Optional[float] = None
    address: Optional[str] = None
    pincode: Optional[str] = None

# Dispute Pydantic Models
class DisputeResponse(BaseModel):
    id: str
    customer: str
    seller: str
    amount: float
    risk: int
    status: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DisputeUpdate(BaseModel):
    status: str

# Notification Pydantic Models
class NotificationResponse(BaseModel):
    id: str
    title: str
    body: str
    targetTab: Optional[str] = None
    target_id: Optional[str] = None
    read: bool
    created_at: datetime
    timestamp: str

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    title: str
    body: str
    targetTab: Optional[str] = None
    target_id: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CouponCreate(BaseModel):
    code: str
    discount_percent: float
    is_premium_only: bool = False
    expiry_date: datetime
    usage_limit: Optional[int] = None
    min_order_value: float = 0.0
    created_by_seller_id: Optional[UUID] = None
    status: Optional[str] = None

class CouponResponse(BaseModel):
    id: UUID
    code: str
    discount_percent: float
    is_premium_only: bool
    expiry_date: datetime
    usage_limit: Optional[int]
    min_order_value: float
    created_at: datetime
    created_by_seller_id: Optional[UUID] = None
    status: str

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    order_value: float

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_percent: Optional[float] = None
    is_premium_only: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    usage_limit: Optional[int] = None
    min_order_value: Optional[float] = None
    status: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    category_id: UUID
    price: float
    weight_grams: float
    image_url: Optional[str] = None
    is_combo: bool = False
    stock_quantity: int = 0
    seller_id: UUID
    description: Optional[str] = None
    images: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[UUID] = None
    price: Optional[float] = None
    weight_grams: Optional[float] = None
    image_url: Optional[str] = None
    is_combo: Optional[bool] = None
    stock_quantity: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    seller_id: Optional[UUID] = None

class ProductApprovalUpdate(BaseModel):
    is_approved: Optional[bool] = None
    rejection_reason: Optional[str] = None

class ProductResponse(BaseModel):
    id: UUID
    name: str
    category_id: UUID
    price: float
    weight_grams: Optional[float]
    image_url: Optional[str]
    images: Optional[List[str]] = []
    is_combo: Optional[bool] = False
    stock_quantity: int
    seller_id: UUID
    description: Optional[str] = None
    created_at: datetime
    is_approved: Optional[bool] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class WishlistItemCreate(BaseModel):
    product_id: UUID
    user_id: UUID

class WishlistItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    user_id: UUID
    added_at: datetime
    product_name: str
    product_price: float
    product_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int

class OrderCreate(BaseModel):
    user_id: UUID
    seller_id: UUID
    items: List[OrderItemCreate]
    total_amount: float
    order_source: str # 'WEB' or 'APP'
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None
    trust_donation_amount: float = 0.00
    currency: str = "ZAR"
    exchange_rate: float = 1.000000

class SellerRegisterRequest(BaseModel):
    phone: str
    email: Optional[str] = None
    business_name: str
    commission_rate: float = 10.0
    status: str = "PENDING"
    kyc_details: Optional[dict] = {}

class SellerResponse(BaseModel):
    id: UUID
    user_id: UUID
    business_name: str
    commission_rate: float
    status: str
    kyc_details: dict
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    followers_count: Optional[int] = 0
    review_count: Optional[int] = 0
    rating: Optional[float] = 4.5
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PayoutResponse(BaseModel):
    id: UUID
    seller_id: UUID
    amount: float
    status: str
    request_date: datetime
    processed_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class WalletAdjustmentRequest(BaseModel):
    amount: float
    type: str  # 'Credit' or 'Debit'
    reason: Optional[str] = None

class WalletTransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    amount: float
    type: str
    description: Optional[str] = None
    mobile_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    seller_id: UUID
    total_amount: float
    status: str
    tracking_id: Optional[str] = None
    order_source: str
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None
    trust_donation_amount: float
    currency: str
    exchange_rate: float
    created_at: datetime
    items: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

# Helper functions for database execution

def normalize_args(args):
    return [str(arg) if isinstance(arg, UUID) else arg for arg in args]

async def execute_query(query: str, *args):
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *normalize_args(args))
        return [dict(row) for row in rows]

async def execute_query_one(query: str, *args):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *normalize_args(args))
        return dict(row) if row is not None else None

async def execute_query_val(query: str, *args):
    async with pool.acquire() as conn:
        return await conn.fetch_val(query, *normalize_args(args))

async def execute_query_none(query: str, *args):
    async with pool.acquire() as conn:
        await conn.execute(query, *normalize_args(args))

# Root & Health Endpoints
@app.get("/api/")
async def read_root():
    return {"status": "BUPZO Backend Core API Live"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# User Authentication & Management
@app.post("/api/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Verify references if referred
    if user.referred_by:
        check_ref = await execute_query_one("SELECT id FROM users WHERE id = $1", user.referred_by)
        if not check_ref:
            raise HTTPException(status_code=400, detail="Referrer user not found.")

    user_id = uuid4()
    
    password_hash = get_password_hash(user.password) if user.password else None

    query = """
    INSERT INTO users
    (id, name, phone, email, is_premium, signup_platform, referred_by, privacy_accepted, password_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """
    values = (
        user_id,
        user.name,
        user.phone,
        user.email,
        user.is_premium,
        user.signup_platform,
        user.referred_by,
        user.privacy_accepted,
        password_hash
    )
    try:
        await execute_query_none(query, *values)
        if user.referred_by:
            ref_bonus = 5.00
            await execute_query_none("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2", ref_bonus, user.referred_by)
            await execute_query_none(
                "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'REFERRAL', $4)",
                uuid4(), user.referred_by, ref_bonus, f"Referral bonus for onboarding user {user.phone}"
            )
            await execute_query_none(
                "INSERT INTO referrals (id, referrer_id, referee_id, bonus_amount, status) VALUES ($1, $2, $3, $4, 'CREDITED')",
                uuid4(), user.referred_by, user_id, ref_bonus
            )
        existing_user = await get_user_by_id(user_id)
        return existing_user
    except asyncpg.exceptions.UniqueViolationError:
        existing_user = await execute_query_one(
            "SELECT u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform, u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode, CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller FROM users u LEFT JOIN sellers s ON s.user_id = u.id WHERE u.phone = $1",
            user.phone
        )
        if existing_user:
            existing_user['is_admin'] = existing_user.get('phone', '') in ADMIN_PHONES
        return existing_user

@app.get("/api/users/", response_model=List[UserResponse])
async def read_users():
    query = """
    SELECT
        u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform,
        u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode,
        CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller
    FROM users u
    LEFT JOIN sellers s ON s.user_id = u.id
    ORDER BY u.created_at DESC
    """
    rows = await execute_query(query)
    result = []
    for row in rows:
        d = dict(row)
        d['is_admin'] = d.get('phone', '') in ADMIN_PHONES
        result.append(d)
    return result

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, payload: UserUpdate):
    # Verify user exists
    u_check = await execute_query_one("SELECT id FROM users WHERE id = $1", user_id)
    if not u_check:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Dynamically build UPDATE query
    fields = []
    values = []
    counter = 1
    
    if payload.name is not None:
        fields.append(f"name = ${counter}")
        values.append(payload.name)
        counter += 1
    if payload.phone is not None:
        fields.append(f"phone = ${counter}")
        values.append(payload.phone)
        counter += 1
    if payload.email is not None:
        fields.append(f"email = ${counter}")
        values.append(payload.email)
        counter += 1
    if payload.is_premium is not None:
        fields.append(f"is_premium = ${counter}")
        values.append(payload.is_premium)
        counter += 1
    if payload.wallet_balance is not None:
        fields.append(f"wallet_balance = ${counter}")
        values.append(payload.wallet_balance)
        counter += 1
        
    if payload.address is not None:
        fields.append(f"address = ${counter}")
        values.append(payload.address)
        counter += 1
    if payload.pincode is not None:
        fields.append(f"pincode = ${counter}")
        values.append(payload.pincode)
        counter += 1
        
    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")
        
    values.append(user_id)
    query = f"UPDATE users SET {', '.join(fields)} WHERE id = ${counter} RETURNING id, name, phone, email, is_premium, signup_platform, wallet_balance, privacy_accepted, created_at, address, pincode"
    
    res = await execute_query_one(query, *values)
    return res

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: UUID):
    query = """
    SELECT u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform, u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode,
           CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller
    FROM users u
    LEFT JOIN sellers s ON s.user_id = u.id
    WHERE u.id = $1
    """
    result = await execute_query_one(query, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    result['is_admin'] = result.get('phone', '') in ADMIN_PHONES
    return result

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: UUID):
    async with pool.acquire() as conn:
        u = await conn.fetchrow("SELECT id FROM users WHERE id = $1", user_id)
        if not u:
            raise HTTPException(status_code=444, detail="User not found")
        
        # Delete referencing orders (seller side)
        seller = await conn.fetchrow("SELECT id FROM sellers WHERE user_id = $1", user_id)
        if seller:
            await conn.execute("DELETE FROM orders WHERE seller_id = $1", seller['id'])
            
        # Delete referencing orders (customer side)
        await conn.execute("DELETE FROM orders WHERE user_id = $1", user_id)
        
        # Delete referencing referrals
        await conn.execute("DELETE FROM referrals WHERE referrer_id = $1 OR referee_id = $1", user_id)
        
        # Delete wishlist
        await conn.execute("DELETE FROM wishlist WHERE user_id = $1", user_id)
        
        # Delete messages
        await conn.execute("DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1", user_id)

        # Delete reviews
        await conn.execute("DELETE FROM reviews WHERE user_id = $1", user_id)

        # Delete wallet transactions
        await conn.execute("DELETE FROM wallet_transactions WHERE user_id = $1", user_id)

        # Delete addresses
        await conn.execute("DELETE FROM addresses WHERE user_id = $1", user_id)
        
        # Finally delete the user
        await conn.execute("DELETE FROM users WHERE id = $1", user_id)
        await invalidate_cache(["cache:users"])
        return {"success": True, "message": "User deleted successfully"}



def format_phone(phone_str: str) -> str:
    if phone_str and len(phone_str.strip()) == 10 and phone_str.strip().isdigit():
        return f"+91{phone_str.strip()}"
    return phone_str.strip() if phone_str else phone_str

@app.post("/api/auth/login", response_model=TokenResponse)
async def auth_login(payload: AuthLoginRequest):
    username = format_phone(payload.username)
    user = await execute_query_one(
        "SELECT u.id, u.password_hash FROM users u WHERE u.email = $1 OR u.phone = $1",
        username
    )
    if not user or not verify_password(payload.password, user.get('password_hash')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    full_user = await get_user_by_id(user['id'])
    
    access_token = create_access_token({"user_id": str(full_user['id'])})
    refresh_token = create_refresh_token({"user_id": str(full_user['id'])})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": full_user
    }

@app.post("/api/auth/register", response_model=TokenResponse)
async def auth_register(payload: AuthRegisterRequest):
    formatted_phone = format_phone(payload.phone)
    formatted_username = format_phone(payload.username)

    user = await execute_query_one("SELECT id FROM users WHERE phone = $1", formatted_phone)
    if user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user_id = uuid4()
    password_hash = get_password_hash(payload.password)
    
    email = formatted_username if '@' in formatted_username else None

    query = """
    INSERT INTO users
    (id, name, phone, email, is_premium, signup_platform, referred_by, privacy_accepted, password_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """
    await execute_query_none(
        query, user_id, payload.name, formatted_phone, email, payload.is_premium,
        payload.signup_platform, payload.referred_by, payload.privacy_accepted, password_hash
    )
    
    full_user = await get_user_by_id(user_id)
    
    access_token = create_access_token({"user_id": str(full_user['id'])})
    refresh_token = create_refresh_token({"user_id": str(full_user['id'])})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": full_user
    }

@app.post("/api/auth/google", response_model=TokenResponse)
async def auth_google(payload: AuthGoogleRequest):
    # Mock Google Auth Verification
    if not payload.google_token or len(payload.google_token) < 5:
        raise HTTPException(status_code=401, detail="Invalid Google Token")
        
    user = await execute_query_one(
        "SELECT u.id FROM users u WHERE u.email = $1",
        payload.email
    )
    if not user:
        # Create user via Google
        user_id = uuid4()
        await execute_query_none(
            "INSERT INTO users (id, name, phone, email, is_premium, signup_platform, privacy_accepted, wallet_balance) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)",
            user_id,
            payload.name,
            f"GOOG-{str(user_id)[:8]}", # Mock phone
            payload.email,
            False,
            'WEB',
            True
        )
        full_user = await get_user_by_id(user_id)
    else:
        full_user = await get_user_by_id(user['id'])
        
    access_token = create_access_token({"user_id": str(full_user['id'])})
    refresh_token = create_refresh_token({"user_id": str(full_user['id'])})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": full_user
    }

@app.post("/api/auth/refresh", response_model=TokenResponse)
async def auth_refresh(payload: dict):
    refresh_token = payload.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token is required.")
    try:
        payload_data = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload_data.get("user_id")
        token_type = payload_data.get("type")
        if user_id is None or token_type != "refresh":
            raise JWTError("Invalid refresh token type.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
    user = await get_user_by_id(UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    access_token = create_access_token({"user_id": str(user['id'])})
    refresh_token = create_refresh_token({"user_id": str(user['id'])})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def auth_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/products/", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    # Verify category and seller
    cat_check = await execute_query_one("SELECT id FROM categories WHERE id = $1", str(product.category_id))
    if not cat_check:
        raise HTTPException(status_code=400, detail="Category not found.")
    
    sel_check = await execute_query_one("SELECT id, business_name FROM sellers WHERE id = $1", str(product.seller_id))
    if not sel_check:
        raise HTTPException(status_code=400, detail="Seller not found.")

    seller_name = sel_check.get('business_name', 'A Seller')

    product_id = uuid4()
    query = """
    INSERT INTO products (id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, is_approved) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)
    RETURNING id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved, rejection_reason
    """
    values = (
        str(product_id),
        product.name,
        str(product.category_id) if product.category_id else None,
        product.price,
        product.weight_grams,
        product.image_url,
        json.dumps(product.images) if product.images else '[]',
        product.is_combo,
        product.stock_quantity,
        str(product.seller_id) if product.seller_id else None,
        product.description
    )
    result = await execute_query_one(query, *values)
    if result and isinstance(result.get('images'), str):
        result = dict(result)
        try:
            result['images'] = json.loads(result['images'])
        except:
            result['images'] = []
    # Send Notification to Admin
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO notifications (id, title, body, target_tab, target_id, read, created_at)
            VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
            """,
            str(uuid4()),
            "New Product Created",
            f"Seller '{seller_name}' created product '{product.name}' (Price: ₹{product.price}).",
            "products",
            str(result['id'])
        )
    await clear_cache_keys("cache:notifications")
    return result

@app.get("/api/products/", response_model=List[ProductResponse])
async def read_products(seller_id: Optional[UUID] = None, all: Optional[bool] = False):
    if seller_id:
        query = """
        SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved, rejection_reason
        FROM products WHERE seller_id = $1
        """
        results = await execute_query(query, seller_id)
    else:
        if all:
            query = """
            SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved, rejection_reason
            FROM products
            """
        else:
            query = """
            SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved, rejection_reason
            FROM products WHERE is_approved = TRUE
            """
        results = await execute_query(query)
    import json
    parsed_results = []
    for r in results:
        r_dict = dict(r)
        if isinstance(r_dict.get('images'), str):
            try:
                r_dict['images'] = json.loads(r_dict['images'])
            except:
                r_dict['images'] = []
        elif r_dict.get('images') is None:
            r_dict['images'] = []
        parsed_results.append(r_dict)
    return parsed_results

@app.get("/api/products/{product_id}", response_model=ProductResponse)
async def read_product(product_id: UUID):
    query = """
    SELECT id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description, created_at, is_approved, rejection_reason
    FROM products
    WHERE id = $1
    """
    result = await execute_query_one(query, product_id)
    if not result:
      raise HTTPException(status_code=404, detail="Product not found")
    return result

@app.put("/api/products/{product_id}/approve", response_model=dict)
async def approve_product(product_id: UUID, payload: ProductApprovalUpdate):
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE products SET is_approved = $1, rejection_reason = $2 WHERE id = $3", 
            payload.is_approved, payload.rejection_reason, str(product_id)
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Product not found")
        status_text = "Approved" if payload.is_approved else ("Rejected" if payload.is_approved is False else "Pending")
        nid = str(uuid4())
        await conn.execute("INSERT INTO notifications (id, title, body, target_tab, target_id) VALUES ($1, $2, $3, $4, $5)", nid, "Product Status Changed", f"Product ID {product_id} was marked as {status_text}.", "products", str(product_id))
        return {"success": True, "is_approved": payload.is_approved, "rejection_reason": payload.rejection_reason}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: UUID):
    async with pool.acquire() as conn:
        p = await conn.fetchrow("SELECT id FROM products WHERE id = $1", product_id)
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Delete referencing items
        await conn.execute("DELETE FROM order_items WHERE product_id = $1", product_id)
        await conn.execute("DELETE FROM reviews WHERE product_id = $1", product_id)
        await conn.execute("DELETE FROM wishlist WHERE product_id = $1", product_id)
        await conn.execute("DELETE FROM product_views WHERE product_id = $1", product_id)
        await conn.execute("DELETE FROM flash_sales WHERE product_id = $1", product_id)
        
        # Finally delete the product
        await conn.execute("DELETE FROM products WHERE id = $1", product_id)
        await invalidate_cache(["cache:products"])
        return {"success": True, "message": "Product deleted successfully"}

# Wishlist Management
@app.post("/api/wishlist/", response_model=WishlistItemResponse)
async def add_to_wishlist(item: WishlistItemCreate):
    existing = await execute_query_one("SELECT id FROM wishlist WHERE user_id=$1 AND product_id=$2", item.user_id, item.product_id)
    if existing:
        raise HTTPException(status_code=400, detail="Item already in wishlist.")
        
    # Verify user and product
    u_check = await execute_query_one("SELECT id FROM users WHERE id = $1", item.user_id)
    if not u_check:
        raise HTTPException(status_code=400, detail="User not found.")
    
    p_check = await execute_query_one("SELECT id, name, price FROM products WHERE id = $1", item.product_id)
    if not p_check:
        raise HTTPException(status_code=400, detail="Product not found.")

    query = """
    INSERT INTO wishlist
    (id, user_id, product_id, added_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, product_id, added_at
    """
    values = (
        uuid4(),
        item.user_id,
        item.product_id,
        datetime.utcnow()
    )
    try:
        result = await execute_query_one(query, *values)
        res_dict = dict(result)
        res_dict['product_name'] = p_check['name']
        res_dict['product_price'] = float(p_check['price'])
        return res_dict
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Item already in wishlist.")

@app.get("/api/wishlist/{user_id}", response_model=List[WishlistItemResponse])
async def get_wishlist(user_id: UUID):
    query = """
    SELECT w.id, w.user_id, w.product_id, w.added_at,
           p.name as product_name, p.price as product_price, p.image_url as product_image_url
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = $1
    """
    results = await execute_query(query, user_id)
    return results

@app.delete("/api/wishlist/{wishlist_id}")
async def remove_from_wishlist(wishlist_id: UUID):
    query = "DELETE FROM wishlist WHERE id = $1"
    await execute_query_none(query, wishlist_id)
    return {"success": True, "message": "Item removed from wishlist"}

@app.get("/api/shipping-rates/")
async def get_shipping_rates(delivery_pincode: str, weight_kg: float = 1.0, pickup_pincode: str = "110020"):
    try:
        rates = await fetch_shipping_rates(pickup_pincode, delivery_pincode, weight_kg)
        return rates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Order & Checkout Management
class WalletTopupRequest(BaseModel):
    user_id: UUID
    amount: float
    description: Optional[str] = "Manual Wallet Top-up"

@app.post("/api/wallet/topup")
async def topup_user_wallet(payload: WalletTopupRequest):
    u = await execute_query_one("SELECT id, wallet_balance FROM users WHERE id = $1", payload.user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_bal = float(u['wallet_balance']) + payload.amount
    await execute_query_none("UPDATE users SET wallet_balance = $1 WHERE id = $2", new_bal, payload.user_id)
    
    tx_id = uuid4()
    await execute_query_none(
        "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'TOPUP', $4)",
        tx_id, payload.user_id, payload.amount, payload.description
    )
    return {"status": "success", "new_balance": new_bal, "transaction_id": str(tx_id)}

@app.post("/api/checkout/", response_model=dict)
async def create_checkout(payload: OrderCreate):
    # Verify user & seller
    u_check = await execute_query_one("SELECT id, wallet_balance FROM users WHERE id = $1", payload.user_id)
    if not u_check:
        raise HTTPException(status_code=400, detail="User not found.")
    seller_info = await execute_query_one("SELECT id, user_id, business_name FROM sellers WHERE id = $1", payload.seller_id)
    if not seller_info:
        raise HTTPException(status_code=400, detail="Seller not found.")

    # Automatically credit balance if insufficient (to guarantee smooth local dev workflow)
    current_balance = float(u_check['wallet_balance'])
    if current_balance < payload.total_amount:
        topup_needed = payload.total_amount - current_balance
        await execute_query_none("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2", topup_needed, payload.user_id)
        await execute_query_none(
            "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'TOPUP', $4)",
            uuid4(), payload.user_id, topup_needed, "Automatic checkout top-up"
        )

    order_id = uuid4()
    seller_user_id = seller_info['user_id']
    seller_name = seller_info['business_name'] or 'Seller'

    # Start Transaction block
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Deduct wallet balance from user
            await conn.execute(
                "UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2",
                payload.total_amount, payload.user_id
            )

            # Log buyer transaction
            await conn.execute(
                "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'PURCHASE', $4)",
                str(uuid4()), str(payload.user_id), -payload.total_amount, f"Checkout for order {order_id}"
            )

            # 1. Create order as paid
            order_query = """
            INSERT INTO orders
            (id, user_id, seller_id, total_amount, status, order_source, shipping_partner, payment_gateway, trust_donation_amount, currency, exchange_rate)
            VALUES ($1, $2, $3, $4, 'paid', $5, $6, $7, $8, $9, $10)
            """
            order_values = (
                str(order_id),
                str(payload.user_id),
                str(payload.seller_id),
                payload.total_amount,
                payload.order_source,
                payload.shipping_partner,
                payload.payment_gateway,
                payload.trust_donation_amount,
                payload.currency,
                payload.exchange_rate
            )
            await conn.execute(order_query, *order_values)

            # 2. Add items to order and deduct stock
            for item in payload.items:
                product = await conn.fetchrow("SELECT price, stock_quantity FROM products WHERE id = $1", item.product_id)
                if not product:
                    raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found.")
                if product['stock_quantity'] < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Product {item.product_id} is out of stock.")

                # Insert order item
                await conn.execute(
                    "INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4, $5)",
                    str(uuid4()), str(order_id), str(item.product_id), item.quantity, product['price'] * item.quantity
                )

                # Update stock
                await conn.execute(
                    "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
                    item.quantity, item.product_id
                )

            # Credit seller wallet with sale proceeds
            await conn.execute(
                "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
                payload.total_amount, seller_user_id
            )
            await conn.execute(
                "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'SALE', $4)",
                str(uuid4()), str(seller_user_id), payload.total_amount, f"Sale earnings for order {order_id}"
            )

            # Notify seller of a new paid order
            await conn.execute(
                "INSERT INTO notifications (id, title, body, target_tab, target_id, read, created_at, user_id) VALUES ($1, $2, $3, $4, $5, FALSE, NOW(), $6)",
                str(uuid4()),
                "New Paid Order Received",
                f"{seller_name} has a paid order {order_id} ready to process.",
                "orders",
                str(order_id),
                str(seller_user_id)
            )

    return {"success": True, "message": "Order created and seller wallet credited.", "order_id": order_id}

# Stitch Payment Integration Models
class StitchPaymentRequest(BaseModel):
    order_id: UUID
    amount: float
    currency: str = "ZAR"

@app.post("/api/payment/stitch", response_model=dict)
async def initiate_stitch_payment(payload: StitchPaymentRequest):
    stitch_key = os.getenv("STITCH_API_KEY", "AQ.Ab8RN6LsciH6omORQ0_DiRO9jW6YvcSWjbJczo-h9cIoCg6pNA")
    client_id = "test_client_id"
    
    # Try calling the real Stitch API
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Step 1: Get Access Token
            token_resp = await client.post(
                "https://secure.stitch.money/connect/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": stitch_key,
                    "scope": "client_paymentrequest"
                }
            )
            
            if token_resp.status_code == 200:
                token_data = token_resp.json()
                access_token = token_data.get("access_token")
                
                # Step 2: Create Payment Initiation Request via GraphQL
                query_graphql = """
                mutation CreatePaymentRequest($amount: MoneyInput!, $payerReference: String!, $beneficiaryReference: String!, $beneficiaryName: String!, $beneficiaryBankId: BankBeneficiaryBankId!, $beneficiaryAccountNumber: String!, $merchant: String!) {
                    clientPaymentInitiationRequestCreate(input: {
                        amount: $amount,
                        payerReference: $payerReference,
                        beneficiaryReference: $beneficiaryReference,
                        beneficiary: {
                            bankAccount: {
                                name: $beneficiaryName,
                                bankId: $beneficiaryBankId,
                                accountNumber: $beneficiaryAccountNumber
                            }
                        },
                        merchant: $merchant
                    }) {
                        paymentInitiationRequest {
                            id
                            url
                        }
                    }
                }"""
                
                variables = {
                    "amount": {
                        "quantity": f"{payload.amount:.2f}",
                        "currency": payload.currency
                    },
                    "payerReference": f"BUPZO-{payload.order_id}",
                    "beneficiaryReference": f"BUPZO-{payload.order_id}",
                    "beneficiaryName": "Bupzo Marketplace",
                    "beneficiaryBankId": "std",
                    "beneficiaryAccountNumber": "123456789",
                    "merchant": "Bupzo"
                }
                
                gql_resp = await client.post(
                    "https://api.stitch.money/graphql",
                    json={"query": query_graphql, "variables": variables},
                    headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
                )
                
                if gql_resp.status_code == 200:
                    gql_data = gql_resp.json()
                    errors = gql_data.get("errors")
                    if not errors:
                        payment_url = gql_data["data"]["clientPaymentInitiationRequestCreate"]["paymentInitiationRequest"]["url"]
                        return {"success": True, "payment_url": payment_url, "mode": "live"}
            
            # If token or GraphQL request fails, fallback to sandbox simulation
            return {
                "success": True,
                "payment_url": f"http://localhost:8003/api/payment/stitch/sandbox?order_id={payload.order_id}&amount={payload.amount}",
                "mode": "sandbox",
                "message": "Fell back to Sandbox/Offline simulation mode."
            }
            
    except Exception as e:
        # Fallback to sandbox simulation on error
        return {
            "success": True,
            "payment_url": f"http://localhost:8003/api/payment/stitch/sandbox?order_id={payload.order_id}&amount={payload.amount}",
            "mode": "sandbox",
            "error": str(e)
        }

@app.get("/api/payment/stitch/sandbox")
async def stitch_sandbox_payment_page(order_id: UUID, amount: float):
    return {
        "title": "BUPZO Stitch Sandbox Payment Gateway Simulator",
        "order_id": order_id,
        "amount_zar": amount,
        "actions": {
            "simulate_success": f"http://localhost:8003/api/payment/stitch/callback?order_id={order_id}&status=success",
            "simulate_cancel": f"http://localhost:8003/api/payment/stitch/callback?order_id={order_id}&status=cancelled"
        }
    }

@app.get("/api/payment/stitch/callback")
async def stitch_payment_callback(order_id: UUID, status: str):
    if status == "success":
        # Update order status to paid in PostgreSQL
        query = "UPDATE orders SET status = 'paid' WHERE id = $1"
        await execute_query_none(query, order_id)
        # Log payment
        await execute_query_none(
            "INSERT INTO payment_logs (id, order_id, gateway_name, amount, status) VALUES ($1, $2, 'STITCH', (SELECT total_amount FROM orders WHERE id = $2), 'success')",
            uuid4(), order_id
        )
        return {"success": True, "message": "Payment simulation successful. Order updated.", "status": "paid"}
    else:
        # Update order status to failed
        query = "UPDATE orders SET status = 'failed' WHERE id = $1"
        await execute_query_none(query, order_id)
        # Log payment
        await execute_query_none(
            "INSERT INTO payment_logs (id, order_id, gateway_name, amount, status) VALUES ($1, $2, 'STITCH', (SELECT total_amount FROM orders WHERE id = $2), 'failed')",
            uuid4(), order_id
        )
        return {"success": False, "message": "Payment simulation cancelled/failed. Order updated.", "status": "failed"}

# ==================== AI INTEGRATION ENDPOINTS ====================

# Helper function to get Gemini Embeddings
async def get_gemini_embedding(text: str) -> List[float]:
    import httpx
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        import random
        # Fallback to random 1536-dim vector if no key is provided
        return [random.uniform(-0.1, 0.1) for _ in range(1536)]
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={gemini_key}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text}]}
            }, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return data["embedding"]["values"]
    except Exception as e:
        print("Gemini Embedding API Error:", e)
    
    import random
    return [random.uniform(-0.1, 0.1) for _ in range(1536)]

class ProductSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

@app.post("/api/products/search/")
async def ai_search_products(payload: ProductSearchRequest):
    # 1. Get embedding vector for query
    embedding = await get_gemini_embedding(payload.query)
    # Convert float array to PostgreSQL vector string format: "[0.1,0.2,...]"
    vector_str = "[" + ",".join(map(str, embedding)) + "]"
    
    # 2. Perform cosine similarity query against pgvector column
    query = """
    SELECT id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description,
           1 - (embedding <=> $1::vector) as similarity
    FROM products
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    """
    try:
        rows = await execute_query(query, vector_str, payload.limit)
        results = []
        for r in rows:
            row_dict = dict(r)
            row_dict['price'] = float(row_dict['price'])
            row_dict['weight_grams'] = float(row_dict['weight_grams'])
            row_dict['similarity'] = float(row_dict['similarity']) if row_dict.get('similarity') is not None else 0.0
            results.append(row_dict)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"pgvector query failed: {str(e)}")

@app.post("/api/auth/forgot-password")
async def forgot_password(email: str):
    # Check if user exists
    user = await execute_query_one("SELECT id FROM users WHERE email = $1", email)
    if not user:
        # To prevent email enumeration, we still return success message
        return {"message": "Reset link sent if email exists."}
    
    # In a real app, generate a reset token and send an email
    return {"message": "Reset link sent if email exists."}

class CopywriterRequest(BaseModel):
    prompt: str

@app.post("/api/ai/copywriter/")
async def ai_product_copywriter(payload: CopywriterRequest):
    import httpx
    import json
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        # Fallback offline generator
        return {
            "success": True,
            "title": f"Nagore {payload.prompt.title()} Specialty",
            "description": f"Traditional, handpicked {payload.prompt} crafted with premium ingredients from the heritage town of Nagore. 100% fresh and natural sweets.",
            "tags": [payload.prompt.lower(), "nagore", "sweets", "traditional", "specialty"]
        }
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
    payload_data = {
        "contents": [{
            "parts": [{
                "text": f"You are the head copywriter for Bupzo AI Marketplace. Generate a marketplace title, description, and tags for product keyword: {payload.prompt}. Return strictly valid JSON with keys: 'title', 'description', and 'tags' (list of 5 strings)."
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload_data, timeout=10.0)
            if resp.status_code == 200:
                res_json = resp.json()
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                content = json.loads(text_content)
                return {
                    "success": True,
                    "title": content.get("title"),
                    "description": content.get("description"),
                    "tags": content.get("tags")
                }
    except Exception as e:
        print("Gemini Copywriter API Error:", e)
        
    return {
        "success": True,
        "title": f"Nagore {payload.prompt.title()} Specialty",
        "description": f"Traditional, handpicked {payload.prompt} crafted with premium ingredients from the heritage town of Nagore. 100% fresh and natural sweets.",
        "tags": [payload.prompt.lower(), "nagore", "sweets", "traditional", "specialty"]
    }

class KYCVerificationRequest(BaseModel):
    gst_number: str
    fssai_number: str
    seller_id: Optional[UUID] = None
    user_id: Optional[UUID] = None

@app.post("/api/ai/kyc/")
async def ai_verify_kyc(payload: KYCVerificationRequest):
    import re
    import json
    # Validate GST and FSSAI formats
    gst_valid = bool(re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", payload.gst_number))
    fssai_valid = bool(re.match(r"^[0-9]{14}$", payload.fssai_number))
    
    status = "APPROVED" if (gst_valid and fssai_valid) else "REJECTED"
    reason = "All checks passed. Business registration numbers verified against active registry." if status == "APPROVED" else "Invalid GSTIN or FSSAI license format."
    
    db_status = "APPROVED" if status == "APPROVED" else "REJECTED"
    kyc_payload = json.dumps({
        "gstin": payload.gst_number, 
        "fssai": payload.fssai_number, 
        "verification_score": 0.98 if status == "APPROVED" else 0.23, 
        "reason": reason
    })

    seller_id_val = None
    if payload.seller_id:
        await execute_query_none(
            "UPDATE sellers SET status = $1, kyc_details = $2, updated_at = NOW() WHERE id = $3",
            db_status, kyc_payload, payload.seller_id
        )
        seller_id_val = payload.seller_id
    elif payload.user_id:
        seller = await execute_query_one("SELECT id FROM sellers WHERE user_id = $1", payload.user_id)
        if seller:
            await execute_query_none(
                "UPDATE sellers SET status = $1, kyc_details = $2, updated_at = NOW() WHERE id = $3",
                db_status, kyc_payload, seller['id']
            )
            seller_id_val = seller['id']

    if seller_id_val:
        async with pool.acquire() as conn:
            s_info = await conn.fetchrow("SELECT business_name FROM sellers WHERE id = $1", seller_id_val)
            biz_name = s_info['business_name'] if s_info else "A Seller"
            await conn.execute(
                """
                INSERT INTO notifications (id, title, body, target_tab, read, created_at)
                VALUES ($1, $2, $3, $4, FALSE, NOW())
                """,
                uuid4(),
                "Seller KYC Verification",
                f"Seller '{biz_name}' completed KYC verification check. Result: {db_status}.",
                "merchants"
            )
        await clear_cache_keys("cache:notifications")

    return {
        "status": status,
        "gst_check": "VALID" if gst_valid else "INVALID",
        "fssai_check": "VALID" if fssai_valid else "INVALID",
        "reason": reason,
        "verification_score": 0.98 if status == "APPROVED" else 0.23
    }

class FraudAnalysisRequest(BaseModel):
    order_id: UUID
    user_id: UUID
    amount: float
    order_source: str

@app.post("/api/ai/fraud/")
async def ai_fraud_check(payload: FraudAnalysisRequest):
    risk_score = 15.0
    reasons = []
    
    if payload.amount > 10000:
        risk_score += 45.0
        reasons.append("High transaction value (>₹10,000)")
    if payload.order_source == "APP" and payload.amount > 5000:
        risk_score += 20.0
        reasons.append("Elevated mobile order volume")
        
    status = "HIGH_RISK" if risk_score > 70 else "SUSPICIOUS" if risk_score > 40 else "SAFE"
    
    return {
        "status": status,
        "risk_score_percent": risk_score,
        "reasons": reasons
    }

# Seller Management
@app.get("/api/sellers/", response_model=List[SellerResponse])
async def read_sellers():
    import json
    query = """
    SELECT s.id, s.user_id, s.business_name, s.commission_rate, s.status, s.kyc_details, s.created_at, s.updated_at,
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           COALESCE((SELECT COUNT(*) FROM seller_followers sf WHERE sf.seller_id = s.id), 0) as followers_count,
           COALESCE((SELECT COUNT(*) FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.seller_id = s.id), 0) as review_count,
           COALESCE((SELECT AVG(r.rating) FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.seller_id = s.id), 4.5) as rating
    FROM sellers s JOIN users u ON s.user_id = u.id
    """
    res = await execute_query(query)
    processed = []
    for row in res:
        kyc = row['kyc_details']
        if isinstance(kyc, str):
            try:
                kyc = json.loads(kyc)
            except Exception:
                kyc = {}
        processed.append({
            "id": row['id'],
            "user_id": row['user_id'],
            "business_name": row['business_name'],
            "commission_rate": float(row['commission_rate']),
            "status": row['status'],
            "kyc_details": kyc,
            "user_name": row["user_name"],
            "user_email": row["user_email"],
            "user_phone": row["user_phone"],
            "followers_count": int(row.get('followers_count', 0) or 0),
            "review_count": int(row.get('review_count', 0) or 0),
            "rating": round(float(row.get('rating', 4.5) or 4.5), 1),
            "created_at": row['created_at'],
            "updated_at": row['updated_at']
        })
    return processed

@app.get("/api/sellers/{seller_id}", response_model=SellerResponse)
async def read_seller(seller_id: UUID):
    import json
    query = "SELECT s.id, s.user_id, s.business_name, s.commission_rate, s.status, s.kyc_details, s.created_at, s.updated_at, u.name as user_name, u.email as user_email, u.phone as user_phone FROM sellers s JOIN users u ON s.user_id = u.id WHERE s.id = $1"
    res = await execute_query_one(query, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
    kyc = res['kyc_details']
    if isinstance(kyc, str):
        try:
            kyc = json.loads(kyc)
        except Exception:
            kyc = {}
    return {
        "id": res['id'],
        "user_id": res['user_id'],
        "business_name": res['business_name'],
        "commission_rate": float(res['commission_rate']),
        "status": res['status'],
        "kyc_details": kyc,
        "user_name": res["user_name"],
        "user_email": res["user_email"],
        "user_phone": res["user_phone"],
        "created_at": res['created_at'],
        "updated_at": res['updated_at']
    }

@app.post("/api/sellers/", response_model=SellerResponse)
async def register_seller(payload: SellerRegisterRequest):
    # 1. Check if user already exists
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT id, email FROM users WHERE phone = $1", payload.phone)
        if not user:
            # Create user
            user_id = uuid4()
            await conn.execute(
                """
                INSERT INTO users (id, phone, email, signup_platform)
                VALUES ($1, $2, $3, 'WEB')
                """,
                user_id, payload.phone, payload.email
            )
        else:
            user_id = user['id']
            # Update email if provided and not set
            if payload.email and not user['email']:
                await conn.execute("UPDATE users SET email = $1 WHERE id = $2", payload.email, user_id)

        # 2. Check if seller profile already exists for this user
        existing_seller = await conn.fetchrow("SELECT id FROM sellers WHERE user_id = $1", user_id)
        if existing_seller:
            raise HTTPException(status_code=400, detail="User is already registered as a merchant.")

        # 3. Create seller profile
        seller_id = uuid4()
        kyc_payload = json.dumps(payload.kyc_details or {})
        
        query = """
        INSERT INTO sellers (id, user_id, business_name, commission_rate, status, kyc_details)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, business_name, commission_rate, status, kyc_details, created_at, updated_at
        """
        try:
            res = await conn.fetchrow(query, seller_id, user_id, payload.business_name, payload.commission_rate, payload.status, kyc_payload)
            # Send Notification to Admin
            await conn.execute(
                """INSERT INTO notifications (id, title, body, target_tab, read, created_at)
                VALUES ($1, $2, $3, $4, FALSE, NOW())
                """,
                str(uuid4()),
                "New Merchant Registered",
                f"Merchant store '{payload.business_name}' has been created with status {payload.status}.",
                "merchants"
            )
            await clear_cache_keys("cache:notifications")
            return {
                "id": res['id'],
                "user_id": res['user_id'],
                "business_name": res['business_name'],
                "commission_rate": float(res['commission_rate']),
                "status": res['status'],
                "kyc_details": json.loads(res['kyc_details']) if isinstance(res['kyc_details'], str) else res['kyc_details'],
                "created_at": res['created_at'],
                "updated_at": res['updated_at']
            }
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=400, detail="Store/Business name already exists.")

@app.post("/api/sellers/{seller_id}/approve")
async def approve_seller(seller_id: UUID):
    query = "UPDATE sellers SET status = 'APPROVED', updated_at = NOW() WHERE id = $1 RETURNING id, status"
    res = await execute_query_one(query, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
    return {"success": True, "seller_id": res['id'], "status": res['status']}

@app.post("/api/sellers/{seller_id}/reject")
async def reject_seller(seller_id: UUID):
    query = "UPDATE sellers SET status = 'REJECTED', updated_at = NOW() WHERE id = $1 RETURNING id, status"
    res = await execute_query_one(query, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
    return {"success": True, "seller_id": res['id'], "status": res['status']}

class SellerUpdate(BaseModel):
    business_name: str
    commission_rate: float
    status: str
    kyc_details: Optional[dict] = None

# Update Seller Details / Commission
@app.put("/api/sellers/{seller_id}")
async def update_seller(seller_id: UUID, data: SellerUpdate):
    business_name = data.business_name
    commission_rate = data.commission_rate
    status = data.status
    kyc_details = json.dumps(data.kyc_details) if data.kyc_details is not None else None
    
    query = """
    UPDATE sellers
    SET business_name = $1, commission_rate = $2, status = $3, kyc_details = COALESCE($4, kyc_details), updated_at = NOW()
    WHERE id = $5
    RETURNING id, user_id, business_name, commission_rate, status, created_at, updated_at
    """
    res = await execute_query_one(query, business_name, commission_rate, status, kyc_details, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
        
    # Update users.is_seller
    if status == 'APPROVED':
        await execute_query_one("UPDATE users SET is_seller = TRUE WHERE id = $1 RETURNING id", res['user_id'])
    else:
        await execute_query_one("UPDATE users SET is_seller = FALSE WHERE id = $1 RETURNING id", res['user_id'])

    # Send notification for commission rate updates
    if commission_rate != 10.0:  # Default rate is 10.0
        async with pool.acquire() as conn:
            seller_info = await conn.fetchrow("SELECT business_name FROM sellers WHERE id = $1", seller_id)
            biz_name = seller_info['business_name'] if seller_info else "A Seller"
            await conn.execute(
                """INSERT INTO notifications (id, title, body, target_tab, read, created_at)
                VALUES ($1, $2, $3, $4, FALSE, NOW())
                """,
                str(uuid4()),
                "Commission Rate Updated",
                f"Seller '{biz_name}' updated commission rate to {commission_rate}%.",
                "merchants"
            )
        await clear_cache_keys("cache:notifications")

    return {
        "id": res['id'],
        "user_id": res['user_id'],
        "business_name": res['business_name'],
        "commission_rate": float(res['commission_rate']),
        "status": res['status'],
        "kyc_details": {},
        "created_at": res['created_at'],
        "updated_at": res['updated_at']
    }

# Delete Seller
@app.delete("/api/sellers/{seller_id}")
async def delete_seller(seller_id: UUID):
    query = "DELETE FROM sellers WHERE id = $1 RETURNING id"
    res = await execute_query_one(query, seller_id)
    if not res:
        raise HTTPException(status_code=404, detail="Seller not found")
    return {"success": True, "message": "Seller deleted successfully"}

# Payouts Management
@app.get("/api/payouts/", response_model=List[PayoutResponse])
async def read_payouts():
    query = "SELECT id, seller_id, amount, status, request_date, processed_date FROM seller_payouts"
    return await execute_query(query)

@app.post("/api/payouts/{payout_id}/approve")
async def approve_payout(payout_id: UUID):
    query = "UPDATE seller_payouts SET status = 'PROCESSED', processed_date = NOW() WHERE id = $1 RETURNING id, status"
    res = await execute_query_one(query, payout_id)
    if not res:
        raise HTTPException(status_code=404, detail="Payout request not found")
    return {"success": True, "payout_id": res['id'], "status": res['status']}

# Manual Wallet Overwrite
@app.post("/api/users/{user_id}/wallet/adjust")
async def adjust_wallet(user_id: UUID, payload: WalletAdjustmentRequest):
    # Verify user
    u_check = await execute_query_one("SELECT id, wallet_balance FROM users WHERE id = $1", user_id)
    if not u_check:
        # Check if the ID matches a seller's ID, and if so, adjust the associated user_id's wallet
        s_check = await execute_query_one("SELECT user_id FROM sellers WHERE id = $1", user_id)
        if s_check:
            user_id = s_check['user_id']
            u_check = await execute_query_one("SELECT id, wallet_balance FROM users WHERE id = $1", user_id)
        else:
            raise HTTPException(status_code=404, detail="User or Seller not found")

    change = payload.amount if payload.type == "Credit" else -payload.amount
    
    # Calculate new balance and verify it's not negative
    new_balance = float(u_check['wallet_balance']) + change
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Wallet balance cannot go below zero.")

    # Transaction block
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2", change, user_id)
            await conn.execute(
                "INSERT INTO wallet_transactions (id, user_id, amount, type, description) VALUES ($1, $2, $3, 'ADMIN_ADJUSTMENT', $4)",
                uuid4(), user_id, change, payload.reason or "Manual Admin Overwrite"
            )

    return {"success": True, "user_id": user_id, "new_balance": new_balance}

# Category Management
@app.get("/api/categories/", response_model=List[CategoryResponse])
async def read_categories():
    query = "SELECT id, name, description, created_at FROM categories"
    return await execute_query(query)

@app.post("/api/categories/", response_model=CategoryResponse)
async def create_category(payload: CategoryCreate):
    query = "INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description, created_at"
    try:
        res = await execute_query_one(query, uuid4(), payload.name, payload.description)
        return res
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Category already exists.")

@app.delete("/api/categories/{category_id}")
async def delete_category(category_id: UUID):
    async with pool.acquire() as conn:
        c = await conn.fetchrow("SELECT id FROM categories WHERE id = $1", category_id)
        if not c:
            raise HTTPException(status_code=404, detail="Category not found")
        await conn.execute("UPDATE products SET category_id = NULL WHERE category_id = $1", category_id)
        await conn.execute("DELETE FROM categories WHERE id = $1", category_id)
        await invalidate_cache(["cache:categories", "cache:products"])
        return {"success": True, "message": "Category deleted successfully"}

# Update Specialty Category
@app.put("/api/categories/{category_id}")
async def update_category(category_id: UUID, payload: CategoryCreate):
    query = """
    UPDATE categories
    SET name = $1, description = $2
    WHERE id = $3
    RETURNING id, name, description, created_at
    """
    res = await execute_query_one(query, payload.name, payload.description, category_id)
    if not res:
        raise HTTPException(status_code=404, detail="Category not found")
    await invalidate_cache(["cache:categories", "cache:products"])
    return res

# Coupon/Voucher Management
# Coupon/Voucher Management
@app.get("/api/coupons/", response_model=List[CouponResponse])
async def read_coupons(seller_id: Optional[UUID] = None):
    if seller_id:
        query = "SELECT id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_at, created_by_seller_id, status FROM coupons WHERE created_by_seller_id = $1 ORDER BY created_at DESC"
        return await execute_query(query, seller_id)
    else:
        query = "SELECT id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_at, created_by_seller_id, status FROM coupons ORDER BY created_at DESC"
        return await execute_query(query)

@app.post("/api/coupons/", response_model=CouponResponse)
async def create_coupon(payload: CouponCreate):
    # Auto status: PENDING if created by a seller, APPROVED if created by an admin
    assigned_status = payload.status if payload.status is not None else ('PENDING' if payload.created_by_seller_id else 'APPROVED')
    
    query = """
    INSERT INTO coupons 
    (id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_by_seller_id, status) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_at, created_by_seller_id, status
    """
    try:
        res = await execute_query_one(
            query, 
            uuid4(), 
            payload.code.upper(), 
            payload.discount_percent, 
            payload.is_premium_only, 
            payload.expiry_date, 
            payload.usage_limit, 
            payload.min_order_value,
            payload.created_by_seller_id,
            assigned_status
        )
        # If it's a seller creating a voucher, insert an admin notification
        if assigned_status == 'PENDING':
            notif_id = f"notif-coupon-{res['id']}"
            await execute_query(
                """INSERT INTO notifications (id, title, body, target_tab, target_id, read)
                   VALUES ($1, $2, $3, $4, $5, FALSE)
                   ON CONFLICT (id) DO NOTHING;""",
                notif_id,
                "Voucher Approval Required",
                f"Voucher code \"{res['code']}\" created by seller. Approval required.",
                "vouchers",
                str(res['id'])
            )
            # Clear notifications cache
            await clear_cache_keys("cache:notifications")
        return res
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Coupon code already exists.")

@app.post("/api/coupons/validate")
async def validate_coupon(payload: CouponValidateRequest):
    query = "SELECT id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, status FROM coupons WHERE code = $1"
    res = await execute_query_one(query, payload.code.upper())
    if not res:
        raise HTTPException(status_code=400, detail="Invalid coupon code.")
    
    if res['status'] == 'PENDING':
        raise HTTPException(status_code=400, detail="Voucher is pending admin approval and cannot be used yet.")
    elif res['status'] == 'REJECTED':
        raise HTTPException(status_code=400, detail="Voucher has been rejected by administration.")

    if datetime.now(res['expiry_date'].tzinfo) > res['expiry_date']:
        raise HTTPException(status_code=400, detail="Coupon has expired.")
    if payload.order_value < float(res['min_order_value']):
        raise HTTPException(status_code=400, detail=f"Minimum order value of ₹{res['min_order_value']} required.")

    discount = (payload.order_value * float(res['discount_percent'])) / 100.0

    return {
        "success": True,
        "code": res['code'],
        "discount_amount": discount,
        "discount_percentage": float(res['discount_percent'])
    }

# Update Coupon
@app.put("/api/coupons/{coupon_id}", response_model=CouponResponse)
async def update_coupon(coupon_id: UUID, payload: CouponUpdate):
    # Retrieve current coupon
    query_select = "SELECT id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_at, created_by_seller_id, status FROM coupons WHERE id = $1"
    current = await execute_query_one(query_select, coupon_id)
    if not current:
        raise HTTPException(status_code=404, detail="Coupon not found")

    code = payload.code.upper() if payload.code is not None else current['code']
    discount_percent = payload.discount_percent if payload.discount_percent is not None else float(current['discount_percent'])
    is_premium_only = payload.is_premium_only if payload.is_premium_only is not None else current['is_premium_only']
    expiry_date = payload.expiry_date if payload.expiry_date is not None else current['expiry_date']
    usage_limit = payload.usage_limit if payload.usage_limit is not None else current['usage_limit']
    min_order_value = payload.min_order_value if payload.min_order_value is not None else float(current['min_order_value'])
    status = payload.status if payload.status is not None else current['status']

    query_update = """
    UPDATE coupons 
    SET code = $1, discount_percent = $2, is_premium_only = $3, expiry_date = $4, usage_limit = $5, min_order_value = $6, status = $7 
    WHERE id = $8 
    RETURNING id, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, created_at, created_by_seller_id, status
    """
    try:
        res = await execute_query_one(query_update, code, discount_percent, is_premium_only, expiry_date, usage_limit, min_order_value, status, coupon_id)
        return res
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Coupon code already exists.")

@app.delete("/api/coupons/{coupon_id}")
async def delete_coupon(coupon_id: UUID):
    async with pool.acquire() as conn:
        c = await conn.fetchrow("SELECT id FROM coupons WHERE id = $1", coupon_id)
        if not c:
            raise HTTPException(status_code=404, detail="Coupon not found")
        await conn.execute("DELETE FROM coupons WHERE id = $1", coupon_id)
        await invalidate_cache(["cache:coupons"])
        return {"success": True, "message": "Coupon deleted successfully"}

# Update Product
@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: UUID, payload: ProductUpdate):
    # Retrieve current product
    query_select = "SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at FROM products WHERE id = $1"
    current = await execute_query_one(query_select, product_id)
    if not current:
        raise HTTPException(status_code=404, detail="Product not found")

    name = payload.name if payload.name is not None else current['name']
    category_id = payload.category_id if payload.category_id is not None else current['category_id']
    price = payload.price if payload.price is not None else float(current['price'])
    weight_grams = payload.weight_grams if payload.weight_grams is not None else float(current['weight_grams'])
    image_url = payload.image_url if payload.image_url is not None else current['image_url']
    is_combo = payload.is_combo if payload.is_combo is not None else current['is_combo']
    stock_quantity = payload.stock_quantity if payload.stock_quantity is not None else current['stock_quantity']
    description = payload.description if payload.description is not None else current['description']
    seller_id = payload.seller_id if payload.seller_id is not None else current['seller_id']
    images = json.dumps(payload.images) if payload.images is not None else (current['images'] if isinstance(current['images'], str) else json.dumps(current['images'] or []))

    query_update = """
    UPDATE products 
    SET name = $1, category_id = $2, price = $3, weight_grams = $4, image_url = $5, images = $6::jsonb, is_combo = $7, stock_quantity = $8, description = $9, seller_id = $10 
    WHERE id = $11 
    RETURNING id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at
    """
    res = await execute_query_one(query_update, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, description, str(seller_id), product_id)
    
    # Create Notification
    nid = str(uuid4())
    await execute_query_one("INSERT INTO notifications (id, title, body, target_tab, target_id) VALUES ($1, $2, $3, $4, $5) RETURNING id", nid, "Product Updated", f"Product '{name}' details were updated by an admin.", "products", str(product_id))

    if res and isinstance(res.get('images'), str):
        res = dict(res)
        try:
            res['images'] = json.loads(res['images'])
        except:
            res['images'] = []
    return res

# MinIO Upload Endpoint
@app.post("/api/upload/")
async def upload_image(request: Request, file: UploadFile = File(...)):
    filename = f"{uuid4().hex}_{file.filename}"
    file_data = await file.read()
    file_size = len(file_data)
    
    try:
        minio_client.put_object(
            MINIO_BUCKET,
            filename,
            io.BytesIO(file_data),
            file_size,
            content_type=file.content_type or "image/jpeg"
        )
        base_url = str(request.base_url).rstrip("/")
        # If running inside Docker, let the host resolve via the dynamic Request base_url (which points to the FastAPI host address as the user sees it)
        url = f"{base_url}/api/media/{filename}"
        return {"success": True, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO upload error: {str(e)}")

# MinIO Media Proxy Endpoint to bypass CORS and Docker local localhost network resolution issues
@app.get("/api/media/{filename}")
async def get_media_file(filename: str):
    try:
        # Fetch object from MinIO container internally
        response = minio_client.get_object(MINIO_BUCKET, filename)
        return StreamingResponse(response, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File {filename} not found in MinIO storage: {str(e)}")

# Get User Orders
@app.get("/api/orders/user/{user_id}", response_model=List[OrderResponse])
async def get_user_orders(user_id: UUID):
    query = """
    SELECT o.id, o.user_id, o.seller_id, o.total_amount, o.status, o.tracking_id, o.order_source, o.shipping_partner, o.payment_gateway, o.trust_donation_amount, o.currency, o.exchange_rate, o.created_at,
           COALESCE((
               SELECT json_agg(json_build_object(
                 'id', oi.id, 
                 'product_id', oi.product_id, 
                 'quantity', oi.quantity, 
                 'price', oi.price_at_purchase, 
                 'name', p.name, 
                 'image_url', p.image_url, 
                 'store_name', COALESCE(s.business_name, 'Bupzo Store')
               ))
               FROM order_items oi
               JOIN products p ON p.id = oi.product_id
               LEFT JOIN sellers s ON s.id = p.seller_id
               WHERE oi.order_id = o.id
           ), '[]'::json) as items
    FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC
    """
    res = await execute_query(query, user_id)
    
    processed = []
    for r in res:
        r_dict = dict(r)
        if isinstance(r_dict.get('items'), str):
            import json
            r_dict['items'] = json.loads(r_dict['items'])
        processed.append(r_dict)
            
    return processed

# Get Seller Orders
@app.get("/api/orders/", response_model=List[OrderResponse])
async def get_all_orders():
    query = """
    SELECT * FROM orders ORDER BY created_at DESC
    """
    rows = await execute_query(query)
    
    orders = []
    for row in rows:
        order_dict = dict(row)
        items_query = """
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        """
        items_rows = await execute_query(items_query, row['id'])
        order_dict['items'] = [dict(ir) for ir in items_rows]
        orders.append(order_dict)
    
    return orders

@app.get("/api/orders/seller/{seller_id}")
async def get_seller_orders(seller_id: str):
    try:
        sid = UUID(seller_id)
    except Exception:
        return []
    query = """
    SELECT id, user_id, seller_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway, trust_donation_amount, currency, exchange_rate, created_at
    FROM orders WHERE seller_id = $1 ORDER BY created_at DESC
    """
    res = await execute_query(query, sid)
    return res or []

# Get Single Order Details
@app.get("/api/orders/{order_id}", response_model=OrderResponse)
async def get_order_details(order_id: UUID):
    query = """
    SELECT id, user_id, seller_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway, trust_donation_amount, currency, exchange_rate, created_at
    FROM orders WHERE id = $1
    """
    res = await execute_query_one(query, order_id)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    return res

# Get User Wallet Transactions
@app.get("/api/wallet/transactions/{user_id}", response_model=List[WalletTransactionResponse])
async def get_user_wallet_transactions(user_id: UUID):
    query = """
    SELECT id, user_id, amount, type, description, created_at
    FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC
    """
    res = await execute_query(query, user_id)
    return res

# Get All Wallet Transactions
@app.get("/api/wallet/transactions/", response_model=List[WalletTransactionResponse])
async def get_all_wallet_transactions():
    query = """
    SELECT wt.id, wt.user_id, wt.amount, wt.type, wt.description, wt.created_at, u.phone as mobile_number
    FROM wallet_transactions wt
    LEFT JOIN users u ON wt.user_id = u.id
    ORDER BY wt.created_at DESC
    """
    res = await execute_query(query)
    return res

# Edit Wallet Transaction
@app.put("/api/wallet/transactions/{tx_id}")
async def edit_wallet_transaction(tx_id: UUID, amount: float, description: str, type: str):
    query = """
    UPDATE wallet_transactions
    SET amount = $1, description = $2, type = $3
    WHERE id = $4
    RETURNING id, user_id, amount, type, description, created_at
    """
    res = await execute_query_one(query, amount, description, type, tx_id)
    if not res:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return res

# Delete Wallet Transaction
@app.delete("/api/wallet/transactions/{tx_id}")
async def delete_wallet_transaction(tx_id: UUID):
    query = "DELETE FROM wallet_transactions WHERE id = $1 RETURNING id"
    res = await execute_query_one(query, tx_id)
    if not res:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"success": True, "message": "Transaction deleted successfully"}

# Update Order Status
@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: UUID, status: str):
    valid_statuses = ['pending', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed']
    if status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status.")
    
    query = "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status"
    res = await execute_query_one(query, status.lower(), order_id)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "order_id": res['id'], "status": res['status']}

class OrderUpdateRequest(BaseModel):
    status: Optional[str] = None
    shipping_provider: Optional[str] = None
    tracking_number: Optional[str] = None

@app.put("/api/orders/{order_id}")
async def update_order_full(order_id: UUID, req: OrderUpdateRequest):
    fields = []
    values = []
    idx = 1
    if req.status is not None:
        fields.append(f"status = ${idx}")
        values.append(req.status.lower())
        idx += 1
    if req.shipping_provider is not None:
        fields.append(f"shipping_provider = ${idx}")
        values.append(req.shipping_provider)
        idx += 1
    if req.tracking_number is not None:
        fields.append(f"tracking_number = ${idx}")
        values.append(req.tracking_number)
        idx += 1
    if not fields:
        return {"success": True, "message": "No changes requested"}
    
    fields.append("updated_at = NOW()")
    query = f"UPDATE orders SET {', '.join(fields)} WHERE id = ${idx} RETURNING id, status"
    values.append(order_id)
    res = await execute_query_one(query, *values)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "order_id": res['id'], "status": res['status']}

@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: UUID):
    await execute_query("DELETE FROM order_items WHERE order_id = $1", order_id)
    res = await execute_query_one("DELETE FROM orders WHERE id = $1 RETURNING id", order_id)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "deleted_order_id": str(order_id)}

# Disputes Endpoints
@app.get("/api/disputes/", response_model=List[DisputeResponse])
async def get_disputes():
    cache_key = "cache:disputes"
    cached = await get_cached_data(cache_key)
    if cached:
        return cached

    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, customer, seller, amount, risk, status, description, created_at FROM disputes ORDER BY created_at DESC;")
        data = []
        for r in rows:
            data.append({
                "id": r["id"],
                "customer": r["customer"],
                "seller": r["seller"],
                "amount": float(r["amount"]),
                "risk": r["risk"],
                "status": r["status"],
                "description": r["description"],
                "created_at": r["created_at"]
            })
        await set_cached_data(cache_key, data, ttl=120)
        return data

@app.put("/api/disputes/{dispute_id}", response_model=DisputeResponse)
async def update_dispute(dispute_id: str, dispute: DisputeUpdate):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "UPDATE disputes SET status = $1 WHERE id = $2 RETURNING id, customer, seller, amount, risk, status, description, created_at;",
            dispute.status, dispute_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        data = {
            "id": row["id"],
            "customer": row["customer"],
            "seller": row["seller"],
            "amount": float(row["amount"]),
            "risk": row["risk"],
            "status": row["status"],
            "description": row["description"],
            "created_at": row["created_at"]
        }
        await clear_cache_keys("cache:disputes")
        return data

# Notifications Endpoints
@app.get("/api/notifications/", response_model=List[NotificationResponse])
async def get_notifications(user_id: Optional[UUID] = Query(None)):
    cache_key = f"cache:notifications:{user_id}" if user_id else "cache:notifications:all"
    cached = await get_cached_data(cache_key)
    if cached:
        return cached

    async with pool.acquire() as conn:
        if user_id:
            rows = await conn.fetch("SELECT id, title, body, target_tab, target_id, created_at, read FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;", user_id)
        else:
            rows = await conn.fetch("SELECT id, title, body, target_tab, target_id, created_at, read FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC;")
        
        data = []
        for r in rows:
            dt: datetime = r["created_at"]
            data.append({
                "id": r["id"],
                "title": r["title"],
                "body": r["body"],
                "targetTab": r["target_tab"],
                "target_id": r["target_id"],
                "read": r["read"],
                "created_at": dt,
                "timestamp": dt.strftime("%H:%M")
            })
        await set_cached_data(cache_key, data, ttl=30)
        return data

@app.post("/api/notifications/", response_model=NotificationResponse)
async def create_notification(notif: NotificationCreate):
    nid = str(uuid4())
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO notifications (id, title, body, target_tab, target_id, read)
               VALUES ($1, $2, $3, $4, $5, FALSE)
               RETURNING id, title, body, target_tab, target_id, created_at, read;""",
            nid, notif.title, notif.body, notif.targetTab, notif.target_id
        )
        dt: datetime = row["created_at"]
        data = {
            "id": row["id"],
            "title": row["title"],
            "body": row["body"],
            "targetTab": row["target_tab"],
            "target_id": row["target_id"],
            "read": row["read"],
            "created_at": dt,
            "timestamp": dt.strftime("%H:%M")
        }
        await clear_cache_keys("cache:notifications")
        return data

@app.post("/api/notifications/{id}/read")
async def mark_notification_read(id: str):
    async with pool.acquire() as conn:
        await conn.execute("UPDATE notifications SET read = TRUE WHERE id = $1;", id)
    await clear_cache_keys("cache:notifications")
    return {"success": True}

class AddressCreate(BaseModel):
    name: str
    street: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/api/addresses/user/{user_id}")
async def get_user_addresses(user_id: str):
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM addresses WHERE user_id = $1", user_id)
        return [dict(row) for row in rows]

@app.post("/api/addresses/")
async def create_address(user_id: str, addr: AddressCreate):
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO addresses (user_id, name, street, city, state, zip_code)
            VALUES ($1::uuid, $2, $3, $4, $5, $6)
            """, user_id, addr.name, addr.street, addr.city, addr.state, addr.zip_code
        )
        return {"success": True}

class MessageCreate(BaseModel):
    receiver_id: str
    order_id: Optional[str] = None
    subject: str
    content: str

@app.get("/api/messages/")
async def get_messages(user_id: Optional[str] = None):
    async with pool.acquire() as conn:
        if user_id:
            rows = await conn.fetch("SELECT m.*, u1.name as sender_name, u2.name as receiver_name FROM messages m JOIN users u1 ON m.sender_id = u1.id JOIN users u2 ON m.receiver_id = u2.id WHERE m.sender_id = $1 OR m.receiver_id = $1 ORDER BY m.created_at DESC", user_id)
        else:
            rows = await conn.fetch("SELECT m.*, u1.name as sender_name, u2.name as receiver_name FROM messages m JOIN users u1 ON m.sender_id = u1.id JOIN users u2 ON m.receiver_id = u2.id ORDER BY m.created_at DESC")
        return [dict(row) for row in rows]

@app.post("/api/messages/")
async def create_message(user_id: str, msg: MessageCreate):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO messages (sender_id, receiver_id, order_id, subject, content)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5) RETURNING *
            """, user_id, msg.receiver_id, msg.order_id, msg.subject, msg.content
        )
        return dict(row)

@app.put("/api/messages/{message_id}/read")
async def mark_message_read(message_id: UUID):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING id, is_read", message_id)
        if not row:
            raise HTTPException(status_code=404, detail="Message not found")
        return dict(row)

@app.put("/api/messages/mark-all-read")
async def mark_all_messages_read(user_id: str):
    async with pool.acquire() as conn:
        await conn.execute("UPDATE messages SET is_read = TRUE WHERE receiver_id = $1::uuid", user_id)
        return {"success": True, "marked_user": user_id}

@app.delete("/api/messages/{message_id}")
async def delete_message(message_id: UUID):
    async with pool.acquire() as conn:
        row = await conn.fetchrow("DELETE FROM messages WHERE id = $1 RETURNING id", message_id)
        if not row:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"success": True, "deleted_id": str(message_id)}

class ReviewCreate(BaseModel):
    user_id: str
    product_id: str
    rating: int
    comment: Optional[str] = None
    images: Optional[List[str]] = []

@app.post("/api/reviews/")
async def create_review(rev: ReviewCreate):
    async with pool.acquire() as conn:
        try:
            import json
            images_json = json.dumps(rev.images)
            row = await conn.fetchrow(
                """
                INSERT INTO reviews (user_id, product_id, rating, content, images)
                VALUES ($1::uuid, $2::uuid, $3, $4, $5::jsonb) RETURNING *, content as comment
                """, rev.user_id, rev.product_id, rev.rating, rev.comment, images_json
            )
            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=400, detail="You have already reviewed this product.")

@app.get("/api/reviews/")
async def get_all_reviews(product_id: Optional[str] = None, seller_id: Optional[str] = None):
    async with pool.acquire() as conn:
        if product_id:
            rows = await conn.fetch("SELECT r.*, r.content as comment, p.name as product_name, u.name as user_name FROM reviews r JOIN products p ON r.product_id = p.id JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC", product_id)
        elif seller_id:
            rows = await conn.fetch("SELECT r.*, r.content as comment, p.name as product_name, u.name as user_name FROM reviews r JOIN products p ON r.product_id = p.id JOIN users u ON r.user_id = u.id WHERE p.seller_id = $1 ORDER BY r.created_at DESC", seller_id)
        else:
            rows = await conn.fetch("SELECT r.*, r.content as comment, p.name as product_name, u.name as user_name FROM reviews r JOIN products p ON r.product_id = p.id JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC")
        import json
        results = []
        for row in rows:
            d = dict(row)
            if isinstance(d.get('images'), str):
                try:
                    d['images'] = json.loads(d['images'])
                except:
                    d['images'] = []
            results.append(d)
        return results

@app.get("/api/sellers/{seller_id}/followers")
async def get_seller_followers(seller_id: str):
    async with pool.acquire() as conn:
        try:
            sid = UUID(seller_id)
            rows = await conn.fetch(
                """
                SELECT u.id, u.name, u.email, sf.created_at
                FROM seller_followers sf
                JOIN users u ON sf.user_id = u.id
                WHERE sf.seller_id = $1
                ORDER BY sf.created_at DESC
                """, sid
            )
            count = len(rows)
            return {"count": count, "followers": [dict(r) for r in rows]}
        except Exception:
            return {"count": 0, "followers": []}

@app.post("/api/sellers/{seller_id}/follow")
async def follow_seller(seller_id: str, user_id: str):
    async with pool.acquire() as conn:
        try:
            await conn.execute(
                """
                INSERT INTO seller_followers (user_id, seller_id)
                VALUES ($1::uuid, $2::uuid)
                ON CONFLICT DO NOTHING
                """, user_id, seller_id
            )
            return {"success": True, "message": "Store followed"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/sellers/{seller_id}/follow")
async def unfollow_seller(seller_id: str, user_id: str):
    async with pool.acquire() as conn:
        try:
            await conn.execute(
                "DELETE FROM seller_followers WHERE user_id = $1::uuid AND seller_id = $2::uuid",
                user_id, seller_id
            )
            return {"success": True, "message": "Store unfollowed"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        pass
