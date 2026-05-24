/**
 * BUPZO - Seller Dashboard
 * Production-ready implementation with real API integration
 */
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, Package, DollarSign, BarChart, Clock, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

// Define types for inventory and sales data
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  lowStock: boolean;
}

interface SalesData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

// Seller Dashboard
export default function SellerDashboard() {
  const { role, userId } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [salesData, setSalesData] = useState<SalesData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [5000, 7500, 9000, 12000, 15000, 18000],
    orders: [20, 30, 40, 50, 60, 70],
  });
  const [loading, setLoading] = useState({
    inventory: true,
    sales: true,
    overall: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        setLoading({ ...loading, overall: true });

        if (!userId) {
          setError('User ID not available');
          return;
        }

        // Fetch inventory from backend
        setLoading({ ...loading, inventory: true });
        const inventoryResponse = await api.get(`/seller/inventory?user_id=${userId}`);
        setInventory(inventoryResponse.data);
        setLoading({ ...loading, inventory: false });

        // Fetch sales analytics from backend
        setLoading({ ...loading, sales: true });
        const salesResponse = await api.get(`/seller/sales-analytics?user_id=${userId}`);
        setSalesData({
          labels: salesResponse.data.labels,
          revenue: salesResponse.data.monthlyRevenue,
          orders: salesResponse.data.monthlyOrders
        });
        setLoading({ ...loading, sales: false });

      } catch (err) {
        console.error('Failed to load seller data:', err);
        setError('Failed to load seller data. Please try again.');
      } finally {
        setLoading({ ...loading, overall: false });
      }
    };

    loadSellerData();
  }, [userId]);

  if (loading.overall) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-dusty-mauve animate-spin mb-4" />
          <p className="text-dim-grey dark:text-dust-grey">Loading seller dashboard...</p>
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
          Manage your inventory, track sales, and monitor your store's performance.
        </p>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dusty-mauve">Total Revenue</h2>
              <p className="text-dim-grey dark:text-dust-grey">This Month</p>
            </div>
            <DollarSign className="h-8 w-8 text-dusty-mauve" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-dusty-mauve">₹{salesData.revenue.reduce((a, b) => a + b, 0)}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dusty-mauve">Total Orders</h2>
              <p className="text-dim-grey dark:text-dust-grey">This Month</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-dusty-mauve" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-dusty-mauve">{salesData.orders.reduce((a, b) => a + b, 0)}</p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-dusty-mauve">Total Products</h2>
              <p className="text-dim-grey dark:text-dust-grey">In Stock</p>
            </div>
            <Package className="h-8 w-8 text-dusty-mauve" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-dusty-mauve">{inventory.length}</p>
          </div>
        </div>
      </div>

      {/* Sales Chart (Placeholder) */}
      <div className="bg-white dark:bg-charcoal rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-dusty-mauve mb-4">Sales Overview</h2>
        <div className="h-64 bg-dim-grey dark:bg-dust-grey rounded-lg flex items-center justify-center">
          <BarChart className="h-16 w-16 text-dim-grey dark:text-dust-grey" />
          <p className="ml-4 text-dim-grey dark:text-dust-grey">Sales Analytics Coming Soon</p>
        </div>
      </div>

      {/* Inventory Management */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dusty-mauve mb-4">Inventory Management</h2>
        {loading.inventory ? (
          <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden">
            <div className="animate-pulse">
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-full"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-3/4 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-1/2 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-full"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-3/4 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-1/2 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-full"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-3/4 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-1/2 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-full"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-3/4 mx-auto my-2"></div>
              <div className="h-4 bg-dim-grey dark:bg-dust-grey rounded-t-lg w-1/2 mx-auto my-2"></div>
            </div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden p-6 text-center">
            <p className="text-dim-grey dark:text-dust-grey">No inventory items found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-dim-grey dark:divide-dust-grey">
              <thead className="bg-dim-grey dark:bg-dust-grey">
                <tr>
                  <th className="px-6 py-3 text-left text-dim-grey dark:text-dust-grey font-medium">Product</th>
                  <th className="px-6 py-3 text-left text-dim-grey dark:text-dust-grey font-medium">Category</th>
                  <th className="px-6 py-3 text-left text-dim-grey dark:text-dust-grey font-medium">Stock</th>
                  <th className="px-6 py-3 text-left text-dim-grey dark:text-dust-grey font-medium">Price</th>
                  <th className="px-6 py-3 text-left text-dim-grey dark:text-dust-grey font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-charcoal divide-y divide-dim-grey dark:divide-dust-grey">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://images.unsplash.com/photo-1604328108342-234b40f09003?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&q=80`}
                          alt={item.name}
                          className="h-8 w-8 object-contain mr-3"
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        item.lowStock ? 'text-red-600 dark:text-red-400' : 'text-dim-grey dark:text-dust-grey'
                      )}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">₹{item.price}</td>
                    <td className="px-6 py-4">
                      {item.lowStock ? (
                        <div className="flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">Low Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">In Stock</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}