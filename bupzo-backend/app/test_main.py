import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
import random
from app.main import app

@pytest.fixture
def client():
    # Trigger startup and shutdown events inside a context manager for each test
    with TestClient(app) as c:
        yield c

def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_user_creation_and_lifecycle(client):
    # Generate completely unique fields to avoid database uniqueness issues
    uid = uuid4().hex[:8]
    phone = f"+9198{random.randint(10, 99)}{random.randint(100000, 999999)}"
    email = f"user_{uid}@bupzo-test.com"
    
    # 1. Create User
    payload = {
        "phone": phone,
        "email": email,
        "is_premium": False,
        "signup_platform": "WEB",
        "privacy_accepted": True
    }
    resp_create = client.post("/api/users/", json=payload)
    assert resp_create.status_code == 200
    data = resp_create.json()
    assert "id" in data
    assert data["phone"] == phone
    assert data["email"] == email
    user_id = data["id"]
    
    # 2. Get User By ID
    resp_get = client.get(f"/api/users/{user_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == user_id

    # 3. Update/Edit User Details
    new_phone = f"+9188{random.randint(10, 99)}{random.randint(100000, 999999)}"
    new_email = f"edit_{uid}@bupzo-test.com"
    update_payload = {
        "phone": new_phone,
        "email": new_email,
        "is_premium": True,
        "wallet_balance": 150.50
    }
    resp_update = client.put(f"/api/users/{user_id}", json=update_payload)
    assert resp_update.status_code == 200
    update_data = resp_update.json()
    assert update_data["phone"] == new_phone
    assert update_data["email"] == new_email
    assert update_data["is_premium"] is True
    assert float(update_data["wallet_balance"]) == 150.50

    # 4. Super Admin Wallet Adjustment
    adjust_payload = {
        "amount": 25.00,
        "type": "Credit",
        "reason": "Test Suite Credit"
    }
    resp_adjust = client.post(f"/api/users/{user_id}/wallet/adjust", json=adjust_payload)
    assert resp_adjust.status_code == 200
    assert resp_adjust.json()["new_balance"] == 175.50

def test_kyc_verification_validator(client):
    # Valid GST and FSSAI
    payload = {
        "gst_number": "33AAAAA1111A1Z1",
        "fssai_number": "10022020000001"
    }
    resp = client.post("/api/ai/kyc/", json=payload)
    assert resp.status_code == 200
    assert resp.json()["status"] == "APPROVED"
    
    # Invalid GST format
    payload_invalid = {
        "gst_number": "INVALIDGST",
        "fssai_number": "10022020000001"
    }
    resp_inv = client.post("/api/ai/kyc/", json=payload_invalid)
    assert resp_inv.status_code == 200
    assert resp_inv.json()["status"] == "REJECTED"

def test_sellers_management(client):
    # Get all sellers
    resp = client.get("/api/sellers/")
    assert resp.status_code == 200
    sellers = resp.json()
    assert isinstance(sellers, list)
    
    if len(sellers) > 0:
        seller_id = sellers[0]["id"]
        # Toggle approve status
        resp_app = client.post(f"/api/sellers/{seller_id}/approve")
        assert resp_app.status_code == 200
        assert resp_app.json()["status"] == "APPROVED"

def test_payouts_management(client):
    # Get all payouts
    resp = client.get("/api/payouts/")
    assert resp.status_code == 200
    payouts = resp.json()
    assert isinstance(payouts, list)
    
    if len(payouts) > 0:
        payout_id = payouts[0]["id"]
        resp_app = client.post(f"/api/payouts/{payout_id}/approve")
        assert resp_app.status_code == 200
        assert resp_app.json()["status"] == "PROCESSED"

def test_ai_copywriter(client):
    payload = {"prompt": "premium chocolate fudge cookie with real vanilla extracts"}
    resp = client.post("/api/ai/copywriter/", json=payload)
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert "title" in resp.json()
    assert "description" in resp.json()

def test_fraud_analysis(client):
    payload = {
        "order_id": str(uuid4()),
        "user_id": str(uuid4()),
        "amount": 15000.00,
        "order_source": "APP" # APP order + high value triggers >70 risk score (HIGH_RISK)
    }
    resp = client.post("/api/ai/fraud/", json=payload)
    assert resp.status_code == 200
    assert resp.json()["status"] == "HIGH_RISK"

def test_category_and_coupon_management(client):
    # 1. Create Category
    cat_payload = {
        "name": f"Sweet Delicacies {uuid4().hex[:6]}",
        "description": "Delicious traditional sweets category"
    }
    resp_cat = client.post("/api/categories/", json=cat_payload)
    assert resp_cat.status_code == 200
    cat_data = resp_cat.json()
    assert "id" in cat_data
    assert cat_data["name"] == cat_payload["name"]
    
    # 2. Get Categories
    resp_cats = client.get("/api/categories/")
    assert resp_cats.status_code == 200
    assert any(c["id"] == cat_data["id"] for c in resp_cats.json())

    # 3. Create Coupon/Voucher
    code = f"TEST{uuid4().hex[:4]}".upper()
    coupon_payload = {
        "code": code,
        "discount_percent": 20.0,
        "is_premium_only": False,
        "min_order_value": 500.0,
        "expiry_date": "2027-12-31T23:59:59Z"
    }
    resp_cp = client.post("/api/coupons/", json=coupon_payload)
    assert resp_cp.status_code == 200
    cp_data = resp_cp.json()
    assert cp_data["code"] == code
    
    # 4. Validate Coupon
    # Insufficient order value
    val_payload_fail = {
        "code": code,
        "order_value": 300.0
    }
    resp_val_fail = client.post("/api/coupons/validate", json=val_payload_fail)
    assert resp_val_fail.status_code == 400
    assert "Minimum order value" in resp_val_fail.json()["detail"]

    # Valid validation
    val_payload_ok = {
        "code": code,
        "order_value": 600.0
    }
    resp_val_ok = client.post("/api/coupons/validate", json=val_payload_ok)
    assert resp_val_ok.status_code == 200
    assert resp_val_ok.json()["success"] is True
    assert resp_val_ok.json()["discount_amount"] == 120.0 # 20% of 600
