# Start BUPZO Application
Write-Host "Starting BUPZO application..."

Write-Host "Building and starting all services via Docker Compose..."
docker compose up --build -d

Write-Host "Waiting for services to initialize..."
Start-Sleep -Seconds 10

Write-Host "Exporting logs to bupzo_logs.txt..."
docker compose logs > bupzo_logs.txt

Write-Host "All services started!"
Write-Host "Frontend App: http://localhost:3003"
Write-Host "Backend API:  http://localhost:8003/docs"
Write-Host "MCP Server:   http://localhost:3004"
Write-Host "Database:     localhost:5434"
Write-Host "Redis:        localhost:6380"
Write-Host "`nNOTE: Please check 'bupzo_logs.txt' and share the errors here!"