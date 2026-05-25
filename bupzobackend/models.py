from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Text, ARRAY, Date, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    is_premium = Column(Boolean, default=False)
    signup_platform = Column(Enum('WEB', 'APP', name='signup_platform_enum'), nullable=False)
    referred_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    wallet_balance = Column(Numeric(10, 2), default=0.00)
    privacy_policy_accepted = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=True)
    bank_acc_for_refund = Column(String)
    bank_ifsc_for_refund = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    referred_users = relationship("User", backref="referrer", remote_side=[id])
    seller = relationship("Seller", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    wallet_transactions = relationship("WalletTransaction", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Seller(Base):
    __tablename__ = "sellers"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True, nullable=False)
    shop_name = Column(String, unique=True, index=True, nullable=False)
    status = Column(Enum('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED', name='seller_status_enum'), default='PENDING')
    commission_rate = Column(Numeric(5, 2), default=0.05)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="seller")
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="seller")
    sales_stats = relationship("SalesStat", back_populates="seller")

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    price = Column(Numeric(10, 2), nullable=False)
    weight_grams = Column(Integer, default=500)
    image_url = Column(String)
    is_combo = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    seller = relationship("Seller", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', name='order_status_enum'), default='PENDING')
    tracking_id = Column(String)
    order_source = Column(Enum('WEB', 'APP', name='order_source_enum'), nullable=False)
    shipping_partner = Column(String)
    payment_gateway = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    seller = relationship("Seller", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment_log = relationship("PaymentLog", back_populates="order", uselist=False)
    shipping_log = relationship("ShippingLog", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

class Wallet(Base):
    __tablename__ = "wallets"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    balance = Column(Numeric(10, 2), default=0.00)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    amount = Column(Numeric(10, 2))
    transaction_type = Column(Enum('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK', name='transaction_type_enum'), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="wallet_transactions")
    wallet = relationship("Wallet", back_populates="transactions")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    image_urls = Column(ARRAY(String))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Coupon(Base):
    __tablename__ = "coupons"

    code = Column(String, primary_key=True)
    discount_percent = Column(Integer, nullable=False)
    is_premium_only = Column(Boolean, default=False)
    expiry_date = Column(Date)
    usage_limit = Column(Integer, default=1)
    used_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PaymentLog(Base):
    __tablename__ = "payment_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    gateway_name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, nullable=False)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    gateway_transaction_id = Column(String)

    order = relationship("Order", back_populates="payment_log")

class ShippingLog(Base):
    __tablename__ = "shipping_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    courier_partner = Column(String, nullable=False)
    shipping_cost = Column(Numeric(10, 2), nullable=False)
    delivery_status = Column(String, default='PENDING')
    tracking_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="shipping_log")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    action = Column(String, nullable=False)
    details = Column(JSON)
    ip_address = Column(INET)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")

class SalesStat(Base):
    __tablename__ = "sales_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), index=True)
    date = Column(Date, nullable=False)
    total_sales = Column(Numeric(10, 2), default=0.00)
    total_orders = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    seller = relationship("Seller", back_populates="sales_stats")

class Banner(Base):
    __tablename__ = "banners"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    title = Column(String)
    description = Column(Text)
    link_url = Column(String)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AdminSetting(Base):
    __tablename__ = "admin_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())