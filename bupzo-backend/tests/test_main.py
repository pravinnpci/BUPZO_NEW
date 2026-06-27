import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from app.main import app

client = TestClient(app)

# 1. Health and Root Check Test
def test_read_root():
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"status": "BUPZO Backend Core API Live"}

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

# 2. AI Copywriter Integration Test
@patch("os.getenv", return_value="fake-key")
@patch("httpx.AsyncClient.post")
def test_ai_copywriter(mock_post, mock_getenv):
    # Mock Gemini API response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": '{"title": "Ghee Halwa Premium", "description": "Authentic wheat halwa cooked in pure ghee.", "tags": ["halwa", "ghee", "sweet"]}'
                }]
            }
        }]
    }
    
    # We patch inside async context, so we return a coroutine
    async def async_return(*args, **kwargs):
        return mock_response
    mock_post.side_effect = async_return

    response = client.post("/api/ai/copywriter/", json={"prompt": "ghee halwa"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["title"] == "Ghee Halwa Premium"
    assert "pure ghee" in data["description"]
    assert "halwa" in data["tags"]

# 3. AI KYC Verification Test (Auto-approval and auto-rejection logic)
def test_ai_kyc_verification_approved():
    payload = {
        "gst_number": "22AAAAA0000A1Z1", # Valid syntax
        "fssai_number": "12345678901234" # Valid 14-digit sequence
    }
    response = client.post("/api/ai/kyc/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert data["gst_check"] == "VALID"
    assert data["fssai_check"] == "VALID"
    assert data["verification_score"] > 0.9

def test_ai_kyc_verification_rejected():
    payload = {
        "gst_number": "123GST", # Invalid syntax
        "fssai_number": "999" # Invalid length
    }
    response = client.post("/api/ai/kyc/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REJECTED"
    assert data["gst_check"] == "INVALID"
    assert data["fssai_check"] == "INVALID"

# 4. AI Fraud and Transaction Anomaly Risk Test
def test_ai_fraud_check_safe():
    payload = {
        "order_id": str(uuid4()),
        "user_id": str(uuid4()),
        "amount": 250.00,
        "order_source": "WEB"
    }
    response = client.post("/api/ai/fraud/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SAFE"
    assert data["risk_score_percent"] < 20.0

def test_ai_fraud_check_high_risk():
    payload = {
        "order_id": str(uuid4()),
        "user_id": str(uuid4()),
        "amount": 15000.00, # Triggers >10000 risk multiplier
        "order_source": "APP"
    }
    response = client.post("/api/ai/fraud/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HIGH_RISK"
    assert "High transaction value" in data["reasons"][0]

# 5. Database User Creation Test (Mock DB Connection Pool)
@pytest.mark.asyncio
@patch("app.main.pool")
async def test_create_user_success(mock_pool):
    mock_conn = AsyncMock()
    # Mock pool.acquire context manager
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
    
    # Mock the return values of execute queries
    mock_conn.fetchrow.return_value = {
        "id": uuid4(),
        "phone": "+919876543210",
        "email": "test@bupzo.com",
        "is_premium": False,
        "signup_platform": "WEB",
        "wallet_balance": 0.00,
        "privacy_accepted": True,
        "created_at": "2026-06-27T09:45:00"
    }
    
    from app.main import create_user, UserCreate
    user_payload = UserCreate(
        phone="+919876543210",
        email="test@bupzo.com",
        is_premium=False,
        signup_platform="WEB",
        referred_by=None,
        privacy_accepted=True
    )
    
    result = await create_user(user_payload)
    assert result["phone"] == "+919876543210"
    assert result["email"] == "test@bupzo.com"
    assert result["wallet_balance"] == 0.00
