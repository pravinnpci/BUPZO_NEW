from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class UserBase(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    is_premium: bool = False
    signup_platform: str
    privacy_policy_accepted: bool
    marketing_consent: bool = True

class UserCreate(UserBase):
    phone_number: str

class User(UserBase):
    id: UUID
    phone_number: str
    wallet_balance: Decimal = 0.00
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: Optional[str] = None

class UserInDB(User):
    hashed_password: Optional[str] = None

class SellerBase(BaseModel):
    shop_name: str
    status: str = "PENDING"
    commission_rate: Decimal = Decimal("0.05")

class SellerCreate(SellerBase):
    pass

class Seller(SellerBase):
    id: UUID
    user_id: UUID

    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    weight_grams: int = 500
    image_url: Optional[str] = None
    is_combo: bool = False
    stock_quantity: int = 0

class ProductCreate(ProductBase):
    category_id: UUID
    seller_id: UUID

class Product(ProductBase):
    id: UUID
    category_id: UUID
    seller_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    total_amount: Decimal
    status: str = "PENDING"
    tracking_id: Optional[str] = None
    order_source: str
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None

class OrderCreate(OrderBase):
    user_id: UUID
    seller_id: UUID

class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int
    price: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: UUID
    order_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

class Order(OrderBase):
    id: UUID
    user_id: UUID
    seller_id: UUID
    order_items: List[OrderItem] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Wallet(BaseModel):
    user_id: UUID
    balance: Decimal = 0.00
    updated_at: datetime

    class Config:
        orm_mode = True

class WalletTransactionBase(BaseModel):
    amount: Decimal
    transaction_type: str
    description: Optional[str] = None

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransaction(WalletTransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

class ReviewBase(BaseModel):
    product_id: UUID
    user_id: UUID
    rating: int
    comment: Optional[str] = None
    image_urls: Optional[List[str]] = []

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True