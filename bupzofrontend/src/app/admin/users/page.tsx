"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const router = useRouter();

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const response = await api.put(`/api/auth/users/${editingUser.id}`, editFormData);
      console.log('User updated successfully:', response.data);

      // Update the users list with the new data
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, ...editFormData } : u
      ));

      // Close the edit modal
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users from local FastAPI backend
        const response = await api.get('/api/auth/users');
        console.log('Fetched users:', response.data);

        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">View and manage all marketplace users</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No users found in the system.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-blue-600">#{user.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{user.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Seller' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
      <button className="text-sm text-blue-600 hover:text-blue-800">View</button>
      <button className="text-sm text-green-600 hover:text-green-800" onClick={() => handleEditClick(user)}>Edit</button>
      <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">User Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="mt-1 text-xl font-semibold">{users.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Admins</div>
                <div className="mt-1 text-xl font-semibold text-red-600">
                  {users.filter(u => u.role === 'Admin').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Sellers</div>
                <div className="mt-1 text-xl font-semibold text-green-600">
                  {users.filter(u => u.role === 'Seller').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Customers</div>
                <div className="mt-1 text-xl font-semibold text-blue-600">
                  {users.filter(u => u.role === 'Customer').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editFormData.username || ''}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editFormData.role || ''}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Customer">Customer</option>
                  <option value="Seller">Seller</option>
                  <option value="Admin">Admin</option>
                </select>
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