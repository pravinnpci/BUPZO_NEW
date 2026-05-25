@echo off
echo =======================================================
echo          Starting BUPZO Local Development Environment
echo =======================================================

cd ..\docker
docker compose -f docker-compose.local.yml up -d --build

echo.
echo BUPZO services are starting up. Access frontend at http://localhost:3003
pause