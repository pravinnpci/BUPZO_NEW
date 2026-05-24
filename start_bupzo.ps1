# Start BUPZO Application
Write-Host "Starting BUPZO application..."

# Check if PostgreSQL is running
$postgresRunning = docker ps --format '{{.Names}}' | Select-String -Pattern 'bupzodb'
if (-not $postgresRunning) {
    Write-Host "Starting PostgreSQL..."
    docker run -d --name bupzodb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bupzo -p 5433:5432 postgres:15-alpine
    Start-Sleep -Seconds 10
}

# Copy setup_db.sql to PostgreSQL container
Write-Host "Setting up database..."
docker cp setup_db.sql bupzodb:/docker-entrypoint-initdb.d/setup_db.sql
docker restart bupzodb
Start-Sleep -Seconds 10

# Set up backend
Write-Host "Setting up backend..."
cd bupzobackend
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& .\venv\Scripts\activate
pip install -r requirements.txt

# Start backend in a new window
Write-Host "Starting backend..."
Start-Process -FilePath "cmd" -ArgumentList "/k cd bupzobackend && .\venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8003 --reload" -WindowStyle Normal

# Set up frontend
Write-Host "Setting up frontend..."
cd ..
cd bupzofrontend
npm install

# Start frontend in a new window
Write-Host "Starting frontend..."
Start-Process -FilePath "cmd" -ArgumentList "/k cd bupzofrontend && npm run dev" -WindowStyle Normal

Write-Host "All services started!"
Write-Host "Frontend: http://localhost:3003"
Write-Host "Backend: http://localhost:8003/api/docs"
Write-Host "Database: localhost:5433"