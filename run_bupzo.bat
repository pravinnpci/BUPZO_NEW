@echo off
echo Starting BUPZO application using Docker Compose...

:: Rebuild and Start all Docker containers in detached mode
docker compose up --build -d

echo All services started!
echo Frontend App: http://localhost:3003
echo Backend API:  http://localhost:8003/docs
echo MCP Server:   http://localhost:3004
echo Database:     localhost:5434
echo Redis:        localhost:6380

pause