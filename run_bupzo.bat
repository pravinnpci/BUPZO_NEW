@echo off
echo Starting BUPZO application...

:: Start PostgreSQL
echo Starting PostgreSQL database...
start "PostgreSQL" "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\15\data" -l "C:\Program Files\PostgreSQL\15\data\postgresql.log" -o "-p 5433"
timeout /t 10

:: Start Backend
echo Starting Backend...
cd bupzobackend
call :activate_venv
pip install -r requirements.txt
start "Backend" cmd /k "call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8003 --reload"

:: Start Frontend
echo Starting Frontend...
cd ..
cd bupzofrontend
call npm install
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo Frontend: http://localhost:3003
echo Backend: http://localhost:8003/api/docs
echo Database: localhost:5433

pause
goto :eof

:activate_venv
if not exist "venv\Scripts\activate.bat" (
    python -m venv venv
)
call venv\Scripts\activate.bat
exit /b