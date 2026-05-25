# This file makes the app/api directory a Python package
from fastapi import APIRouter

# Create a router for the API
api_router = APIRouter()

# Import routers
from . import auth, products, orders, wallet, payments

# Include routers in the API router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])