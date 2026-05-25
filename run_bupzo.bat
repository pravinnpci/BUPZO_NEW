@echo off
echo Starting BUPZO application using Docker Compose...

:: Rebuild and Start all Docker containers in detached mode
docker compose up --build -d

echo Waiting for services to initialize...
timeout /t 10

echo Exporting logs to bupzo_logs.txt...
docker compose logs > bupzo_logs.txt

echo All services started!
echo Frontend App: http://localhost:3003
echo Backend API:  http://localhost:8003/docs
echo MCP Server:   http://localhost:3004
echo Database:     localhost:5434
echo Redis:        localhost:6380
echo.
echo NOTE: Please check 'bupzo_logs.txt' and share the errors here!

pause