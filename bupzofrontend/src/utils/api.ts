const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
};

export const authApi = {
  requestOTP: (email: string) => api.post('/api/auth/request-otp', { email }),
  verifyOTP: (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp }),
};

export const walletApi = {
  getBalance: () => api.get('/api/wallet/balance'),
};

export const productApi = {
  getProducts: () => api.get('/api/products'),
};

export default api;