@echo off
echo =======================================================
echo          BUPZO MONOREPO GENESIS INITIALIZER
echo =======================================================
echo This script will set up the BUPZO monorepo structure for local development.
echo Please ensure you are running this from the desired project root directory.
echo.
pause

:: 1. Core Application Folders
echo Creating core application folders...
mkdir bupzofrontend
mkdir bupzobackend
mkdir bupzomcp
mkdir infra
mkdir database
mkdir .github
mkdir .github\workflows

:: 2. Initialize bupzofrontend (Next.js)
echo Initializing bupzofrontend (Next.js)...
cd bupzofrontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm --skip-install
npm install
:: Add basic Dockerfile for frontend
echo # Stage 1: Builder > Dockerfile
echo FROM node:20-alpine as builder >> Dockerfile
echo ARG NEXT_PUBLIC_BASE_PATH >> Dockerfile
echo ARG NEXT_PUBLIC_PORT >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json package-lock.json ./ >> Dockerfile
echo RUN npm ci --omit=dev >> Dockerfile
echo COPY . . >> Dockerfile
echo RUN npm run build >> Dockerfile
echo # Stage 2: Runner >> Dockerfile
echo FROM node:20-alpine >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY --from=builder /app/package*.json ./ >> Dockerfile
echo COPY --from=builder /app/node_modules ./node_modules >> Dockerfile
echo COPY --from=builder /app/.next ./.next >> Dockerfile
echo COPY --from=builder /app/public ./public >> Dockerfile
echo ENV PORT 3000 >> Dockerfile
echo CMD ["npm", "run", "start"] >> Dockerfile
cd ..

:: 3. Initialize bupzobackend (FastAPI)
echo Initializing bupzobackend (FastAPI)...
cd bupzobackend
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
echo httpx==0.27.0 >> requirements.txt
echo redis==5.0.3 >> requirements.txt
:: Add basic Dockerfile for backend
echo FROM python:3.11-slim-buster > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY requirements.txt . >> Dockerfile
echo RUN pip install --no-cache-dir -r requirements.txt >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 8003 >> Dockerfile
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"] >> Dockerfile
cd ..

:: 4. Initialize bupzomcp (Node.js)
echo Initializing bupzomcp (Node.js)...
cd bupzomcp
npm init -y >> NUL
npm install pg ioredis @modelcontextprotocol/server @google/generative-ai axios uuid dotenv express body-parser cors nodemon >> NUL
:: Create dummy index.js for MCP (simplified for genesis)
echo require('dotenv').config(); > index.js
echo const express = require('express'); >> index.js
echo const app = express(); >> index.js
echo app.use(express.json()); >> index.js
echo app.get('/', (req, res) => res.send('MCP Server Live')); >> index.js
echo const PORT = process.env.PORT || 3004; >> index.js
echo app.listen(PORT, () => console.log(`MCP Server running on port ${PORT}`)); >> index.js
:: Add basic Dockerfile for mcp
echo FROM node:20-alpine > Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json package-lock.json ./ >> Dockerfile
echo RUN npm ci --omit=dev >> Dockerfile
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