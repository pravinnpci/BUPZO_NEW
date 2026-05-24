import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://bupzobackend:8003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      throw error.response.data;
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  requestOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getUser: (userId: string) => api.get(`/auth/user?id=${userId}`),
};

export const productApi = {
  getCategories: () => api.get('/products/categories'),
  getProducts: (categoryId?: string) => {
    const url = categoryId ? `/products?category_id=${categoryId}` : '/products';
    return api.get(url);
  },
  getProduct: (productId: string) => api.get(`/products/${productId}`),
};

export const walletApi = {
  getBalance: (userId: string) => api.get(`/wallet/balance?user_id=${userId}`),
  getTransactions: (userId: string) => api.get(`/wallet/transactions?user_id=${userId}`),
};

export default api;