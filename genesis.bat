@echo off
echo =======================================================
echo          BUPZO MONOREPO GENESIS INITIALIZER
echo =======================================================
echo This script will set up the BUPZO monorepo structure for local development.
echo Please ensure you are running this from an EMPTY directory.
echo.
pause

:: Define the main project root directory name
set PROJECT_ROOT_DIR=bupzo-monorepo

echo Creating main project root: %PROJECT_ROOT_DIR%
mkdir %PROJECT_ROOT_DIR%
cd %PROJECT_ROOT_DIR%

:: 1. Core Application Folders
echo Creating core application folders...
mkdir bupzo-frontend
mkdir bupzo-backend
mkdir bupzo-mcp
mkdir infra
mkdir database
mkdir .github
mkdir .github\workflows

:: 2. Initialize bupzo-frontend (Next.js)
echo Initializing bupzo-frontend (Next.js)...
cd bupzo-frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --skip-install
:: Add basic Dockerfile for frontend
echo FROM node:20-alpine AS builder > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json pnpm-lock.yaml ./ >> Dockerfile
echo RUN pnpm install --frozen-lockfile >> Dockerfile
echo COPY . . >> Dockerfile
echo RUN pnpm build >> Dockerfile
echo FROM node:20-alpine >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY --from=builder /app/package*.json ./ >> Dockerfile
echo COPY --from=builder /app/node_modules ./node_modules >> Dockerfile
echo COPY --from=builder /app/.next ./.next >> Dockerfile
echo COPY --from=builder /app/public ./public >> Dockerfile
echo EXPOSE 3000 >> Dockerfile
echo ENV PORT=3000 >> Dockerfile
echo CMD ["npm", "run", "start"] >> Dockerfile
cd ..

:: 3. Initialize bupzo-backend (FastAPI)
echo Initializing bupzo-backend (FastAPI)...
cd bupzo-backend
mkdir app
mkdir app\api
mkdir app\core
mkdir app\services
mkdir app\models
:: Create dummy main.py for FastAPI
echo from fastapi import FastAPI > app\main.py
echo from fastapi.middleware.cors import CORSMiddleware >> app\main.py
echo app = FastAPI(title="BUPZO Core API") >> app\main.py
echo app.add_middleware( >> app\main.py
echo     CORSMiddleware, >> app\main.py
echo     allow_origins=["*"], >> app\main.py
echo     allow_credentials=True, >> app\main.py
echo     allow_methods=["*"], >> app\main.py
echo     allow_headers=["*"], >> app\main.py
echo ) >> app\main.py
echo @app.get("/") >> app\main.py
echo async def read_root(): return {"status": "BUPZO Backend Live"} >> app\main.py
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
echo python-decouple==3.8 >> requirements.txt
echo httpx==0.27.0 >> requirements.txt
:: Add basic Dockerfile for backend
echo FROM python:3.11-slim-buster > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY requirements.txt . >> Dockerfile
echo RUN pip install --no-cache-dir -r requirements.txt >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 8000 >> Dockerfile
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] >> Dockerfile
cd ..

:: 4. Initialize bupzo-mcp (Node.js)
echo Initializing bupzo-mcp (Node.js)...
cd bupzo-mcp
pnpm init -y >> NUL
pnpm add pg ioredis @modelcontextprotocol/server @google/generative-ai axios uuid >> NUL
:: Create dummy index.js for MCP
echo const { Pool } = require('pg'); > index.js
echo const Redis = require('ioredis'); >> index.js
echo const axios = require('axios'); >> index.js
echo const { v4: uuidv4 } = require('uuid'); >> index.js
echo const mcp = require('@modelcontextprotocol/server'); >> index.js
echo const { getGenerativeModel } = require('./agent'); >> index.js
echo const pool = new Pool({ user: 'bupzo_user', host: 'db', database: 'bupzo_db', password: 'bupzo_password', port: 5432 }); >> index.js
echo const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379'); >> index.js
echo pool.on('connect', () => { console.log('PostgreSQL connected'); }); >> index.js
echo pool.on('error', (err) => { console.error('PostgreSQL error:', err); }); >> index.js
echo redis.on('connect', () => { console.log('Redis connected'); }); >> index.js
echo redis.on('error', (err) => { console.error('Redis error:', err); }); >> index.js
echo const server = mcp.createServer({ model: getGenerativeModel(), tools: [] }); >> index.js
echo server.listen(3004, () => { console.log('MCP server running on port 3004'); }); >> index.js
:: Add basic Dockerfile for mcp
echo FROM node:20-alpine > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json pnpm-lock.yaml ./ >> Dockerfile
echo RUN pnpm install --frozen-lockfile >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 3004 >> Dockerfile
echo CMD ["node", "index.js"] >> Dockerfile
cd ..

:: 5. Create infra/main.tf placeholder
echo Creating infra/main.tf placeholder...
cd infra
echo # Terraform configuration for BUPZO infrastructure > main.tf
echo # This file will be populated with Vercel, Supabase, Upstash Redis automation >> main.tf
cd ..

:: 6. Create database/schema.sql
echo Creating database/schema.sql...
cd database
copy "c:\Users\localadmin\Downloads\Bupzo\setup_db.sql" schema.sql
cd ..

:: 7. Create docker-compose.yml for local development
echo Creating docker-compose.yml...
echo version: '3.8' > docker-compose.yml
echo services: >> docker-compose.yml
echo   db: >> docker-compose.yml
echo     image: postgres:15-alpine >> docker-compose.yml
echo     container_name: bupzo_db >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       POSTGRES_USER: bupzo_user >> docker-compose.yml
echo       POSTGRES_PASSWORD: bupzo_password >> docker-compose.yml
echo       POSTGRES_DB: bupzo_db >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./database/schema.sql:/docker-entrypoint-initdb.d/setup_db.sql >> docker-compose.yml
echo       - pgdata:/var/lib/postgresql/data >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "5434:5432" >> docker-compose.yml
echo     healthcheck: >> docker-compose.yml
echo       test: ["CMD-SHELL", "pg_isready -U bupzo_user -d bupzo_db"] >> docker-compose.yml
echo       interval: 5s >> docker-compose.yml
echo       timeout: 5s >> docker-compose.yml
echo       retries: 5 >> docker-compose.yml
echo   redis: >> docker-compose.yml
echo     image: redis:7-alpine >> docker-compose.yml
echo     container_name: bupzo_redis >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "6380:6379" >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - redisdata:/data >> docker-compose.yml
echo     healthcheck: >> docker-compose.yml
echo       test: ["CMD", "redis-cli", "ping"] >> docker-compose.yml
echo       interval: 5s >> docker-compose.yml
echo       timeout: 5s >> docker-compose.yml
echo       retries: 5 >> docker-compose.yml
echo   backend-api: >> docker-compose.yml
echo     build: ./bupzo-backend >> docker-compose.yml
echo     container_name: bupzo_backend >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db >> docker-compose.yml
echo       REDIS_URL: redis://redis:6379 >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "8003:8000" >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       db: { condition: service_healthy } >> docker-compose.yml
echo       redis: { condition: service_healthy } >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-backend:/app >> docker-compose.yml
echo     command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] >> docker-compose.yml
echo   mcp-server: >> docker-compose.yml
echo     build: ./bupzo-mcp >> docker-compose.yml
echo     container_name: bupzo_mcp >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       REDIS_URL: redis://redis:6379 >> docker-compose.yml
echo       DATABASE_URL: postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db >> docker-compose.yml
echo       GOOGLE_API_KEY: "" >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "3004:3004" >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       db: { condition: service_healthy } >> docker-compose.yml
echo       redis: { condition: service_healthy } >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-mcp:/app >> docker-compose.yml
echo     command: ["node", "index.js"] >> docker-compose.yml
echo   frontend: >> docker-compose.yml
echo     build: ./bupzo-frontend >> docker-compose.yml
echo     container_name: bupzo_frontend >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "3003:3000" >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       NEXT_PUBLIC_API_URL: http://backend-api:8000 >> docker-compose.yml
echo       NEXT_PUBLIC_MCP_URL: http://mcp-server:3004 >> docker-compose.yml
echo     depends_on: >> docker-compose.yml
echo       - backend-api >> docker-compose.yml
echo       - mcp-server >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - ./bupzo-frontend:/app >> docker-compose.yml
echo       - /app/node_modules >> docker-compose.yml
echo     command: ["npm", "run", "dev"] >> docker-compose.yml
echo volumes: >> docker-compose.yml
echo   pgdata: >> docker-compose.yml
echo   redisdata: >> docker-compose.yml

:: 8. Create .env template file
echo Creating .env template file...
echo # --- BUPZO CONFIGURATION ENVIRONMENT --- > .env
echo GITHUB_TOKEN=your_github_token_here >> .env
echo DOCKER_HUB_TOKEN=your_docker_hub_token_here >> .env
echo VERCEL_TOKEN=your_vercel_token_here >> .env
echo SUPABASE_URL=your_supabase_url_here >> .env
echo SUPABASE_ANON_KEY=your_supabase_anon_key_here >> .env
echo SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here >> .env
echo GEMINI_API_KEY=your_gemini_api_key_here >> .env
echo UPSTASH_REDIS_REST_URL=your_upstash_url_here >> .env
echo UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here >> .env
echo WHATSAPP_API_TOKEN=your_whatsapp_token_here >> .env
echo BREVO_API_KEY=your_brevo_key_here >> .env
echo PAYMENT_KEY_ID=your_payment_key_id_here >> .env
echo PAYMENT_KEY_SECRET=your_payment_key_secret_here >> .env
echo SHIPROCKET_TOKEN=your_shiprocket_token_here >> .env
echo NIMBUSPOST_API_KEY=your_nimbuspost_api_key_here >> .env
echo DELHIVERY_API_TOKEN=your_delhivery_api_token_here >> .env
echo NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here >> .env
echo FIREBASE_CONFIG_JSON=your_firebase_config_json_here >> .env
echo # --- END BUPZO CONFIGURATION --- >> .env

echo =======================================================
echo BUPZO Monorepo structure created successfully!
echo Please navigate into the "%PROJECT_ROOT_DIR%" directory.
echo Fill in the API keys in the .env file.
echo Then run: docker compose up -d --build
echo =======================================================
pause