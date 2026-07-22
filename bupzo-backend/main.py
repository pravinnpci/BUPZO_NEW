import os
from typing import List, Optional, Any
from passlib.context import CryptContext

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DECIMAL, JSONB, ForeignKey, Text, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="BUPZO Backend API",
    description="FastAPI backend for BUPZO e-commerce platform",
    version="0.1.0",
)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    is_premium = Column(Boolean, default=False)
    signup_platform = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)
    referred_by = Column(Integer, ForeignKey("users.id"))
    wallet_balance = Column(DECIMAL(10, 2), default=0.00)
    privacy_accepted = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    referrer = relationship("User", remote_side=[id], backref="referrals")
    seller_profile = relationship("Seller", back_populates="user", uselist=False)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Seller(Base):
    __tablename__ = "sellers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String, nullable=False)
    commission_rate = Column(DECIMAL(5, 2), nullable=False)
    status = Column(String, default="PENDING")
    kyc_details = Column(JSONB)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="seller_profile")
    products = relationship("Product", back_populates="seller")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    weight_grams = Column(Integer, nullable=False)
    image_url = Column(Text)
    is_combo = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    is_approved = Column(Boolean, default=False)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category")
    seller = relationship("Seller", back_populates="products")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String, default="Pending")
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    seller = relationship("Seller")

class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_default = Column(Boolean, default=False)

    user = relationship("User", backref="addresses")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String, nullable=False)
    receiver_id = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Pydantic Schemas for Request/Response ---
class UserBase(BaseModel):
    phone: str
    email: Optional[str] = None
    is_premium: bool = False
    signup_platform: str
    referred_by: Optional[int] = None
    wallet_balance: float = 0.00
    privacy_accepted: bool = False

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(UserBase):
    phone: Optional[str] = None
    signup_platform: Optional[str] = None

class UserInDB(UserBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

class AddressBase(BaseModel):
    name: str
    street: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressInDB(AddressBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class AuthLogin(BaseModel):
    username: str
    password: str

class AuthGoogle(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    id_token: str

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryInDB(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class SellerBase(BaseModel):
    user_id: int
    business_name: str
    commission_rate: float
    status: str = "PENDING"
    kyc_details: Optional[dict] = None

class SellerCreate(SellerBase):
    pass

class SellerUpdate(BaseModel):
    user_id: Optional[int] = None
    business_name: Optional[str] = None
    commission_rate: Optional[float] = None
    status: Optional[str] = None
    kyc_details: Optional[dict] = None

class SellerInDB(SellerBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    category_id: int
    price: float
    weight_grams: int
    image_url: Optional[str] = None
    is_combo: bool = False
    stock_quantity: int = 0
    is_approved: bool = False
    seller_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    weight_grams: Optional[int] = None
    stock_quantity: Optional[int] = None
    seller_id: Optional[int] = None

class ProductInDB(ProductBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    customer_name: str
    amount: float
    status: str = "Pending"
    seller_id: int

class OrderCreate(OrderBase):
    pass

class OrderInDB(OrderBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

class MessageBase(BaseModel):
    sender_id: str
    receiver_id: str
    subject: Optional[str] = None
    content: str

class MessageCreate(MessageBase):
    pass

class MessageInDB(MessageBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        orm_mode = True

@app.get("/")
async def read_root():
    return {"message": "Welcome to BUPZO Backend API!"}

# Users CRUD
@app.post("/users/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: SessionLocal = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[UserInDB])
def read_users(skip: int = 0, limit: int = 100, db: SessionLocal = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserInDB)
def read_user(user_id: int, db: SessionLocal = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=UserInDB)
def update_user(user_id: int, user: UserUpdate, db: SessionLocal = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: SessionLocal = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return

# Products CRUD
@app.post("/products/", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: SessionLocal = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[ProductInDB])
def read_products(skip: int = 0, limit: int = 100, seller_id: Optional[int] = None, db: SessionLocal = Depends(get_db)):
    query = db.query(Product)
    if seller_id is not None:
        query = query.filter(Product.seller_id == seller_id)
    else:
        query = query.filter(Product.is_approved == True)
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=ProductInDB)
def read_product(product_id: int, db: SessionLocal = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_id}", response_model=ProductInDB)
def update_product(product_id: int, product: ProductUpdate, db: SessionLocal = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: SessionLocal = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return

# Orders CRUD
@app.post("/orders/", response_model=OrderInDB, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: SessionLocal = Depends(get_db)):
    db_order = Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/seller/{seller_id}", response_model=List[OrderInDB])
def read_orders(seller_id: int, skip: int = 0, limit: int = 100, db: SessionLocal = Depends(get_db)):
    query = db.query(Order).filter(Order.seller_id == seller_id)
    orders = query.offset(skip).limit(limit).all()
    return orders

# Sellers CRUD (similar patterns for categories, orders, etc. can be added)
@app.post("/sellers/", response_model=SellerInDB, status_code=status.HTTP_201_CREATED)
def create_seller(seller: SellerCreate, db: SessionLocal = Depends(get_db)):
    db_seller = Seller(**seller.dict())
    db.add(db_seller)
    db.commit()
    db.refresh(db_seller)
    return db_seller

@app.get("/sellers/", response_model=List[SellerInDB])
def read_sellers(skip: int = 0, limit: int = 100, db: SessionLocal = Depends(get_db)):
    sellers = db.query(Seller).offset(skip).limit(limit).all()
    return sellers

@app.get("/sellers/{seller_id}", response_model=SellerInDB)
def read_seller(seller_id: int, db: SessionLocal = Depends(get_db)):
    seller = db.query(Seller).filter(Seller.id == seller_id).first()
    if seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller

@app.put("/sellers/{seller_id}", response_model=SellerInDB)
def update_seller(seller_id: int, seller: SellerUpdate, db: SessionLocal = Depends(get_db)):
    db_seller = db.query(Seller).filter(Seller.id == seller_id).first()
    if db_seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")
    for key, value in seller.dict(exclude_unset=True).items():
        setattr(db_seller, key, value)
    db.commit()
    db.refresh(db_seller)
    return db_seller

@app.delete("/sellers/{seller_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seller(seller_id: int, db: SessionLocal = Depends(get_db)):
    db_seller = db.query(Seller).filter(Seller.id == seller_id).first()
    if db_seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")
    db.delete(db_seller)
    db.commit()
    return

# --- Authentication Endpoints ---
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "bupzo_secret_key"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60 * 24 * 7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/register")
def auth_register(user: UserCreate, db: SessionLocal = Depends(get_db)):
    # Check existing phone or email
    existing = db.query(User).filter((User.phone == user.phone) | (User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this phone or email already exists")
    
    db_user = User(
        phone=user.phone,
        email=user.email,
        signup_platform=user.signup_platform,
        is_premium=user.is_premium,
        privacy_accepted=user.privacy_accepted
    )
    if user.password:
        db_user.password_hash = get_password_hash(user.password)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = create_access_token({"sub": db_user.phone, "user_id": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": db_user.id, "phone": db_user.phone, "email": db_user.email}}

@app.post("/auth/login")
def auth_login(creds: AuthLogin, db: SessionLocal = Depends(get_db)):
    user = db.query(User).filter((User.phone == creds.username) | (User.email == creds.username)).first()
    if not user or not user.password_hash or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    token = create_access_token({"sub": user.phone, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "phone": user.phone, "email": user.email}}

@app.post("/auth/google")
def auth_google(google_data: AuthGoogle, db: SessionLocal = Depends(get_db)):
    # In a real app, verify id_token with Firebase/Google here
    user = db.query(User).filter(User.email == google_data.email).first()
    if not user:
        # Create new user
        user = User(
            phone=google_data.phone or f"google_{google_data.email}",
            email=google_data.email,
            signup_platform="google",
            privacy_accepted=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token({"sub": user.email, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "phone": user.phone, "email": user.email}}

@app.post("/auth/forgot-password")
def auth_forgot_password(email: str):
    # Dummy implementation for demo
    return {"success": True, "message": "If that email exists, a reset link was sent."}

# --- Address Endpoints ---
@app.post("/addresses/", response_model=AddressInDB)
def create_address(address: AddressCreate, user_id: int, db: SessionLocal = Depends(get_db)):
    db_address = Address(**address.dict(), user_id=user_id)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

@app.get("/addresses/user/{user_id}", response_model=List[AddressInDB])
def get_user_addresses(user_id: int, db: SessionLocal = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == user_id).all()

@app.post("/messages/", response_model=MessageInDB, status_code=status.HTTP_201_CREATED)
def create_message(msg: MessageCreate, db: SessionLocal = Depends(get_db)):
    db_msg = Message(**msg.dict())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@app.get("/messages/", response_model=List[MessageInDB])
def get_messages(user_id: Optional[str] = None, db: SessionLocal = Depends(get_db)):
    if user_id:
        return db.query(Message).filter((Message.sender_id == user_id) | (Message.receiver_id == user_id)).order_by(Message.created_at.desc()).all()
    return db.query(Message).order_by(Message.created_at.desc()).all()