@echo off
echo Starting BUPZO application...

:: Start PostgreSQL (using Docker)
echo Starting PostgreSQL database...
docker run -d --name bupzodb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bupzo -p 5433:5432 -v %cd%/setup_db.sql:/docker-entrypoint-initdb.d/setup_db.sql postgres:15-alpine

:: Wait for PostgreSQL to be ready
timeout /t 10

:: Start Backend
echo Starting Backend...
cd bupzobackend
call :activate_venv
start "Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8003 --reload"

:: Start Frontend
echo Starting Frontend...
cd ..
cd bupzofrontend
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo Frontend: http://localhost:3003
echo Backend: http://localhost:8003/api/docs
echo Database: localhost:5433

pause

:activate_venv
if not exist "venv\Scripts\activate.bat" (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt