"""
BUPZO FastAPI Backend
Production-ready FastAPI application with CORS and database integration
"""
import os
import json
from datetime import date
from decimal import Decimal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import redis
from database import engine, Base, SessionLocal
from routers import auth, products, wallet
from models import Category, Product, User, Order, OrderItem, WalletTransaction, PaymentLog, ShippingLog

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="BUPZO API",
    description="Enterprise-grade multi-vendor e-commerce platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(Category).count() > 0:
            return

        seller = User(
            phone="+919812345678",
            email="seller@bupzo.com",
            is_premium=True,
            signup_platform="WEB",
            wallet_balance=Decimal("0.00"),
            privacy_accepted=True,
        )
        customer = User(
            phone="+919876543210",
            email="customer@bupzo.com",
            is_premium=False,
            signup_platform="WEB",
            wallet_balance=Decimal("150.00"),
            privacy_accepted=True,
        )

        categories = [
            Category(name="Dry Fruits", description="Premium imported dry fruits and packed nuts."),
            Category(name="Halwa", description="Artisanal halwa made with traditional recipes."),
            Category(name="Spices", description="Freshly ground herbs and spice blends for every recipe."),
            Category(name="Gift Sets", description="Curated gourmet gift packages for every celebration."),
        ]

        db.add_all([seller, customer])
        db.add_all(categories)
        db.flush()

        products = [
            Product(
                name="Premium Mixed Dry Fruits Gift Box",
                category_id=categories[0].id,
                price=Decimal("349.00"),
                weight_grams=500,
                image_url="https://images.unsplash.com/photo-1598214886806-c2896e899622?auto=format&fit=crop&w=600&q=80",
                stock_quantity=120,
                seller_id=seller.id,
            ),
            Product(
                name="Traditional Gajar Halwa",
                category_id=categories[1].id,
                price=Decimal("199.00"),
                weight_grams=400,
                image_url="https://images.unsplash.com/photo-1604328108342-234b40f09003?auto=format&fit=crop&w=600&q=80",
                stock_quantity=80,
                seller_id=seller.id,
            ),
            Product(
                name="Saffron-Infused Spice Kit",
                category_id=categories[2].id,
                price=Decimal("179.00"),
                weight_grams=250,
                image_url="https://images.unsplash.com/photo-1581092580960-959e007056c9?auto=format&fit=crop&w=600&q=80",
                stock_quantity=150,
                seller_id=seller.id,
            ),
            Product(
                name="Festive Gourmet Gift Hamper",
                category_id=categories[3].id,
                price=Decimal("699.00"),
                weight_grams=1200,
                image_url="https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=600&q=80",
                stock_quantity=40,
                seller_id=seller.id,
            ),
        ]

        db.add_all(products)
        db.flush()

        order = Order(
            user_id=customer.id,
            total_amount=Decimal("548.00"),
            status="DELIVERED",
            tracking_id="BUPZO2345",
            order_source="WEB",
            shipping_partner="Shiprocket",
            payment_gateway="Razorpay",
        )
        db.add(order)
        db.flush()

        order_items = [
            OrderItem(
                order_id=order.id,
                product_id=products[0].id,
                quantity=1,
                price_at_purchase=Decimal("349.00"),
            ),
            OrderItem(
                order_id=order.id,
                product_id=products[1].id,
                quantity=1,
                price_at_purchase=Decimal("199.00"),
            ),
        ]
        db.add_all(order_items)

        payment_log = PaymentLog(
            order_id=order.id,
            amount=Decimal("548.00"),
            gateway="Razorpay",
            transaction_id="TRX-784321",
            status="SUCCESS",
            response_code="00",
            response_message="Payment processed successfully.",
        )
        shipping_log = ShippingLog(
            order_id=order.id,
            partner="Shiprocket",
            tracking_id="SR123456789",
            status="DELIVERED",
            estimated_delivery=date.today(),
            actual_delivery=date.today(),
        )
        wallet_transaction = WalletTransaction(
            user_id=customer.id,
            amount=Decimal("150.00"),
            type="CASHBACK",
            description="Festival cashback bonus.",
        )

        db.add_all([payment_log, shipping_log, wallet_transaction])
        db.commit()
    except Exception as exc:
        print("Database seed failed:", exc)
        db.rollback()
    finally:
        db.close()


def seed_redis():
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        return

    try:
        redis_client = redis.from_url(redis_url)
        redis_client.ping()
        redis_client.set("bupzo:dashboard:popular_categories", json.dumps([
            {"name": "Dry Fruits", "items": 42},
            {"name": "Halwa", "items": 28},
            {"name": "Spices", "items": 55},
        ]))
        redis_client.set("bupzo:cache:featured_products", json.dumps([
            {"id": "1", "name": "Premium Mixed Dry Fruits Gift Box"},
            {"id": "2", "name": "Traditional Gajar Halwa"},
            {"id": "3", "name": "Saffron-Infused Spice Kit"},
        ]))
        redis_client.close()
    except Exception as exc:
        print("Redis seed failed:", exc)


# Create database tables and seed initial data on startup
@app.on_event("startup")
async def startup_db_client():
    Base.metadata.create_all(bind=engine)
    seed_database()
    seed_redis()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
try:
    from routers import agents as agents_router
    app.include_router(agents_router.router, prefix="/api/agents", tags=["agents"])
except Exception:
    # agents router is optional; if missing, continue without it
    pass

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "BUPZO API is running"}