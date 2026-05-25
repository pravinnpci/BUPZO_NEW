"""Multi-agent wrapper for Mistral-like API calls with API key rotation.

This is a copy placed inside the backend build context so the Docker container
can import and use it. It mirrors bupzo_agents/multi_agent.py and reads
multiple API keys from environment at runtime for automatic rotation.
"""
import google.generativeai as genai
import os
import asyncio
import logging
from typing import Any, List
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Gemini API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("No GEMINI_API_KEY configured. Set GEMINI_API_KEY in environment variables.")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash') # Using flash model for cost-efficiency and speed
else:
    gemini_model = None

async def _call_gemini(prompt: str, timeout: int = 15) -> str:
    if not gemini_model:
        return "[Gemini API key not configured. Set GEMINI_API_KEY in env.]"

    try:
        # Gemini API does not have explicit rate limit rotation like Mistral,
        # but we can implement retries for transient errors.
        # For simplicity, we'll make a direct call for now.
        # httpx is not directly used for Gemini SDK, but kept for future potential direct HTTP calls if needed.
        
        # The Gemini SDK handles the HTTP request internally.
        response = await gemini_model.generate_content_async(prompt)
        return response.text
    except genai.types.BlockedPromptException as e:
        logger.warning(f"Gemini API call blocked due to safety concerns: {e}")
        return f"[Gemini API blocked: {e}]"
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return f"[Gemini API error: {e}]"


async def admin_suggest_banners(context: str) -> str:
    prompt = (
        "You are AdminAgent for BUPZO marketplace. Given the following context, "
        "propose 3 concise marketing banner copy options and suggested CTA text. Context:\n" + context
    )
    return await _call_gemini(prompt)

async def seller_generate_description(product: dict) -> str:
    prompt = (
        "You are SellerAgent. Create an SEO-optimized product title, 2-line description, "
        "and 5 keyword tags for the following product (JSON):\n" + str(product)
    )
    return await _call_gemini(prompt)

async def customer_generate_notifications(profile: dict) -> str:
    prompt = (
        "You are CustomerAgent. Produce 3 personalized push notification messages (short) "
        "based on this customer profile (JSON):\n" + str(profile)
    )
    return await _call_gemini(prompt)

def run_sync(coro: Any) -> Any:
    return asyncio.get_event_loop().run_until_complete(coro)