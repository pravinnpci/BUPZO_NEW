"use client";

/**
 * BUPZO - Customer Dashboard
 * Production-ready implementation with real API integration
 */
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { ShoppingCart, Package, CreditCard, DollarSign, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { walletApi } from '../../../utils/api';
import api from '../../../utils/api';

const customerApi = {
  getOrders: (userId: string) => api.get(`/customer/orders?user_id=${userId}`),
  getTracking: (userId: string) => api.get(`/customer/tracking?user_id=${userId}`)
};

// Define types for orders and tracking
interface Order {
  id: string;
  date: string;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

interface Tracking {
  id: string;
  orderId: string;
  status: string;
  location: string;
  eta: string;
}

// Customer Dashboard
export default function CustomerDashboard() {
  const { walletBalance, role, userId, fetchWalletBalance } = useAuthStore();
  const { items, total } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<Tracking[]>([]);
  const [loading, setLoading] = useState({
    wallet: true,
    orders: true,
    tracking: true,
    overall: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading({ ...loading, overall: true, wallet: true });

        // Fetch wallet balance
        await fetchWalletBalance();
        setLoading({ ...loading, wallet: false });

        if (!userId) {
          setError('User ID not available');
          return;
        }

        // Fetch orders from backend
        setLoading({ ...loading, orders: true });
        const ordersResponse = await customerApi.getOrders(userId);
        setOrders(ordersResponse.data);
        setLoading({ ...loading, orders: false });

        // Fetch tracking from backend
        setLoading({ ...loading, tracking: true });
        const trackingResponse = await customerApi.getTracking(userId);
        setTracking(trackingResponse.data);
        setLoading({ ...loading, tracking: false });

      } catch (err) {
        console.error('Failed to load customer data:', err);
        setError('Failed to load customer data. Please try again.');
      } finally {
        setLoading({ ...loading, overall: false });
      }
    };

    loadCustomerData();
  }, [userId, fetchWalletBalance]);

  if (loading.overall) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-dusty-mauve animate-spin mb-4" />
          <p className="text-dim-grey dark:text-dust-grey">Loading customer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center text-dusty-mauve hover:text-charcoal transition-colors"
          >
            <span className="mr-2">Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <a
          href="/"
          className={cn(
            'flex items-center text-dusty-mauve hover:text-charcoal transition-colors',
            'dark:hover:text-almond-silk'
          )}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </a>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dusty-mauve mb-2">Welcome, {role}!</h1>
        <p className="text-dim-grey dark:text-dust-grey">
          Track your orders, manage your wallet, and explore your cart.
        </p>
      </div>

      {/* Wallet Balance */}
      <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dusty-mauve">Wallet Balance</h2>
            <p className="text-dim-grey dark:text-dust-grey">Available for refunds and purchases</p>
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-dusty-mauve" />
            <span className="text-2xl font-bold text-dusty-mauve">₹{walletBalance}</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cart Summary */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-dusty-mauve mb-4">Your Cart</h2>
          {items.length === 0 ? (
            <p className="text-dim-grey dark:text-dust-grey">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 object-contain mr-3"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-dim-grey dark:text-dust-grey">
                        {item.quantity} x ₹{item.price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-dim-grey dark:border-dust-grey">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-dusty-mauve">₹{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-dusty-mauve mb-4">Order History</h2>
          {loading.orders ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 text-dusty-mauve animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-dim-grey dark:text-dust-grey">No orders found.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="border-b border-dim-grey dark:border-dust-grey pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-dim-grey dark:text-dust-grey">{order.date}</p>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    {order.items.map((item) => (
                      <div key={item.name} className="text-sm text-dim-grey dark:text-dust-grey">
                        {item.quantity}x {item.name} - ₹{item.price}
                      </div>
                    ))}
                    <div className="mt-1 font-medium text-dusty-mauve">Total: ₹{order.total}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order Tracking */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-dusty-mauve mb-4">Order Tracking</h2>
          {loading.tracking ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 text-dusty-mauve animate-spin" />
            </div>
          ) : tracking.length === 0 ? (
            <p className="text-dim-grey dark:text-dust-grey">No tracking data available.</p>
          ) : (
            <ul className="space-y-3">
              {tracking.map((track) => (
                <li key={track.id} className="border-b border-dim-grey dark:border-dust-grey pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{track.orderId}</p>
                      <p className="text-sm text-dim-grey dark:text-dust-grey">{track.location}</p>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        track.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          track.status === 'In Transit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      )}
                    >
                      {track.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-dim-grey dark:text-dust-grey">
                    <p>{track.eta}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}