"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  customer_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const router = useRouter();

  const handleUpdateClick = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
  };

  const handleShipClick = (order: Order) => {
    setEditingOrder(order);
    setEditStatus("Shipped");
  };

  const handleSaveUpdate = async () => {
    if (!editingOrder) return;

    try {
      const response = await api.patch(`/api/orders/${editingOrder.id}/status?status=${encodeURIComponent(editStatus)}`);
      console.log('Order status updated successfully:', response.data);

      // Update the orders list with the new status
      setOrders(orders.map(o =>
        o.id === editingOrder.id ? { ...o, status: editStatus } : o
      ));

      // Close the update modal
      setEditingOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  const handleCancelUpdate = () => {
    setEditingOrder(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders for this seller from local FastAPI backend
        // In a real implementation, we would filter orders by seller's products
        // For now, we'll use customer orders as a demo
        const response = await api.get('/api/orders/customer/1');
        console.log('Fetched orders:', response.data);

        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (statusFilter === "all") return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-600">View and manage customer orders for your products</p>
        </div>
        <Link href="/seller/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Back to Dashboard
        </Link>
      </header>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-semibold">Customer Orders</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {orders.length} orders
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-48"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No orders found for your products.</p>
            <p className="text-sm text-gray-400">When customers purchase your items, they will appear here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-blue-600">#{order.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">Customer #{order.customer_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">₹{order.total_amount.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">View</button>
                        <button className="text-sm text-green-600 hover:text-green-800" onClick={() => handleUpdateClick(order)}>Update</button>
                        <button className="text-sm text-purple-600 hover:text-purple-800" onClick={() => handleShipClick(order)}>Ship</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Order Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Orders</div>
              <div className="mt-1 text-xl font-semibold">{orders.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="mt-1 text-xl font-semibold text-green-600">
                ₹{orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Pending Orders</div>
              <div className="mt-1 text-xl font-semibold text-yellow-600">
                {orders.filter(o => o.status.toLowerCase() === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Order Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <input
                  type="text"
                  value={`#${editingOrder.id}`}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <input
                  type="text"
                  value={editingOrder.status}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelUpdate}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}