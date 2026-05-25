import os
import json
from typing import Dict, List, Optional, Union
from google.generativeai import GenerativeModel, ChatSession
from google.generativeai.types import HarmBlock, HarmCategory

class MultiAgentSystem:
    def __init__(self):
        self.gemini_model = None
        self._initialize_gemini_model()

    def _initialize_gemini_model(self):
        """Initialize the Gemini model with appropriate safety settings."""
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable not set")

            # Initialize the Gemini model
            self.gemini_model = GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction="""
                You are BUPZO AI, an advanced AI assistant for a multi-vendor e-commerce platform.
                You help customers, sellers, and admins with various tasks related to BUPZO.
                Always respond in a professional, helpful, and friendly manner.
                """
            )

            # Configure safety settings
            self.gemini_model.safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlock.HIGH,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlock.HIGH,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlock.HIGH,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlock.HIGH,
            }

        except Exception as e:
            print(f"Error initializing Gemini model: {e}")
            raise

    def _call_gemini(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Call the Gemini model with a prompt and optional context."""
        if not self.gemini_model:
            raise ValueError("Gemini model not initialized")

        try:
            chat = self.gemini_model.start_chat(
                history=[
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": f"""
                                You are BUPZO AI, an advanced AI assistant for a multi-vendor e-commerce platform.
                                You help customers, sellers, and admins with various tasks related to BUPZO.
                                Current context: {json.dumps(context) if context else 'None'}
                                """
                            }
                        ]
                    }
                ]
            )

            response = chat.send_message(prompt)
            return response.text

        except Exception as e:
            print(f"Error calling Gemini model: {e}")
            raise

    def admin_suggest_banners(self, current_banners: List[Dict], season: str) -> List[Dict]:
        """Generate banner suggestions for the admin based on current banners and season."""
        prompt = f"""
        You are an expert in e-commerce marketing for BUPZO, a multi-vendor platform specializing in Nagore specialties,
        Toys, Home Appliances, Ceramics, and Electronics.

        Current banners:
        {json.dumps(current_banners, indent=2)}

        Season: {season}

        Generate 3-5 creative banner ideas for BUPZO that would be effective for this season.
        Each banner should include:
        - Title (short and catchy)
        - Description (1-2 sentences)
        - Image suggestion (type of product or theme)
        - Target audience (e.g., "Premium customers", "New customers", "Toys lovers")
        - Call to action (e.g., "Shop Now", "Limited Time Offer")

        Format your response as a JSON array of objects with these properties.
        """

        response = self._call_gemini(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract the JSON manually
            import re
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return []

    def seller_generate_description(self, product_name: str, category: str, features: List[str]) -> str:
        """Generate a compelling product description for a seller."""
        prompt = f"""
        You are a professional copywriter for BUPZO, a multi-vendor e-commerce platform.

        Product Name: {product_name}
        Category: {category}
        Features: {', '.join(features)}

        Write a compelling and informative product description (150-200 words) that:
        1. Highlights the key features and benefits
        2. Uses persuasive language to encourage purchase
        3. Is SEO-friendly with relevant keywords
        4. Maintains a professional yet friendly tone
        5. Includes a clear call-to-action at the end

        Make sure to mention the unique selling points of BUPZO products, such as:
        - Authentic Nagore specialties
        - High-quality materials
        - Trusted by customers
        - Fast shipping options
        """

        response = self._call_gemini(prompt)
        return response

    def customer_generate_notifications(self, order_status: str, product_name: str, user_preferences: Dict) -> List[Dict]:
        """Generate appropriate notifications for customers based on order status and preferences."""
        prompt = f"""
        You are BUPZO AI, helping to create personalized customer notifications.

        Order Status: {order_status}
        Product Name: {product_name}
        User Preferences: {json.dumps(user_preferences, indent=2)}

        Generate 1-3 appropriate notification messages for this customer based on:
        1. Their order status
        2. Their product purchase
        3. Their preferences (communication channel, language, etc.)

        Each notification should include:
        - Message type (WhatsApp, Email, Push Notification)
        - Message content (short and clear)
        - Recommended timing (e.g., "immediately", "24 hours after shipping", etc.)
        - Personalization level (1-5, with 5 being highly personalized)

        Format your response as a JSON array of objects with these properties.
        """

        response = self._call_gemini(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract the JSON manually
            import re
            match = re.search(r'\[.*\]', response, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return []

    def generate_product_recommendations(self, user_id: str, purchased_products: List[Dict], user_preferences: Dict) -> List[Dict]:
        """Generate personalized product recommendations for a customer."""
        prompt = f"""
        You are BUPZO AI, helping to generate personalized product recommendations.

        User ID: {user_id}
        Purchased Products: {json.dumps(purchased_products, indent=2)}
        User Preferences: {json.dumps(user_preferences, indent=2)}

        Generate 5-8 personalized product recommendations for this customer based on:
        1. Their purchase history
        2. Their preferences (categories, price range, etc.)
        3. Current popular products on BUPZO
        4. Seasonal trends

        Each recommendation should include:
        - Product ID (if available)
        - Product Name
        - Category
        - Brief description (1-2 sentences)
        - Why it's recommended (personalization reason)
        - Estimated price range
        - Seller information (if available)

        Format your response as a JSON array of objects with these properties.
        """

        response = self._call_gemini(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract the JSON manually
            import re
            match = re.search(r'\[.*\]', response, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return []

    def generate_seller_analytics(self, seller_id: str, sales_data: List[Dict], market_trends: Dict) -> Dict:
        """Generate analytics and insights for sellers based on their sales data."""
        prompt = f"""
        You are BUPZO AI, helping sellers analyze their performance.

        Seller ID: {seller_id}
        Sales Data: {json.dumps(sales_data, indent=2)}
        Market Trends: {json.dumps(market_trends, indent=2)}

        Generate a comprehensive analytics report for this seller that includes:
        1. Sales Performance Summary (total sales, average order value, growth trends)
        2. Top Performing Products (with sales figures)
        3. Customer Segmentation (by location, purchase frequency, etc.)
        4. Market Positioning (compared to competitors)
        5. Recommendations for Improvement (product offerings, marketing, etc.)
        6. Predictive Insights (future sales trends based on current data)

        Format your response as a JSON object with these properties.
        """

        response = self._call_gemini(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract the JSON manually
            import re
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return {}