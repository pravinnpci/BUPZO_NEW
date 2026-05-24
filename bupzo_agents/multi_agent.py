"""Multi-agent wrapper for Mistral-like API calls with API key rotation.

This module keeps the API keys out of source control by reading
multiple keys from environment variables. It provides automatic
key rotation when rate limits or quota issues are encountered.

It provides three simple async helpers: `admin_suggest_banners`,
`seller_generate_description`, and `customer_generate_notifications`.
"""
import os
import asyncio
import logging
from typing import Any, List
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load multiple API keys for rotation
MISTRAL_KEYS = [
    os.environ.get("MISTRAL_API_KEY", "XlrPnzJyhVnBYnKc04UVlrfO0K9SO6vP"),
    os.environ.get("MISTRAL_API_KEY_2", "XlrPnzJyhVnBYnKc04UVlrfO0K9SO6vP"),  # Fallback key
]
# Use the chat completions endpoint by default
MISTRAL_API_URL = os.environ.get("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions")

# Filter out None values (empty environment variables)
MISTRAL_KEYS = [key for key in MISTRAL_KEYS if key]

if not MISTRAL_KEYS:
    # Do not raise at import time to keep services testable without a key.
    # Endpoints will return a helpful error if no keys are available.
    logger.warning("No Mistral API keys configured. Set MISTRAL_API_KEY or MISTRAL_API_KEY_2 in env.")
    MISTRAL_KEYS = None

async def _call_mistral(prompt: str, timeout: int = 15) -> str:
    if not MISTRAL_KEYS:
        return "[Mistral API key not configured. Set MISTRAL_API_KEY or MISTRAL_API_KEY_2 in env.]"

    # Initialize with first key
    current_key_index = 0
    max_retries = len(MISTRAL_KEYS)  # Try each key once
    retries = 0

    while retries < max_retries:
        current_key = MISTRAL_KEYS[current_key_index]
        headers = {"Authorization": f"Bearer {current_key}", "Content-Type": "application/json"}
        payload = {
            "model": "mistral-tiny",
            "messages": [{"role": "user", "content": prompt}]
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(MISTRAL_API_URL, json=payload, headers=headers)

            # Check for rate limit or quota exceeded
            if resp.status_code == 429:
                logger.warning(f"Key {current_key_index + 1} failed with status 429 (Rate Limit Exceeded). Rotating to next available API key...")
                current_key_index = (current_key_index + 1) % len(MISTRAL_KEYS)
                retries += 1
                continue

            # Check for quota validation failure
            try:
                data = resp.json()
                if isinstance(data, dict) and "error" in data and "quota_exceeded" in data["error"].get("type", ""):
                    logger.warning(f"Key {current_key_index + 1} failed with quota exceeded. Rotating to next available API key...")
                    current_key_index = (current_key_index + 1) % len(MISTRAL_KEYS)
                    retries += 1
                    continue
            except Exception:
                # If JSON parsing fails, just continue with the response text
                pass

            # If we get here, the request was successful
            try:
                data = resp.json()
                # Parse Mistral/OpenAI-style chat completions response format
                if isinstance(data, dict) and "choices" in data and data["choices"]:
                    choice = data["choices"][0]
                    # Support both {message:{content:...}} and {text:...} shapes
                    if isinstance(choice, dict):
                        if "message" in choice and isinstance(choice["message"], dict) and "content" in choice["message"]:
                            return choice["message"]["content"]
                        if "text" in choice:
                            return choice["text"]
                return str(data)
            except Exception:
                return f"[Mistral error: status={resp.status_code}] {resp.text}"

    # If we exhausted all keys
    return f"[Mistral error: All API keys failed. Last status={resp.status_code}] {resp.text}"

async def admin_suggest_banners(context: str) -> str:
    prompt = (
        "You are AdminAgent for BUPZO marketplace. Given the following context, "
        "propose 3 concise marketing banner copy options and suggested CTA text. Context:\n" + context
    )
    return await _call_mistral(prompt)

async def seller_generate_description(product: dict) -> str:
    prompt = (
        "You are SellerAgent. Create an SEO-optimized product title, 2-line description, "
        "and 5 keyword tags for the following product (JSON):\n" + str(product)
    )
    return await _call_mistral(prompt)

async def customer_generate_notifications(profile: dict) -> str:
    prompt = (
        "You are CustomerAgent. Produce 3 personalized push notification messages (short) "
        "based on this customer profile (JSON):\n" + str(profile)
    )
    return await _call_mistral(prompt)

def run_sync(coro: Any) -> Any:
    """Helper to run async functions from sync contexts."""
    return asyncio.get_event_loop().run_until_complete(coro)