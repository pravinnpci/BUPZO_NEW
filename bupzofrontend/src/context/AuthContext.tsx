"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend
          const response = await axios.get('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.user) {
            setUser(response.data.user);
          }
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        role
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'seller') {
        router.push('/seller/dashboard');
      } else if (user.role === 'customer') {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/signup', {
        name,
        email,
        phone,
        password,
        role
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'seller') {
        router.push('/seller/dashboard');
      } else if (user.role === 'customer') {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};