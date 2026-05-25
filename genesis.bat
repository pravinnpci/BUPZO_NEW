@echo off
echo =======================================================
echo          BUPZO MONOREPO GENESIS INITIALIZER
echo =======================================================
echo This script will set up the BUPZO monorepo structure.
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
mkdir bupzo-admin
mkdir bupzo-mcp

:: 2. Infrastructure & DevOps Folders
echo Creating infrastructure and DevOps folders...
mkdir infra
mkdir docker
mkdir scripts
mkdir .github
mkdir .github\workflows

:: 3. Initialize bupzo-frontend (Next.js)
echo Initializing bupzo-frontend (Next.js)...
cd bupzo-frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --skip-install
:: Add basic Dockerfile for frontend
echo # syntax=docker/dockerfile:1.4 > Dockerfile
echo FROM node:20-alpine >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json pnpm-lock.yaml ./ >> Dockerfile
echo RUN pnpm install --frozen-lockfile >> Dockerfile
echo COPY . . >> Dockerfile
echo RUN pnpm build >> Dockerfile
echo EXPOSE 3000 >> Dockerfile
echo CMD ["pnpm", "start"] >> Dockerfile
cd ..

:: 4. Initialize bupzo-backend (FastAPI)
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
echo # syntax=docker/dockerfile:1.4 > Dockerfile
echo FROM python:3.11-slim-buster >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY requirements.txt . >> Dockerfile
echo RUN pip install --no-cache-dir -r requirements.txt >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 8000 >> Dockerfile
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] >> Dockerfile
cd ..

:: 5. Initialize bupzo-admin (Next.js) - Unified with frontend, but separate build for now
echo Initializing bupzo-admin (Next.js)...
cd bupzo-admin
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --skip-install
:: Add basic Dockerfile for admin
echo # syntax=docker/dockerfile:1.4 > Dockerfile
echo FROM node:20-alpine >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json pnpm-lock.yaml ./ >> Dockerfile
echo RUN pnpm install --frozen-lockfile >> Dockerfile
echo COPY . . >> Dockerfile
echo RUN pnpm build >> Dockerfile
echo EXPOSE 3001 >> Dockerfile
echo CMD ["pnpm", "start"] >> Dockerfile
cd ..

:: 6. Initialize bupzo-mcp (Node.js)
echo Initializing bupzo-mcp (Node.js)...
cd bupzo-mcp
pnpm init -y >> NUL
pnpm add pg ioredis @modelcontextprotocol/server @google/generative-ai >> NUL
:: Add basic Dockerfile for mcp
echo # syntax=docker/dockerfile:1.4 > Dockerfile
echo FROM node:20-alpine >> Dockerfile
echo WORKDIR /app >> Dockerfile
echo COPY package.json pnpm-lock.yaml ./ >> Dockerfile
echo RUN pnpm install --frozen-lockfile >> Dockerfile
echo COPY . . >> Dockerfile
echo EXPOSE 3004 >> Dockerfile
echo CMD ["node", "index.js"] >> Dockerfile
cd ..

echo =======================================================
echo BUPZO Monorepo structure created successfully!
echo Please navigate into the "%PROJECT_ROOT_DIR%" directory.
echo =======================================================
pause