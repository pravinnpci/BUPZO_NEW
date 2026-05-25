"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: string;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const router = useRouter();

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const response = await api.put(`/api/products/${editingProduct.id}`, {
        name: editFormData.name,
        description: editFormData.description,
        price: editFormData.price,
        seller_id: 1, // Using seller ID 1 as the current logged-in seller
        stock: editFormData.stock
      });
      console.log('Product updated successfully:', response.data);

      // Update the products list with the new data
      setProducts(products.map(p =>
        p.id === editingProduct.id ? { ...p, ...editFormData } : p
      ));

      // Close the edit modal
      setEditingProduct(null);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch seller's products from local FastAPI backend
        // Using seller ID 1 as the current logged-in seller
        const response = await api.get('/api/products/seller/1');
        console.log('Fetched seller products:', response.data);

        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load your products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStockColor = (stock: number) => {
    if (stock > 10) return 'bg-green-100 text-green-800';
    if (stock > 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-600">View and manage your product inventory</p>
        </div>
        <Link href="/seller/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Back to Dashboard
        </Link>
      </header>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-semibold">My Products</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="groceries">Groceries</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No products found in your inventory.</p>
            <p className="text-sm text-gray-400">Create your first product using the form in the dashboard!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-blue-600">{product.name}</div>
                      <div className="text-xs text-gray-500">ID: {product.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{product.description}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-semibold">₹{product.price.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => handleEditClick(product)}>Edit</button>
                        <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Inventory Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="mt-1 text-xl font-semibold">{products.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Stock</div>
              <div className="mt-1 text-xl font-semibold text-green-600">
                {products.reduce((sum, product) => sum + product.stock, 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Low Stock Items</div>
              <div className="mt-1 text-xl font-semibold text-yellow-600">
                {products.filter(p => p.stock <= 5).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Out of Stock</div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.price || ''}
                  onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={editFormData.stock || ''}
                  onChange={(e) => setEditFormData({...editFormData, stock: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}