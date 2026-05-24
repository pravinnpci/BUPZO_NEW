@echo off
echo Starting BUPZO application...

:: Start PostgreSQL (already running)
echo PostgreSQL is already running on port 5433

:: Start Backend
echo Starting Backend...
cd bupzobackend
if not exist "venv" (
    python -m venv venv
)
call :activate_venv
start "Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8003 --reload"

:: Start Frontend
echo Starting Frontend...
cd ..
cd bupzofrontend
if not exist "node_modules" (
    npm install
)
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo Frontend: http://localhost:3003
echo Backend: http://localhost:8003/api/docs
echo Database: localhost:5433

pause

:activate_venv
if not exist "venv\Scripts\activate.bat" (
    exit /b 1
)
call venv\Scripts\activate.bat