import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

SHIPROCKET_EMAIL = os.getenv("SHIPROCKET_EMAIL", "")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD", "")
SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"
SHIPROCKET_CHANNEL_ID = os.getenv("SHIPROCKET_CHANNEL_ID", "")

# In-memory token cache (replace with Redis in production)
_token_cache: Dict[str, Any] = {"token": None, "expires_at": None}

# ─────────────────────────────────────────────────────────────
# AUTH & TOKEN MANAGEMENT
# ─────────────────────────────────────────────────────────────

async def get_shiprocket_token() -> Optional[str]:
    """Get Shiprocket token with in-memory caching (24h TTL)."""
    global _token_cache
    now = datetime.utcnow()

    # Return cached token if still valid
    if _token_cache["token"] and _token_cache["expires_at"]:
        if now < _token_cache["expires_at"]:
            return _token_cache["token"]

    if not SHIPROCKET_EMAIL or not SHIPROCKET_PASSWORD:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/auth/login",
                json={"email": SHIPROCKET_EMAIL, "password": SHIPROCKET_PASSWORD}
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    _token_cache["token"] = token
                    _token_cache["expires_at"] = now + timedelta(hours=23)
                    return token
    except Exception as e:
        print(f"[Shiprocket] Auth error: {e}")

    return None


def _get_mock_token() -> str:
    return "mock_shiprocket_token"


# ─────────────────────────────────────────────────────────────
# SERVICEABILITY / RATES
# ─────────────────────────────────────────────────────────────

async def fetch_shipping_rates(
    pickup_pincode: str,
    delivery_pincode: str,
    weight_kg: float,
    cod: int = 0
) -> List[Dict]:
    """Fetch available couriers and rates from Shiprocket."""
    token = await get_shiprocket_token()

    if not token:
        return [
            {"courier_id": 1, "name": "Standard Delivery (Mock)", "cost": 50.0, "estimated_delivery_days": "3-5 days"},
            {"courier_id": 2, "name": "Express Delivery (Mock)", "cost": 120.0, "estimated_delivery_days": "1-2 days"},
            {"courier_id": 3, "name": "Economy Delivery (Mock)", "cost": 35.0, "estimated_delivery_days": "5-7 days"},
        ]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SHIPROCKET_BASE_URL}/courier/serviceability/",
                params={
                    "pickup_postcode": pickup_pincode,
                    "delivery_postcode": delivery_pincode,
                    "weight": weight_kg,
                    "cod": cod
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                data = response.json()
                couriers = data.get("data", {}).get("available_courier_companies", [])
                return [
                    {
                        "courier_id": c.get("courier_company_id"),
                        "name": c.get("courier_name"),
                        "cost": c.get("rate"),
                        "estimated_delivery_days": c.get("etd"),
                        "cod_charges": c.get("cod_charges", 0),
                        "min_weight": c.get("min_weight", 0.5),
                    }
                    for c in couriers
                ]
    except Exception as e:
        print(f"[Shiprocket] Rates error: {e}")

    return [
        {"courier_id": 1, "name": "Standard Delivery (Mock)", "cost": 50.0, "estimated_delivery_days": "3-5 days"},
        {"courier_id": 2, "name": "Express Delivery (Mock)", "cost": 120.0, "estimated_delivery_days": "1-2 days"},
    ]


# ─────────────────────────────────────────────────────────────
# ORDER CREATION
# ─────────────────────────────────────────────────────────────

async def create_shiprocket_order(order_data: Dict) -> Dict:
    """
    Create an order on Shiprocket platform.
    Returns: { success, shiprocket_order_id, shipment_id, channel_order_id }
    """
    token = await get_shiprocket_token()

    payload = {
        "order_id": order_data.get("order_id"),
        "order_date": order_data.get("order_date", datetime.utcnow().strftime("%Y-%m-%d %H:%M")),
        "pickup_location": order_data.get("pickup_location", "Primary"),
        "channel_id": SHIPROCKET_CHANNEL_ID or "",
        "comment": order_data.get("comment", "Bupzo Marketplace Order"),
        "billing_customer_name": order_data.get("customer_name", ""),
        "billing_last_name": order_data.get("customer_last_name", ""),
        "billing_address": order_data.get("billing_address", ""),
        "billing_address_2": order_data.get("billing_address_2", ""),
        "billing_city": order_data.get("billing_city", ""),
        "billing_pincode": order_data.get("billing_pincode", ""),
        "billing_state": order_data.get("billing_state", ""),
        "billing_country": order_data.get("billing_country", "India"),
        "billing_email": order_data.get("billing_email", ""),
        "billing_phone": order_data.get("billing_phone", ""),
        "shipping_is_billing": order_data.get("shipping_is_billing", True),
        "order_items": order_data.get("order_items", []),
        "payment_method": order_data.get("payment_method", "Prepaid"),
        "sub_total": order_data.get("sub_total", 0),
        "length": order_data.get("length", 10),
        "breadth": order_data.get("breadth", 10),
        "height": order_data.get("height", 10),
        "weight": order_data.get("weight", 0.5),
    }

    if not token:
        # Mock response for development
        mock_id = f"SR_{order_data.get('order_id', 'MOCK')[:8].upper()}"
        return {
            "success": True,
            "mock": True,
            "shiprocket_order_id": mock_id,
            "shipment_id": f"SHP_{mock_id}",
            "channel_order_id": order_data.get("order_id"),
            "status": "NEW"
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/orders/create/adhoc",
                json=payload,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            )
            data = response.json()
            if response.status_code in (200, 201):
                return {
                    "success": True,
                    "shiprocket_order_id": str(data.get("order_id", "")),
                    "shipment_id": str(data.get("shipment_id", "")),
                    "channel_order_id": str(data.get("channel_order_id", "")),
                    "status": data.get("status", ""),
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        print(f"[Shiprocket] Create order error: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# AWB GENERATION
# ─────────────────────────────────────────────────────────────

async def generate_awb(shipment_id: str, courier_id: int) -> Dict:
    """
    Assign a courier and generate AWB (Air Waybill) for a shipment.
    Returns: { success, awb_code, courier_name, tracking_url }
    """
    token = await get_shiprocket_token()

    if not token:
        awb = f"AWB{shipment_id[:8].upper()}01"
        return {
            "success": True,
            "mock": True,
            "awb_code": awb,
            "courier_name": "Mock Courier",
            "tracking_url": f"https://shiprocket.co/tracking/{awb}",
            "response": {}
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/courier/assign/awb",
                json={"shipment_id": shipment_id, "courier_id": str(courier_id)},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()
            if response.status_code == 200:
                awb_data = data.get("response", {}).get("data", {})
                awb_code = awb_data.get("awb_code", "")
                return {
                    "success": True,
                    "awb_code": awb_code,
                    "courier_name": awb_data.get("courier_name", ""),
                    "tracking_url": f"https://shiprocket.co/tracking/{awb_code}",
                    "response": awb_data
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        print(f"[Shiprocket] AWB error: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# PICKUP SCHEDULING
# ─────────────────────────────────────────────────────────────

async def schedule_pickup(shipment_ids: List[str]) -> Dict:
    """
    Schedule a pickup for one or more shipments.
    Returns: { success, pickup_scheduled_date, response }
    """
    token = await get_shiprocket_token()

    if not token:
        pickup_date = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        return {
            "success": True,
            "mock": True,
            "pickup_scheduled_date": pickup_date,
            "response": {}
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/courier/generate/pickup",
                json={"shipment_id": shipment_ids},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()
            if response.status_code == 200:
                pickup_data = data.get("pickup_status", {})
                return {
                    "success": True,
                    "pickup_scheduled_date": pickup_data.get("pickup_scheduled_date"),
                    "response": pickup_data
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        print(f"[Shiprocket] Pickup schedule error: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# TRACKING
# ─────────────────────────────────────────────────────────────

async def get_tracking(awb_code: str) -> Dict:
    """
    Get real-time tracking info for a shipment via AWB code.
    Returns: { success, current_status, tracking_data, estimated_delivery }
    """
    token = await get_shiprocket_token()

    if not token:
        return {
            "success": True,
            "mock": True,
            "current_status": "In Transit",
            "current_status_code": 6,
            "tracking_data": {
                "awb_code": awb_code,
                "current_status": "In Transit",
                "delivered_date": None,
                "shipment_track": [
                    {"date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"), "activity": "Shipment picked up", "location": "Seller Warehouse"},
                    {"date": (datetime.utcnow() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"), "activity": "In transit", "location": "Hub"},
                ]
            },
            "estimated_delivery": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")
        }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SHIPROCKET_BASE_URL}/courier/track/awb/{awb_code}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                data = response.json()
                tracking = data.get("tracking_data", {})
                return {
                    "success": True,
                    "current_status": tracking.get("shipment_status"),
                    "current_status_code": tracking.get("shipment_status_id"),
                    "tracking_data": tracking,
                    "estimated_delivery": tracking.get("etd")
                }
            else:
                return {"success": False, "error": "Tracking not available"}
    except Exception as e:
        print(f"[Shiprocket] Tracking error: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# CANCEL SHIPMENT
# ─────────────────────────────────────────────────────────────

async def cancel_shipment(awb_codes: List[str]) -> Dict:
    """Cancel one or more shipments by AWB code."""
    token = await get_shiprocket_token()

    if not token:
        return {"success": True, "mock": True, "message": "Cancellation requested (mock)"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/orders/cancel/shipment/awbs",
                json={"awbs": awb_codes},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()
            return {"success": response.status_code == 200, "response": data}
    except Exception as e:
        print(f"[Shiprocket] Cancel error: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# LABEL GENERATION
# ─────────────────────────────────────────────────────────────

async def generate_label(shipment_ids: List[str]) -> Dict:
    """Generate shipping label PDF URL for shipments."""
    token = await get_shiprocket_token()

    if not token:
        return {"success": True, "mock": True, "label_url": "https://mock.shiprocket.co/label/mock.pdf"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/courier/generate/label",
                json={"shipment_id": shipment_ids},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()
            if response.status_code == 200:
                return {"success": True, "label_url": data.get("label_url", "")}
            else:
                return {"success": False, "error": data.get("message", "")}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def generate_manifest(shipment_ids: List[str]) -> Dict:
    """Generate manifest PDF URL for shipments."""
    token = await get_shiprocket_token()

    if not token:
        return {"success": True, "mock": True, "manifest_url": "https://mock.shiprocket.co/manifest/mock.pdf"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/manifests/generate",
                json={"shipment_id": shipment_ids},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()
            if response.status_code == 200:
                return {"success": True, "manifest_url": data.get("manifest_url", "")}
            else:
                return {"success": False, "error": data.get("message", "")}
    except Exception as e:
        return {"success": False, "error": str(e)}

