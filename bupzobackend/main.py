"""
BUPZO FastAPI Backend
Production-ready FastAPI application with CORS and database integration
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers import auth, products, wallet

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

# Create database tables
@app.on_event("startup")
async def startup_db_client():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

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