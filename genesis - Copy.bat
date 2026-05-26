@echo off
setlocal

echo =======================================================
echo          BUPZO MONOREPO GENESIS INITIALIZER
echo =======================================================
echo This script will set up the BUPZO monorepo structure for local development automatically.
echo Please ensure you are running this from the desired project root directory (e.g., C:\Projects\bupzo-project).
echo.

:: Define PROJECT_ROOT as the directory where this script is executed
set "PROJECT_ROOT=%~dp0"
:: Remove trailing backslash from PROJECT_ROOT if it exists
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

:: 1. Core Application Folders
echo Creating core application folders...
mkdir bupzo-frontend || exit /b %errorlevel%
mkdir bupzo-backend || exit /b %errorlevel%
mkdir bupzo-mcp || exit /b %errorlevel%
mkdir infra || exit /b %errorlevel%
mkdir database || exit /b %errorlevel%
mkdir database\migrations || exit /b %errorlevel%
mkdir .github || exit /b %errorlevel%
mkdir .github\workflows || exit /b %errorlevel%

:: Use pushd/popd to manage directory changes safely
pushd "%PROJECT_ROOT%"

:: 2. Initialize bupzofrontend (Next.js)
echo Initializing bupzofrontend (Next.js)...
echo WORKDIR /app
echo COPY --from=builder /app/package*.json ./
echo COPY --from=builder /app/node_modules ./node_modules
echo COPY --from=builder /app/.next ./.next
echo COPY --from=builder /app/public ./public
echo ENV PORT 3000
echo CMD ["npm", "run", "start"]
) > Dockerfile || exit /b %errorlevel%
pushd bupzo-frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm --skip-install --force || exit /b %errorlevel%
npm install || exit /b %errorlevel%
:: Add basic Dockerfile for frontend
(
echo # Stage 1: Builder
echo FROM node:20-alpine as builder
echo ARG NEXT_PUBLIC_BASE_PATH
echo ARG NEXT_PUBLIC_PORT
echo WORKDIR /app
echo COPY package.json package-lock.json ./
echo RUN npm ci --omit=dev
echo COPY . .
echo RUN npm run build
echo # Stage 2: Runner
echo FROM node:20-alpine
echo WORKDIR /app
echo COPY --from=builder /app/package*.json ./
echo COPY --from=builder /app/node_modules ./node_modules
echo COPY --from=builder /app/.next ./.next
echo COPY --from=builder /app/public ./public
echo ENV PORT 3000
echo CMD ["npm", "run", "start"]
) > Dockerfile || exit /b %errorlevel%
popd

:: 3. Initialize bupzo-backend (FastAPI)
echo Initializing bupzo-backend (FastAPI)...
pushd bupzo-backend
mkdir app || exit /b %errorlevel%
mkdir app\api || exit /b %errorlevel%
mkdir app\core || exit /b %errorlevel%
mkdir app\services || exit /b %errorlevel%
mkdir app\models || exit /b %errorlevel%
:: Create dummy main.py for FastAPI
echo from fastapi import FastAPI > app\main.py
echo import os >> app\main.py
echo from dotenv import load_dotenv >> app\main.py
echo from fastapi.middleware.cors import CORSMiddleware >> app\main.py
echo from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine >> app\main.py
echo from sqlalchemy.orm import sessionmaker >> app\main.py
echo from redis.asyncio import Redis >> app\main.py
echo load_dotenv() >> app\main.py
echo app = FastAPI(title="BUPZO Core API") >> app\main.py
echo app.add_middleware( >> app\main.py
echo     CORSMiddleware, >> app\main.py
echo     allow_origins=["http://localhost:3003", "http://localhost:3005"], >> app\main.py
echo     allow_credentials=True, >> app\main.py
echo     allow_methods=["*"], >> app\main.py
echo     allow_headers=["*"], >> app\main.py
echo ) >> app\main.py
echo DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://bupzo_user:bupzo_password@db:5432/bupzo_db") >> app\main.py
echo REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379") >> app\main.py
echo engine = create_async_engine(DATABASE_URL, echo=True) >> app\main.py
echo AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession) >> app\main.py
echo async def get_db(): async with AsyncSessionLocal() as session: yield session >> app\main.py
echo @app.get("/") >> app\main.py
echo async def read_root(): return {"status": "BUPZO Backend Live"} >> app\main.py
(
echo from fastapi import FastAPI
echo import os
echo from dotenv import load_dotenv
echo from fastapi.middleware.cors import CORSMiddleware
echo from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
echo from sqlalchemy.orm import sessionmaker
echo from redis.asyncio import Redis
echo load_dotenv()
echo app = FastAPI(title="BUPZO Core API")
echo app.add_middleware(
echo     CORSMiddleware,
echo     allow_origins=["http://localhost:3003", "http://localhost:3005"],
echo     allow_credentials=True,
echo     allow_methods=["*"],
echo     allow_headers=["*"],
echo )
echo DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://bupzo_user:bupzo_password@db:5432/bupzo_db")
echo REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
echo engine = create_async_engine(DATABASE_URL, echo=True)
echo AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
echo async def get_db(): async with AsyncSessionLocal() as session: yield session
echo @app.get("/")
echo async def read_root(): return {"status": "BUPZO Backend Live"}
) > app\main.py || exit /b %errorlevel%
:: Create requirements.txt
echo fastapi==0.110.0 > requirements.txt
echo uvicorn==0.28.0 >> requirements.txt
echo python-dotenv==1.0.1 >> requirements.txt
echo psycopg2-binary==2.9.9 >> requirements.txt
echo sqlalchemy==2.0.29 >> requirements.txt
echo asyncpg==0.29.0 >> requirements.txt
echo pydantic==2.7.1 >> requirements.txt
echo pydantic-settings==2.2.1 >> requirements.txt
echo python-jose==3.3.0 >> requirements.txt
echo passlib==1.7.4 >> requirements.txt
echo python-multipart==0.0.9 >> requirements.txt
echo httpx==0.27.0 >> requirements.txt
echo redis==5.0.3 >> requirements.txt
echo python-dotenv==1.0.1 >> requirements.txt
echo fastapi==0.110.0
echo uvicorn==0.28.0
echo python-dotenv==1.0.1
echo psycopg2-binary==2.9.9
echo sqlalchemy==2.0.29
echo asyncpg==0.29.0
echo pydantic==2.7.1
echo pydantic-settings==2.2.1
echo python-jose==3.3.0
echo passlib==1.7.4
echo python-multipart==0.0.9
echo httpx==0.27.0
echo redis==5.0.3
) > requirements.txt || exit /b %errorlevel%
:: Add basic Dockerfile for backend
echo FROM python:3.11-slim-buster > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY requirements.txt . >> Dockerfile
echo RUN pip install --no-cache-dir -r requirements.txt >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 8000 >> Dockerfile
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] >> Dockerfile
cd ..
echo FROM python:3.11-slim-buster
echo WORKDIR /app
echo COPY requirements.txt .
echo RUN pip install --no-cache-dir -r requirements.txt
echo COPY . .
echo EXPOSE 8000
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
) > Dockerfile || exit /b %errorlevel%
popd

:: 4. Initialize bupzo-mcp (Node.js)
echo Initializing bupzo-mcp (Node.js)...
pushd bupzo-mcp
npm init -y || exit /b %errorlevel%
npm install pg ioredis @modelcontextprotocol/server @google/generative-ai axios uuid dotenv express body-parser cors nodemon || exit /b %errorlevel%
:: Create dummy index.js for MCP (simplified for genesis)
echo require('dotenv').config(); > index.js
echo const express = require('express'); >> index.js
echo const app = express(); >> index.js
echo app.use(express.json()); >> index.js
echo const { Client } = require('pg'); >> index.js
echo const bodyParser = require('body-parser'); >> index.js
echo const cors = require('cors'); >> index.js
echo app.use(cors()); >> index.js
echo app.use(bodyParser.json()); >> index.js
echo const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, }); >> index.js
echo async function connectToDatabase() { try { await client.connect(); console.log('Connected to PostgreSQL database'); } catch (err) { console.error('Error connecting to the database', err); } } >> index.js
echo app.get('/', (req, res) => res.send('MCP Server Live')); >> index.js
echo const PORT = process.env.PORT || 3004; >> index.js
echo app.listen(PORT, () => { console.log(`MCP Server running on port ${PORT}`); connectToDatabase(); }); >> index.js
(
echo require('dotenv').config();
echo const express = require('express');
echo const app = express();
echo app.use(express.json());
echo const { Client } = require('pg');
echo const bodyParser = require('body-parser');
echo const cors = require('cors');
echo app.use(cors());
echo app.use(bodyParser.json());
echo const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, });
echo async function connectToDatabase() { try { await client.connect(); console.log('Connected to PostgreSQL database'); } catch (err) { console.error('Error connecting to the database', err); } }
echo app.get('/', (req, res) => res.send('MCP Server Live'));
echo const PORT = process.env.PORT || 3004;
echo app.listen(PORT, () => { console.log(`MCP Server running on port ${PORT}`); connectToDatabase(); });
:: Add basic Dockerfile for mcp
echo FROM node:20-alpine > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json package-lock.json ./ >> Dockerfile
echo RUN npm ci --omit=dev >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 3004 >> Dockerfile
echo CMD ["npm", "run", "dev"] >> Dockerfile
cd ..
(
echo FROM node:20-alpine
echo WORKDIR /app
echo COPY package.json package-lock.json ./
echo RUN npm ci --omit=dev
echo COPY . .
echo EXPOSE 3004
echo CMD ["npm", "run", "dev"]
) > Dockerfile || exit /b %errorlevel%
cd "%PROJECT_ROOT%" || exit /b %errorlevel%

:: 5. Create infra/main.tf placeholder
echo Creating infra/main.tf placeholder...
cd infra
echo # Terraform configuration for BUPZO infrastructure > main.tf
echo # This file will be populated with Vercel, Supabase, Upstash Redis automation >> main.tf
cd ..
cd infra || exit /b %errorlevel%
(
echo # Terraform configuration for BUPZO infrastructure
echo # This file will be populated with Vercel, Supabase, Upstash Redis automation
) > main.tf || exit /b %errorlevel%
cd "%PROJECT_ROOT%" || exit /b %errorlevel%
 
:: 6. Create database/schema.sql
echo Creating database/schema.sql...
cd database
echo -- Enable UUID generation > schema.sql
echo CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; >> schema.sql
echo -- 1. Categories Table >> schema.sql
echo CREATE TABLE categories ( >> schema.sql
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql 
echo     name TEXT UNIQUE NOT NULL, >> schema.sql
echo     description TEXT, >> schema.sql
echo     image_url TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 2. Users Table >> schema.sql
echo CREATE TABLE users ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     phone_number TEXT UNIQUE NOT NULL, >> schema.sql
echo     email TEXT UNIQUE, >> schema.sql
echo     full_name TEXT, >> schema.sql
echo     is_premium BOOLEAN DEFAULT FALSE, >> schema.sql
echo     signup_platform TEXT CHECK (signup_platform IN ('WEB', 'APP')) NOT NULL, >> schema.sql
echo     referred_by UUID REFERENCES users(id), >> schema.sql
echo     wallet_balance DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     privacy_policy_accepted BOOLEAN DEFAULT FALSE, >> schema.sql
echo     marketing_consent BOOLEAN DEFAULT TRUE, >> schema.sql
echo     bank_acc_for_refund TEXT, >> schema.sql
echo     bank_ifsc_for_refund TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 3. Sellers Table >> schema.sql
echo CREATE TABLE sellers ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     user_id UUID REFERENCES users(id) UNIQUE NOT NULL, >> schema.sql
echo     shop_name TEXT UNIQUE NOT NULL, >> schema.sql
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')), >> schema.sql
echo     commission_rate DECIMAL(5, 2) DEFAULT 0.05, >> schema.sql
echo     kyc_details JSONB, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 4. Products Table >> schema.sql
echo CREATE TABLE products ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     name TEXT NOT NULL, >> schema.sql
echo     description TEXT, >> schema.sql
echo     category_id UUID REFERENCES categories(id), >> schema.sql
echo     price DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     weight_grams INT DEFAULT 500, >> schema.sql
echo     image_url TEXT, >> schema.sql
echo     is_combo BOOLEAN DEFAULT FALSE, >> schema.sql
echo     stock_quantity INT DEFAULT 0, >> schema.sql
echo     seller_id UUID REFERENCES sellers(id), >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 5. Orders Table >> schema.sql
echo CREATE TABLE orders ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     user_id UUID REFERENCES users(id), >> schema.sql
echo     seller_id UUID REFERENCES sellers(id), >> schema.sql
echo     total_amount DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')), >> schema.sql
echo     tracking_id TEXT, >> schema.sql
echo     order_source TEXT CHECK (order_source IN ('WEB', 'APP')) NOT NULL, >> schema.sql
echo     shipping_partner TEXT, >> schema.sql
echo     payment_gateway TEXT, >> schema.sql
echo     trust_donation_amount DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     currency TEXT DEFAULT 'INR', >> schema.sql
echo     exchange_rate DECIMAL(10, 4) DEFAULT 1.00, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 6. Order Items Table >> schema.sql
echo CREATE TABLE order_items ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     order_id UUID REFERENCES orders(id) ON DELETE CASCADE, >> schema.sql
echo     product_id UUID REFERENCES products(id), >> schema.sql
echo     quantity INT NOT NULL, >> schema.sql
echo     price DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 7. Wallet Transactions Table >> schema.sql
echo CREATE TABLE wallet_transactions ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     user_id UUID REFERENCES users(id), >> schema.sql
echo     amount DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     transaction_type TEXT CHECK (transaction_type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK')) NOT NULL, >> schema.sql
echo     description TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 8. Reviews Table >> schema.sql
echo CREATE TABLE reviews ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     product_id UUID REFERENCES products(id), >> schema.sql
echo     user_id UUID REFERENCES users(id), >> schema.sql
echo     rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL, >> schema.sql
echo     comment TEXT, >> schema.sql
echo     image_urls TEXT[], >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 9. Coupons Table >> schema.sql
echo CREATE TABLE coupons ( >> schema.sql 
echo     code TEXT PRIMARY KEY, >> schema.sql
echo     discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100), >> schema.sql
echo     is_premium_only BOOLEAN DEFAULT FALSE, >> schema.sql
echo     expiry_date DATE, >> schema.sql
echo     usage_limit INT DEFAULT 1, >> schema.sql
echo     min_order_value DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     used_count INT DEFAULT 0, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 10. Payment Logs Table >> schema.sql
echo CREATE TABLE payment_logs ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     order_id UUID REFERENCES orders(id), >> schema.sql
echo     gateway_name TEXT NOT NULL, >> schema.sql
echo     amount DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     status TEXT NOT NULL, >> schema.sql
echo     transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     payment_intent_id TEXT, >> schema.sql
echo     gateway_transaction_id TEXT >> schema.sql
echo ); >> schema.sql
echo -- 11. Shipping Logs Table >> schema.sql
echo CREATE TABLE shipping_logs ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     order_id UUID REFERENCES orders(id), >> schema.sql
echo     courier_partner TEXT NOT NULL, >> schema.sql
echo     shipping_cost DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     delivery_status TEXT DEFAULT 'PENDING', >> schema.sql
echo     tracking_url TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 12. Audit Logs Table >> schema.sql
echo CREATE TABLE audit_logs ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     user_id UUID REFERENCES users(id), >> schema.sql
echo     action TEXT NOT NULL, >> schema.sql
echo     details JSONB, >> schema.sql
echo     ip_address INET, >> schema.sql
echo     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 13. Sales Stats Table >> schema.sql
echo CREATE TABLE sales_stats ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     seller_id UUID REFERENCES sellers(id), >> schema.sql
echo     date DATE NOT NULL, >> schema.sql
echo     total_sales DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     total_orders INT DEFAULT 0, >> schema.sql
echo     total_revenue DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 14. Banners Table >> schema.sql
echo CREATE TABLE banners ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     image_url TEXT NOT NULL, >> schema.sql
echo     title TEXT, >> schema.sql
echo     description TEXT, >> schema.sql
echo     link_url TEXT, >> schema.sql
echo     start_date TIMESTAMP WITH TIME ZONE, >> schema.sql
echo     end_date TIMESTAMP WITH TIME ZONE, >> schema.sql
echo     is_active BOOLEAN DEFAULT TRUE, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 15. Admin Settings Table >> schema.sql
echo CREATE TABLE admin_settings ( >> schema.sql 
echo     key TEXT PRIMARY KEY, >> schema.sql
echo     value TEXT NOT NULL, >> schema.sql
echo     value_type TEXT DEFAULT 'string', >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 16. System Alerts Table >> schema.sql
echo CREATE TABLE system_alerts ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     title TEXT NOT NULL, >> schema.sql
echo     message TEXT NOT NULL, >> schema.sql
echo     severity TEXT CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')) NOT NULL, >> schema.sql
echo     is_active BOOLEAN DEFAULT TRUE, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 17. Seller Products Table (Junction Table) >> schema.sql
echo CREATE TABLE seller_products ( >> schema.sql
echo     seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE, >> schema.sql 
echo     product_id UUID REFERENCES products(id) ON DELETE CASCADE, >> schema.sql
echo     PRIMARY KEY (seller_id, product_id), >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 18. Seller Payouts Table >> schema.sql
echo CREATE TABLE seller_payouts ( >> schema.sql
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     seller_id UUID REFERENCES sellers(id) NOT NULL, >> schema.sql 
echo     amount DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')), >> schema.sql
echo     payout_method TEXT, >> schema.sql
echo     transaction_id TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 19. Referrals Table >> schema.sql
echo CREATE TABLE referrals ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     referrer_id UUID REFERENCES users(id) NOT NULL, >> schema.sql
echo     referred_user_id UUID REFERENCES users(id) NOT NULL, >> schema.sql
echo     reward_amount DECIMAL(10, 2) DEFAULT 0.00, >> schema.sql
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')), >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 20. Product Views Table >> schema.sql
echo CREATE TABLE product_views ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     product_id UUID REFERENCES products(id) NOT NULL, >> schema.sql
echo     user_id UUID REFERENCES users(id), >> schema.sql
echo     viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 21. Spin Win Rewards Table >> schema.sql
echo CREATE TABLE spin_win_rewards ( >> schema.sql
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql 
echo     user_id UUID REFERENCES users(id) NOT NULL, >> schema.sql
echo     reward_amount DECIMAL(10, 2) NOT NULL, >> schema.sql
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')), >> schema.sql
echo     payout_method TEXT, >> schema.sql
echo     transaction_id TEXT, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- 22. Wishlist Table >> schema.sql
echo CREATE TABLE wishlist ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     user_id UUID REFERENCES users(id) NOT NULL, >> schema.sql
echo     product_id UUID REFERENCES products(id) NOT NULL, >> schema.sql
echo     price_drop_alert_enabled BOOLEAN DEFAULT FALSE, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     UNIQUE(user_id, product_id) >> schema.sql
echo ); >> schema.sql
echo -- 23. Flash Sales Table >> schema.sql
echo CREATE TABLE flash_sales ( >> schema.sql 
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), >> schema.sql
echo     product_id UUID REFERENCES products(id) NOT NULL, >> schema.sql
echo     discount_percent INT NOT NULL, >> schema.sql
echo     flash_sale_price DECIMAL(10, 2) GENERATED ALWAYS AS (price * (1 - discount_percent / 100)) STORED, >> schema.sql
echo     start_time TIMESTAMP WITH TIME ZONE NOT NULL, >> schema.sql
echo     end_time TIMESTAMP WITH TIME ZONE NOT NULL, >> schema.sql
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), >> schema.sql
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() >> schema.sql
echo ); >> schema.sql
echo -- Create indexes for performance >> schema.sql
echo CREATE INDEX idx_products_category ON products(category_id); >> schema.sql
echo CREATE INDEX idx_products_seller ON products(seller_id); >> schema.sql
echo CREATE INDEX idx_orders_user ON orders(user_id); >> schema.sql
echo CREATE INDEX idx_orders_seller ON orders(seller_id); >> schema.sql
echo CREATE INDEX idx_reviews_product ON reviews(product_id); >> schema.sql
echo CREATE INDEX idx_reviews_user ON reviews(user_id); >> schema.sql
echo CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id); >> schema.sql
echo CREATE INDEX idx_product_views_product ON product_views(product_id); >> schema.sql
echo CREATE INDEX idx_product_views_user ON product_views(user_id); >> schema.sql
echo CREATE INDEX idx_wishlist_user ON wishlist(user_id); >> schema.sql
echo CREATE INDEX idx_wishlist_product ON wishlist(product_id); >> schema.sql
cd ..
(
echo -- Enable UUID generation
echo CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
echo -- 1. Categories Table
echo CREATE TABLE categories (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     name TEXT UNIQUE NOT NULL,
echo     description TEXT,
echo     image_url TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 2. Users Table
echo CREATE TABLE users (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     phone_number TEXT UNIQUE NOT NULL,
echo     email TEXT UNIQUE,
echo     full_name TEXT,
echo     is_premium BOOLEAN DEFAULT FALSE,
echo     signup_platform TEXT CHECK (signup_platform IN ('WEB', 'APP')) NOT NULL,
echo     referred_by UUID REFERENCES users(id),
echo     wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
echo     privacy_policy_accepted BOOLEAN DEFAULT FALSE,
echo     marketing_consent BOOLEAN DEFAULT TRUE,
echo     bank_acc_for_refund TEXT,
echo     bank_ifsc_for_refund TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 3. Sellers Table
echo CREATE TABLE sellers (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
echo     shop_name TEXT UNIQUE NOT NULL,
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')),
echo     commission_rate DECIMAL(5, 2) DEFAULT 0.05,
echo     kyc_details JSONB,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 4. Products Table
echo CREATE TABLE products (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     name TEXT NOT NULL,
echo     description TEXT,
echo     category_id UUID REFERENCES categories(id),
echo     price DECIMAL(10, 2) NOT NULL,
echo     weight_grams INT DEFAULT 500,
echo     image_url TEXT,
echo     is_combo BOOLEAN DEFAULT FALSE,
echo     stock_quantity INT DEFAULT 0,
echo     seller_id UUID REFERENCES sellers(id),
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 5. Orders Table
echo CREATE TABLE orders (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id),
echo     seller_id UUID REFERENCES sellers(id),
echo     total_amount DECIMAL(10, 2) NOT NULL,
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
echo     tracking_id TEXT,
echo     order_source TEXT CHECK (order_source IN ('WEB', 'APP')) NOT NULL,
echo     shipping_partner TEXT,
echo     payment_gateway TEXT,
echo     trust_donation_amount DECIMAL(10, 2) DEFAULT 0.00,
echo     currency TEXT DEFAULT 'INR',
echo     exchange_rate DECIMAL(10, 4) DEFAULT 1.00,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 6. Order Items Table
echo CREATE TABLE order_items (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
echo     product_id UUID REFERENCES products(id),
echo     quantity INT NOT NULL,
echo     price DECIMAL(10, 2) NOT NULL,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 7. Wallet Transactions Table
echo CREATE TABLE wallet_transactions (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id),
echo     amount DECIMAL(10, 2) NOT NULL,
echo     transaction_type TEXT CHECK (transaction_type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK')) NOT NULL,
echo     description TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 8. Reviews Table
echo CREATE TABLE reviews (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     product_id UUID REFERENCES products(id),
echo     user_id UUID REFERENCES users(id),
echo     rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
echo     comment TEXT,
echo     image_urls TEXT[],
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 9. Coupons Table
echo CREATE TABLE coupons (
echo     code TEXT PRIMARY KEY,
echo     discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
echo     is_premium_only BOOLEAN DEFAULT FALSE,
echo     expiry_date DATE,
echo     usage_limit INT DEFAULT 1,
echo     min_order_value DECIMAL(10, 2) DEFAULT 0.00,
echo     used_count INT DEFAULT 0,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 10. Payment Logs Table
echo CREATE TABLE payment_logs (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     order_id UUID REFERENCES orders(id),
echo     gateway_name TEXT NOT NULL,
echo     amount DECIMAL(10, 2) NOT NULL,
echo     status TEXT NOT NULL,
echo     transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     payment_intent_id TEXT,
echo     gateway_transaction_id TEXT
echo );
echo -- 11. Shipping Logs Table
echo CREATE TABLE shipping_logs (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     order_id UUID REFERENCES orders(id),
echo     courier_partner TEXT NOT NULL,
echo     shipping_cost DECIMAL(10, 2) NOT NULL,
echo     delivery_status TEXT DEFAULT 'PENDING',
echo     tracking_url TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 12. Audit Logs Table
echo CREATE TABLE audit_logs (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id),
echo     action TEXT NOT NULL,
echo     details JSONB,
echo     ip_address INET,
echo     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 13. Sales Stats Table
echo CREATE TABLE sales_stats (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     seller_id UUID REFERENCES sellers(id),
echo     date DATE NOT NULL,
echo     total_sales DECIMAL(10, 2) DEFAULT 0.00,
echo     total_orders INT DEFAULT 0,
echo     total_revenue DECIMAL(10, 2) DEFAULT 0.00,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 14. Banners Table
echo CREATE TABLE banners (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     image_url TEXT NOT NULL,
echo     title TEXT,
echo     description TEXT,
echo     link_url TEXT,
echo     start_date TIMESTAMP WITH TIME ZONE,
echo     end_date TIMESTAMP WITH TIME ZONE,
echo     is_active BOOLEAN DEFAULT TRUE,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 15. Admin Settings Table
echo CREATE TABLE admin_settings (
echo     key TEXT PRIMARY KEY,
echo     value TEXT NOT NULL,
echo     value_type TEXT DEFAULT 'string',
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 16. System Alerts Table
echo CREATE TABLE system_alerts (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     title TEXT NOT NULL,
echo     message TEXT NOT NULL,
echo     severity TEXT CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')) NOT NULL,
echo     is_active BOOLEAN DEFAULT TRUE,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 17. Seller Products Table (Junction Table)
echo CREATE TABLE seller_products (
echo     seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
echo     product_id UUID REFERENCES products(id) ON DELETE CASCADE,
echo     PRIMARY KEY (seller_id, product_id),
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 18. Seller Payouts Table
echo CREATE TABLE seller_payouts (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     seller_id UUID REFERENCES sellers(id) NOT NULL,
echo     amount DECIMAL(10, 2) NOT NULL,
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
echo     payout_method TEXT,
echo     transaction_id TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 19. Referrals Table
echo CREATE TABLE referrals (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     referrer_id UUID REFERENCES users(id) NOT NULL,
echo     referred_user_id UUID REFERENCES users(id) NOT NULL,
echo     reward_amount DECIMAL(10, 2) DEFAULT 0.00,
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')),
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 20. Product Views Table
echo CREATE TABLE product_views (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     product_id UUID REFERENCES products(id) NOT NULL,
echo     user_id UUID REFERENCES users(id),
echo     viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 21. Spin Win Rewards Table
echo CREATE TABLE spin_win_rewards (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id) NOT NULL,
echo     reward_amount DECIMAL(10, 2) NOT NULL,
echo     status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED')),
echo     payout_method TEXT,
echo     transaction_id TEXT,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- 22. Wishlist Table
echo CREATE TABLE wishlist (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     user_id UUID REFERENCES users(id) NOT NULL,
echo     product_id UUID REFERENCES products(id) NOT NULL,
echo     price_drop_alert_enabled BOOLEAN DEFAULT FALSE,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     UNIQUE(user_id, product_id)
echo );
echo -- 23. Flash Sales Table
echo CREATE TABLE flash_sales (
echo     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
echo     product_id UUID REFERENCES products(id) NOT NULL,
echo     discount_percent INT NOT NULL,
echo     flash_sale_price DECIMAL(10, 2) GENERATED ALWAYS AS (price * (1 - discount_percent / 100)) STORED,
echo     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
echo     end_time TIMESTAMP WITH TIME ZONE NOT NULL,
echo     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
echo     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
echo );
echo -- Create indexes for performance
echo CREATE INDEX idx_products_category ON products(category_id);
echo CREATE INDEX idx_products_seller ON products(seller_id);
echo CREATE INDEX idx_orders_user ON orders(user_id);
echo CREATE INDEX idx_orders_seller ON orders(seller_id);
echo CREATE INDEX idx_reviews_product ON reviews(product_id);
echo CREATE INDEX idx_reviews_user ON reviews(user_id);
echo CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
echo CREATE INDEX idx_product_views_product ON product_views(product_id);
echo CREATE INDEX idx_product_views_user ON product_views(user_id);
echo CREATE INDEX idx_wishlist_user ON wishlist(user_id);
echo CREATE INDEX idx_wishlist_product ON wishlist(product_id);
) > schema.sql || exit /b %errorlevel%
cd "%PROJECT_ROOT%" || exit /b %errorlevel%
 
:: 7. Create docker-compose.yml
echo Creating docker-compose.yml...
echo version: '3.8' > docker-compose.yml
echo services: >> docker-compose.yml
echo   db: >> docker-compose.yml
echo     image: postgres:15-alpine >> docker-compose.yml
echo     container_name: bupzo_db >> docker-compose.yml
echo     environment: >> docker-compose.local.yml 
echo       POSTGRES_USER: bupzo_user >> docker-compose.yml
echo       POSTGRES_PASSWORD: bupzo_password >> docker-compose.yml
echo       POSTGRES_DB: bupzo_db >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql >> docker-compose.yml
echo       - pgdata:/var/lib/postgresql/data >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "5434:5432" >> docker-compose.local.yml 
echo     healthcheck: >> docker-compose.yml
echo       test: ["CMD-SHELL", "pg_isready -U bupzo_user -d bupzo_db"] >> docker-compose.yml
echo       interval: 5s >> docker-compose.yml
echo       timeout: 5s >> docker-compose.yml
echo       retries: 5 >> docker-compose.yml
echo >> docker-compose.yml
echo   redis: >> docker-compose.yml
echo     image: redis:7-alpine >> docker-compose.yml
echo     container_name: bupzo_redis >> docker-compose.local.yml 
echo     ports: >> docker-compose.yml
echo       - "6380:6379" >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - redisdata:/data >> docker-compose.yml
echo     healthcheck: >> docker-compose.yml
echo       test: ["CMD", "redis-cli", "ping"] >> docker-compose.yml
echo       interval: 5s >> docker-compose.yml
echo       timeout: 5s >> docker-compose.yml
echo       retries: 5 >> docker-compose.yml
echo >> docker-compose.yml
echo   backend-api: >> docker-compose.yml
echo     build: >> docker-compose.local.yml 
echo       context: ./bupzo-backend >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo     container_name: bupzo_backend >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db >> docker-compose.yml
echo       REDIS_URL: redis://redis:6379 >> docker-compose.yml
echo       GEMINI_API_KEY: ${GEMINI_API_KEY} >> docker-compose.yml
echo       WHATSAPP_API_TOKEN: ${WHATSAPP_API_TOKEN} >> docker-compose.local.yml 
echo       BREVO_API_KEY: ${BREVO_API_KEY} >> docker-compose.yml
echo       PAYMENT_KEY_ID: ${PAYMENT_KEY_ID} >> docker-compose.yml
echo       PAYMENT_KEY_SECRET: ${PAYMENT_KEY_SECRET} >> docker-compose.yml
echo       PHONEPE_MERCHANT_ID: ${PHONEPE_MERCHANT_ID} >> docker-compose.yml
echo       PHONEPE_SALT_KEY: ${PHONEPE_SALT_KEY} >> docker-compose.yml
echo       SHIPROCKET_EMAIL: ${SHIPROCKET_EMAIL} >> docker-compose.yml
echo       SHIPROCKET_PASSWORD: ${SHIPROCKET_PASSWORD} >> docker-compose.yml
echo       NIMBUSPOST_API_KEY: ${NIMBUSPOST_API_KEY} >> docker-compose.yml
echo       DELIVERY_API_TOKEN: ${DELIVERY_API_TOKEN} >> docker-compose.yml
echo       WEBHOOK_SECRET: ${WEBHOOK_SECRET} >> docker-compose.yml
echo     ports: >> docker-compose.local.yml 
echo       - "8003:8000" >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       db: >> docker-compose.yml
echo         condition: service_healthy >> docker-compose.yml
echo       redis: >> docker-compose.yml
echo         condition: service_healthy >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-backend:/app >> docker-compose.local.yml 
echo     command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] >> docker-compose.yml
echo >> docker-compose.yml
echo   mcp-server: >> docker-compose.yml
echo     build: >> docker-compose.yml
echo       context: ./bupzo-mcp >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo     container_name: bupzo_mcp >> docker-compose.yml
echo     environment: >> docker-compose.local.yml 
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db >> docker-compose.yml
echo       REDIS_URL: redis://redis:6379 >> docker-compose.yml
echo       GEMINI_API_KEY: ${GEMINI_API_KEY} >> docker-compose.yml
echo       WHATSAPP_API_TOKEN: ${WHATSAPP_API_TOKEN} >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "3004:3004" >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       db: >> docker-compose.yml
echo         condition: service_healthy >> docker-compose.yml
echo       redis: >> docker-compose.yml
echo         condition: service_healthy >> docker-compose.yml
echo     volumes: >> docker-compose.local.yml 
echo       - ./bupzo-mcp:/app >> docker-compose.yml
echo     command: ["npm", "run", "dev"] >> docker-compose.yml
echo >> docker-compose.yml
echo   frontend-client: >> docker-compose.yml
echo     build: >> docker-compose.yml
echo       context: ./bupzo-frontend >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo       args: >> docker-compose.yml
echo         - NEXT_PUBLIC_BASE_PATH=/ >> docker-compose.yml
echo         - NEXT_PUBLIC_PORT=3000 >> docker-compose.yml
echo     container_name: bupzo_frontend_client >> docker-compose.local.yml 
echo     ports: >> docker-compose.yml
echo       - "3003:3000" >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       NEXT_PUBLIC_API_URL: http://backend-api:8000 >> docker-compose.yml
echo       NEXT_PUBLIC_MCP_URL: http://mcp-server:3004 >> docker-compose.yml
echo       NEXT_PUBLIC_PORT=3003 >> docker-compose.yml
echo       NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL} >> docker-compose.yml
echo       NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY} >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       backend-api: >> docker-compose.local.yml
echo         condition: service_started >> docker-compose.local.yml 
echo       mcp-server: >> docker-compose.yml
echo         condition: service_started >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-frontend:/app >> docker-compose.yml
echo       - /app/node_modules >> docker-compose.yml
echo     command: ["npm", "run", "dev", "--", "-p", "3000"] >> docker-compose.yml
echo >> docker-compose.yml
echo   frontend-admin: >> docker-compose.yml
echo     build: >> docker-compose.yml
echo       context: ./bupzo-frontend >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo       args: >> docker-compose.yml
echo         - NEXT_PUBLIC_BASE_PATH=/admin >> docker-compose.yml
echo         - NEXT_PUBLIC_PORT=3000 >> docker-compose.yml
echo     container_name: bupzo_frontend_admin >> docker-compose.local.yml 
echo     ports: >> docker-compose.yml
echo       - "3005:3000" >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       NEXT_PUBLIC_API_URL: http://backend-api:8000 >> docker-compose.yml
echo       NEXT_PUBLIC_MCP_URL: http://mcp-server:3004 >> docker-compose.yml
echo       NEXT_PUBLIC_PORT=3005 >> docker-compose.yml
echo       NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL} >> docker-compose.yml
echo       NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY} >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       backend-api: >> docker-compose.yml
echo         condition: service_started >> docker-compose.yml
echo       mcp-server: >> docker-compose.yml
echo         condition: service_started >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-frontend:/app >> docker-compose.yml
echo       - /app/node_modules >> docker-compose.yml
echo     command: ["npm", "run", "dev", "--", "-p", "3000"] >> docker-compose.yml
echo >> docker-compose.yml
echo volumes: >> docker-compose.yml
echo   pgdata: >> docker-compose.yml
echo   redisdata: >> docker-compose.yml
(
echo version: '3.8'
echo services:
echo   db:
echo     image: postgres:15-alpine
echo     container_name: bupzo_db
echo     environment:
echo       POSTGRES_USER: bupzo_user
echo       POSTGRES_PASSWORD: bupzo_password
echo       POSTGRES_DB: bupzo_db
echo     volumes:
echo       - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
echo       - pgdata:/var/lib/postgresql/data
echo     ports:
echo       - "5434:5432"
echo     healthcheck:
echo       test: ["CMD-SHELL", "pg_isready -U bupzo_user -d bupzo_db"]
echo       interval: 5s
echo       timeout: 5s
echo       retries: 5
echo
echo   redis:
echo     image: redis:7-alpine
echo     container_name: bupzo_redis
echo     ports:
echo       - "6380:6379"
echo     volumes:
echo       - redisdata:/data
echo     healthcheck:
echo       test: ["CMD", "redis-cli", "ping"]
echo       interval: 5s
echo       timeout: 5s
echo       retries: 5
echo
echo   backend-api:
echo     build:
echo       context: ./bupzo-backend
echo       dockerfile: Dockerfile
echo     container_name: bupzo_backend
echo     environment:
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
echo       REDIS_URL: redis://redis:6379
echo       GEMINI_API_KEY: ${GEMINI_API_KEY}
echo       WHATSAPP_API_TOKEN: ${WHATSAPP_API_TOKEN}
echo       BREVO_API_KEY: ${BREVO_API_KEY}
echo       PAYMENT_KEY_ID: ${PAYMENT_KEY_ID}
echo       PAYMENT_KEY_SECRET: ${PAYMENT_KEY_SECRET}
echo       PHONEPE_MERCHANT_ID: ${PHONEPE_MERCHANT_ID}
echo       PHONEPE_SALT_KEY: ${PHONEPE_SALT_KEY}
echo       SHIPROCKET_EMAIL: ${SHIPROCKET_EMAIL}
echo       SHIPROCKET_PASSWORD: ${SHIPROCKET_PASSWORD}
echo       NIMBUSPOST_API_KEY: ${NIMBUSPOST_API_KEY}
echo       DELIVERY_API_TOKEN: ${DELIVERY_API_TOKEN}
echo       WEBHOOK_SECRET: ${WEBHOOK_SECRET}
echo     ports:
echo       - "8003:8000"
echo     depends_on:
echo       db:
echo         condition: service_healthy
echo       redis:
echo         condition: service_healthy
echo     volumes:
echo       - ./bupzo-backend:/app
echo     command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
echo
echo   mcp-server:
echo     build:
echo       context: ./bupzo-mcp
echo       dockerfile: Dockerfile
echo     container_name: bupzo_mcp
echo     environment:
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
echo       REDIS_URL: redis://redis:6379
echo       GEMINI_API_KEY: ${GEMINI_API_KEY}
echo       WHATSAPP_API_TOKEN: ${WHATSAPP_API_TOKEN}
echo     ports:
echo       - "3004:3004"
echo     depends_on:
echo       db:
echo         condition: service_healthy
echo       redis:
echo         condition: service_healthy
echo     volumes:
echo       - ./bupzo-mcp:/app
echo     command: ["npm", "run", "dev"]
echo
echo   frontend-client:
echo     build:
echo       context: ./bupzo-frontend
echo       dockerfile: Dockerfile
echo       args:
echo         - NEXT_PUBLIC_BASE_PATH=/
echo         - NEXT_PUBLIC_PORT=3000
echo     container_name: bupzo_frontend_client
echo     ports:
echo       - "3003:3000"
echo     environment:
echo       NEXT_PUBLIC_API_URL: http://backend-api:8000
echo       NEXT_PUBLIC_MCP_URL: http://mcp-server:3004
echo       NEXT_PUBLIC_PORT=3003
echo       NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
echo       NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
echo     depends_on:
echo       backend-api:
         condition: service_started
echo       mcp-server:
         condition: service_started
echo     volumes:
echo       - ./bupzo-frontend:/app
echo       - /app/node_modules
echo     command: ["npm", "run", "dev", "--", "-p", "3000"]
echo
echo   frontend-admin:
echo     build:
echo       context: ./bupzo-frontend
echo       dockerfile: Dockerfile
echo       args:
echo         - NEXT_PUBLIC_BASE_PATH=/admin
echo         - NEXT_PUBLIC_PORT=3000
echo     container_name: bupzo_frontend_admin
echo     ports:
echo       - "3005:3000"
echo     environment:
echo       NEXT_PUBLIC_API_URL: http://backend-api:8000
echo       NEXT_PUBLIC_MCP_URL: http://mcp-server:3004
echo       NEXT_PUBLIC_PORT=3005
echo       NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
echo       NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
echo     depends_on:
echo       backend-api:
         condition: service_started
echo       mcp-server:
         condition: service_started
echo     volumes:
echo       - ./bupzo-frontend:/app
echo       - /app/node_modules
echo     command: ["npm", "run", "dev", "--", "-p", "3000"]
echo
echo volumes:
echo   pgdata:
echo   redisdata:
) > docker-compose.yml || exit /b %errorlevel%
 
:: 8. Create .env.example
echo Creating .env.example...
echo # --- BUPZO CONFIGURATION ENVIRONMENT --- > .env.example
echo # Database Configuration >> .env.example
echo DATABASE_URL=postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db >> .env.example
echo REDIS_URL=redis://redis:6379 >> .env.example
echo # Supabase Configuration (for cloud deployment) >> .env.example
echo SUPABASE_URL= >> .env.example
echo SUPABASE_ANON_KEY= >> .env.example
echo SUPABASE_SERVICE_ROLE_KEY= >> .env.example
echo # AI & External API Keys >> .env.example
echo GEMINI_API_KEY= >> .env.example
echo WHATSAPP_API_TOKEN= >> .env.example
echo BREVO_API_KEY= >> .env.example
echo PAYMENT_KEY_ID= >> .env.example
echo PAYMENT_KEY_SECRET= >> .env.example
echo PHONEPE_MERCHANT_ID= >> .env.example
echo PHONEPE_SALT_KEY= >> .env.example
echo PHONEPE_SALT_INDEX= >> .env.example
echo SHIPROCKET_EMAIL= >> .env.example
echo SHIPROCKET_PASSWORD= >> .env.example
echo NIMBUSPOST_API_KEY= >> .env.example
echo DELIVERY_API_TOKEN= >> .env.example
echo WEBHOOK_SECRET= >> .env.example
echo # Firebase Configuration (for Push Notifications & OTP) >> .env.example
echo FIREBASE_SERVER_KEY= >> .env.example
echo FIREBASE_CONFIG_JSON= >> .env.example 
echo # Google reCAPTCHA (for Bot Protection) >> .env.example
echo NEXT_PUBLIC_RECAPTCHA_SITE_KEY= >> .env.example
echo # Authentication and Deployment >> .env.example 
echo GITHUB_TOKEN= >> .env.example
echo DOCKER_HUB_TOKEN= >> .env.example
echo VERCEL_TOKEN= >> .env.example
echo # Upstash Redis (for cloud deployment, if not using local Docker Redis) >> .env.example
echo UPSTASH_REDIS_REST_URL= >> .env.example
echo UPSTASH_REDIS_REST_TOKEN= >> .env.example
(
echo # --- BUPZO CONFIGURATION ENVIRONMENT ---
echo # Database Configuration
echo DATABASE_URL=postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db
echo REDIS_URL=redis://redis:6379
echo # Supabase Configuration (for cloud deployment)
echo SUPABASE_URL=
echo SUPABASE_ANON_KEY=
echo SUPABASE_SERVICE_ROLE_KEY=
echo # AI & External API Keys
echo GEMINI_API_KEY=
echo WHATSAPP_API_TOKEN=
echo BREVO_API_KEY=
echo PAYMENT_KEY_ID=
echo PAYMENT_KEY_SECRET=
echo PHONEPE_MERCHANT_ID=
echo PHONEPE_SALT_KEY=
echo PHONEPE_SALT_INDEX=
echo SHIPROCKET_EMAIL=
echo SHIPROCKET_PASSWORD=
echo NIMBUSPOST_API_KEY=
echo DELIVERY_API_TOKEN=
echo WEBHOOK_SECRET=
echo # Firebase Configuration (for Push Notifications & OTP)
echo FIREBASE_SERVER_KEY=
echo FIREBASE_CONFIG_JSON=
echo # Google reCAPTCHA (for Bot Protection)
echo NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
echo # Authentication and Deployment
echo GITHUB_TOKEN=
echo DOCKER_HUB_TOKEN=
echo VERCEL_TOKEN=
echo # Upstash Redis (for cloud deployment, if not using local Docker Redis)
echo UPSTASH_REDIS_REST_URL=
echo UPSTASH_REDIS_REST_TOKEN=
) > .env.example || exit /b %errorlevel%

echo =======================================================
echo SUCCESS: BUPZO Framework Structure Initialized!
echo Next: Fill in the API keys into the newly created .env.example file. 
echo Then, copy .env.example to .env and fill in local values if needed.
echo =======================================================
pause
cd .. 
pause > NUL

:: 6. Copy schema.sql
echo Copying schema.sql...
copy "c:\Users\localadmin\Downloads\Bupzo\database\schema.sql" database\schema.sql

:: 7. Copy docker-compose.yml
echo Copying docker-compose.yml...
copy "c:\Users\localadmin\Downloads\Bupzo\docker-compose.yml" docker-compose.yml

:: 8. Copy .env.example
echo Copying .env.example...
copy "c:\Users\localadmin\Downloads\Bupzo\.env.example" .env.example 

echo =======================================================
echo BUPZO Monorepo structure created successfully!
echo Please navigate into the project root directory.
echo Fill in the API keys in the .env file.
echo Then run: docker compose up -d --build
echo =======================================================
pause
endlocal