export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isCombo?: boolean;
  stockQuantity?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  product_name: string;
  product_price: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  product_name: string;
  product_price: number;
  created_at: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('http://localhost:8003/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function addToCart(productId: string, userId: string, quantity: number): Promise<CartItem> {
  const response = await fetch('http://localhost:8003/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_id: productId, user_id: userId, quantity }),
  });

  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }
  return response.json();
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const response = await fetch(`http://localhost:8003/api/cart/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cart items');
  }
  return response.json();
}

export async function removeFromCart(itemId: string): Promise<void> {
  await fetch(`http://localhost:8003/api/cart/${itemId}`, {
    method: 'DELETE',
  });
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  await fetch(`http://localhost:8003/api/cart/${itemId}/quantity`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });
}

export async function addToWishlist(productId: string, userId: string): Promise<WishlistItem> {
  const response = await fetch('http://localhost:8003/api/wishlist', {
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
  const response = await fetch(`http://localhost:8003/api/wishlist/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch wishlist items');
  }
  return response.json();
}

export async function removeFromWishlist(itemId: string): Promise<void> {
  await fetch(`http://localhost:8003/api/wishlist/${itemId}`, {
    method: 'DELETE',
  });
}