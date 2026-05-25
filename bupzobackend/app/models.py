from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, DECIMAL, Date, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    phone_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    is_premium = Column(Boolean, default=False)
    signup_platform = Column(String)
    referred_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    wallet_balance = Column(DECIMAL(10, 2), default=0.00)
    privacy_policy_accepted = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=True)
    bank_acc_for_refund = Column(String)
    bank_ifsc_for_refund = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    referred_users = relationship("User", backref="referrer", remote_side=[id])
    seller = relationship("Seller", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user")

class Seller(Base):
    __tablename__ = "sellers"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True)
    shop_name = Column(String, unique=True, index=True)
    status = Column(String, default="PENDING")
    commission_rate = Column(DECIMAL(5, 2), default=0.05)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="seller")
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="seller")
    sales_stats = relationship("SalesStat", back_populates="seller")

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, index=True)
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    price = Column(DECIMAL(10, 2))
    weight_grams = Column(Integer, default=500)
    image_url = Column(String)
    is_combo = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    category = relationship("Category", back_populates="products")
    seller = relationship("Seller", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), index=True)
    total_amount = Column(DECIMAL(10, 2))
    status = Column(String, default="PENDING")
    tracking_id = Column(String)
    order_source = Column(String)
    shipping_partner = Column(String)
    payment_gateway = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="orders")
    seller = relationship("Seller", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    payment_log = relationship("PaymentLog", back_populates="order", uselist=False)
    shipping_log = relationship("ShippingLog", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True)
    quantity = Column(Integer)
    price = Column(DECIMAL(10, 2))
    created_at = Column(DateTime, default=datetime.now)

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

class Wallet(Base):
    __tablename__ = "wallets"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    balance = Column(DECIMAL(10, 2), default=0.00)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    amount = Column(DECIMAL(10, 2))
    transaction_type = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", backref="transactions")
    wallet = relationship("Wallet", back_populates="transactions")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    rating = Column(Integer)
    comment = Column(Text)
    image_urls = Column(ARRAY(String))
    created_at = Column(DateTime, default=datetime.now)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")