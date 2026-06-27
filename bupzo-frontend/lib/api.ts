const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  weight_grams: number;
  image_url?: string;
  is_combo: boolean;
  stock_quantity: number;
  seller_id: string;
  description?: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  added_at: string;
  product_name: string;
  product_price: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products/`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function createCheckout(order: {
  user_id: string;
  seller_id: string;
  items: { product_id: string; quantity: number }[];
  total_amount: number;
  order_source: string;
  shipping_partner?: string;
  payment_gateway?: string;
  trust_donation_amount?: number;
}): Promise<{ success: boolean; message: string; order_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error('Failed to complete checkout');
  }
  return response.json();
}

export async function addToWishlist(productId: string, userId: string): Promise<WishlistItem> {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_id: productId, user_id: userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to add item to wishlist');
  }
  return response.json();
}

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch wishlist items');
  }
  return response.json();
}

export async function removeFromWishlist(itemId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/wishlist/${itemId}`, {
    method: 'DELETE',
  });
}

export async function initiateStitchPayment(orderId: string, amount: number): Promise<{ success: boolean; payment_url: string; mode: string }> {
  const response = await fetch(`${API_BASE_URL}/api/payment/stitch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderId, amount }),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate Stitch payment');
  }
  return response.json();
}

export async function searchProducts(query: string, limit?: number): Promise<{ success: boolean; results: Product[] }> {
  const response = await fetch(`${API_BASE_URL}/api/products/search/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error('Failed to perform AI product search');
  }
  return response.json();
}

export async function generateAICopy(prompt: string): Promise<{ success: boolean; title: string; description: string; tags: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/ai/copywriter/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI copy');
  }
  return response.json();
}

export async function verifyKYC(gstNumber: string, fssaiNumber: string): Promise<{
  status: string;
  gst_check: string;
  fssai_check: string;
  reason: string;
  verification_score: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/ai/kyc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gst_number: gstNumber, fssai_number: fssaiNumber }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify KYC');
  }
  return response.json();
}

export async function checkFraud(orderId: string, userId: string, amount: number, orderSource: string): Promise<{
  status: string;
  risk_score_percent: number;
  reasons: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/ai/fraud/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderId, user_id: userId, amount, order_source: orderSource }),
  });

  if (!response.ok) {
    throw new Error('Failed to check fraud');
  }
  return response.json();
}
