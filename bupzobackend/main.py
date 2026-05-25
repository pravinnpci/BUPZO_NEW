from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from redis import asyncio as aioredis
from databases import Database
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to databases
    app.state.redis = aioredis.from_url(os.getenv("UPSTASH_REDIS_REST_URL"))
    app.state.db = Database(os.getenv("DATABASE_URL"))
    await app.state.db.connect()

    yield

    # Shutdown: Disconnect from databases
    await app.state.db.disconnect()
    await app.state.redis.close()

app = FastAPI(
    title="BUPZO Core API",
    description="The Next-Gen AI-Powered Multi-Vendor E-Commerce Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"status": "BUPZO Backend Live"}

# Include routers
from app.api import auth, products, orders, wallet, payments

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}