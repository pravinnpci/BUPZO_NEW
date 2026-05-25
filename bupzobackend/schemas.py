"""
BUPZO Pydantic Schemas
Request and response validation schemas
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    phone: str
    email: Optional[EmailStr] = None
    is_premium: bool = False
    signup_platform: str
    referred_by: Optional[UUID] = None
    privacy_accepted: bool = False

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: UUID
    wallet_balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    category_id: UUID
    price: float
    weight_grams: int
    image_url: Optional[str] = None
    is_combo: bool = False
    stock_quantity: int = 0

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: UUID
    seller_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int
    price_at_purchase: float

class OrderBase(BaseModel):
    total_amount: float
    status: str
    order_source: str
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class OrderResponse(BaseModel):
    id: str
    date: str
    status: str
    items: List[dict]
    total: float

class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category: str
    stock: int
    price: float
    lowStock: bool

class SalesAnalyticsResponse(BaseModel):
    totalRevenue: float
    totalOrders: int
    monthlyRevenue: List[float]
    monthlyOrders: List[int]
    labels: List[str]

class TrackingResponse(BaseModel):
    id: str
    orderId: str
    status: str
    location: str
    eta: str

class WalletTransactionBase(BaseModel):
    amount: float
    type: str
    description: Optional[str] = None

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransactionResponse(WalletTransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: UUID
    role: str