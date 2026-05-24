@echo off
echo Starting BUPZO application with all fixes...

:: Navigate to frontend and install dependencies
echo Installing frontend dependencies...
cd bupzofrontend
npm install

:: Start frontend in a new window
echo Starting frontend...
start "Frontend" cmd /k "npm run dev"

:: Navigate to backend and set up virtual environment
echo Setting up backend...
cd ..
cd bupzobackend
if not exist "venv" (
    python -m venv venv
)
call :activate_venv
pip install -r requirements.txt

:: Start backend in a new window
echo Starting backend...
start "Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8003 --reload"

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