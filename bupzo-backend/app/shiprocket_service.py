import os
import httpx

SHIPROCKET_EMAIL = os.getenv("SHIPROCKET_EMAIL")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD")
SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

async def get_shiprocket_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SHIPROCKET_BASE_URL}/auth/login",
            json={
                "email": SHIPROCKET_EMAIL,
                "password": SHIPROCKET_PASSWORD
            }
        )
        if response.status_code == 200:
            return response.json().get("token")
        return None

async def fetch_shipping_rates(pickup_pincode: str, delivery_pincode: str, weight_kg: float):
    token = await get_shiprocket_token()
    if not token:
        return [
            {
                "name": "Standard Delivery (Mock)",
                "cost": 50.0,
                "estimated_delivery_days": "3-5 days"
            },
            {
                "name": "Express Delivery (Mock)",
                "cost": 120.0,
                "estimated_delivery_days": "1-2 days"
            }
        ]
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SHIPROCKET_BASE_URL}/courier/serviceability/",
            params={
                "pickup_postcode": pickup_pincode,
                "delivery_postcode": delivery_pincode,
                "weight": weight_kg,
                "cod": 0
            },
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            available_couriers = data.get("data", {}).get("available_courier_companies", [])
            rates = []
            for courier in available_couriers:
                rates.append({
                    "name": courier.get("courier_name"),
                    "cost": courier.get("rate"),
                    "estimated_delivery_days": courier.get("etd")
                })
            return rates
        else:
            raise Exception(f"Failed to fetch rates: {response.text}")
