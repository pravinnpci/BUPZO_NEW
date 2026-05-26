#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "======================================================="
echo "         BUPZO MONOREPO GENESIS INITIALIZER"
echo "======================================================="
echo "This script will set up the BUPZO monorepo structure for local development automatically."
echo "Please ensure you are running this from the desired project root directory (e.g., /c/Projects/bupzo-project)."
echo ""

# Define PROJECT_ROOT as the directory where this script is executed
PROJECT_ROOT="$(pwd)"

# 1. Core Application Folders
echo "Creating core application folders..."
rm -rf bupzo-frontend && mkdir -p bupzo-frontend || { echo "Failed to create bupzo-frontend"; exit 1; }
rm -rf bupzo-backend && mkdir -p bupzo-backend || { echo "Failed to create bupzo-backend"; exit 1; }
rm -rf bupzo-mcp && mkdir -p bupzo-mcp || { echo "Failed to create bupzo-mcp"; exit 1; }
rm -rf infra && mkdir -p infra || { echo "Failed to create infra"; exit 1; }
rm -rf database && mkdir -p database || { echo "Failed to create database"; exit 1; }
rm -rf database/migrations && mkdir -p database/migrations || { echo "Failed to create database/migrations"; exit 1; }
rm -rf .github && mkdir -p .github || { echo "Failed to create .github"; exit 1; }
rm -rf .github/workflows && mkdir -p .github/workflows || { echo "Failed to create .github/workflows"; exit 1; }

# Use pushd/popd to manage directory changes safely
pushd "$PROJECT_ROOT"

# 2. Initialize bupzofrontend (Next.js)
echo "Initializing bupzofrontend (Next.js)..."
pushd bupzo-frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm --skip-install --force || exit 1
npm install || exit 1
# Add basic Dockerfile for frontend
cat << EOF > Dockerfile || exit 1
# Stage 1: Builder
FROM node:20-alpine as builder
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_PORT
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm install -g lightningcss # Required for Tailwind CSS
RUN npm run build
# Stage 2: Runner
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
ENV PORT 3000
CMD ["npm", "run", "start"]
EOF
popd

# 3. Initialize bupzo-backend (FastAPI)
echo "Initializing bupzo-backend (FastAPI)..."
pushd bupzo-backend
mkdir -p app || exit 1
mkdir -p app/api || exit 1
mkdir -p app/core || exit 1
mkdir -p app/services || exit 1
mkdir -p app/models || exit 1
# Create dummy main.py for FastAPI
cat << EOF > app/main.py || exit 1
from fastapi import FastAPI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from redis.asyncio import Redis
load_dotenv()
app = FastAPI(title="BUPZO Core API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003", "http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://bupzo_user:bupzo_password@db:5432/bupzo_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
async def get_db(): async with AsyncSessionLocal() as session: yield session
@app.get("/")
async def read_root(): return {"status": "BUPZO Backend Live"}
EOF
# Create requirements.txt
cat << EOF > requirements.txt || exit 1
fastapi==0.110.0
uvicorn==0.28.0
python-dotenv==1.0.1
psycopg2-binary==2.9.9
sqlalchemy==2.0.29
asyncpg==0.29.0
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.9
httpx==0.27.0
redis==5.0.3
EOF
# Add basic Dockerfile for backend
cat << EOF > Dockerfile || exit 1
FROM python:3.11-slim-buster
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF
popd

# 4. Initialize bupzo-mcp (Node.js)
echo "Initializing bupzo-mcp (Node.js)..."
pushd bupzo-mcp
npm init -y || exit 1
npm install pg ioredis @modelcontextprotocol/server @google/generative-ai axios uuid dotenv express body-parser cors nodemon || exit 1
# Create dummy index.js for MCP (simplified for genesis)
cat << EOF > index.js || exit 1
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, });
async function connectToDatabase() { try { await client.connect(); console.log('Connected to PostgreSQL database'); } catch (err) { console.error('Error connecting to the database', err); } }
app.get('/', (req, res) => res.send('MCP Server Live'));
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => { console.log(\`MCP Server running on port \${PORT}\`); connectToDatabase(); });
EOF
# Add basic Dockerfile for mcp
cat << EOF > Dockerfile || exit 1
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3004
CMD ["npm", "run", "dev"]
EOF
popd

# 5. Create infra/main.tf placeholder
echo "Creating infra/main.tf placeholder..."
pushd infra
cat << EOF > main.tf || exit 1
# Terraform configuration for BUPZO infrastructure
# This file will be populated with Vercel, Supabase, Upstash Redis automation
EOF
popd

# 6. Create database/schema.sql
echo "Creating database/schema.sql..."
pushd database
cat << EOF > schema.sql || exit 1
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT, -- Added as per requirements
    is_premium BOOLEAN DEFAULT FALSE,
    signup_platform TEXT CHECK (signup_platform IN ('WEB', 'APP')) NOT NULL,
    referred_by UUID REFERENCES users(id),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT TRUE,
    bank_acc_for_refund TEXT,
    bank_ifsc_for_refund TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Sellers Table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    shop_name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    commission_rate DECIMAL(5, 2) DEFAULT 0.05,
    kyc_details JSONB, -- Added as per requirements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    weight_grams INT DEFAULT 500,
    image_url TEXT,
    is_combo BOOLEAN DEFAULT FALSE,
    stock_quantity INT DEFAULT 0,
    seller_id UUID REFERENCES sellers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES sellers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    order_source TEXT CHECK (order_source IN ('WEB', 'APP')) NOT NULL,
    shipping_partner TEXT,
    payment_gateway TEXT,
    trust_donation_amount DECIMAL(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    tracking_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 6. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 7. Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 8. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 9. Coupons Table
CREATE TABLE coupons (
    code TEXT PRIMARY KEY,
    discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
    min_order_value DECIMAL(10, 2) DEFAULT 0.00, -- Fixed duplication
    is_premium_only BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    usage_limit INT DEFAULT 1,
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    used_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 10. Payment Logs Table
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    gateway_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_intent_id TEXT,
    gateway_transaction_id TEXT
);
-- 11. Shipping Logs Table
CREATE TABLE shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    courier_partner TEXT NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    delivery_status TEXT DEFAULT 'PENDING',
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 12. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 13. Sales Stats Table
CREATE TABLE sales_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id),
    date DATE NOT NULL,
    total_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 14. Banners Table
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 15. Admin Settings Table
CREATE TABLE admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    value_type TEXT DEFAULT 'string', -- Added as per requirements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 16. System Alerts Table
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 17. Seller Products Table (Junction Table)
CREATE TABLE seller_products (
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (seller_id, product_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 18. Seller Payouts Table
CREATE TABLE seller_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    payout_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 19. Referrals Table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_user_id UUID REFERENCES users(id) NOT NULL,
    reward_amount DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 20. Product Views Table
CREATE TABLE product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    user_id UUID REFERENCES users(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 21. Spin Win Rewards Table
CREATE TABLE spin_win_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    reward_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')),
    payout_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 22. Wishlist Table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    price_drop_alert_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
-- 23. Flash Sales Table
CREATE TABLE flash_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    discount_percent INT NOT NULL,
    flash_sale_price DECIMAL(10, 2) GENERATED ALWAYS AS (price * (1 - discount_percent / 100)) STORED,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);
EOF
popd

# 7. Create docker-compose.yml
echo "Creating docker-compose.yml..."
cat << EOF > docker-compose.yml || exit 1
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    container_name: bupzo_db
    environment:
      POSTGRES_USER: bupzo_user
      POSTGRES_PASSWORD: bupzo_password
      POSTGRES_DB: bupzo_db
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bupzo_user -d bupzo_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bupzo_redis
    ports:
      - "6380:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend-api:
    build:
      context: ./bupzo-backend
      dockerfile: Dockerfile
    container_name: bupzo_backend
    environment:
      DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
      REDIS_URL: redis://redis:6379
      GEMINI_API_KEY: \${GEMINI_API_KEY}
      WHATSAPP_API_TOKEN: \${WHATSAPP_API_TOKEN}
      BREVO_API_KEY: \${BREVO_API_KEY}
      PAYMENT_KEY_ID: \${PAYMENT_KEY_ID}
      PAYMENT_KEY_SECRET: \${PAYMENT_KEY_SECRET}
      PHONEPE_MERCHANT_ID: \${PHONEPE_MERCHANT_ID}
      PHONEPE_SALT_KEY: \${PHONEPE_SALT_KEY}
      SHIPROCKET_EMAIL: \${SHIPROCKET_EMAIL}
      PHONEPE_SALT_INDEX: ${PHONEPE_SALT_INDEX}
      SHIPROCKET_PASSWORD: \${SHIPROCKET_PASSWORD}
      NIMBUSPOST_API_KEY: \${NIMBUSPOST_API_KEY}
      DELIVERY_API_TOKEN: \${DELIVERY_API_TOKEN}
      WEBHOOK_SECRET: \${WEBHOOK_SECRET}
    ports:
      - "8003:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./bupzo-backend:/app
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

  mcp-server:
    # MCP Server: Node.js (@modelcontextprotocol/sdk) for AI Agent Tools.
    build:
      context: ./bupzo-mcp
      dockerfile: Dockerfile
    container_name: bupzo_mcp
    environment:
      DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
      REDIS_URL: redis://redis:6379
      # AI & External API Keys (for Backend & MCP)
      GEMINI_API_KEY: \${GEMINI_API_KEY}
      WHATSAPP_API_TOKEN: \${WHATSAPP_API_TOKEN}
    ports:
      - "3004:3004"
    depends_on:
      db:
        condition: service_healthy
      backend-api:
        condition: service_started
      redis:
        condition: service_healthy
    volumes:
      - ./bupzo-mcp:/app
    command: ["npm", "run", "dev"]

  frontend-client:
    build:
      context: ./bupzo-frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_BASE_PATH=/
        - NEXT_PUBLIC_PORT=3000
    container_name: bupzo_frontend_client
    ports:
      - "3003:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend-api:8000
      NEXT_PUBLIC_MCP_URL: http://mcp-server:3004
      NEXT_PUBLIC_PORT: 3003
      NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    depends_on:
      backend-api:
        condition: service_started
      mcp-server:
        condition: service_started
    volumes:
      - ./bupzo-frontend:/app
      - /app/node_modules
    command: ["npm", "run", "dev", "--", "-p", "3000"]

  frontend-admin:
    build:
      context: ./bupzo-frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_BASE_PATH=/admin
        - NEXT_PUBLIC_PORT=3000
    container_name: bupzo_frontend_admin
    ports:
      - "3005:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend-api:8000
      NEXT_PUBLIC_MCP_URL: http://mcp-server:3004
      NEXT_PUBLIC_PORT: 3005
      NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    depends_on:
      backend-api:
        condition: service_started
      mcp-server:
        condition: service_started
    volumes:
      - ./bupzo-frontend:/app
      - /app/node_modules
    command: ["npm", "run", "dev", "--", "-p", "3000"]

volumes:
  pgdata:
  redisdata:
EOF

# 8. Create .env.example
echo "Creating .env.example..."
cat << EOF > .env.example || exit 1
# --- BUPZO CONFIGURATION ENVIRONMENT ---
# Database Configuration
DATABASE_URL=postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
REDIS_URL=redis://redis:6379
# Supabase Configuration (for cloud deployment)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
WHATSAPP_API_TOKEN=
BREVO_API_KEY=
PAYMENT_KEY_ID=
PAYMENT_KEY_SECRET=
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
NIMBUSPOST_API_KEY=
DELIVERY_API_TOKEN=
WEBHOOK_SECRET=
# Firebase Configuration (for Push Notifications & OTP)
FIREBASE_SERVER_KEY=
FIREBASE_CONFIG_JSON= # JSON string of your Firebase config
# Google reCAPTCHA (for Bot Protection)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
# Authentication and Deployment (for CI/CD)
GITHUB_TOKEN=
DOCKER_HUB_TOKEN=
VERCEL_TOKEN=
# Upstash Redis (for cloud deployment, if not using local Docker Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
EOF

popd # Pop from PROJECT_ROOT to the initial directory

echo "======================================================="
echo "SUCCESS: BUPZO Framework Structure Initialized!"
echo "Next: Fill in the API keys into the newly created .env.example file."
echo "Then, copy .env.example to .env and fill in local values if needed."
echo "======================================================="