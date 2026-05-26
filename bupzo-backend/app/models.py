from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Numeric, JSON, ARRAY, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKeyConstraint
import uuid
from datetime import datetime

Base = declarative_base()

class Category(Base):
    __tablename__ = 'categories'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    is_premium = Column(Boolean, default=False)
    signup_platform = Column(String, CheckConstraint("signup_platform IN ('WEB', 'APP')"), nullable=False)
    referred_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    wallet_balance = Column(Numeric(10, 2), default=0.00)
    privacy_accepted = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=True)
    bank_acc_for_refund = Column(String)
    bank_ifsc_for_refund = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    referrals = relationship("Referral", back_populates="referrer")
    seller = relationship("Seller", uselist=False, back_populates="user")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wallet_transactions = relationship("WalletTransaction", back_populates="user")
    product_views = relationship("ProductView", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user")
    referrals_received = relationship("Referral", foreign_keys="Referral.referred_user_id", back_populates="referred_user")

class Seller(Base):
    __tablename__ = 'sellers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), unique=True, nullable=False)
    shop_name = Column(String, unique=True, nullable=False)
    status = Column(String, CheckConstraint("status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')"), default="PENDING")
    commission_rate = Column(Numeric(5, 2), default=5.00)
    kyc_details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="seller")
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="seller")
    seller_products = relationship("SellerProduct", back_populates="seller")
    payouts = relationship("SellerPayout", back_populates="seller")
    sales_stats = relationship("SalesStat", back_populates="seller")

class Product(Base):
    __tablename__ = 'products'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id'))
    price = Column(Numeric(10, 2), nullable=False)
    weight_grams = Column(Integer, default=500)
    image_url = Column(String)
    is_combo = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    seller_id = Column(UUID(as_uuid=True), ForeignKey('sellers.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", backref="products")
    seller = relationship("Seller", back_populates="products")
    reviews = relationship("Review", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    product_views = relationship("ProductView", back_populates="product")
    wishlist = relationship("Wishlist", back_populates="product")
    flash_sales = relationship("FlashSale", back_populates="product")
    seller_products = relationship("SellerProduct", back_populates="product")

class Order(Base):
    __tablename__ = 'orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    seller_id = Column(UUID(as_uuid=True), ForeignKey('sellers.id'))
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="INR")
    exchange_rate = Column(Numeric(10, 4), default=1.00)
    status = Column(String, CheckConstraint("status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')"), default="PENDING")
    tracking_id = Column(String)
    order_source = Column(String, CheckConstraint("order_source IN ('WEB', 'APP')"), nullable=False)
    shipping_partner = Column(String)
    payment_gateway = Column(String)
    trust_donation_amount = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    seller = relationship("Seller", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    payment_logs = relationship("PaymentLog", back_populates="order")
    shipping_logs = relationship("ShippingLog", back_populates="order")

class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete="CASCADE"),
    )

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

class WalletTransaction(Base):
    __tablename__ = 'wallet_transactions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_type = Column(String, CheckConstraint("transaction_type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK')"), nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wallet_transactions")

class Review(Base):
    __tablename__ = 'reviews'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    rating = Column(Integer, CheckConstraint("rating BETWEEN 1 AND 5"), nullable=False)
    comment = Column(Text)
    image_urls = Column(ARRAY(String))
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Coupon(Base):
    __tablename__ = 'coupons'

    code = Column(String, primary_key=True)
    discount_percent = Column(Integer, CheckConstraint("discount_percent BETWEEN 0 AND 100"))
    min_order_value = Column(Numeric(10, 2), default=0.00)
    is_premium_only = Column(Boolean, default=False)
    expiry_date = Column(Date)
    usage_limit = Column(Integer, default=1)
    used_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class PaymentLog(Base):
    __tablename__ = 'payment_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    gateway_name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, nullable=False)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    payment_intent_id = Column(String)
    gateway_transaction_id = Column(String)

    order = relationship("Order", back_populates="payment_logs")

class ShippingLog(Base):
    __tablename__ = 'shipping_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    courier_partner = Column(String, nullable=False)
    shipping_cost = Column(Numeric(10, 2), nullable=False)
    delivery_status = Column(String, default="PENDING")
    tracking_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="shipping_logs")

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    action = Column(String, nullable=False)
    details = Column(JSON)
    ip_address = Column(INET)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class SalesStat(Base):
    __tablename__ = 'sales_stats'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey('sellers.id'))
    date = Column(Date, nullable=False)
    total_sales = Column(Numeric(10, 2), default=0.00)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller = relationship("Seller", back_populates="sales_stats")

class Banner(Base):
    __tablename__ = 'banners'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_url = Column(String, nullable=False)
    title = Column(String)
    description = Column(String)
    link_url = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AdminSetting(Base):
    __tablename__ = 'admin_settings'

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    value_type = Column(String, default="string")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemAlert(Base):
    __tablename__ = 'system_alerts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, CheckConstraint("severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SellerProduct(Base):
    __tablename__ = 'seller_products'

    seller_id = Column(UUID(as_uuid=True), ForeignKey('sellers.id'), primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("Seller", back_populates="seller_products")
    product = relationship("Product", back_populates="seller_products")

class SellerPayout(Base):
    __tablename__ = 'seller_payouts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey('sellers.id'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, CheckConstraint("status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')"), default="PENDING")
    payout_method = Column(String)
    transaction_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller = relationship("Seller", back_populates="payouts")

class Referral(Base):
    __tablename__ = 'referrals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    referred_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    reward_amount = Column(Numeric(10, 2), default=0.00)
    status = Column(String, CheckConstraint("status IN ('PENDING', 'CLAIMED', 'EXPIRED')"), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals")
    referred_user = relationship("User", foreign_keys=[referred_user_id], back_populates="referrals_received")

class ProductView(Base):
    __tablename__ = 'product_views'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    viewed_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="product_views")
    user = relationship("User", back_populates="product_views")

class SpinWinReward(Base):
    __tablename__ = 'spin_win_rewards'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    reward_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, CheckConstraint("status IN ('PENDING', 'CLAIMED', 'EXPIRED')"), default="PENDING")
    payout_method = Column(String)
    transaction_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")

class Wishlist(Base):
    __tablename__ = 'wishlist'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    price_drop_alert_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wishlist")
    product = relationship("Product", back_populates="wishlist")

    __table_args__ = (UniqueConstraint('user_id', 'product_id'),)

class FlashSale(Base):
    __tablename__ = 'flash_sales'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    discount_percent = Column(Integer, nullable=False)
    flash_sale_price = Column(Numeric(10, 2), server_default="price * (1 - discount_percent / 100)")
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="flash_sales")