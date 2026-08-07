import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union

# Environment default fallbacks
SHIPROCKET_EMAIL = os.getenv("SHIPROCKET_EMAIL", "")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD", "")
SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"
SHIPROCKET_CHANNEL_ID = os.getenv("SHIPROCKET_CHANNEL_ID", "")

NIMBUSPOST_EMAIL = os.getenv("NIMBUSPOST_EMAIL", "")
NIMBUSPOST_PASSWORD = os.getenv("NIMBUSPOST_PASSWORD", "")
NIMBUSPOST_TOKEN = os.getenv("NIMBUSPOST_TOKEN", "")
NIMBUSPOST_BASE_URL = "https://api.nimbuspost.com/v1"

# In-memory token caches
_shiprocket_token_cache: Dict[str, Any] = {"token": None, "expires_at": None}
_nimbuspost_token_cache: Dict[str, Any] = {"token": None, "expires_at": None}


# ─────────────────────────────────────────────────────────────
# SHIPROCKET AUTH & TOKEN MANAGEMENT
# ─────────────────────────────────────────────────────────────

async def get_shiprocket_token(db_settings: Optional[Dict] = None) -> Optional[str]:
    """Get Shiprocket token with in-memory caching or DB credentials."""
    global _shiprocket_token_cache
    now = datetime.utcnow()

    if _shiprocket_token_cache["token"] and _shiprocket_token_cache["expires_at"]:
        if now < _shiprocket_token_cache["expires_at"]:
            return _shiprocket_token_cache["token"]

    email = (db_settings and db_settings.get("email")) or SHIPROCKET_EMAIL
    password = (db_settings and db_settings.get("password")) or SHIPROCKET_PASSWORD

    if not email or not password:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SHIPROCKET_BASE_URL}/auth/login",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    _shiprocket_token_cache["token"] = token
                    _shiprocket_token_cache["expires_at"] = now + timedelta(hours=23)
                    return token
    except Exception as e:
        print(f"[Shiprocket] Auth error: {e}")

    return None


# ─────────────────────────────────────────────────────────────
# NIMBUSPOST AUTH & TOKEN MANAGEMENT
# ─────────────────────────────────────────────────────────────

async def get_nimbuspost_token(db_settings: Optional[Dict] = None) -> Optional[str]:
    """Get NimbusPost token (direct token or login)."""
    global _nimbuspost_token_cache
    now = datetime.utcnow()

    # Use explicit token if provided
    token = (db_settings and db_settings.get("api_token")) or NIMBUSPOST_TOKEN
    if token:
        return token

    if _nimbuspost_token_cache["token"] and _nimbuspost_token_cache["expires_at"]:
        if now < _nimbuspost_token_cache["expires_at"]:
            return _nimbuspost_token_cache["token"]

    email = (db_settings and db_settings.get("email")) or NIMBUSPOST_EMAIL
    password = (db_settings and db_settings.get("password")) or NIMBUSPOST_PASSWORD

    if not email or not password:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{NIMBUSPOST_BASE_URL}/users/login",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("data", {}).get("token") or data.get("token")
                if token:
                    _nimbuspost_token_cache["token"] = token
                    _nimbuspost_token_cache["expires_at"] = now + timedelta(hours=23)
                    return token
    except Exception as e:
        print(f"[NimbusPost] Auth error: {e}")

    return None


# ─────────────────────────────────────────────────────────────
# MULTI-AGGREGATOR RATES & SERVICEABILITY
# ─────────────────────────────────────────────────────────────

async def fetch_shipping_rates(
    pickup_pincode: str,
    delivery_pincode: str,
    weight_kg: float = 0.5,
    cod: int = 0,
    db_credentials: Optional[Dict[str, Dict]] = None
) -> List[Dict]:
    """
    Fetch available courier options and live rates from BOTH Shiprocket and NimbusPost.
    Returns normalized list of courier rates.
    """
    rates = []

    # 1. Fetch Shiprocket Rates
    sr_token = await get_shiprocket_token(db_credentials.get("shiprocket") if db_credentials else None)
    if sr_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{SHIPROCKET_BASE_URL}/courier/serviceability/",
                    params={
                        "pickup_postcode": pickup_pincode,
                        "delivery_postcode": delivery_pincode,
                        "weight": weight_kg,
                        "cod": cod
                    },
                    headers={"Authorization": f"Bearer {sr_token}"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    couriers = data.get("data", {}).get("available_courier_companies", [])
                    for c in couriers:
                        rates.append({
                            "aggregator": "shiprocket",
                            "courier_id": c.get("courier_company_id"),
                            "name": f"Shiprocket - {c.get('courier_name')}",
                            "cost": float(c.get("rate", 0)),
                            "estimated_delivery_days": c.get("etd", "2-4 days"),
                            "cod_charges": float(c.get("cod_charges", 0)),
                            "rating": c.get("rating", 4.5),
                        })
        except Exception as e:
            print(f"[Shiprocket] Rates error: {e}")

    # 2. Fetch NimbusPost Rates
    np_token = await get_nimbuspost_token(db_credentials.get("nimbuspost") if db_credentials else None)
    if np_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{NIMBUSPOST_BASE_URL}/courier/serviceability",
                    json={
                        "pickup_pincode": pickup_pincode,
                        "delivery_pincode": delivery_pincode,
                        "weight": weight_kg,
                        "is_cod": bool(cod)
                    },
                    headers={"Authorization": f"Bearer {np_token}"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    couriers = data.get("data", [])
                    for c in couriers:
                        rates.append({
                            "aggregator": "nimbuspost",
                            "courier_id": c.get("id") or c.get("courier_id"),
                            "name": f"NimbusPost - {c.get('courier_name')}",
                            "cost": float(c.get("total_charges") or c.get("rate") or 0),
                            "estimated_delivery_days": c.get("expected_delivery_date", "2-3 days"),
                            "cod_charges": float(c.get("cod_charges", 0)),
                            "rating": c.get("rating", 4.3),
                        })
        except Exception as e:
            print(f"[NimbusPost] Rates error: {e}")

    # Fallback mock rates if no API keys connected
    if not rates:
        rates = [
            {
                "aggregator": "shiprocket",
                "courier_id": 1,
                "name": "Shiprocket - Delhivery Surface (Mock)",
                "cost": 55.0,
                "estimated_delivery_days": "3-5 days",
                "cod_charges": 0.0,
                "rating": 4.6
            },
            {
                "aggregator": "nimbuspost",
                "courier_id": 101,
                "name": "NimbusPost - BlueDart Express (Mock)",
                "cost": 75.0,
                "estimated_delivery_days": "1-2 days",
                "cod_charges": 0.0,
                "rating": 4.8
            },
            {
                "aggregator": "shiprocket",
                "courier_id": 2,
                "name": "Shiprocket - DTDC Air (Mock)",
                "cost": 65.0,
                "estimated_delivery_days": "2-3 days",
                "cod_charges": 0.0,
                "rating": 4.4
            }
        ]

    # Sort rates by lowest cost
    return sorted(rates, key=lambda x: x["cost"])


# ─────────────────────────────────────────────────────────────
# DUAL AGGREGATOR ORDER CREATION & AWB DISPATCH
# ─────────────────────────────────────────────────────────────

async def create_shiprocket_order(order_data: Dict, db_credentials: Optional[Dict] = None) -> Dict:
    """Create order and payload in Shiprocket."""
    token = await get_shiprocket_token(db_credentials)

    payload = {
        "order_id": order_data.get("order_id"),
        "order_date": order_data.get("order_date", datetime.utcnow().strftime("%Y-%m-%d %H:%M")),
        "pickup_location": order_data.get("pickup_location", "Primary"),
        "channel_id": SHIPROCKET_CHANNEL_ID or "",
        "comment": order_data.get("comment", "Bupzo Marketplace Order"),
        "billing_customer_name": order_data.get("customer_name", "Customer"),
        "billing_last_name": order_data.get("customer_last_name", ""),
        "billing_address": order_data.get("billing_address", "Store Address"),
        "billing_address_2": order_data.get("billing_address_2", ""),
        "billing_city": order_data.get("billing_city", "City"),
        "billing_pincode": order_data.get("billing_pincode", "400001"),
        "billing_state": order_data.get("billing_state", "State"),
        "billing_country": order_data.get("billing_country", "India"),
        "billing_email": order_data.get("billing_email", "customer@bupzo.com"),
        "billing_phone": order_data.get("billing_phone", "9999999999"),
        "shipping_is_billing": True,
        "order_items": order_data.get("order_items", []),
        "payment_method": order_data.get("payment_method", "Prepaid"),
        "sub_total": order_data.get("sub_total", 0),
        "length": order_data.get("length", 10),
        "breadth": order_data.get("breadth", 10),
        "height": order_data.get("height", 10),
        "weight": order_data.get("weight", 0.5),
    }

    if not token:
        mock_id = f"SR_{str(order_data.get('order_id', 'MOCK'))[:8].upper()}"
        return {
            "success": True,
            "aggregator": "shiprocket",
            "mock": True,
            "shiprocket_order_id": mock_id,
            "shipment_id": f"SHP_{mock_id}",
            "status": "NEW"
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{SHIPROCKET_BASE_URL}/orders/create/adhoc",
                json=payload,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            )
            data = resp.json()
            if resp.status_code in (200, 201):
                return {
                    "success": True,
                    "aggregator": "shiprocket",
                    "shiprocket_order_id": str(data.get("order_id", "")),
                    "shipment_id": str(data.get("shipment_id", "")),
                    "status": data.get("status", "")
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def create_nimbuspost_order(order_data: Dict, db_credentials: Optional[Dict] = None) -> Dict:
    """Create order and shipment in NimbusPost using seller pickup location and customer delivery details."""
    token = await get_nimbuspost_token(db_credentials)

    payload = {
        "order_number": order_data.get("order_id"),
        "shipping_charges": 0,
        "discount": 0,
        "cod_charges": 0,
        "payment_type": "prepaid" if order_data.get("payment_method", "").lower() != "cod" else "cod",
        "order_amount": order_data.get("sub_total", 0),
        "package_weight": order_data.get("weight", 0.5),
        "package_length": order_data.get("length", 10),
        "package_width": order_data.get("breadth", 10),
        "package_height": order_data.get("height", 10),
        "consignee": {
            "name": order_data.get("customer_name", "Customer"),
            "address": order_data.get("billing_address", ""),
            "address_2": order_data.get("billing_address_2", ""),
            "city": order_data.get("billing_city", ""),
            "state": order_data.get("billing_state", ""),
            "pincode": order_data.get("billing_pincode", ""),
            "phone": order_data.get("billing_phone", ""),
            "email": order_data.get("billing_email", "")
        },
        "pickup": {
            "warehouse_name": order_data.get("pickup_location", "Primary Warehouse"),
            "name": order_data.get("seller_name", "Seller Store"),
            "address": order_data.get("seller_address", "Seller Address"),
            "city": order_data.get("seller_city", "Mumbai"),
            "state": order_data.get("seller_state", "Maharashtra"),
            "pincode": order_data.get("seller_pincode", "400001"),
            "phone": order_data.get("seller_phone", "9999999999")
        },
        "order_items": order_data.get("order_items", [])
    }

    if not token:
        mock_id = f"NP_{str(order_data.get('order_id', 'MOCK'))[:8].upper()}"
        return {
            "success": True,
            "aggregator": "nimbuspost",
            "mock": True,
            "nimbuspost_order_id": mock_id,
            "shipment_id": f"NP_SHP_{mock_id}",
            "status": "CREATED"
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{NIMBUSPOST_BASE_URL}/shipments/create",
                json=payload,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            )
            data = resp.json()
            if resp.status_code in (200, 201) and data.get("status"):
                np_data = data.get("data", {})
                return {
                    "success": True,
                    "aggregator": "nimbuspost",
                    "nimbuspost_order_id": str(np_data.get("order_id", "")),
                    "shipment_id": str(np_data.get("shipment_id", "")),
                    "status": "CREATED"
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# AWB GENERATION & PICKUP SCHEDULING
# ─────────────────────────────────────────────────────────────

async def generate_awb(
    shipment_id: str,
    courier_id: Union[int, str],
    aggregator: str = "shiprocket",
    db_credentials: Optional[Dict] = None
) -> Dict:
    """Generate AWB for given shipment via Shiprocket or NimbusPost."""
    if aggregator == "nimbuspost":
        token = await get_nimbuspost_token(db_credentials)
        if not token:
            awb = f"NPAWB{str(shipment_id)[:8].upper()}99"
            return {
                "success": True,
                "aggregator": "nimbuspost",
                "mock": True,
                "awb_code": awb,
                "courier_name": "NimbusPost Express (Mock)",
                "tracking_url": f"https://nimbuspost.com/tracking/{awb}"
            }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{NIMBUSPOST_BASE_URL}/shipments/manifest",
                    json={"shipment_id": shipment_id, "courier_id": courier_id},
                    headers={"Authorization": f"Bearer {token}"}
                )
                data = resp.json()
                if resp.status_code == 200 and data.get("status"):
                    awb_code = data.get("data", {}).get("awb_number", "")
                    return {
                        "success": True,
                        "aggregator": "nimbuspost",
                        "awb_code": awb_code,
                        "courier_name": data.get("data", {}).get("courier_name", "NimbusPost Partner"),
                        "tracking_url": f"https://nimbuspost.com/tracking/{awb_code}"
                    }
                else:
                    return {"success": False, "error": data.get("message", str(data))}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Default: Shiprocket
    token = await get_shiprocket_token(db_credentials)
    if not token:
        awb = f"SRAWB{str(shipment_id)[:8].upper()}01"
        return {
            "success": True,
            "aggregator": "shiprocket",
            "mock": True,
            "awb_code": awb,
            "courier_name": "Shiprocket Surface (Mock)",
            "tracking_url": f"https://shiprocket.co/tracking/{awb}"
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{SHIPROCKET_BASE_URL}/courier/assign/awb",
                json={"shipment_id": shipment_id, "courier_id": str(courier_id)},
                headers={"Authorization": f"Bearer {token}"}
            )
            data = resp.json()
            if resp.status_code == 200:
                awb_data = data.get("response", {}).get("data", {})
                awb_code = awb_data.get("awb_code", "")
                return {
                    "success": True,
                    "aggregator": "shiprocket",
                    "awb_code": awb_code,
                    "courier_name": awb_data.get("courier_name", "Shiprocket Partner"),
                    "tracking_url": f"https://shiprocket.co/tracking/{awb_code}"
                }
            else:
                return {"success": False, "error": data.get("message", str(data))}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────
# UNIVERSAL LIVE TRACKING ACROSS ALL 3 PANELS
# ─────────────────────────────────────────────────────────────

async def get_universal_tracking(
    awb_code: str,
    aggregator: str = "shiprocket",
    db_credentials: Optional[Dict] = None
) -> Dict:
    """Fetch live tracking normalized across Customer, Seller, and Admin panels."""
    if aggregator == "nimbuspost":
        token = await get_nimbuspost_token(db_credentials)
        if not token:
            return {
                "success": True,
                "mock": True,
                "aggregator": "nimbuspost",
                "current_status": "In Transit",
                "status_code": "IN_TRANSIT",
                "location": "Hub Facilities",
                "awb_code": awb_code,
                "courier_name": "NimbusPost Partner (Mock)",
                "history": [
                    {"status": "Shipment Created", "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"), "location": "Seller Store"},
                    {"status": "Picked Up", "date": (datetime.utcnow() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"), "location": "Sorting Hub"},
                    {"status": "In Transit", "date": (datetime.utcnow() + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"), "location": "Transit Hub"}
                ],
                "etd": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
            }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{NIMBUSPOST_BASE_URL}/shipments/track/{awb_code}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return {
                        "success": True,
                        "aggregator": "nimbuspost",
                        "current_status": data.get("history", [{}])[-1].get("status", "In Transit"),
                        "status_code": data.get("current_status", "IN_TRANSIT"),
                        "location": data.get("location", "Transit Center"),
                        "awb_code": awb_code,
                        "courier_name": data.get("courier_name", "NimbusPost Courier"),
                        "history": data.get("history", []),
                        "etd": data.get("expected_delivery", "")
                    }
        except Exception as e:
            print(f"[NimbusPost] Tracking error: {e}")

    # Default Shiprocket Tracking
    token = await get_shiprocket_token(db_credentials)
    if not token:
        return {
            "success": True,
            "mock": True,
            "aggregator": "shiprocket",
            "current_status": "In Transit",
            "status_code": "IN_TRANSIT",
            "location": "Central Logistics Hub",
            "awb_code": awb_code,
            "courier_name": "Shiprocket Express (Mock)",
            "history": [
                {"status": "Order Processed", "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"), "location": "Seller Warehouse"},
                {"status": "Picked Up by Courier", "date": (datetime.utcnow() + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"), "location": "Warehouse Hub"},
                {"status": "In Transit", "date": (datetime.utcnow() + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"), "location": "Regional Hub"}
            ],
            "etd": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")
        }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{SHIPROCKET_BASE_URL}/courier/track/awb/{awb_code}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                tracking = data.get("tracking_data", {})
                track_activities = tracking.get("shipment_track_activities", [])
                return {
                    "success": True,
                    "aggregator": "shiprocket",
                    "current_status": tracking.get("shipment_status", "In Transit"),
                    "status_code": str(tracking.get("shipment_status_id", 6)),
                    "location": tracking.get("current_timestamp", "Hub"),
                    "awb_code": awb_code,
                    "courier_name": tracking.get("courier_name", "Shiprocket Courier"),
                    "history": [
                        {
                            "status": a.get("activity", ""),
                            "date": a.get("date", ""),
                            "location": a.get("location", "")
                        }
                        for a in track_activities
                    ],
                    "etd": tracking.get("etd", "")
                }
    except Exception as e:
        print(f"[Shiprocket] Tracking error: {e}")

    return {"success": False, "error": "Tracking unavailable"}


# ─────────────────────────────────────────────────────────────
# REVERSE LOGISTICS & REFUND WORKFLOW
# ─────────────────────────────────────────────────────────────

async def create_reverse_pickup(
    order_data: Dict,
    aggregator: str = "shiprocket",
    db_credentials: Optional[Dict] = None
) -> Dict:
    """
    Trigger reverse pickup logistics for customer returns via Shiprocket or NimbusPost APIs.
    Customer address becomes Pickup Address, Seller address becomes Return Destination.
    """
    if aggregator == "nimbuspost":
        token = await get_nimbuspost_token(db_credentials)
        if not token:
            rev_awb = f"NPREV{str(order_data.get('order_id'))[:8].upper()}"
            return {
                "success": True,
                "aggregator": "nimbuspost",
                "mock": True,
                "reverse_awb": rev_awb,
                "status": "REVERSE_PICKUP_SCHEDULED"
            }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{NIMBUSPOST_BASE_URL}/shipments/create_return",
                    json={
                        "order_number": f"RET-{order_data.get('order_id')}",
                        "pickup": {
                            "name": order_data.get("customer_name"),
                            "address": order_data.get("customer_address"),
                            "city": order_data.get("customer_city"),
                            "state": order_data.get("customer_state"),
                            "pincode": order_data.get("customer_pincode"),
                            "phone": order_data.get("customer_phone")
                        },
                        "destination": {
                            "name": order_data.get("seller_name"),
                            "address": order_data.get("seller_address"),
                            "city": order_data.get("seller_city"),
                            "pincode": order_data.get("seller_pincode")
                        }
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                data = resp.json()
                return {
                    "success": resp.status_code in (200, 201),
                    "aggregator": "nimbuspost",
                    "reverse_awb": data.get("data", {}).get("awb_number"),
                    "status": "REVERSE_PICKUP_SCHEDULED"
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Default Shiprocket Return Order
    token = await get_shiprocket_token(db_credentials)
    if not token:
        rev_awb = f"SRREV{str(order_data.get('order_id'))[:8].upper()}"
        return {
            "success": True,
            "aggregator": "shiprocket",
            "mock": True,
            "reverse_awb": rev_awb,
            "status": "REVERSE_PICKUP_SCHEDULED"
        }

    try:
        payload = {
            "order_id": f"RET-{order_data.get('order_id')}",
            "order_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            "pickup_customer_name": order_data.get("customer_name", "Customer"),
            "pickup_address": order_data.get("customer_address", ""),
            "pickup_city": order_data.get("customer_city", ""),
            "pickup_state": order_data.get("customer_state", ""),
            "pickup_pincode": order_data.get("customer_pincode", ""),
            "pickup_phone": order_data.get("customer_phone", ""),
            "order_items": order_data.get("order_items", []),
            "sub_total": order_data.get("sub_total", 0),
            "weight": order_data.get("weight", 0.5)
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{SHIPROCKET_BASE_URL}/orders/create/return",
                json=payload,
                headers={"Authorization": f"Bearer {token}"}
            )
            data = resp.json()
            return {
                "success": resp.status_code in (200, 201),
                "aggregator": "shiprocket",
                "reverse_awb": str(data.get("shipment_id", "")),
                "status": "REVERSE_PICKUP_SCHEDULED"
            }
    except Exception as e:
        return {"success": False, "error": str(e)}
