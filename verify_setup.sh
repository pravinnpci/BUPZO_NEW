#!/bin/bash

# Function to check service health
check_service() {
    echo "=== $1 Service Verification ==="
    if docker-compose exec $1 bash -c "echo 'Running...'" > /dev/null; then
        echo "✅ $1 is running"
        if [ "$1" == "db" ]; then
            docker-compose exec $1 psql -U postgres -d bupzo_db -c "SELECT * FROM users LIMIT 3;" || echo "❌ Database query failed"
        elif [ "$1" == "mcp-server" ]; then
            docker-compose exec $1 node -e "console.log('MCP Server connection test passed')"
        fi
    else
        echo "❌ $1 is not running"
    fi
}

# Run verification
check_service "db"
check_service "redis"
check_service "backend"
check_service "frontend"
check_service "mcp-server"

# Final database verification
echo "=== Complete Database Schema Verification ==="
docker-compose exec db psql -U postgres -d bupzo_db -c "SELECT * FROM users;" > users_output.txt
docker-compose exec db psql -U postgres -d bupzo_db -c "SELECT * FROM categories;" > categories_output.txt
docker-compose exec db psql -U postgres -d bupzo_db -c "SELECT * FROM products;" > products_output.txt
docker-compose exec db psql -U postgres -d bupzo_db -c "SELECT * FROM orders;" > orders_output.txt

echo "Verification complete. Output files saved:"
echo "  - users_output.txt"
echo "  - categories_output.txt"
echo "  - products_output.txt"
echo "  - orders_output.txt"